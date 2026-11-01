import crypto from "crypto";
import jwt from "jsonwebtoken";
import QRCode from "qrcode";
import PDFDocument from "pdfkit";

import Donation from "../models/Donation.js";
import DonationResponse from "../models/DonationResponse.js";
import BloodRequest from "../models/BloodRequest.js";
import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { notifyUser } from "../services/notificationService.js";
import { RESTRICT_VERIFIER_TO_HOSPITAL } from "../constants.js";

const sameId = (a, b) => String(a) === String(b);

const makeCertificateId = () =>
  `BC-${new Date().getFullYear()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

const norm = (s = "") => s.toLowerCase().replace(/\s+/g, " ").trim();

// Tolerant match: "Sangamner Civil Hospital" matches "sangamner civil hospital, main"
const hospitalMatches = (a, b) => {
  const x = norm(a);
  const y = norm(b);
  return !!x && !!y && (x.includes(y) || y.includes(x));
};

const decodeQr = (token, res) => {
  let payload;
  try {
    payload = jwt.verify(token, process.env.QR_SECRET);
  } catch {
    res.status(400);
    throw new Error("Invalid or expired QR code");
  }
  if (payload.t !== "donation") {
    res.status(400);
    throw new Error("This is not a donation QR code");
  }
  return payload;
};

// Everything that must be true before a donation counts. `actor` is the verifier/admin.
const loadVerifiable = async (token, actor, res) => {
  const payload = decodeQr(token, res);

  const response = await DonationResponse.findById(payload.rid);
  if (
    !response ||
    response.status !== "selected" ||
    !sameId(response.donorId, payload.did) ||
    !sameId(response.requestId, payload.qid)
  ) {
    res.status(400);
    throw new Error("This QR code is no longer valid for a donation");
  }

  const existing = await Donation.findOne({ responseId: response._id });
  if (existing) {
    res.status(409);
    throw new Error(`Already verified (certificate ${existing.certificateId})`);
  }

  const request = await BloodRequest.findById(response.requestId);
  if (!request) {
    res.status(404);
    throw new Error("Blood request not found");
  }
  if (!["open", "matched"].includes(request.status)) {
    res.status(400);
    throw new Error(`This request is ${request.status}`);
  }
  if (request.unitsFulfilled >= request.unitsRequired) {
    res.status(400);
    throw new Error("All required units are already fulfilled");
  }

  // Verifiers can only confirm donations at their own hospital. Admins are exempt.
  if (
    RESTRICT_VERIFIER_TO_HOSPITAL &&
    actor.role === "verifier" &&
    !hospitalMatches(actor.hospitalName, request.hospitalName)
  ) {
    res.status(403);
    throw new Error(
      `This donation is for "${request.hospitalName}". You are registered for "${actor.hospitalName}".`
    );
  }

  const donor = await User.findById(response.donorId);
  if (!donor) {
    res.status(404);
    throw new Error("Donor not found");
  }

  return { response, request, donor };
};

// GET /api/donations/qr/:requestId  (selected donor)
export const getDonationQr = asyncHandler(async (req, res) => {
  const response = await DonationResponse.findOne({
    requestId: req.params.requestId,
    donorId: req.user._id,
    status: "selected",
  });
  if (!response) {
    res.status(404);
    throw new Error("You have not been selected as the donor for this request");
  }

  const existing = await Donation.findOne({ responseId: response._id });
  if (existing) {
    res.status(400);
    throw new Error("This donation is already verified");
  }

  const request = await BloodRequest.findById(response.requestId).select(
    "status hospitalName bloodGroup"
  );
  if (!request || !["open", "matched"].includes(request.status)) {
    res.status(400);
    throw new Error("This request is no longer active");
  }

  const token = jwt.sign(
    {
      t: "donation",
      rid: String(response._id),
      did: String(req.user._id),
      qid: String(response.requestId),
    },
    process.env.QR_SECRET,
    { expiresIn: "7d" }
  );

  const qr = await QRCode.toDataURL(token, {
    width: 320,
    margin: 2,
    errorCorrectionLevel: "M",
  });

  res.json({
    success: true,
    qr,
    token,
    expiresInDays: 7,
    hospitalName: request.hospitalName,
    bloodGroup: request.bloodGroup,
  });
});

// POST /api/donations/inspect  (verifier/admin) preview before confirming
export const inspectDonation = asyncHandler(async (req, res) => {
  const { request, donor } = await loadVerifiable(req.body.token, req.user, res);

  res.json({
    success: true,
    donor: {
      name: donor.name,
      bloodGroup: donor.bloodGroup,
      city: donor.city,
      isEligible: donor.isEligible,
      nextEligibleDate: donor.nextEligibleDate,
    },
    request: {
      patientName: request.patientName,
      bloodGroup: request.bloodGroup,
      hospitalName: request.hospitalName,
      city: request.city,
      unitsRequired: request.unitsRequired,
      unitsFulfilled: request.unitsFulfilled,
    },
  });
});

// POST /api/donations/verify  (verifier/admin) records the donation
export const verifyDonation = asyncHandler(async (req, res) => {
  const { response, request, donor } = await loadVerifiable(
    req.body.token,
    req.user,
    res
  );

  if (!donor.isEligible) {
    res.status(400);
    throw new Error(
      `Donor is in cooldown until ${donor.nextEligibleDate.toDateString()}`
    );
  }

  let donation;
  try {
    donation = await Donation.create({
      donorId: donor._id,
      requestId: request._id,
      responseId: response._id,
      bloodGroup: request.bloodGroup,
      hospitalName: request.hospitalName,
      city: request.city,
      verifiedBy: req.user._id,
      certificateId: makeCertificateId(),
    });
  } catch (err) {
    if (err.code === 11000) {
      res.status(409);
      throw new Error("This donation was already verified");
    }
    throw err;
  }

  const updated = await BloodRequest.findByIdAndUpdate(
    request._id,
    { $inc: { unitsFulfilled: 1 } },
    { new: true }
  );
  if (updated.unitsFulfilled >= updated.unitsRequired && updated.status !== "completed") {
    updated.status = "completed";
    await updated.save();
  }

  donor.lastDonationDate = donation.donationDate;
  donor.isAvailable = false; // cooldown starts now
  await donor.save();

  await Promise.all([
    notifyUser({
      userId: donor._id,
      type: "donation_verified",
      title: "Donation verified. Thank you!",
      message: "Your certificate is ready in My Donations.",
      relatedId: request._id,
    }),
    notifyUser({
      userId: request.createdBy,
      type: "donation_verified",
      title: "A donation was verified",
      message: `${donor.name} donated for ${request.patientName} (${updated.unitsFulfilled}/${updated.unitsRequired} units).`,
      relatedId: request._id,
    }),
  ]);

  res.status(201).json({
    success: true,
    donation,
    donorName: donor.name,
    requestStatus: updated.status,
    unitsFulfilled: updated.unitsFulfilled,
    unitsRequired: updated.unitsRequired,
  });
});

// GET /api/donations/mine
export const getMyDonations = asyncHandler(async (req, res) => {
  const donations = await Donation.find({ donorId: req.user._id }).sort({
    donationDate: -1,
  });
  res.json({ success: true, total: donations.length, donations });
});

// GET /api/donations/:id/certificate  (donor or admin) streams a PDF
export const downloadCertificate = asyncHandler(async (req, res) => {
  const donation = await Donation.findById(req.params.id)
    .populate("donorId", "name")
    .populate("verifiedBy", "name hospitalName");
  if (!donation) {
    res.status(404);
    throw new Error("Donation not found");
  }
  if (!sameId(donation.donorId._id, req.user._id) && req.user.role !== "admin") {
    res.status(403);
    throw new Error("You can only download your own certificate");
  }

  const verifier = donation.verifiedBy;
  const verifiedByText = verifier
    ? `Verified by ${verifier.name}${verifier.hospitalName ? `, ${verifier.hospitalName}` : ""}`
    : "Verified by an authorised BloodConnect administrator";

  const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 40 });
  const W = doc.page.width;
  const H = doc.page.height;

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${donation.certificateId}.pdf"`
  );
  doc.pipe(res);

  const red = "#B91C1C";
  const dark = "#1F2937";
  const grey = "#6B7280";

  doc.rect(20, 20, W - 40, H - 40).lineWidth(3).stroke(red);
  doc.rect(30, 30, W - 60, H - 60).lineWidth(1).stroke(red);

  doc.fillColor(red).font("Helvetica-Bold").fontSize(16)
    .text("BLOODCONNECT", 0, 70, { width: W, align: "center" });

  doc.fillColor(dark).font("Helvetica-Bold").fontSize(36)
    .text("Certificate of Appreciation", 0, 105, { width: W, align: "center" });

  doc.fillColor(grey).font("Helvetica").fontSize(14)
    .text("This certificate is proudly presented to", 0, 175, { width: W, align: "center" });

  doc.fillColor(red).font("Helvetica-Bold").fontSize(34)
    .text(donation.donorId.name, 0, 205, { width: W, align: "center" });

  doc.fillColor(dark).font("Helvetica").fontSize(15)
    .text("for voluntarily donating blood and helping save lives.", 0, 260, {
      width: W,
      align: "center",
    });

  const date = donation.donationDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  doc.fontSize(13).fillColor(dark)
    .text(
      `Blood group: ${donation.bloodGroup}   |   Date: ${date}   |   ${donation.hospitalName}, ${donation.city}`,
      0,
      305,
      { width: W, align: "center" }
    );

  doc.fillColor(grey).fontSize(11)
    .text(`Certificate ID: ${donation.certificateId}`, 0, 385, { width: W, align: "center" });
  doc.fillColor(dark).fontSize(11)
    .text(verifiedByText, 0, 405, { width: W, align: "center" });
  doc.fillColor(grey).fontSize(9)
    .text(
      "Issued only after the donation was confirmed by authorised staff.",
      0,
      430,
      { width: W, align: "center" }
    );

  doc.end();
});
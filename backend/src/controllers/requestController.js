import BloodRequest from "../models/BloodRequest.js";
import DonationResponse from "../models/DonationResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { findMatchingDonors } from "../services/matchingService.js";
import { notifyMany, notifyUser } from "../services/notificationService.js";

const sameId = (a, b) => String(a) === String(b);

const getRequestOr404 = async (id, res) => {
  const request = await BloodRequest.findById(id);
  if (!request) {
    res.status(404);
    throw new Error("Request not found");
  }
  return request;
};

const assertOwner = (request, user, res) => {
  if (!sameId(request.createdBy, user._id)) {
    res.status(403);
    throw new Error("Only the request owner can do this");
  }
};

// POST /api/requests
export const createRequest = asyncHandler(async (req, res) => {
  const { latitude, longitude, ...data } = req.body;

  const request = await BloodRequest.create({
    ...data,
    createdBy: req.user._id,
    location: { type: "Point", coordinates: [longitude, latitude] },
  });

  const donors = await findMatchingDonors({
    bloodGroup: request.bloodGroup,
    latitude,
    longitude,
    radiusKm: 10,
    excludeUserId: req.user._id,
    limit: 100,
  });

  // Notify only matching, available, eligible donors nearby
  await notifyMany(
    donors.map((d) => ({
      userId: d._id,
      type: "new_request",
      title: `${request.bloodGroup} blood needed (${request.urgency})`,
      message: `${request.hospitalName}, ${request.city} · ${d.distanceKm} km from you`,
      relatedId: request._id,
    }))
  );

  res.status(201).json({
    success: true,
    request,
    nearbyDonorsCount: donors.length,
  });
});

// GET /api/requests  (open requests feed, contact number hidden)
export const getRequests = asyncHandler(async (req, res) => {
  const { bloodGroup, urgency, city, page, limit } = req.validatedQuery;

  const filter = { status: "open" };
  if (bloodGroup) filter.bloodGroup = bloodGroup;
  if (urgency) filter.urgency = urgency;
  if (city) {
    const safe = city.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.city = new RegExp(`^${safe}$`, "i");
  }

  const [requests, total] = await Promise.all([
    BloodRequest.find(filter)
      .select("-contactNumber")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    BloodRequest.countDocuments(filter),
  ]);

  res.json({
    success: true,
    total,
    page,
    pages: Math.ceil(total / limit),
    requests,
  });
});

// GET /api/requests/mine
export const getMyRequests = asyncHandler(async (req, res) => {
  const requests = await BloodRequest.find({ createdBy: req.user._id }).sort({
    createdAt: -1,
  });

  const ids = requests.map((r) => r._id);
  const counts = await DonationResponse.aggregate([
    { $match: { requestId: { $in: ids }, status: { $in: ["accepted", "selected"] } } },
    { $group: { _id: "$requestId", count: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((c) => [String(c._id), c.count]));

  const data = requests.map((r) => ({
    ...r.toObject(),
    acceptedCount: countMap.get(String(r._id)) || 0,
  }));

  res.json({ success: true, requests: data });
});

// GET /api/requests/:id
export const getRequestById = asyncHandler(async (req, res) => {
  const request = await BloodRequest.findById(req.params.id).populate(
    "createdBy",
    "name city"
  );
  if (!request) {
    res.status(404);
    throw new Error("Request not found");
  }

  const isOwner = sameId(request.createdBy._id, req.user._id);
  const myResponse = await DonationResponse.findOne({
    requestId: request._id,
    donorId: req.user._id,
  });

  const out = request.toObject();
  const mayContact =
    isOwner || (myResponse && ["accepted", "selected"].includes(myResponse.status));
  if (!mayContact) delete out.contactNumber;

  res.json({ success: true, request: out, isOwner, myResponse });
});

// PATCH /api/requests/:id/cancel
export const cancelRequest = asyncHandler(async (req, res) => {
  const request = await getRequestOr404(req.params.id, res);
  assertOwner(request, req.user, res);

  if (["completed", "cancelled"].includes(request.status)) {
    res.status(400);
    throw new Error(`Request is already ${request.status}`);
  }

  request.status = "cancelled";
  await request.save();

  // Tell donors who had accepted that they no longer need to come
  const accepted = await DonationResponse.find({
    requestId: request._id,
    status: { $in: ["accepted", "selected"] },
  }).select("donorId");

  await notifyMany(
    accepted.map((r) => ({
      userId: r.donorId,
      type: "request_cancelled",
      title: "Request cancelled",
      message: `The ${request.bloodGroup} request at ${request.hospitalName} was cancelled. Thank you for offering to help.`,
      relatedId: request._id,
    }))
  );

  res.json({ success: true, request });
});

// GET /api/requests/:id/responses  (owner only)
// Donors who accepted agreed to be contacted, so their phone is shared here.
export const getRequestResponses = asyncHandler(async (req, res) => {
  const request = await getRequestOr404(req.params.id, res);
  assertOwner(request, req.user, res);

  const responses = await DonationResponse.find({
    requestId: request._id,
    status: { $in: ["accepted", "selected"] },
  })
    .populate("donorId", "name bloodGroup city phone")
    .sort({ createdAt: -1 });

  res.json({ success: true, count: responses.length, responses });
});

// POST /api/requests/:id/respond  (donor)
export const respondToRequest = asyncHandler(async (req, res) => {
  const { status, message } = req.body;
  const user = req.user;
  const request = await getRequestOr404(req.params.id, res);

  if (sameId(request.createdBy, user._id)) {
    res.status(400);
    throw new Error("You cannot respond to your own request");
  }
  if (!["open", "matched"].includes(request.status)) {
    res.status(400);
    throw new Error("This request is no longer accepting donors");
  }

  if (status === "accepted") {
    if (!user.isDonor) {
      res.status(400);
      throw new Error("Enable donor mode in your profile first");
    }
    if (!user.isAvailable) {
      res.status(400);
      throw new Error("Turn on your availability before accepting");
    }
    if (!user.isEligible) {
      res.status(400);
      throw new Error(
        `You can donate again after ${user.nextEligibleDate.toDateString()}`
      );
    }
    if (user.bloodGroup !== request.bloodGroup) {
      res.status(400);
      throw new Error("Your blood group does not match this request");
    }
  }

  const previous = await DonationResponse.findOne({
    requestId: request._id,
    donorId: user._id,
  });
  const wasActive = previous && ["accepted", "selected"].includes(previous.status);

  const response = await DonationResponse.findOneAndUpdate(
    { requestId: request._id, donorId: user._id },
    { status, message: message || "", respondedAt: new Date() },
    { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
  );

  // Notify the requester only on a real change (no duplicates on repeat clicks)
  if (status === "accepted" && !wasActive) {
    await notifyUser({
      userId: request.createdBy,
      type: "donor_accepted",
      title: "A donor accepted your request",
      message: `${user.name} (${user.bloodGroup}) can donate for ${request.patientName}.`,
      relatedId: request._id,
    });
  } else if (status === "withdrawn" && wasActive) {
    await notifyUser({
      userId: request.createdBy,
      type: "donor_withdrew",
      title: "A donor withdrew",
      message: `${user.name} is no longer able to donate for ${request.patientName}.`,
      relatedId: request._id,
    });
  }

  res.json({ success: true, response });
});

// PATCH /api/requests/:id/responses/:responseId/select  (owner)
export const selectDonor = asyncHandler(async (req, res) => {
  const request = await getRequestOr404(req.params.id, res);
  assertOwner(request, req.user, res);

  const response = await DonationResponse.findOne({
    _id: req.params.responseId,
    requestId: request._id,
  });
  if (!response) {
    res.status(404);
    throw new Error("Response not found");
  }
  if (response.status !== "accepted") {
    res.status(400);
    throw new Error("Only accepted responses can be selected");
  }

  response.status = "selected";
  await response.save();

  if (request.status === "open") {
    request.status = "matched";
    await request.save();
  }

  await notifyUser({
    userId: response.donorId,
    type: "donor_selected",
    title: "You were selected as the donor",
    message: `Please coordinate with the family at ${request.hospitalName}. The hospital will confirm your eligibility.`,
    relatedId: request._id,
  });

  res.json({ success: true, request, response });
});
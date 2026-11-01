import User from "../models/User.js";
import BloodRequest from "../models/BloodRequest.js";
import Donation from "../models/Donation.js";
import DonationResponse from "../models/DonationResponse.js";
import Report from "../models/Report.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { notifyMany } from "../services/notificationService.js";
import { BLOOD_GROUPS } from "../constants.js";

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// GET /api/admin/users?search=&role=
export const listUsers = asyncHandler(async (req, res) => {
  const { search, role } = req.query;
  const filter = {};

  if (["user", "verifier", "admin"].includes(role)) filter.role = role;
  if (search && String(search).trim()) {
    const rx = new RegExp(escapeRegex(String(search).trim()), "i");
    filter.$or = [{ name: rx }, { email: rx }];
  }

  const users = await User.find(filter).sort({ createdAt: -1 }).limit(30);
  res.json({ success: true, count: users.length, users });
});

// PATCH /api/admin/users/:id/role   body: { role: "verifier"|"user", hospitalName? }
export const setUserRole = asyncHandler(async (req, res) => {
  const { role, hospitalName } = req.body;

  const target = await User.findById(req.params.id);
  if (!target) {
    res.status(404);
    throw new Error("User not found");
  }
  if (String(target._id) === String(req.user._id)) {
    res.status(400);
    throw new Error("You cannot change your own role");
  }
  if (target.role === "admin") {
    res.status(400);
    throw new Error("Admin accounts cannot be changed here");
  }

  target.role = role;
  target.hospitalName = role === "verifier" ? hospitalName : undefined;
  await target.save();

  res.json({ success: true, user: target });
});

// Last N calendar dates in India time, oldest first: ["2026-10-19", ...]
const lastDatesIST = (n) => {
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    out.push(d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }));
  }
  return out;
};

// GET /api/admin/overview
export const getOverview = asyncHandler(async (req, res) => {
  const days = lastDatesIST(14);
  const since = new Date(Date.now() - 15 * 86400000);
  const since30 = new Date(Date.now() - 30 * 86400000);

  const [
    totalUsers,
    donors,
    availableNow,
    verifiers,
    requestStatus,
    totalDonations,
    donations30,
    perDay,
    perGroup,
    openReports,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isDonor: true }),
    User.countDocuments({ isDonor: true, isAvailable: true }),
    User.countDocuments({ role: "verifier" }),
    BloodRequest.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Donation.countDocuments(),
    Donation.countDocuments({ donationDate: { $gte: since30 } }),
    Donation.aggregate([
      { $match: { donationDate: { $gte: since } } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$donationDate",
              timezone: "Asia/Kolkata",
            },
          },
          count: { $sum: 1 },
        },
      },
    ]),
    User.aggregate([
      { $match: { isDonor: true } },
      {
        $group: {
          _id: "$bloodGroup",
          total: { $sum: 1 },
          available: { $sum: { $cond: ["$isAvailable", 1, 0] } },
        },
      },
    ]),
    Report.countDocuments({ status: "open" }),
  ]);

  const statusMap = Object.fromEntries(requestStatus.map((s) => [s._id, s.count]));
  const dayMap = Object.fromEntries(perDay.map((d) => [d._id, d.count]));
  const groupMap = Object.fromEntries(perGroup.map((g) => [g._id, g]));

  res.json({
    success: true,
    overview: {
      users: { total: totalUsers, donors, availableNow, verifiers },
      requests: {
        open: statusMap.open || 0,
        matched: statusMap.matched || 0,
        completed: statusMap.completed || 0,
        cancelled: statusMap.cancelled || 0,
      },
      donations: { total: totalDonations, last30: donations30 },
      donationsByDay: days.map((date) => ({ date, count: dayMap[date] || 0 })),
      donorsByGroup: BLOOD_GROUPS.map((bloodGroup) => ({
        bloodGroup,
        total: groupMap[bloodGroup]?.total || 0,
        available: groupMap[bloodGroup]?.available || 0,
      })),
      openReports,
    },
  });
});

// GET /api/admin/reports?status=open
export const listReports = asyncHandler(async (req, res) => {
  const status = ["open", "resolved", "dismissed"].includes(req.query.status)
    ? req.query.status
    : "open";

  const reports = await Report.find({ status })
    .populate({
      path: "requestId",
      select: "patientName bloodGroup hospitalName city status createdBy",
      populate: { path: "createdBy", select: "name" },
    })
    .populate("reporterId", "name")
    .sort({ createdAt: -1 })
    .limit(50);

  res.json({ success: true, count: reports.length, reports });
});

// PATCH /api/admin/reports/:id   body: { action: "dismiss" | "cancel_request" }
export const resolveReport = asyncHandler(async (req, res) => {
  const { action } = req.body;

  const report = await Report.findById(req.params.id);
  if (!report) {
    res.status(404);
    throw new Error("Report not found");
  }
  if (report.status !== "open") {
    res.status(400);
    throw new Error("This report was already handled");
  }

  if (action === "dismiss") {
    report.status = "dismissed";
    report.resolvedBy = req.user._id;
    await report.save();
    return res.json({ success: true, report });
  }

  // cancel_request
  const request = await BloodRequest.findById(report.requestId);
  if (request && ["open", "matched"].includes(request.status)) {
    request.status = "cancelled";
    await request.save();

    const accepted = await DonationResponse.find({
      requestId: request._id,
      status: { $in: ["accepted", "selected"] },
    }).select("donorId");

    await notifyMany([
      {
        userId: request.createdBy,
        type: "request_cancelled",
        title: "Your request was removed",
        message: "An administrator removed this request after a report.",
        relatedId: request._id,
      },
      ...accepted.map((r) => ({
        userId: r.donorId,
        type: "request_cancelled",
        title: "Request cancelled",
        message: `The ${request.bloodGroup} request at ${request.hospitalName} was cancelled.`,
        relatedId: request._id,
      })),
    ]);
  }

  // Every open report on this request is now settled
  await Report.updateMany(
    { requestId: report.requestId, status: "open" },
    { status: "resolved", resolvedBy: req.user._id }
  );

  res.json({ success: true, report: await Report.findById(report._id) });
});
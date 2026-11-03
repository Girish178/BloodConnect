import mongoose from "mongoose";
import Camp from "../models/Camp.js";
import CampRegistration from "../models/CampRegistration.js";
import User from "../models/User.js";
import { COOLDOWN_DAYS } from "../constants.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { notifyMany, notifyUser } from "../services/notificationService.js";

const DAY_MS = 24 * 60 * 60 * 1000;
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

// Midnight (UTC) of today's calendar date in India. Camps on or after this are "upcoming".
const todayCutoff = () => {
  const ist = new Date(Date.now() + IST_OFFSET_MS);
  return new Date(Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate()));
};

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const fail = (res, code, message) => {
  res.status(code);
  throw new Error(message);
};

const loadCamp = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) fail(res, 404, "Camp not found");
  const camp = await Camp.findById(req.params.id);
  if (!camp) fail(res, 404, "Camp not found");
  return camp;
};

const canManage = (user, camp) =>
  !!user && (user.role === "admin" || String(camp.createdBy) === String(user._id));

const requireManager = (req, res, camp) => {
  if (!canManage(req.user, camp)) fail(res, 403, "You can only manage camps you created");
};

// Registered headcount for many camps at once: { campId: count }
const countsFor = async (campIds) => {
  if (!campIds.length) return {};
  const rows = await CampRegistration.aggregate([
    { $match: { campId: { $in: campIds }, status: "registered" } },
    { $group: { _id: "$campId", n: { $sum: 1 } } },
  ]);
  return Object.fromEntries(rows.map((r) => [String(r._id), r.n]));
};

const shape = (camp, counts) => {
  const o = camp.toObject ? camp.toObject() : camp;
  const registeredCount = counts[String(o._id)] || 0;
  return {
    ...o,
    registeredCount,
    spotsLeft: o.capacity > 0 ? Math.max(0, o.capacity - registeredCount) : null,
    isPast: new Date(o.date) < todayCutoff(),
  };
};

// Is this user still resting from a previous donation on the camp day?
const eligibilityOn = (user, campDate) => {
  if (!user.lastDonationDate) return { eligible: true, nextEligibleDate: null };
  const next = new Date(new Date(user.lastDonationDate).getTime() + COOLDOWN_DAYS * DAY_MS);
  return { eligible: next <= new Date(campDate), nextEligibleDate: next };
};

// GET /api/camps?scope=upcoming|past&city=Sangamner   (public)
export const listCamps = asyncHandler(async (req, res) => {
  const scope = req.query.scope === "past" ? "past" : "upcoming";
  const limit = Math.min(Number(req.query.limit) || 30, 60);
  const cutoff = todayCutoff();

  const filter =
    scope === "past"
      ? { date: { $lt: cutoff } }
      : { date: { $gte: cutoff }, status: "upcoming" };

  if (typeof req.query.city === "string" && req.query.city.trim()) {
    filter.city = new RegExp(escapeRegex(req.query.city.trim()), "i");
  }

  const camps = await Camp.find(filter)
    .sort({ date: scope === "past" ? -1 : 1, startTime: 1 })
    .limit(limit);
  const counts = await countsFor(camps.map((c) => c._id));

  res.json({ success: true, camps: camps.map((c) => shape(c, counts)) });
});

// GET /api/camps/managed   camps I created (admins see all)
export const managedCamps = asyncHandler(async (req, res) => {
  const filter = req.user.role === "admin" ? {} : { createdBy: req.user._id };
  const camps = await Camp.find(filter).sort({ date: -1 }).limit(100);
  const counts = await countsFor(camps.map((c) => c._id));
  res.json({ success: true, camps: camps.map((c) => shape(c, counts)) });
});

// GET /api/camps/mine   camps I registered for
export const myRegistrations = asyncHandler(async (req, res) => {
  const regs = await CampRegistration.find({ userId: req.user._id, status: "registered" }).populate("campId");
  const camps = regs.filter((r) => r.campId);
  const counts = await countsFor(camps.map((r) => r.campId._id));
  const items = camps
    .map((r) => ({ registrationId: r._id, attended: r.attended, camp: shape(r.campId, counts) }))
    .sort((a, b) => new Date(a.camp.date) - new Date(b.camp.date));
  res.json({ success: true, registrations: items });
});

// GET /api/camps/:id   (public; richer if a valid token is sent)
export const getCamp = asyncHandler(async (req, res) => {
  const camp = await loadCamp(req, res);
  const counts = await countsFor([camp._id]);
  const out = { success: true, camp: shape(camp, counts), isRegistered: false, canManage: false };

  if (req.user) {
    const reg = await CampRegistration.findOne({ campId: camp._id, userId: req.user._id });
    out.isRegistered = !!reg && reg.status === "registered";
    out.canManage = canManage(req.user, camp);
    out.eligibility = eligibilityOn(req.user, camp.date);
  }
  res.json(out);
});

// POST /api/camps   (verifier or admin)
export const createCamp = asyncHandler(async (req, res) => {
  const b = req.body;
  const date = new Date(b.date);
  if (date < todayCutoff()) fail(res, 400, "The camp date cannot be in the past");

  const camp = await Camp.create({
    title: b.title,
    organizer: b.organizer || req.user.hospitalName || req.user.name,
    description: b.description || "",
    date,
    startTime: b.startTime,
    endTime: b.endTime,
    venue: b.venue,
    city: b.city,
    address: b.address || "",
    contactPhone: b.contactPhone,
    capacity: Number(b.capacity) || 0,
    createdBy: req.user._id,
  });

  // Tell donors in the same city (up to 500) so the camp does not go unseen
  const donors = await User.find({
    isDonor: true,
    _id: { $ne: req.user._id },
    city: new RegExp(`^${escapeRegex(camp.city)}$`, "i"),
  })
    .select("_id")
    .limit(500)
    .lean();

  await notifyMany(
    donors.map((d) => ({
      userId: d._id,
      type: "camp_new",
      title: `Blood camp: ${camp.title}`,
      message: `${camp.venue}, ${camp.city}`,
      relatedId: camp._id,
    }))
  );

  res.status(201).json({ success: true, camp: shape(camp, {}) });
});

// PUT /api/camps/:id
export const updateCamp = asyncHandler(async (req, res) => {
  const camp = await loadCamp(req, res);
  requireManager(req, res, camp);
  if (camp.status === "cancelled") fail(res, 400, "A cancelled camp cannot be edited");

  const b = req.body;
  const before = `${camp.date.toISOString()}|${camp.startTime}|${camp.endTime}|${camp.venue}`;

  const fields = ["title", "organizer", "description", "startTime", "endTime", "venue", "city", "address", "contactPhone"];
  fields.forEach((f) => {
    if (b[f] !== undefined) camp[f] = b[f];
  });
  if (b.date !== undefined) {
    const d = new Date(b.date);
    if (d < todayCutoff()) fail(res, 400, "The camp date cannot be in the past");
    camp.date = d;
  }
  if (b.capacity !== undefined) camp.capacity = Number(b.capacity) || 0;
  if (camp.endTime <= camp.startTime) fail(res, 400, "End time must be after start time");

  await camp.save();

  const after = `${camp.date.toISOString()}|${camp.startTime}|${camp.endTime}|${camp.venue}`;
  if (before !== after) {
    const regs = await CampRegistration.find({ campId: camp._id, status: "registered" }).select("userId").lean();
    await notifyMany(
      regs.map((r) => ({
        userId: r.userId,
        type: "camp_updated",
        title: `Camp updated: ${camp.title}`,
        message: "The date, time or venue changed. Please check the details.",
        relatedId: camp._id,
      }))
    );
  }

  const counts = await countsFor([camp._id]);
  res.json({ success: true, camp: shape(camp, counts) });
});

// PATCH /api/camps/:id/cancel
export const cancelCamp = asyncHandler(async (req, res) => {
  const camp = await loadCamp(req, res);
  requireManager(req, res, camp);
  if (camp.status === "cancelled") fail(res, 400, "This camp is already cancelled");

  camp.status = "cancelled";
  await camp.save();

  const regs = await CampRegistration.find({ campId: camp._id, status: "registered" }).select("userId").lean();
  await notifyMany(
    regs.map((r) => ({
      userId: r.userId,
      type: "camp_cancelled",
      title: `Camp cancelled: ${camp.title}`,
      message: "The organizer cancelled this camp.",
      relatedId: camp._id,
    }))
  );

  res.json({ success: true, camp: shape(camp, await countsFor([camp._id])) });
});

// POST /api/camps/:id/register
export const registerForCamp = asyncHandler(async (req, res) => {
  const camp = await loadCamp(req, res);
  if (camp.status !== "upcoming") fail(res, 400, "This camp has been cancelled");
  if (camp.date < todayCutoff()) fail(res, 400, "This camp has already taken place");

  const { eligible, nextEligibleDate } = eligibilityOn(req.user, camp.date);
  if (!eligible) {
    fail(
      res,
      400,
      `You are still in your rest period and will be eligible from ${nextEligibleDate.toISOString().slice(0, 10)}`
    );
  }

  const existing = await CampRegistration.findOne({ campId: camp._id, userId: req.user._id });
  if (existing && existing.status === "registered") fail(res, 409, "You are already registered for this camp");

  if (camp.capacity > 0) {
    const taken = await CampRegistration.countDocuments({ campId: camp._id, status: "registered" });
    if (taken >= camp.capacity) fail(res, 400, "This camp is full");
  }

  if (existing) {
    existing.status = "registered";
    await existing.save();
  } else {
    await CampRegistration.create({ campId: camp._id, userId: req.user._id });
  }

  await notifyUser({
    userId: req.user._id,
    type: "camp_registered",
    title: `You are registered: ${camp.title}`,
    message: `${camp.venue}, ${camp.city} · ${camp.startTime}–${camp.endTime}`,
    relatedId: camp._id,
  });

  const counts = await countsFor([camp._id]);
  res.status(201).json({ success: true, camp: shape(camp, counts), isRegistered: true });
});

// DELETE /api/camps/:id/register
export const cancelRegistration = asyncHandler(async (req, res) => {
  const camp = await loadCamp(req, res);
  const reg = await CampRegistration.findOne({ campId: camp._id, userId: req.user._id, status: "registered" });
  if (!reg) fail(res, 404, "You are not registered for this camp");

  reg.status = "cancelled";
  await reg.save();

  const counts = await countsFor([camp._id]);
  res.json({ success: true, camp: shape(camp, counts), isRegistered: false });
});

// GET /api/camps/:id/attendees   (organizer or admin)
export const getAttendees = asyncHandler(async (req, res) => {
  const camp = await loadCamp(req, res);
  requireManager(req, res, camp);

  const regs = await CampRegistration.find({ campId: camp._id, status: "registered" })
    .populate("userId", "name phone bloodGroup city")
    .sort({ createdAt: 1 });

  const attendees = regs
    .filter((r) => r.userId)
    .map((r) => ({
      registrationId: r._id,
      attended: r.attended,
      name: r.userId.name,
      phone: r.userId.phone,
      bloodGroup: r.userId.bloodGroup,
      city: r.userId.city,
    }));

  res.json({ success: true, attendees });
});

// PATCH /api/camps/:id/attendees/:regId
export const markAttendance = asyncHandler(async (req, res) => {
  const camp = await loadCamp(req, res);
  requireManager(req, res, camp);
  if (!mongoose.isValidObjectId(req.params.regId)) fail(res, 404, "Registration not found");

  const reg = await CampRegistration.findOneAndUpdate(
    { _id: req.params.regId, campId: camp._id, status: "registered" },
    { attended: req.body.attended },
    { returnDocument: "after" }
  );
  if (!reg) fail(res, 404, "Registration not found");
  res.json({ success: true, attended: reg.attended });
});

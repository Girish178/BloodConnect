import User from "../models/User.js";
import Donation from "../models/Donation.js";
import BloodRequest from "../models/BloodRequest.js";
import DonationResponse from "../models/DonationResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Tiny in-memory cache so the public home page cannot hammer the database
let cache = { at: 0, data: null };
const CACHE_MS = 60 * 1000;

// GET /api/stats/public  (no login, aggregates only, no personal data)
export const getPublicStats = asyncHandler(async (req, res) => {
  if (cache.data && Date.now() - cache.at < CACHE_MS) {
    return res.json({ success: true, stats: cache.data });
  }

  const [donors, donations, activeRequests, connections] = await Promise.all([
    User.countDocuments({ isDonor: true }),
    Donation.countDocuments(),
    BloodRequest.countDocuments({ status: { $in: ["open", "matched"] } }),
    DonationResponse.countDocuments({ status: { $in: ["accepted", "selected"] } }),
  ]);

  cache = { at: Date.now(), data: { donors, donations, activeRequests, connections } };
  res.json({ success: true, stats: cache.data });
});
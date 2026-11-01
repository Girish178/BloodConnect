import { asyncHandler } from "../utils/asyncHandler.js";
import { findMatchingDonors } from "../services/matchingService.js";

// GET /api/donors/search?bloodGroup=B%2B&lat=19.56&lng=74.21&radius=10
export const searchDonors = asyncHandler(async (req, res) => {
  const { bloodGroup, lat, lng, radius } = req.validatedQuery;

  const donors = await findMatchingDonors({
    bloodGroup,
    latitude: lat,
    longitude: lng,
    radiusKm: radius,
    excludeUserId: req.user._id,
  });

  res.json({ success: true, count: donors.length, donors });
});
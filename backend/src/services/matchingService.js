import User from "../models/User.js";
import { COOLDOWN_DAYS } from "../constants.js";

/**
 * Finds donors who:
 *  - have the exact requested blood group
 *  - are donors AND have marked themselves available
 *  - have finished their cooldown period
 *  - are within radiusKm of the given point
 * Results are sorted nearest first. Phone and email are never returned.
 */
export const findMatchingDonors = async ({
  bloodGroup,
  longitude,
  latitude,
  radiusKm = 10,
  excludeUserId,
  limit = 50,
}) => {
  const cutoff = new Date(Date.now() - COOLDOWN_DAYS * 86400000);

  const query = {
    bloodGroup,
    isDonor: true,
    isAvailable: true,
    $or: [{ lastDonationDate: null }, { lastDonationDate: { $lte: cutoff } }],
  };
  if (excludeUserId) query._id = { $ne: excludeUserId };

  return User.aggregate([
    {
      $geoNear: {
        near: { type: "Point", coordinates: [longitude, latitude] },
        distanceField: "distanceMeters",
        maxDistance: radiusKm * 1000,
        spherical: true,
        query,
      },
    },
    { $limit: limit },
    {
      $project: {
        name: 1,
        bloodGroup: 1,
        city: 1,
        isAvailable: 1,
        distanceKm: { $round: [{ $divide: ["$distanceMeters", 1000] }, 1] },
      },
    },
  ]);
};
import { asyncHandler } from "../utils/asyncHandler.js";

// PUT /api/users/profile
export const updateProfile = asyncHandler(async (req, res) => {
  const { latitude, longitude, ...updates } = req.body;
  const user = req.user;

  Object.assign(user, updates);

  if (latitude !== undefined && longitude !== undefined) {
    user.location = { type: "Point", coordinates: [longitude, latitude] };
  }

  // If they are now in cooldown, they cannot stay available
  if (user.isAvailable && !user.isEligible) {
    user.isAvailable = false;
  }

  await user.save();
  res.json({ success: true, user });
});

// PATCH /api/users/availability
export const setAvailability = asyncHandler(async (req, res) => {
  const { isAvailable } = req.body;
  const user = req.user;

  if (isAvailable) {
    if (!user.isDonor) {
      res.status(400);
      throw new Error("Enable donor mode in your profile first");
    }
    if (!user.isEligible) {
      res.status(400);
      throw new Error(
        `You can donate again after ${user.nextEligibleDate.toDateString()}`
      );
    }
  }

  user.isAvailable = isAvailable;
  await user.save();
  res.json({ success: true, user });
});
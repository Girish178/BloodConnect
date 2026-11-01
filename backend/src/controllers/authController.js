import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateToken } from "../utils/generateToken.js";

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { latitude, longitude, ...data } = req.body;

  const exists = await User.findOne({ email: data.email });
  if (exists) {
    res.status(409);
    throw new Error("Email is already registered");
  }

  const userData = { ...data };
  if (latitude !== undefined && longitude !== undefined) {
    userData.location = { type: "Point", coordinates: [longitude, latitude] };
  }

  const user = await User.create(userData);

  res.status(201).json({
    success: true,
    token: generateToken(user._id),
    user,
  });
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  res.json({
    success: true,
    token: generateToken(user._id),
    user,
  });
});

// GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});
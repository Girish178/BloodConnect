import Report from "../models/Report.js";
import BloodRequest from "../models/BloodRequest.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// POST /api/reports
export const createReport = asyncHandler(async (req, res) => {
  const { requestId, reason, details } = req.body;

  const request = await BloodRequest.findById(requestId).select("createdBy");
  if (!request) {
    res.status(404);
    throw new Error("Request not found");
  }
  if (String(request.createdBy) === String(req.user._id)) {
    res.status(400);
    throw new Error("You cannot report your own request");
  }

  try {
    const report = await Report.create({
      requestId,
      reporterId: req.user._id,
      reason,
      details: details || "",
    });
    res.status(201).json({ success: true, report });
  } catch (err) {
    if (err.code === 11000) {
      res.status(409);
      throw new Error("You have already reported this request");
    }
    throw err;
  }
});
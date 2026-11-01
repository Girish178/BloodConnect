import mongoose from "mongoose";

export const REPORT_REASONS = ["fake", "spam", "wrong_info", "abusive", "other"];

const reportSchema = new mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BloodRequest",
      required: true,
      index: true,
    },
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: { type: String, enum: REPORT_REASONS, required: true },
    details: { type: String, trim: true, maxlength: 300, default: "" },
    status: {
      type: String,
      enum: ["open", "resolved", "dismissed"],
      default: "open",
    },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// One report per user per request
reportSchema.index({ requestId: 1, reporterId: 1 }, { unique: true });
reportSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("Report", reportSchema);
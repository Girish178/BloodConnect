import mongoose from "mongoose";

const donationResponseSchema = new mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BloodRequest",
      required: true,
    },
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["accepted", "declined", "withdrawn", "selected"],
      required: true,
    },
    message: { type: String, trim: true, maxlength: 200, default: "" },
    respondedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// One response per donor per request
donationResponseSchema.index({ requestId: 1, donorId: 1 }, { unique: true });

export default mongoose.model("DonationResponse", donationResponseSchema);
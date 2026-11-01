import mongoose from "mongoose";

const donationSchema = new mongoose.Schema(
  {
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BloodRequest",
      required: true,
    },
    // unique: a response can be verified only once
    responseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DonationResponse",
      required: true,
      unique: true,
    },
    bloodGroup: { type: String, required: true },
    hospitalName: { type: String, required: true },
    city: { type: String, required: true },
    donationDate: { type: Date, default: Date.now },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    verificationStatus: { type: String, enum: ["verified"], default: "verified" },
    certificateId: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export default mongoose.model("Donation", donationSchema);
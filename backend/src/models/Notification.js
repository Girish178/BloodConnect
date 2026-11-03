import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "new_request",
        "donor_accepted",
        "donor_withdrew",
        "donor_selected",
        "request_cancelled",
        "donation_verified",
        "camp_new",
        "camp_registered",
        "camp_updated",
        "camp_cancelled",
      ],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, trim: true, default: "" },
    relatedId: { type: mongoose.Schema.Types.ObjectId }, // the blood request, or the camp for camp_* types
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });
// Auto-delete after 30 days so the collection stays small
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

export default mongoose.model("Notification", notificationSchema);

import mongoose from "mongoose";

export const CAMP_STATUSES = ["upcoming", "cancelled"];

const campSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 100 },
    organizer: { type: String, trim: true, maxlength: 100, default: "" },
    description: { type: String, trim: true, maxlength: 500, default: "" },

    // The day of the camp (stored as midnight UTC of that calendar day)
    date: { type: Date, required: true },
    startTime: { type: String, default: "09:00" }, // "HH:MM", 24 hour
    endTime: { type: String, default: "17:00" },

    venue: { type: String, required: true, trim: true, maxlength: 120 },
    city: { type: String, required: true, trim: true },
    address: { type: String, trim: true, maxlength: 200, default: "" },
    contactPhone: { type: String, required: true, trim: true },

    // 0 means no limit
    capacity: { type: Number, default: 0, min: 0, max: 5000 },

    status: { type: String, enum: CAMP_STATUSES, default: "upcoming" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: true }
);

campSchema.index({ date: 1, status: 1 });
campSchema.index({ city: 1 });

export default mongoose.model("Camp", campSchema);

import mongoose from "mongoose";
import { BLOOD_GROUPS, URGENCY_LEVELS, REQUEST_STATUSES } from "../constants.js";

const bloodRequestSchema = new mongoose.Schema(
  {
    patientName: { type: String, required: true, trim: true, minlength: 2 },
    bloodGroup: { type: String, required: true, enum: BLOOD_GROUPS },
    unitsRequired: { type: Number, required: true, min: 1, max: 10 },
    unitsFulfilled: { type: Number, default: 0, min: 0 },
    hospitalName: { type: String, required: true, trim: true },
    hospitalAddress: { type: String, trim: true, default: "" },
    city: { type: String, required: true, trim: true },
    urgency: { type: String, enum: URGENCY_LEVELS, default: "urgent" },
    contactNumber: { type: String, required: true, trim: true },
    requiredBy: { type: Date },
    notes: { type: String, trim: true, maxlength: 300, default: "" },

    // GeoJSON: [longitude, latitude]
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: (v) => Array.isArray(v) && v.length === 2,
          message: "Coordinates must be [longitude, latitude]",
        },
      },
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: { type: String, enum: REQUEST_STATUSES, default: "open" },
  },
  { timestamps: true }
);

bloodRequestSchema.index({ location: "2dsphere" });
bloodRequestSchema.index({ status: 1, bloodGroup: 1, createdAt: -1 });

export default mongoose.model("BloodRequest", bloodRequestSchema);
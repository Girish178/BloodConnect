import mongoose from "mongoose";
import { BLOOD_GROUPS } from "../constants.js";

const stockItem = new mongoose.Schema(
  {
    bloodGroup: { type: String, enum: BLOOD_GROUPS, required: true },
    units: { type: Number, min: 0, default: 0 },
    fee: { type: Number, min: 0, default: 0 }, // processing fee per unit, in rupees
  },
  { _id: false }
);

const bloodBankSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ["blood_bank", "hospital"], default: "blood_bank" },
    city: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    phone: { type: String, trim: true },
    openHours: { type: String, trim: true },
    is24x7: { type: Boolean, default: false },
    // Plain numbers (not GeoJSON): a region has only a few hundred banks, so distance is worked out in code
    latitude: { type: Number, min: -90, max: 90 },
    longitude: { type: Number, min: -180, max: 180 },

    stock: { type: [stockItem], default: () => BLOOD_GROUPS.map((bloodGroup) => ({ bloodGroup, units: 0, fee: 0 })) },
    stockUpdatedAt: { type: Date, default: null },
    stockUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    managers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

bloodBankSchema.index({ city: 1, isActive: 1 });

export default mongoose.model("BloodBank", bloodBankSchema);

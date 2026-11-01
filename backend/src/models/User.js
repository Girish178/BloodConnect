import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { BLOOD_GROUPS, COOLDOWN_DAYS } from "../constants.js";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 8, select: false },
    phone: { type: String, required: true, trim: true },
    bloodGroup: { type: String, required: true, enum: BLOOD_GROUPS },
    city: { type: String, required: true, trim: true },

    // user = donor/requester, verifier = hospital or blood-bank staff, admin = platform admin
    role: { type: String, enum: ["user", "verifier", "admin"], default: "user" },
    hospitalName: { type: String, trim: true }, // only set for verifiers

    isDonor: { type: Boolean, default: true },
    isAvailable: { type: Boolean, default: false },
    lastDonationDate: { type: Date, default: null },

    // GeoJSON: coordinates are [longitude, latitude]. Left unset if unknown.
    location: {
      type: { type: String, enum: ["Point"] },
      coordinates: {
        type: [Number],
        default: undefined,
        validate: {
          validator: (v) => v === undefined || v.length === 2,
          message: "Coordinates must be [longitude, latitude]",
        },
      },
    },
  },
  { timestamps: true }
);

userSchema.index({ location: "2dsphere" });
userSchema.index({ bloodGroup: 1, isAvailable: 1 });

userSchema.virtual("nextEligibleDate").get(function () {
  if (!this.lastDonationDate) return null;
  return new Date(this.lastDonationDate.getTime() + COOLDOWN_DAYS * 86400000);
});

userSchema.virtual("isEligible").get(function () {
  const next = this.nextEligibleDate;
  return !next || next <= new Date();
});

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.__v;
    delete ret.id;
    return ret;
  },
});

export default mongoose.model("User", userSchema);
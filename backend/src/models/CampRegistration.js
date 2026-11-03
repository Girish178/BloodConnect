import mongoose from "mongoose";

const campRegistrationSchema = new mongoose.Schema(
  {
    campId: { type: mongoose.Schema.Types.ObjectId, ref: "Camp", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["registered", "cancelled"], default: "registered" },
    // Set by the camp organizer on the day
    attended: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// One registration per person per camp (cancel and re-register reuses the same row)
campRegistrationSchema.index({ campId: 1, userId: 1 }, { unique: true });
campRegistrationSchema.index({ userId: 1, status: 1 });

export default mongoose.model("CampRegistration", campRegistrationSchema);

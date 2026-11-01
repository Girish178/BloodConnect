export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

// Standard red-cell compatibility, used for the learning card on the home page.
// canGiveTo: who this group can donate to. canReceiveFrom: who it can receive from.
export const COMPATIBILITY = {
  "A+": { canGiveTo: ["A+", "AB+"], canReceiveFrom: ["A+", "A-", "O+", "O-"] },
  "A-": { canGiveTo: ["A+", "A-", "AB+", "AB-"], canReceiveFrom: ["A-", "O-"] },
  "B+": { canGiveTo: ["B+", "AB+"], canReceiveFrom: ["B+", "B-", "O+", "O-"] },
  "B-": { canGiveTo: ["B+", "B-", "AB+", "AB-"], canReceiveFrom: ["B-", "O-"] },
  "AB+": { canGiveTo: ["AB+"], canReceiveFrom: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] },
  "AB-": { canGiveTo: ["AB+", "AB-"], canReceiveFrom: ["A-", "B-", "AB-", "O-"] },
  "O+": { canGiveTo: ["A+", "B+", "AB+", "O+"], canReceiveFrom: ["O+", "O-"] },
  "O-": { canGiveTo: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], canReceiveFrom: ["O-"] },
};

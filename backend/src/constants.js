export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

// Placeholder cooldown. Swap in your own eligibility engine later.
export const COOLDOWN_DAYS = 90;
export const URGENCY_LEVELS = ["critical", "urgent", "planned"];
export const REQUEST_STATUSES = ["open", "matched", "completed", "cancelled"];
export const MAX_RADIUS_KM = 100;
// Verifiers can only confirm donations for requests at their own hospital.
// Set to false while demoing if hospital names are typed differently.
export const RESTRICT_VERIFIER_TO_HOSPITAL = true;
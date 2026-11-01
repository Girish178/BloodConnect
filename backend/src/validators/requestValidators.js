import { z } from "zod";
import { BLOOD_GROUPS, URGENCY_LEVELS, MAX_RADIUS_KM } from "../constants.js";

// In a URL, an unencoded "+" turns into a space ("B+" -> "B "), so repair it
const bloodGroupQuery = z
  .string()
  .transform((s) => s.replace(/ /g, "+").trim())
  .pipe(z.enum(BLOOD_GROUPS));

export const createRequestSchema = z.object({
  patientName: z.string().trim().min(2, "Patient name is required"),
  bloodGroup: z.enum(BLOOD_GROUPS),
  unitsRequired: z.number().int().min(1).max(10),
  hospitalName: z.string().trim().min(2, "Hospital name is required"),
  hospitalAddress: z.string().trim().optional(),
  city: z.string().trim().min(2, "City is required"),
  urgency: z.enum(URGENCY_LEVELS).optional().default("urgent"),
  contactNumber: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  requiredBy: z.coerce.date().optional(),
  notes: z.string().trim().max(300).optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const requestListSchema = z.object({
  bloodGroup: bloodGroupQuery.optional(),
  urgency: z.enum(URGENCY_LEVELS).optional(),
  city: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const donorSearchSchema = z.object({
  bloodGroup: bloodGroupQuery,
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().min(1).max(MAX_RADIUS_KM).default(10),
});

export const respondSchema = z.object({
  status: z.enum(["accepted", "declined", "withdrawn"]),
  message: z.string().trim().max(200).optional(),
});
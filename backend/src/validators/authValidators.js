import { z } from "zod";
import { BLOOD_GROUPS } from "../constants.js";

const phone = z
  .string()
  .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number");

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name is too short"),
  email: z.string().trim().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone,
  bloodGroup: z.enum(BLOOD_GROUPS),
  city: z.string().trim().min(2, "City is required"),
  isDonor: z.boolean().optional().default(true),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).optional(),
  phone: phone.optional(),
  city: z.string().trim().min(2).optional(),
  bloodGroup: z.enum(BLOOD_GROUPS).optional(),
  isDonor: z.boolean().optional(),
  lastDonationDate: z.coerce.date().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export const availabilitySchema = z.object({
  isAvailable: z.boolean(),
});
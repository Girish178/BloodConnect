import { z } from "zod";

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use the format HH:MM");

const campBase = z.object({
  title: z.string().trim().min(3, "Title is too short").max(100),
  organizer: z.string().trim().max(100).optional(),
  description: z.string().trim().max(500).optional(),
  date: z.coerce.date({ invalid_type_error: "Enter a valid date" }),
  startTime: time,
  endTime: time,
  venue: z.string().trim().min(2, "Venue is required").max(120),
  city: z.string().trim().min(2, "City is required"),
  address: z.string().trim().max(200).optional(),
  contactPhone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  capacity: z.coerce.number().int().min(0).max(5000).optional(),
});

export const createCampSchema = campBase.refine((d) => d.endTime > d.startTime, {
  message: "End time must be after start time",
  path: ["endTime"],
});

export const updateCampSchema = campBase.partial();

export const attendanceSchema = z.object({
  attended: z.boolean(),
});

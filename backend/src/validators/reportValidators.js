import { z } from "zod";
import { REPORT_REASONS } from "../models/Report.js";

export const createReportSchema = z.object({
  requestId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid request id"),
  reason: z.enum(REPORT_REASONS),
  details: z.string().trim().max(300).optional(),
});

export const resolveReportSchema = z.object({
  action: z.enum(["dismiss", "cancel_request"]),
});
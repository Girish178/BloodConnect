import { z } from "zod";

export const tokenSchema = z.object({
  token: z.string().trim().min(20, "QR code is missing or too short"),
});
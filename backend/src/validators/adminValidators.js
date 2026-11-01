import { z } from "zod";

export const setRoleSchema = z
  .object({
    role: z.enum(["user", "verifier"]),
    hospitalName: z.string().trim().min(2, "Hospital name is too short").optional(),
  })
  .refine((d) => d.role !== "verifier" || !!d.hospitalName, {
    message: "Hospital name is required for a verifier",
    path: ["hospitalName"],
  });
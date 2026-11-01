import express from "express";
import { createReport } from "../controllers/reportController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { createReportSchema } from "../validators/reportValidators.js";

const router = express.Router();

router.post("/", protect, validate(createReportSchema), createReport);

export default router;

import express from "express";
import { searchDonors } from "../controllers/donorController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { validateQuery } from "../middlewares/validate.js";
import { donorSearchSchema } from "../validators/requestValidators.js";

const router = express.Router();

router.use(protect);
router.get("/search", validateQuery(donorSearchSchema), searchDonors);

export default router;
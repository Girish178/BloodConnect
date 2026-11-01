import express from "express";
import { updateProfile, setAvailability } from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import {
  updateProfileSchema,
  availabilitySchema,
} from "../validators/authValidators.js";

const router = express.Router();

router.use(protect);

router.put("/profile", validate(updateProfileSchema), updateProfile);
router.patch("/availability", validate(availabilitySchema), setAvailability);

export default router;
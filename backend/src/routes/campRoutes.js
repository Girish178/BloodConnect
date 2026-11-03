import express from "express";
import {
  listCamps,
  managedCamps,
  myRegistrations,
  getCamp,
  createCamp,
  updateCamp,
  cancelCamp,
  registerForCamp,
  cancelRegistration,
  getAttendees,
  markAttendance,
} from "../controllers/campController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { verifierOrAdmin } from "../middlewares/adminMiddleware.js";
import { validate } from "../middlewares/validate.js";
import {
  createCampSchema,
  updateCampSchema,
  attendanceSchema,
} from "../validators/campValidators.js";

const router = express.Router();

// Lets a page work for guests and logged-in users: a missing or bad token
// just means "anonymous" instead of an error.
const optionalAuth = (req, res, next) => {
  if (!req.headers.authorization) return next();
  protect(req, res, (err) => {
    if (err) res.status(200);
    next();
  });
};

router.get("/", listCamps);
router.get("/mine", protect, myRegistrations);
router.get("/managed", protect, verifierOrAdmin, managedCamps);
router.post("/", protect, verifierOrAdmin, validate(createCampSchema), createCamp);

router.get("/:id", optionalAuth, getCamp);
router.put("/:id", protect, verifierOrAdmin, validate(updateCampSchema), updateCamp);
router.patch("/:id/cancel", protect, verifierOrAdmin, cancelCamp);

router.post("/:id/register", protect, registerForCamp);
router.delete("/:id/register", protect, cancelRegistration);

router.get("/:id/attendees", protect, verifierOrAdmin, getAttendees);
router.patch(
  "/:id/attendees/:regId",
  protect,
  verifierOrAdmin,
  validate(attendanceSchema),
  markAttendance
);

export default router;

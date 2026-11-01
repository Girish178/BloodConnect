import express from "express";
import {
  listUsers,
  setUserRole,
  getOverview,
  listReports,
  resolveReport,
} from "../controllers/adminController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { adminOnly } from "../middlewares/adminMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { setRoleSchema } from "../validators/adminValidators.js";
import { resolveReportSchema } from "../validators/reportValidators.js";

const router = express.Router();

router.use(protect, adminOnly);

router.get("/overview", getOverview);
router.get("/users", listUsers);
router.patch("/users/:id/role", validate(setRoleSchema), setUserRole);
router.get("/reports", listReports);
router.patch("/reports/:id", validate(resolveReportSchema), resolveReport);

export default router;
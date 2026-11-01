import express from "express";
import {
  getDonationQr,
  inspectDonation,
  verifyDonation,
  getMyDonations,
  downloadCertificate,
} from "../controllers/donationController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { verifierOrAdmin } from "../middlewares/adminMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { tokenSchema } from "../validators/donationValidators.js";

const router = express.Router();

router.use(protect);

router.get("/mine", getMyDonations);
router.get("/qr/:requestId", getDonationQr);
router.post("/inspect", verifierOrAdmin, validate(tokenSchema), inspectDonation);
router.post("/verify", verifierOrAdmin, validate(tokenSchema), verifyDonation);
router.get("/:id/certificate", downloadCertificate);

export default router;
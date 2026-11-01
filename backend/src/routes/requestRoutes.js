import express from "express";
import {
  createRequest,
  getRequests,
  getMyRequests,
  getRequestById,
  cancelRequest,
  getRequestResponses,
  respondToRequest,
  selectDonor,
} from "../controllers/requestController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { validate, validateQuery } from "../middlewares/validate.js";
import {
  createRequestSchema,
  requestListSchema,
  respondSchema,
} from "../validators/requestValidators.js";

const router = express.Router();

router.use(protect);

router.post("/", validate(createRequestSchema), createRequest);
router.get("/", validateQuery(requestListSchema), getRequests);
router.get("/mine", getMyRequests); // must stay above "/:id"
router.get("/:id", getRequestById);
router.patch("/:id/cancel", cancelRequest);
router.get("/:id/responses", getRequestResponses);
router.post("/:id/respond", validate(respondSchema), respondToRequest);
router.patch("/:id/responses/:responseId/select", selectDonor);

export default router;
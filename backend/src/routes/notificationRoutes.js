import express from "express";
import {
  getNotifications,
  getUnreadCount,
  markRead,
  markAllRead,
} from "../controllers/notificationController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getNotifications);
router.get("/unread-count", getUnreadCount);
router.patch("/read-all", markAllRead); // must stay above "/:id/read"
router.patch("/:id/read", markRead);

export default router;
import Notification from "../models/Notification.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// GET /api/notifications?limit=20
export const getNotifications = asyncHandler(async (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 50);

  const [notifications, unreadCount] = await Promise.all([
    Notification.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(limit),
    Notification.countDocuments({ userId: req.user._id, isRead: false }),
  ]);

  res.json({ success: true, unreadCount, notifications });
});

// GET /api/notifications/unread-count
export const getUnreadCount = asyncHandler(async (req, res) => {
  const unreadCount = await Notification.countDocuments({
    userId: req.user._id,
    isRead: false,
  });
  res.json({ success: true, unreadCount });
});

// PATCH /api/notifications/:id/read
export const markRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { isRead: true },
    { new: true }
  );
  if (!notification) {
    res.status(404);
    throw new Error("Notification not found");
  }
  res.json({ success: true, notification });
});

// PATCH /api/notifications/read-all
export const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { userId: req.user._id, isRead: false },
    { isRead: true }
  );
  res.json({ success: true });
});
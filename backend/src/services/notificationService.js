import Notification from "../models/Notification.js";

// Notification failures must never break the main action, so errors are only logged.
export const notifyUser = async ({ userId, type, title, message, relatedId }) => {
  try {
    await Notification.create({ userId, type, title, message, relatedId });
  } catch (err) {
    console.error("notifyUser failed:", err.message);
  }
};

// docs: [{ userId, type, title, message, relatedId }, ...]
export const notifyMany = async (docs) => {
  if (!docs.length) return;
  try {
    await Notification.insertMany(docs, { ordered: false });
  } catch (err) {
    console.error("notifyMany failed:", err.message);
  }
};
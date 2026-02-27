const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const { protect } = require("../middleware/authMiddleware");

// All notification routes require authentication
router.use(protect);

// Get all notifications for logged in user
router.get("/", notificationController.getNotifications);

// Mark a single notification as read
router.put("/:id/read", notificationController.markAsRead);

// Mark all notifications as read
router.put("/read-all", notificationController.markAllAsRead);

module.exports = router;

const express = require("express");
const {
  updateProfile,
  deleteResume,
  getPublicProfile,
  searchUsers,
  followUser,
  unfollowUser,
} = require("../controllers/userController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

//protected routes
router.put("/profile", protect, updateProfile);
router.post("/resume", protect, deleteResume)
router.post("/:id/follow", protect, followUser);
router.post("/:id/unfollow", protect, unfollowUser);

// Public & Specific Paths (Before /:id)
router.get("/search", protect, searchUsers);

// Public Routes
router.get("/:id", getPublicProfile);

module.exports = router;

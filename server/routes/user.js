const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const {
  getUserProfile,
  updateUserProfile,
  updateMindfulnessStats,
  addToFavorites,
  addRecentlyPlayed,
  getUserStats,
  deleteUserAccount
} = require("../controllers/userController");

router.use(authMiddleware);

router.get("/profile", getUserProfile);

router.put("/profile", updateUserProfile);

router.post("/mindfulness/session", updateMindfulnessStats);

router.post("/favorites", addToFavorites);

router.post("/recently-played", addRecentlyPlayed);

router.get("/stats", getUserStats);

router.delete("/account", deleteUserAccount);

module.exports = router;
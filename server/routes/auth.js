const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const authController = require("../controllers/authController");

// Register route
router.post(
  "/register",
  [
    body("name")
      .isLength({ min: 2, max: 50 })
      .withMessage("Name must be 2 to 50 characters"),
    body("email").isEmail().withMessage("Invalid email address"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("mobile").optional().isMobilePhone().withMessage("Invalid mobile number"),
  ],
  authController.signup
);

// Also keep signup for backward compatibility
router.post(
  "/signup",
  [
    body("name")
      .isLength({ min: 2, max: 50 })
      .withMessage("Name must be 2 to 50 characters"),
    body("email").isEmail().withMessage("Invalid email address"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("mobile").optional().isMobilePhone().withMessage("Invalid mobile number"),
  ],
  authController.signup
);

// Login route
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Invalid email address"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  authController.login
);

// Verify token route
router.get("/verify", require("../middlewares/authMiddleware"), async (req, res) => {
  try {
    const User = require("../models/User");
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      user: user
    });
  } catch (error) {
    console.error("Verify token error:", error);
    res.status(500).json({
      success: false,
      message: "Error verifying token"
    });
  }
});

module.exports = router;

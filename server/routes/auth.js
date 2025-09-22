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
// router.get("/verify", authController.verifyToken);

module.exports = router;

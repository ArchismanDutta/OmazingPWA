const User = require("../models/User");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key_here";
const JWT_EXPIRES_IN = "7d";

// Helper to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

// Signup handler
exports.signup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { name, email, password, mobile, role } = req.body;

    // Check if user/email already exists
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });
    }
    existingUser = await User.findOne({ mobile });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Mobile number already registered" });
    }

    // Create new user
    const newUser = new User({ name, email, password, mobile, role });
    await newUser.save();

    // Generate JWT token
    const token = generateToken(newUser);

    res
      .status(201)
      .json({
        success: true,
        token,
        user: { id: newUser._id, name, email, mobile, role: newUser.role },
      });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Login handler
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    // Check password match
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = generateToken(user);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

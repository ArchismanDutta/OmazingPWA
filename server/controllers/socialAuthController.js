const User = require("../models/User");
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const axios = require("axios");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key_here";
const JWT_EXPIRES_IN = "7d";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

// Google Login handler
exports.googleLogin = async (req, res) => {
  const { tokenId } = req.body;

  console.log(
    "Received Google tokenId:",
    tokenId ? "Token received" : "No token"
  );
  console.log(
    "Google Client ID configured:",
    process.env.GOOGLE_CLIENT_ID ? "Yes" : "No"
  );

  if (!tokenId) {
    return res
      .status(400)
      .json({ success: false, message: "Google token is required" });
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload;

    console.log("Google verification successful for email:", email);

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Google token missing email" });
    }

    let user = await User.findOne({ email });

    if (!user) {
      // Create new user with Google ID
      user = new User({
        name,
        email,
        password: googleId + JWT_SECRET, // dummy password for social users
        socialIds: { google: googleId },
        role: "user",
      });
      await user.save();
      console.log("New Google user created:", email);
    } else {
      // Update existing user with Google ID if not already set
      if (!user.socialIds.google) {
        user.socialIds.google = googleId;
        await user.save();
      }
      console.log("Existing user logged in via Google:", email);
    }

    const token = generateToken(user);
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Google login error:", err.message);
    res.status(401).json({ success: false, message: "Invalid Google token" });
  }
};

// Facebook Login handler
exports.facebookLogin = async (req, res) => {
  const { accessToken } = req.body;

  console.log(
    "Received Facebook accessToken:",
    accessToken ? "Token received" : "No token"
  );

  if (!accessToken) {
    return res
      .status(400)
      .json({ success: false, message: "Facebook access token is required" });
  }

  try {
    // Verify Facebook token with Facebook Graph API
    const fbResponse = await axios.get(
      `https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`
    );
    const { email, name, id: facebookId } = fbResponse.data;

    console.log("Facebook verification successful for email:", email);

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Facebook token missing email" });
    }

    let user = await User.findOne({ email });

    if (!user) {
      // Create new user with Facebook ID
      user = new User({
        name,
        email,
        password: facebookId + JWT_SECRET, // dummy password for social users
        mobile: "0000000000", // placeholder mobile
        socialIds: { facebook: facebookId },
        role: "user",
      });
      await user.save();
      console.log("New Facebook user created:", email);
    } else {
      // Update existing user with Facebook ID if not already set
      if (!user.socialIds.facebook) {
        user.socialIds.facebook = facebookId;
        await user.save();
      }
      console.log("Existing user logged in via Facebook:", email);
    }

    const token = generateToken(user);
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Facebook login error:", err.response?.data || err.message);
    res.status(401).json({ success: false, message: "Invalid Facebook token" });
  }
};

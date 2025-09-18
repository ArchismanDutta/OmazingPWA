// app.js

const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

// Import custom middleware modules
const logger = require("./middlewares/logger");
const corsConfig = require("./middlewares/corsConfig");
const security = require("./middlewares/security");
const errorHandler = require("./middlewares/errorHandler");
const roleMiddleware = require("./middlewares/roleMiddleware");
const authMiddleware = require("./middlewares/authMiddleware");

const app = express();

// Database connection
mongoose
  .connect(
    process.env.MONGO_URI
  )
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Middleware Setup
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(logger);
app.use(corsConfig);
app.use(security);

// Public route example
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Mindfullness Platform",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
  });
});

// Health check route
app.get("/api/v1/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Auth routes
app.use("/api/v1/auth", require("./routes/auth"));
app.use("/api/v1/social-auth", require("./routes/socialAuth"));

// Content routes
app.use("/api/v1/content", require("./routes/content"));

// Sample protected route accessible by authenticated users only
app.get("/api/v1/user/dashboard", authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: "Welcome to user dashboard",
    user: req.user,
  });
});

// Sample protected admin route accessible only by admins
app.get(
  "/api/v1/admin/dashboard",
  authMiddleware,
  roleMiddleware(["admin"]),
  (req, res) => {
    res.json({
      success: true,
      message: "Welcome Admin!",
      user: req.user,
    });
  }
);

// Generic 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
    path: req.originalUrl,
    method: req.method,
  });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`CORS: All origins allowed`);
  console.log(`API Base URL: http://localhost:${PORT}/api/v1`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\nReceived SIGINT. Graceful shutdown...");
  mongoose.connection.close(() => {
    console.log("MongoDB connection closed.");
    process.exit(0);
  });
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Content = require("../models/Content");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const { upload, deleteFromS3, deleteFromLocal, isS3Enabled } = require("../services/uploadService");

router.get("/dashboard", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalSessions = await User.aggregate([
      { $group: { _id: null, total: { $sum: "$mindfulness.totalSessions" } } }
    ]);
    const totalMinutes = await User.aggregate([
      { $group: { _id: null, total: { $sum: "$mindfulness.totalMinutes" } } }
    ]);
    const premiumUsers = await User.countDocuments({ "subscription.type": "premium" });
    const activeUsers = await User.countDocuments({
      "mindfulness.lastSessionDate": {
        $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }
    });

    const stats = {
      totalUsers,
      totalSessions: totalSessions[0]?.total || 0,
      totalMinutes: totalMinutes[0]?.total || 0,
      premiumUsers,
      activeUsers
    };

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select("name email role createdAt");

    res.json({
      success: true,
      stats,
      recentUsers
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard data"
    });
  }
});

router.get("/users", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || "";
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } }
        ]
      };
    }

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalUsers = await User.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / limit);

    res.json({
      success: true,
      users,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users"
    });
  }
});

router.get("/users/:id", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user"
    });
  }
});

router.put("/users/:id", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
  try {
    const { name, email, role, subscription, isEmailVerified } = req.body;

    const updateData = {
      name,
      email,
      role,
      isEmailVerified
    };

    if (subscription) {
      updateData["subscription.type"] = subscription.type;
      updateData["subscription.status"] = subscription.status || "active";
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      message: "User updated successfully",
      user
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user"
    });
  }
});

router.delete("/users/:id", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete your own account"
      });
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete user"
    });
  }
});

router.get("/analytics", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
  try {
    const period = req.query.period || "30d";
    const days = period === "7d" ? 7 : period === "90d" ? 90 : period === "1y" ? 365 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const userGrowth = await User.aggregate([
      {
        $match: { createdAt: { $gte: startDate } }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          newUsers: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const subscriptionStats = await User.aggregate([
      {
        $group: {
          _id: "$subscription.type",
          count: { $sum: 1 }
        }
      }
    ]);

    const sessionStats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalSessions: { $sum: "$mindfulness.totalSessions" },
          totalMinutes: { $sum: "$mindfulness.totalMinutes" },
          avgSessions: { $avg: "$mindfulness.totalSessions" }
        }
      }
    ]);

    res.json({
      success: true,
      analytics: {
        userGrowth,
        subscriptionStats,
        sessionStats: sessionStats[0] || { totalSessions: 0, totalMinutes: 0, avgSessions: 0 }
      }
    });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics"
    });
  }
});

router.get("/export/users", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
  try {
    const users = await User.find().select("-password");

    const csvHeader = "Name,Email,Role,Subscription,Sessions,Minutes,Created At\n";
    const csvData = users.map(user =>
      `"${user.name}","${user.email}","${user.role}","${user.subscription.type}",${user.mindfulness.totalSessions},${user.mindfulness.totalMinutes},"${user.createdAt.toISOString()}"`
    ).join("\n");

    const csv = csvHeader + csvData;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="users_export_${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csv);
  } catch (error) {
    console.error("Export users error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to export users"
    });
  }
});

// Note: Content management routes are handled by /api/v1/content routes
// This keeps admin routes focused on user management and dashboard analytics

module.exports = router;
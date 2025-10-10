const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Content = require("../models/Content");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const { upload, deleteFromS3, deleteFromLocal, isS3Enabled } = require("../services/uploadService");
const { body } = require('express-validator');

// Import course controllers
const adminCourseController = require('../controllers/adminCourseController');

// Import video carousel controller
const videoCarouselController = require('../controllers/videoCarouselController');

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
      data: users,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalUsers,
        itemsPerPage: limit,
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
    const { name, email, role, subscription, subscriptionType, isEmailVerified } = req.body;

    const updateData = {
      name,
      email,
      role,
      isEmailVerified
    };

    // Handle both subscription object and subscriptionType string
    if (subscription) {
      updateData["subscription.type"] = subscription.type;
      updateData["subscription.status"] = subscription.status || "active";
    } else if (subscriptionType) {
      updateData["subscription.type"] = subscriptionType;
      updateData["subscription.status"] = "active";
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
      data: user
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
  
// Course Management Routes
router.get("/courses", authMiddleware, roleMiddleware(["admin"]), adminCourseController.getAllCoursesAdmin);
router.get("/courses/:id", authMiddleware, roleMiddleware(["admin"]), adminCourseController.getCourseByIdAdmin);
 
router.post(
  "/courses",
  authMiddleware,
  roleMiddleware(["admin"]),
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('instructor.name').notEmpty().withMessage('Instructor name is required'),
    body('thumbnail').notEmpty().withMessage('Thumbnail is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('level').isIn(['beginner', 'intermediate', 'advanced']).withMessage('Invalid level')
  ],
  adminCourseController.createCourse
);

router.put(
  "/courses/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  adminCourseController.updateCourse
);

router.delete("/courses/:id", authMiddleware, roleMiddleware(["admin"]), adminCourseController.deleteCourse);

// Course status management
router.put("/courses/:id/publish", authMiddleware, roleMiddleware(["admin"]), adminCourseController.publishCourse);
router.put("/courses/:id/archive", authMiddleware, roleMiddleware(["admin"]), adminCourseController.archiveCourse);

// Module management
router.post(
  "/courses/:id/modules",
  authMiddleware,
  roleMiddleware(["admin"]),
  [
    body('title').notEmpty().withMessage('Module title is required'),
    body('order').optional().isNumeric()
  ],
  adminCourseController.addModule
);

router.put(
  "/courses/:courseId/modules/:moduleId",
  authMiddleware,
  roleMiddleware(["admin"]),
  adminCourseController.updateModule
);

router.delete(
  "/courses/:courseId/modules/:moduleId",
  authMiddleware,
  roleMiddleware(["admin"]),
  adminCourseController.deleteModule
);

// Lesson management
router.post(
  "/courses/:courseId/modules/:moduleId/lessons",
  authMiddleware,
  roleMiddleware(["admin"]),
  [
    body('title').notEmpty().withMessage('Lesson title is required'),
    body('content.type').isIn(['video', 'audio', 'text', 'quiz']).withMessage('Invalid content type'),
    body('order').optional().isNumeric()
  ],
  adminCourseController.addLesson
);

router.put(
  "/courses/:courseId/modules/:moduleId/lessons/:lessonId",
  authMiddleware,
  roleMiddleware(["admin"]),
  adminCourseController.updateLesson
);

router.delete(
  "/courses/:courseId/modules/:moduleId/lessons/:lessonId",
  authMiddleware,
  roleMiddleware(["admin"]),
  adminCourseController.deleteLesson
);

// Course analytics
router.get("/courses/:id/analytics", authMiddleware, roleMiddleware(["admin"]), adminCourseController.getCourseAnalytics);

// Course enrollments
router.get("/courses/:id/enrollments", authMiddleware, roleMiddleware(["admin"]), adminCourseController.getCourseEnrollments);

// File upload routes for course media
router.post(
  "/upload/thumbnail",
  authMiddleware,
  roleMiddleware(["admin"]),
  upload.single('thumbnail'),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const fileUrl = isS3Enabled()
        ? req.file.location
        : `/uploads/${req.file.filename}`;

      res.json({
        success: true,
        message: 'Thumbnail uploaded successfully',
        data: {
          url: fileUrl,
          filename: req.file.filename || req.file.key,
          mimetype: req.file.mimetype,
          size: req.file.size
        }
      });
    } catch (error) {
      console.error('Thumbnail upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Error uploading thumbnail',
        error: error.message
      });
    }
  }
);

router.post(
  "/upload/lesson-media",
  authMiddleware,
  roleMiddleware(["admin"]),
  upload.single('media'),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const fileUrl = isS3Enabled()
        ? req.file.location
        : `/uploads/${req.file.filename}`;

      const mediaType = req.file.mimetype.startsWith('video/') ? 'video' :
                       req.file.mimetype.startsWith('audio/') ? 'audio' : 'other';

      res.json({
        success: true,
        message: 'Media uploaded successfully',
        data: {
          url: fileUrl,
          filename: req.file.filename || req.file.key,
          mimetype: req.file.mimetype,
          size: req.file.size,
          type: mediaType
        }
      });
    } catch (error) {
      console.error('Media upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Error uploading media',
        error: error.message
      });
    }
  }
);

router.post(
  "/upload/resources",
  authMiddleware,
  roleMiddleware(["admin"]),
  upload.array('resources', 5),
  (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
      }

      const uploadedFiles = req.files.map(file => {
        const fileUrl = isS3Enabled()
          ? file.location
          : `/uploads/${file.filename}`;

        let fileType = 'other';
        if (file.mimetype.includes('pdf')) fileType = 'pdf';
        else if (file.mimetype.startsWith('audio/')) fileType = 'audio';
        else if (file.mimetype.startsWith('image/')) fileType = 'image';
        else if (file.mimetype.includes('text')) fileType = 'link';

        return {
          url: fileUrl,
          filename: file.filename || file.key,
          mimetype: file.mimetype,
          size: file.size,
          type: fileType
        };
      });

      res.json({
        success: true,
        message: 'Resources uploaded successfully',
        data: uploadedFiles
      });
    } catch (error) {
      console.error('Resources upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Error uploading resources',
        error: error.message
      });
    }
  }
);

// Video Carousel Management Routes
router.get("/videos", authMiddleware, roleMiddleware(["admin"]), videoCarouselController.getAllVideosAdmin);
router.get("/videos/:id", authMiddleware, roleMiddleware(["admin"]), videoCarouselController.getVideoById);
router.post("/videos", authMiddleware, roleMiddleware(["admin"]), videoCarouselController.createVideo);
router.put("/videos/:id", authMiddleware, roleMiddleware(["admin"]), videoCarouselController.updateVideo);
router.delete("/videos/:id", authMiddleware, roleMiddleware(["admin"]), videoCarouselController.deleteVideo);
router.put("/videos/:id/toggle", authMiddleware, roleMiddleware(["admin"]), videoCarouselController.toggleVideoStatus);

// Note: Content management routes are handled by /api/v1/content routes
// This keeps admin routes focused on user management and dashboard analytics

module.exports = router;
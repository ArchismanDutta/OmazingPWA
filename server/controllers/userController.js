const User = require("../models/User");
const mongoose = require("mongoose");

const getUserProfile = async (req, res) => {
  try {
    console.log("Looking for user with ID:", req.user.id);
    console.log("ID type:", typeof req.user.id);
    console.log("Is valid ObjectId:", mongoose.Types.ObjectId.isValid(req.user.id));

    // Ensure we're using a proper ObjectId
    let userId;
    if (mongoose.Types.ObjectId.isValid(req.user.id)) {
      userId = req.user.id;
    } else {
      console.log("Invalid ObjectId format:", req.user.id);
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format"
      });
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      console.log("User not found in database");
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    console.log("User found:", user.email);

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user profile"
    });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;

    const allowedUpdates = [
      "name", "mobile", "profile", "preferences"
    ];

    const filteredUpdates = {};
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      userId,
      { ...filteredUpdates, updatedAt: Date.now() },
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
      message: "Profile updated successfully",
      data: { user }
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile"
    });
  }
};

const updateMindfulnessStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { sessionMinutes, experienceGained } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const today = new Date();
    const lastSession = user.mindfulness.lastSessionDate;
    const isConsecutiveDay = lastSession &&
      (today.getTime() - lastSession.getTime()) < (48 * 60 * 60 * 1000);

    const mindfulnessUpdate = {
      totalSessions: user.mindfulness.totalSessions + 1,
      totalMinutes: user.mindfulness.totalMinutes + sessionMinutes,
      currentStreak: isConsecutiveDay ? user.mindfulness.currentStreak + 1 : 1,
      lastSessionDate: today,
      experience: user.mindfulness.experience + (experienceGained || 10)
    };

    mindfulnessUpdate.longestStreak = Math.max(
      user.mindfulness.longestStreak,
      mindfulnessUpdate.currentStreak
    );

    const newLevel = Math.floor(mindfulnessUpdate.experience / 100) + 1;
    if (newLevel > user.mindfulness.level) {
      mindfulnessUpdate.level = newLevel;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        mindfulness: mindfulnessUpdate,
        updatedAt: Date.now()
      },
      { new: true }
    ).select("-password");

    res.json({
      success: true,
      message: "Mindfulness stats updated",
      data: {
        user: updatedUser,
        levelUp: newLevel > user.mindfulness.level
      }
    });
  } catch (error) {
    console.error("Update mindfulness stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update mindfulness stats"
    });
  }
};

const addToFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const { contentId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const isAlreadyFavorite = user.activities.favoriteContent.includes(contentId);

    let updatedUser;
    if (isAlreadyFavorite) {
      updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          $pull: { "activities.favoriteContent": contentId },
          updatedAt: Date.now()
        },
        { new: true }
      ).select("-password");

      res.json({
        success: true,
        message: "Removed from favorites",
        data: { user: updatedUser, action: "removed" }
      });
    } else {
      updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          $push: { "activities.favoriteContent": contentId },
          updatedAt: Date.now()
        },
        { new: true }
      ).select("-password");

      res.json({
        success: true,
        message: "Added to favorites",
        data: { user: updatedUser, action: "added" }
      });
    }
  } catch (error) {
    console.error("Add to favorites error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update favorites"
    });
  }
};

const addRecentlyPlayed = async (req, res) => {
  try {
    const userId = req.user.id;
    const { contentId, duration } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const recentItem = {
      contentId,
      playedAt: new Date(),
      duration: duration || 0
    };

    const existingIndex = user.activities.recentlyPlayed.findIndex(
      item => item.contentId.toString() === contentId
    );

    let updateQuery;
    if (existingIndex > -1) {
      updateQuery = {
        $set: {
          [`activities.recentlyPlayed.${existingIndex}`]: recentItem
        },
        updatedAt: Date.now()
      };
    } else {
      updateQuery = {
        $push: {
          "activities.recentlyPlayed": {
            $each: [recentItem],
            $position: 0,
            $slice: 20
          }
        },
        updatedAt: Date.now()
      };
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateQuery,
      { new: true }
    ).select("-password");

    res.json({
      success: true,
      message: "Recently played updated",
      data: { user: updatedUser }
    });
  } catch (error) {
    console.error("Add recently played error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update recently played"
    });
  }
};

const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select("mindfulness activities");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const stats = {
      mindfulness: user.mindfulness,
      totalFavorites: user.activities.favoriteContent.length,
      completedCourses: user.activities.completedCourses.length,
      recentActivity: user.activities.recentlyPlayed.slice(0, 5)
    };

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error("Get user stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user stats"
    });
  }
};

const deleteUserAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { confirmDelete } = req.body;

    if (!confirmDelete) {
      return res.status(400).json({
        success: false,
        message: "Account deletion must be confirmed"
      });
    }

    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: "Account deleted successfully"
    });
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete account"
    });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  updateMindfulnessStats,
  addToFavorites,
  addRecentlyPlayed,
  getUserStats,
  deleteUserAccount
};
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: { type: String, required: true, minlength: 6 },
  mobile: { type: String, required: false },
  socialIds: {
    google: { type: String, default: null },
    facebook: { type: String, default: null },
  },
  role: {
    type: String,
    enum: ["user", "manager", "admin"],
    default: "user",
  },
  isEmailVerified: { type: Boolean, default: false },

  // Profile information
  profile: {
    avatar: { type: String, default: null },
    bio: { type: String, maxlength: 500, default: "" },
    dateOfBirth: { type: Date, default: null },
    location: { type: String, maxlength: 100, default: "" },
    wellnessGoals: [{ type: String }],
    meditationExperience: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner"
    },
    preferredSessionLength: {
      type: Number,
      default: 10,
      min: 5,
      max: 60
    },
    timezone: { type: String, default: "UTC" }
  },

  // Subscription and billing
  subscription: {
    type: {
      type: String,
      enum: ["free", "premium", "lifetime"],
      default: "free"
    },
    status: {
      type: String,
      enum: ["active", "inactive", "cancelled", "expired"],
      default: "active"
    },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    autoRenew: { type: Boolean, default: false }
  },

  // Mindfulness tracking
  mindfulness: {
    totalSessions: { type: Number, default: 0 },
    totalMinutes: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastSessionDate: { type: Date, default: null },
    level: { type: Number, default: 1 },
    experience: { type: Number, default: 0 }
  },

  // Preferences
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      dailyReminder: { type: Boolean, default: false },
      reminderTime: { type: String, default: "09:00" }
    },
    privacy: {
      profileVisibility: {
        type: String,
        enum: ["public", "friends", "private"],
        default: "private"
      },
      shareProgress: { type: Boolean, default: false }
    },
    content: {
      favoriteCategories: [{ type: String }],
      language: { type: String, default: "en" },
      contentRating: {
        type: String,
        enum: ["all", "beginner", "intermediate", "advanced"],
        default: "all"
      }
    }
  },

  // Activity tracking
  activities: {
    favoriteContent: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Content"
    }],
    completedCourses: [{
      courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
      completedAt: { type: Date, default: Date.now },
      certificateIssued: { type: Boolean, default: false }
    }],
    recentlyPlayed: [{
      contentId: { type: mongoose.Schema.Types.ObjectId, ref: "Content" },
      playedAt: { type: Date, default: Date.now },
      duration: { type: Number, default: 0 }
    }]
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Index for performance
userSchema.index({ email: 1 });
userSchema.index({ mobile: 1 });

// Password hashing middleware before save - DISABLED FOR DEVELOPMENT
// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();

//   try {
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
//     next();
//   } catch (err) {
//     next(err);
//   }
// });

// Method to compare password during login - SIMPLIFIED FOR DEVELOPMENT
userSchema.methods.comparePassword = async function (candidatePassword) {
  // return await bcrypt.compare(candidatePassword, this.password); // DISABLED FOR DEVELOPMENT
  return candidatePassword === this.password; // Simple string comparison for development
};

// Update timestamp on save
userSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("User", userSchema);

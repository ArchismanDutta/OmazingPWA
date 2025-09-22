const mongoose = require('mongoose');

const lessonProgressSchema = new mongoose.Schema({
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: Date,
  watchTime: {
    type: Number,
    default: 0 // Time watched in seconds
  },
  lastPosition: {
    type: Number,
    default: 0 // Last position in seconds for video/audio
  },
  attempts: [{
    attemptedAt: {
      type: Date,
      default: Date.now
    },
    score: Number,
    answers: [mongoose.Schema.Types.Mixed],
    passed: Boolean
  }],
  notes: [{
    timestamp: Number, // Position in video/audio where note was taken
    content: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

const moduleProgressSchema = new mongoose.Schema({
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: Date,
  lessonsProgress: [lessonProgressSchema],
  progressPercentage: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const courseEnrollmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  startedAt: Date,
  completedAt: Date,
  lastAccessedAt: Date,
  status: {
    type: String,
    enum: ['enrolled', 'in_progress', 'completed', 'dropped'],
    default: 'enrolled'
  },
  progress: {
    percentage: {
      type: Number,
      default: 0
    },
    completedLessons: {
      type: Number,
      default: 0
    },
    totalLessons: {
      type: Number,
      default: 0
    },
    completedModules: {
      type: Number,
      default: 0
    },
    totalModules: {
      type: Number,
      default: 0
    },
    totalWatchTime: {
      type: Number,
      default: 0 // Total time spent in seconds
    }
  },
  modulesProgress: [moduleProgressSchema],
  currentLesson: {
    moduleId: mongoose.Schema.Types.ObjectId,
    lessonId: mongoose.Schema.Types.ObjectId,
    position: {
      type: Number,
      default: 0
    }
  },
  certificate: {
    issued: {
      type: Boolean,
      default: false
    },
    issuedAt: Date,
    certificateId: String,
    downloadUrl: String
  },
  rating: {
    score: {
      type: Number,
      min: 1,
      max: 5
    },
    review: String,
    ratedAt: Date
  },
  paymentInfo: {
    transactionId: String,
    amount: Number,
    currency: String,
    paymentMethod: String,
    paidAt: Date
  },
  settings: {
    notifications: {
      type: Boolean,
      default: true
    },
    autoPlay: {
      type: Boolean,
      default: true
    },
    playbackSpeed: {
      type: Number,
      default: 1.0
    },
    subtitles: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Compound indexes for better performance
courseEnrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });
courseEnrollmentSchema.index({ userId: 1, status: 1 });
courseEnrollmentSchema.index({ courseId: 1, status: 1 });
courseEnrollmentSchema.index({ enrolledAt: -1 });
courseEnrollmentSchema.index({ lastAccessedAt: -1 });

// Pre-save middleware to calculate progress
courseEnrollmentSchema.pre('save', function(next) {
  if (this.modulesProgress && this.modulesProgress.length > 0) {
    let totalCompletedLessons = 0;
    let totalLessons = 0;
    let totalCompletedModules = 0;
    let totalWatchTime = 0;

    this.modulesProgress.forEach(moduleProgress => {
      if (moduleProgress.lessonsProgress && moduleProgress.lessonsProgress.length > 0) {
        totalLessons += moduleProgress.lessonsProgress.length;

        const completedLessonsInModule = moduleProgress.lessonsProgress.filter(lesson => lesson.completed).length;
        totalCompletedLessons += completedLessonsInModule;

        // Calculate module completion
        const moduleCompletionPercentage = (completedLessonsInModule / moduleProgress.lessonsProgress.length) * 100;
        moduleProgress.progressPercentage = Math.round(moduleCompletionPercentage);

        if (moduleCompletionPercentage === 100) {
          moduleProgress.completed = true;
          if (!moduleProgress.completedAt) {
            moduleProgress.completedAt = new Date();
          }
          totalCompletedModules++;
        }

        // Calculate total watch time
        moduleProgress.lessonsProgress.forEach(lesson => {
          totalWatchTime += lesson.watchTime || 0;
        });
      }
    });

    // Update progress
    this.progress.completedLessons = totalCompletedLessons;
    this.progress.totalLessons = totalLessons;
    this.progress.completedModules = totalCompletedModules;
    this.progress.totalModules = this.modulesProgress.length;
    this.progress.totalWatchTime = totalWatchTime;

    // Calculate overall percentage
    if (totalLessons > 0) {
      this.progress.percentage = Math.round((totalCompletedLessons / totalLessons) * 100);
    }

    // Update enrollment status
    if (this.progress.percentage === 100 && this.status !== 'completed') {
      this.status = 'completed';
      this.completedAt = new Date();
    } else if (this.progress.percentage > 0 && this.status === 'enrolled') {
      this.status = 'in_progress';
      if (!this.startedAt) {
        this.startedAt = new Date();
      }
    }
  }

  next();
});

// Instance methods
courseEnrollmentSchema.methods.markLessonComplete = function(moduleId, lessonId, watchTime = 0) {
  const moduleProgress = this.modulesProgress.find(m => m.moduleId.toString() === moduleId.toString());

  if (moduleProgress) {
    const lessonProgress = moduleProgress.lessonsProgress.find(l => l.lessonId.toString() === lessonId.toString());

    if (lessonProgress) {
      lessonProgress.completed = true;
      lessonProgress.completedAt = new Date();
      lessonProgress.watchTime = Math.max(lessonProgress.watchTime || 0, watchTime);
    }
  }

  this.lastAccessedAt = new Date();
  return this.save();
};

courseEnrollmentSchema.methods.updateLessonProgress = function(moduleId, lessonId, position, watchTime = 0) {
  const moduleProgress = this.modulesProgress.find(m => m.moduleId.toString() === moduleId.toString());

  if (moduleProgress) {
    const lessonProgress = moduleProgress.lessonsProgress.find(l => l.lessonId.toString() === lessonId.toString());

    if (lessonProgress) {
      lessonProgress.lastPosition = position;
      lessonProgress.watchTime = Math.max(lessonProgress.watchTime || 0, watchTime);
    }
  }

  // Update current lesson
  this.currentLesson = {
    moduleId,
    lessonId,
    position
  };

  this.lastAccessedAt = new Date();
  return this.save();
};

courseEnrollmentSchema.methods.addQuizAttempt = function(moduleId, lessonId, score, answers, passed) {
  const moduleProgress = this.modulesProgress.find(m => m.moduleId.toString() === moduleId.toString());

  if (moduleProgress) {
    const lessonProgress = moduleProgress.lessonsProgress.find(l => l.lessonId.toString() === lessonId.toString());

    if (lessonProgress) {
      lessonProgress.attempts.push({
        score,
        answers,
        passed,
        attemptedAt: new Date()
      });

      // Mark as completed if passed
      if (passed) {
        lessonProgress.completed = true;
        lessonProgress.completedAt = new Date();
      }
    }
  }

  this.lastAccessedAt = new Date();
  return this.save();
};

courseEnrollmentSchema.methods.addNote = function(moduleId, lessonId, timestamp, content) {
  const moduleProgress = this.modulesProgress.find(m => m.moduleId.toString() === moduleId.toString());

  if (moduleProgress) {
    const lessonProgress = moduleProgress.lessonsProgress.find(l => l.lessonId.toString() === lessonId.toString());

    if (lessonProgress) {
      lessonProgress.notes.push({
        timestamp,
        content,
        createdAt: new Date()
      });
    }
  }

  return this.save();
};

courseEnrollmentSchema.methods.rateCourse = function(score, review) {
  this.rating = {
    score,
    review,
    ratedAt: new Date()
  };

  return this.save();
};

// Static methods
courseEnrollmentSchema.statics.getUserEnrollments = function(userId, status = null) {
  const query = { userId };
  if (status) {
    query.status = status;
  }

  return this.find(query)
    .populate('courseId', 'title description thumbnail instructor category level metrics pricing')
    .sort({ lastAccessedAt: -1, enrolledAt: -1 });
};

courseEnrollmentSchema.statics.getCourseEnrollments = function(courseId, status = null) {
  const query = { courseId };
  if (status) {
    query.status = status;
  }

  return this.find(query)
    .populate('userId', 'name email profile')
    .sort({ enrolledAt: -1 });
};

courseEnrollmentSchema.statics.getEnrollmentStats = function(courseId) {
  return this.aggregate([
    { $match: { courseId: mongoose.Types.ObjectId(courseId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgProgress: { $avg: '$progress.percentage' },
        avgWatchTime: { $avg: '$progress.totalWatchTime' }
      }
    }
  ]);
};

const CourseEnrollment = mongoose.model('CourseEnrollment', courseEnrollmentSchema);

module.exports = CourseEnrollment;
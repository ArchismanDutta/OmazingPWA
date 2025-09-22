const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  content: {
    type: {
      type: String,
      enum: ['video', 'audio', 'text', 'quiz'],
      required: true
    },
    url: String, // For video/audio content
    text: String, // For text lessons
    quiz: {
      questions: [{
        question: String,
        options: [String],
        correctAnswer: Number,
        explanation: String
      }],
      passingScore: {
        type: Number,
        default: 70
      }
    }
  },
  duration: {
    type: Number, // Duration in seconds
    default: 0
  },
  order: {
    type: Number,
    required: true
  },
  isPreview: {
    type: Boolean,
    default: false
  },
  resources: [{
    title: String,
    url: String,
    type: {
      type: String,
      enum: ['pdf', 'audio', 'link', 'image']
    }
  }]
}, {
  timestamps: true
});

const moduleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  order: {
    type: Number,
    required: true
  },
  lessons: [lessonSchema]
}, {
  timestamps: true
});

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  shortDescription: {
    type: String,
    trim: true,
    maxlength: 300
  },
  instructor: {
    name: {
      type: String,
      required: true
    },
    bio: String,
    image: String,
    credentials: [String]
  },
  thumbnail: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'mindfulness_basics',
      'stress_management',
      'sleep_meditation',
      'anxiety_relief',
      'focus_concentration',
      'emotional_wellness',
      'relationships',
      'self_compassion',
      'advanced_practice',
      'workplace_wellness'
    ]
  },
  level: {
    type: String,
    required: true,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  language: {
    type: String,
    default: 'en'
  },
  tags: [String],
  modules: [moduleSchema],
  pricing: {
    type: {
      type: String,
      enum: ['free', 'paid', 'premium'],
      default: 'free'
    },
    amount: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'USD'
    },
    discountPrice: Number,
    subscriptionRequired: {
      type: Boolean,
      default: false
    }
  },
  metrics: {
    totalDuration: {
      type: Number,
      default: 0 // Total course duration in seconds
    },
    lessonCount: {
      type: Number,
      default: 0
    },
    moduleCount: {
      type: Number,
      default: 0
    },
    enrollmentCount: {
      type: Number,
      default: 0
    },
    rating: {
      average: {
        type: Number,
        default: 0
      },
      count: {
        type: Number,
        default: 0
      }
    },
    completionRate: {
      type: Number,
      default: 0
    }
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  publishedAt: Date,
  requirements: [String],
  whatYouWillLearn: [String],
  targetAudience: [String],
  certificateTemplate: String,
  settings: {
    allowDownloads: {
      type: Boolean,
      default: false
    },
    allowDiscussions: {
      type: Boolean,
      default: true
    },
    autoEnroll: {
      type: Boolean,
      default: false
    },
    certificateEnabled: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Indexes for better performance
courseSchema.index({ category: 1, status: 1 });
courseSchema.index({ 'pricing.type': 1, status: 1 });
courseSchema.index({ level: 1, category: 1 });
courseSchema.index({ tags: 1 });
courseSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Pre-save middleware to calculate metrics
courseSchema.pre('save', function(next) {
  if (this.modules && this.modules.length > 0) {
    this.metrics.moduleCount = this.modules.length;

    let totalLessons = 0;
    let totalDuration = 0;

    this.modules.forEach(module => {
      if (module.lessons && module.lessons.length > 0) {
        totalLessons += module.lessons.length;
        totalDuration += module.lessons.reduce((sum, lesson) => sum + (lesson.duration || 0), 0);
      }
    });

    this.metrics.lessonCount = totalLessons;
    this.metrics.totalDuration = totalDuration;
  }

  next();
});

// Instance methods
courseSchema.methods.getPublicInfo = function() {
  return {
    _id: this._id,
    title: this.title,
    description: this.description,
    shortDescription: this.shortDescription,
    instructor: this.instructor,
    thumbnail: this.thumbnail,
    category: this.category,
    level: this.level,
    language: this.language,
    tags: this.tags,
    pricing: this.pricing,
    metrics: this.metrics,
    requirements: this.requirements,
    whatYouWillLearn: this.whatYouWillLearn,
    targetAudience: this.targetAudience,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

courseSchema.methods.getPreviewLessons = function() {
  const previewLessons = [];

  this.modules.forEach(module => {
    module.lessons.forEach(lesson => {
      if (lesson.isPreview) {
        previewLessons.push({
          _id: lesson._id,
          title: lesson.title,
          description: lesson.description,
          duration: lesson.duration,
          moduleTitle: module.title,
          content: lesson.content.type === 'text' ? lesson.content : { type: lesson.content.type }
        });
      }
    });
  });

  return previewLessons;
};

// Static methods
courseSchema.statics.getPublicCourses = function(filters = {}) {
  const query = { status: 'published', ...filters };

  return this.find(query)
    .select('title description shortDescription instructor thumbnail category level language tags pricing metrics requirements whatYouWillLearn targetAudience createdAt updatedAt')
    .sort({ 'metrics.rating.average': -1, 'metrics.enrollmentCount': -1 });
};

courseSchema.statics.searchCourses = function(searchTerm, filters = {}) {
  const query = {
    status: 'published',
    $text: { $search: searchTerm },
    ...filters
  };

  return this.find(query, { score: { $meta: 'textScore' } })
    .select('title description shortDescription instructor thumbnail category level language tags pricing metrics requirements whatYouWillLearn targetAudience createdAt updatedAt')
    .sort({ score: { $meta: 'textScore' }, 'metrics.rating.average': -1 });
};

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
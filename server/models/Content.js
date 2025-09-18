const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  type: {
    type: String,
    required: true,
    enum: ['audio', 'video', 'image', 'document'],
    index: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'meditation',
      'music',
      'nature_sounds',
      'guided_meditation',
      'breathing_exercises',
      'yoga',
      'mindfulness',
      'stress_relief',
      'sleep',
      'focus',
      'inspiration'
    ],
    index: true
  },
  // File information
  fileName: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  // Storage information
  storage: {
    type: {
      type: String,
      enum: ['s3', 'local'],
      required: true
    },
    location: {
      type: String,
      required: true // S3 key or local file path
    },
    url: {
      type: String // Public URL if available
    }
  },
  // Content metadata
  duration: {
    type: Number, // Duration in seconds for audio/video
    default: null
  },
  dimensions: {
    width: { type: Number, default: null },
    height: { type: Number, default: null }
  },
  // Access control
  isPublic: {
    type: Boolean,
    default: false
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  price: {
    type: Number,
    default: 0,
    min: 0
  },
  // Content organization
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  // Analytics
  viewCount: {
    type: Number,
    default: 0
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'archived'],
    default: 'active',
    index: true
  },
  // Author/Admin info
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound indexes for efficient queries
contentSchema.index({ type: 1, category: 1 });
contentSchema.index({ status: 1, isPublic: 1 });
contentSchema.index({ isPremium: 1, price: 1 });
contentSchema.index({ uploadedBy: 1, createdAt: -1 });

// Text search index
contentSchema.index({
  title: 'text',
  description: 'text',
  tags: 'text'
});

// Virtual for formatted file size
contentSchema.virtual('formattedSize').get(function() {
  const size = this.fileSize;
  if (size < 1024) return size + ' B';
  if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB';
  if (size < 1024 * 1024 * 1024) return (size / (1024 * 1024)).toFixed(1) + ' MB';
  return (size / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
});

// Virtual for formatted duration
contentSchema.virtual('formattedDuration').get(function() {
  if (!this.duration) return null;

  const hours = Math.floor(this.duration / 3600);
  const minutes = Math.floor((this.duration % 3600) / 60);
  const seconds = this.duration % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

// Update timestamp on save
contentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to increment view count
contentSchema.methods.incrementViews = function() {
  this.viewCount += 1;
  return this.save();
};

// Method to increment download count
contentSchema.methods.incrementDownloads = function() {
  this.downloadCount += 1;
  return this.save();
};

// Static method to find public content
contentSchema.statics.findPublic = function(filters = {}) {
  return this.find({
    ...filters,
    status: 'active',
    isPublic: true
  });
};

// Static method to find premium content
contentSchema.statics.findPremium = function(filters = {}) {
  return this.find({
    ...filters,
    status: 'active',
    isPremium: true
  });
};

module.exports = mongoose.model('Content', contentSchema);
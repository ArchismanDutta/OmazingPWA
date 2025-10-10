const mongoose = require('mongoose');

const videoCarouselSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Video title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  url: {
    type: String,
    required: [true, 'Video URL is required'],
    trim: true
  },
  platform: {
    type: String,
    enum: ['youtube', 'instagram', 'other'],
    default: 'other'
  },
  videoId: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  thumbnail: {
    type: String,
    trim: true
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for sorting by order
videoCarouselSchema.index({ order: 1, createdAt: -1 });

// Method to extract video ID and platform from URL
videoCarouselSchema.methods.extractVideoInfo = function() {
  const url = this.url;

  // YouTube patterns
  const youtubePatterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/
  ];

  for (const pattern of youtubePatterns) {
    const match = url.match(pattern);
    if (match) {
      this.platform = 'youtube';
      this.videoId = match[1];
      this.thumbnail = `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`;
      return { platform: 'youtube', videoId: match[1] };
    }
  }

  // Instagram patterns
  const instagramPatterns = [
    /(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:p|reel|tv)\/([a-zA-Z0-9_-]+)/,
    /(?:https?:\/\/)?(?:www\.)?instagr\.am\/(?:p|reel)\/([a-zA-Z0-9_-]+)/
  ];

  for (const pattern of instagramPatterns) {
    const match = url.match(pattern);
    if (match) {
      this.platform = 'instagram';
      this.videoId = match[1];
      return { platform: 'instagram', videoId: match[1] };
    }
  }

  return { platform: 'other', videoId: null };
};

// Pre-save hook to extract video info
videoCarouselSchema.pre('save', function(next) {
  if (this.isModified('url')) {
    this.extractVideoInfo();
  }
  next();
});

module.exports = mongoose.model('VideoCarousel', videoCarouselSchema);

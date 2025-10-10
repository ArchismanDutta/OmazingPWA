const VideoCarousel = require('../models/VideoCarousel');

// Get all videos for carousel (public)
exports.getAllVideos = async (req, res) => {
  try {
    const videos = await VideoCarousel.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .select('-createdBy');

    res.json({
      success: true,
      videos
    });
  } catch (error) {
    console.error('Get videos error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch videos'
    });
  }
};

// Admin: Get all videos (including inactive)
exports.getAllVideosAdmin = async (req, res) => {
  try {
    const videos = await VideoCarousel.find()
      .sort({ order: 1, createdAt: -1 })
      .populate('createdBy', 'name email');

    res.json({
      success: true,
      videos
    });
  } catch (error) {
    console.error('Get videos admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch videos'
    });
  }
};

// Admin: Get single video
exports.getVideoById = async (req, res) => {
  try {
    const video = await VideoCarousel.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    res.json({
      success: true,
      video
    });
  } catch (error) {
    console.error('Get video error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch video'
    });
  }
};

// Admin: Create video
exports.createVideo = async (req, res) => {
  try {
    const { title, url, description, order, isActive } = req.body;

    if (!title || !url) {
      return res.status(400).json({
        success: false,
        message: 'Title and URL are required'
      });
    }

    const video = new VideoCarousel({
      title,
      url,
      description,
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user.id
    });

    await video.save();

    res.status(201).json({
      success: true,
      message: 'Video added successfully',
      video
    });
  } catch (error) {
    console.error('Create video error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create video',
      error: error.message
    });
  }
};

// Admin: Update video
exports.updateVideo = async (req, res) => {
  try {
    const { title, url, description, order, isActive } = req.body;

    const video = await VideoCarousel.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Update fields
    if (title !== undefined) video.title = title;
    if (url !== undefined) video.url = url;
    if (description !== undefined) video.description = description;
    if (order !== undefined) video.order = order;
    if (isActive !== undefined) video.isActive = isActive;

    await video.save();

    res.json({
      success: true,
      message: 'Video updated successfully',
      video
    });
  } catch (error) {
    console.error('Update video error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update video',
      error: error.message
    });
  }
};

// Admin: Delete video
exports.deleteVideo = async (req, res) => {
  try {
    const video = await VideoCarousel.findByIdAndDelete(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    res.json({
      success: true,
      message: 'Video deleted successfully'
    });
  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete video'
    });
  }
};

// Admin: Toggle video active status
exports.toggleVideoStatus = async (req, res) => {
  try {
    const video = await VideoCarousel.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    video.isActive = !video.isActive;
    await video.save();

    res.json({
      success: true,
      message: `Video ${video.isActive ? 'activated' : 'deactivated'} successfully`,
      video
    });
  } catch (error) {
    console.error('Toggle video status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle video status'
    });
  }
};

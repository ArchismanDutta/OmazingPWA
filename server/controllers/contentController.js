const Content = require('../models/Content');
const { validationResult } = require('express-validator');
const { deleteFromS3, deleteFromLocal, getSignedUrl, isS3Enabled } = require('../services/uploadService');

// Upload content
exports.uploadContent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const uploadedContent = [];

    // Process each uploaded file
    for (const file of req.files) {
      const {
        title,
        description,
        category,
        isPublic = false,
        isPremium = false,
        price = 0,
        tags
      } = req.body;

      // Determine content type from MIME type
      let contentType;
      if (file.mimetype.startsWith('image/')) contentType = 'image';
      else if (file.mimetype.startsWith('video/')) contentType = 'video';
      else if (file.mimetype.startsWith('audio/')) contentType = 'audio';
      else contentType = 'document';

      // Create content record
      const content = new Content({
        title: title || file.originalname,
        description: description || '',
        type: contentType,
        category,
        fileName: file.filename || file.key,
        originalName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        storage: {
          type: isS3Enabled() ? 's3' : 'local',
          location: isS3Enabled() ? file.key : `${require('../services/uploadService').getFileFolder(file.mimetype)}/${file.filename}`,
          url: file.location || null
        },
        isPublic: isPublic === 'true',
        isPremium: isPremium === 'true',
        price: parseFloat(price) || 0,
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        uploadedBy: req.user.id
      });

      await content.save();
      uploadedContent.push(content);
    }

    res.status(201).json({
      success: true,
      message: `${uploadedContent.length} file(s) uploaded successfully`,
      data: uploadedContent
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading content',
      error: error.message
    });
  }
};

// Get all content (with filters)
exports.getAllContent = async (req, res) => {
  try {
    const {
      type,
      category,
      isPublic,
      isPremium,
      status = 'active',
      page = 1,
      limit = 20,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = { status };

    if (type) query.type = type;
    if (category) query.category = category;
    if (isPublic !== undefined) query.isPublic = isPublic === 'true';
    if (isPremium !== undefined) query.isPremium = isPremium === 'true';

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const content = await Content.find(query)
      .populate('uploadedBy', 'name email')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Generate appropriate URLs for each content item
    content.forEach(item => {
      if (item.storage.type === 's3') {
        item.storage.signedUrl = getSignedUrl(item.storage.location);
      } else if (item.storage.type === 'local') {
        const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
        item.storage.url = `${baseUrl}/uploads/${item.storage.location}`;
      }
    });

    const totalCount = await Content.countDocuments(query);

    res.json({
      success: true,
      data: content,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalItems: totalCount,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching content',
      error: error.message
    });
  }
};

// Get single content by ID
exports.getContentById = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id)
      .populate('uploadedBy', 'name email');

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    // Generate appropriate URL for content access
    if (content.storage.type === 's3') {
      // For S3 files, always generate signed URL for security
      content.storage.signedUrl = getSignedUrl(content.storage.location);
    } else if (content.storage.type === 'local') {
      // For local files, create a public URL
      const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
      content.storage.url = `${baseUrl}/uploads/${content.storage.location}`;
    }

    // Increment view count
    await content.incrementViews();

    res.json({
      success: true,
      data: content
    });

  } catch (error) {
    console.error('Get content by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching content',
      error: error.message
    });
  }
};

// Update content
exports.updateContent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const {
      title,
      description,
      category,
      isPublic,
      isPremium,
      price,
      tags,
      status
    } = req.body;

    const content = await Content.findById(req.params.id);

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    // Check if user has permission to update
    if (content.uploadedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this content'
      });
    }

    // Update fields
    if (title) content.title = title;
    if (description) content.description = description;
    if (category) content.category = category;
    if (isPublic !== undefined) content.isPublic = isPublic;
    if (isPremium !== undefined) content.isPremium = isPremium;
    if (price !== undefined) content.price = price;
    if (tags) content.tags = tags.split(',').map(tag => tag.trim());
    if (status) content.status = status;

    await content.save();

    res.json({
      success: true,
      message: 'Content updated successfully',
      data: content
    });

  } catch (error) {
    console.error('Update content error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating content',
      error: error.message
    });
  }
};

// Delete content
exports.deleteContent = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    // Check if user has permission to delete
    if (content.uploadedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this content'
      });
    }

    // Delete file from storage
    let deleteResult;
    if (content.storage.type === 's3') {
      deleteResult = await deleteFromS3(content.storage.location);
    } else {
      deleteResult = await deleteFromLocal(content.storage.location);
    }

    if (!deleteResult.success) {
      console.warn('File deletion failed:', deleteResult.error);
      // Continue with database deletion even if file deletion fails
    }

    // Delete from database
    await Content.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Content deleted successfully'
    });

  } catch (error) {
    console.error('Delete content error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting content',
      error: error.message
    });
  }
};

// Get public content (for users)
exports.getPublicContent = async (req, res) => {
  try {
    const {
      type,
      category,
      page = 1,
      limit = 20,
      search
    } = req.query;

    const query = {
      status: 'active',
      isPublic: true
    };

    if (type) query.type = type;
    if (category) query.category = category;
    if (search) {
      query.$text = { $search: search };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const content = await Content.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Generate appropriate URLs for each content item
    content.forEach(item => {
      if (item.storage.type === 's3') {
        item.storage.signedUrl = getSignedUrl(item.storage.location);
        // Don't expose the raw S3 location
        item.storage.location = undefined;
      } else if (item.storage.type === 'local') {
        const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
        item.storage.url = `${baseUrl}/uploads/${item.storage.location}`;
        // Don't expose the raw file path
        item.storage.location = undefined;
      }
    });

    const totalCount = await Content.countDocuments(query);

    res.json({
      success: true,
      data: content,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalItems: totalCount,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get public content error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching public content',
      error: error.message
    });
  }
};

// Get content statistics (for admin)
exports.getContentStats = async (req, res) => {
  try {
    const stats = await Content.aggregate([
      {
        $group: {
          _id: null,
          totalContent: { $sum: 1 },
          totalViews: { $sum: '$viewCount' },
          totalDownloads: { $sum: '$downloadCount' },
          publicContent: {
            $sum: { $cond: ['$isPublic', 1, 0] }
          },
          premiumContent: {
            $sum: { $cond: ['$isPremium', 1, 0] }
          }
        }
      }
    ]);

    const typeStats = await Content.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalSize: { $sum: '$fileSize' }
        }
      }
    ]);

    const categoryStats = await Content.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {},
        byType: typeStats,
        byCategory: categoryStats
      }
    });

  } catch (error) {
    console.error('Get content stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching content statistics',
      error: error.message
    });
  }
};

module.exports = exports;
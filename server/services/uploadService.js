const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
const fs = require('fs');
const { s3, getBucketName, isS3Enabled } = require('../config/aws');

// File type validation
const fileFilter = (req, file, cb) => {
  // Allowed file types for mindfulness platform
  const allowedTypes = {
    image: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    video: ['video/mp4', 'video/webm', 'video/ogg'],
    audio: ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/mpeg'],
    document: ['application/pdf', 'text/plain']
  };

  const allAllowedTypes = Object.values(allowedTypes).flat();

  if (allAllowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} not allowed`), false);
  }
};

// Generate unique filename
const generateFileName = (originalname) => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const ext = path.extname(originalname);
  return `${timestamp}-${randomString}${ext}`;
};

// S3 Storage Configuration
const s3Storage = multerS3({
  s3: s3,
  bucket: (req, file, cb) => {
    cb(null, getBucketName());
  },
  metadata: (req, file, cb) => {
    cb(null, {
      fieldName: file.fieldname,
      uploadedBy: req.user?.id || 'anonymous',
      uploadDate: new Date().toISOString()
    });
  },
  key: (req, file, cb) => {
    const folder = getFileFolder(file.mimetype);
    const filename = generateFileName(file.originalname);
    cb(null, `${folder}/${filename}`);
  },
  contentType: multerS3.AUTO_CONTENT_TYPE
});

// Local Storage Configuration (for development)
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = getFileFolder(file.mimetype);
    const uploadPath = path.join(__dirname, '../../uploads', folder);

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const filename = generateFileName(file.originalname);
    cb(null, filename);
  }
});

// Determine file folder based on MIME type
const getFileFolder = (mimetype) => {
  if (mimetype.startsWith('image/')) return 'images';
  if (mimetype.startsWith('video/')) return 'videos';
  if (mimetype.startsWith('audio/')) return 'audio';
  if (mimetype.startsWith('application/') || mimetype.startsWith('text/')) return 'documents';
  return 'misc';
};

// Configure multer based on storage type
const upload = multer({
  storage: isS3Enabled() ? s3Storage : localStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
    files: 5 // Max 5 files per upload
  }
});

// Delete file from S3
const deleteFromS3 = async (fileKey) => {
  try {
    const params = {
      Bucket: getBucketName(),
      Key: fileKey
    };

    await s3.deleteObject(params).promise();
    return { success: true };
  } catch (error) {
    console.error('S3 delete error:', error);
    return { success: false, error: error.message };
  }
};

// Delete file from local storage
const deleteFromLocal = async (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return { success: true };
    }
    return { success: false, error: 'File not found' };
  } catch (error) {
    console.error('Local delete error:', error);
    return { success: false, error: error.message };
  }
};

// Generate signed URL for private S3 files
const getSignedUrl = (fileKey, expiresIn = 3600) => {
  if (!isS3Enabled()) {
    return null; // Local files are served directly
  }

  const params = {
    Bucket: getBucketName(),
    Key: fileKey,
    Expires: expiresIn // 1 hour default
  };
 
  return s3.getSignedUrl('getObject', params);
};

module.exports = {
  upload,
  deleteFromS3,
  deleteFromLocal,
  getSignedUrl,
  isS3Enabled,
  getBucketName,
  getFileFolder
};
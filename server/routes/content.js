const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const { upload } = require('../services/uploadService');
const contentController = require('../controllers/contentController');

// Validation rules
const uploadValidation = [
  body('category')
    .isIn([
      'meditation', 'music', 'nature_sounds', 'guided_meditation',
      'breathing_exercises', 'yoga', 'mindfulness', 'stress_relief',
      'sleep', 'focus', 'inspiration'
    ])
    .withMessage('Invalid category'),
  body('title')
    .optional()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number')
];

const updateValidation = [
  body('title')
    .optional()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('category')
    .optional()
    .isIn([
      'meditation', 'music', 'nature_sounds', 'guided_meditation',
      'breathing_exercises', 'yoga', 'mindfulness', 'stress_relief',
      'sleep', 'focus', 'inspiration'
    ])
    .withMessage('Invalid category'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'archived'])
    .withMessage('Invalid status')
];

// Public routes (no auth required)
router.get('/public', contentController.getPublicContent);
router.get('/public/:id', contentController.getContentById);

// Protected routes (auth required)
router.use(authMiddleware); // Apply auth middleware to all routes below

// User routes
router.get('/', contentController.getAllContent);
router.get('/:id', contentController.getContentById);

// Admin/Manager routes (content management)
router.post(
  '/upload',
  roleMiddleware(['admin', 'manager']),
  upload.array('files', 5), // Allow up to 5 files
  uploadValidation,
  contentController.uploadContent
);

router.put(
  '/:id',
  roleMiddleware(['admin', 'manager']),
  updateValidation,
  contentController.updateContent
);

router.delete(
  '/:id',
  roleMiddleware(['admin', 'manager']),
  contentController.deleteContent
);

// Admin only routes
router.get(
  '/admin/stats',
  roleMiddleware(['admin']),
  contentController.getContentStats
);

module.exports = router;
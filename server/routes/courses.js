const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const courseController = require('../controllers/courseController');
const authMiddleware = require('../middlewares/authMiddleware');

// Public routes
router.get('/', courseController.getAllCourses);
router.get('/categories', courseController.getCategories);
router.get('/levels', courseController.getLevels);
router.get('/:id', courseController.getCourseById);

// Protected routes (require authentication)
router.post(
  '/:id/enroll',
  authMiddleware,
  [
    body('paymentId').optional().isString(),
    body('paymentMethod').optional().isString()
  ],
  courseController.enrollInCourse
);

router.get(
  '/my/enrollments',
  authMiddleware,
  courseController.getUserCourses
);

router.put(
  '/:courseId/modules/:moduleId/lessons/:lessonId/progress',
  authMiddleware,
  [
    body('position').optional().isNumeric(),
    body('watchTime').optional().isNumeric(),
    body('completed').optional().isBoolean()
  ],
  courseController.updateLessonProgress
);

router.post(
  '/:courseId/modules/:moduleId/lessons/:lessonId/quiz',
  authMiddleware,
  [
    body('answers').isArray().withMessage('Answers must be an array')
  ],
  courseController.submitQuizAttempt
);

router.post(
  '/:courseId/rate',
  authMiddleware,
  [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('review').optional().isString().isLength({ max: 1000 })
  ],
  courseController.rateCourse
);

module.exports = router;
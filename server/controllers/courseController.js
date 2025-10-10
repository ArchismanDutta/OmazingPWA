const Course = require('../models/Course');
const CourseEnrollment = require('../models/CourseEnrollment');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const { getContentUrl } = require('../services/uploadService');

// Get all courses (public)
const getAllCourses = async (req, res) => {
  try {
    const {
      category,
      level,
      pricing,
      language = 'en',
      search,
      sort = 'popular',
      page = 1,
      limit = 12
    } = req.query;

    // Build filter object
    const filters = {};
    if (category) filters.category = category;
    if (level) filters.level = level;
    if (pricing) filters['pricing.type'] = pricing;
    if (language) filters.language = language;

    let coursesQuery;

    if (search) {
      coursesQuery = Course.searchCourses(search, filters);
    } else {
      coursesQuery = Course.getPublicCourses(filters);
    }

    // Apply sorting
    switch (sort) {
      case 'newest':
        coursesQuery = coursesQuery.sort({ publishedAt: -1 });
        break;
      case 'oldest':
        coursesQuery = coursesQuery.sort({ publishedAt: 1 });
        break;
      case 'price_low':
        coursesQuery = coursesQuery.sort({ 'pricing.amount': 1 });
        break;
      case 'price_high':
        coursesQuery = coursesQuery.sort({ 'pricing.amount': -1 });
        break;
      case 'rating':
        coursesQuery = coursesQuery.sort({ 'metrics.rating.average': -1 });
        break;
      case 'popular':
      default:
        coursesQuery = coursesQuery.sort({
          'metrics.enrollmentCount': -1,
          'metrics.rating.average': -1
        });
        break;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const courses = await coursesQuery
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalQuery = search ?
      Course.find({
        status: 'published',
        $text: { $search: search },
        ...filters
      }) :
      Course.find({ status: 'published', ...filters });

    const total = await totalQuery.countDocuments();

    // Process CloudFront URLs for course thumbnails and media
    courses.forEach(course => {
      // Process thumbnail URL
      if (course.thumbnail && course.thumbnail.includes('amazonaws.com')) {
        // Extract S3 key from URL
        const urlParts = course.thumbnail.split('.amazonaws.com/');
        if (urlParts.length > 1) {
          const s3Key = urlParts[1];
          course.thumbnail = getContentUrl(s3Key, false); // Public content, no signed URL
        }
      }
    });

    res.json({
      success: true,
      data: courses,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNext: parseInt(page) < Math.ceil(total / parseInt(limit)),
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching courses',
      error: error.message
    });
  }
};

// Get course by ID (public)
const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const course = await Course.findOne({ _id: id, status: 'published' });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    let enrollment = null;
    let hasAccess = false;

    // Check if user is enrolled
    if (userId) {
      enrollment = await CourseEnrollment.findOne({ userId, courseId: id });
      hasAccess = enrollment || course.pricing.type === 'free';
    } else {
      hasAccess = course.pricing.type === 'free';
    }

    // Prepare response data
    const responseData = {
      ...course.getPublicInfo(),
      hasAccess,
      enrollment: enrollment ? {
        status: enrollment.status,
        progress: enrollment.progress,
        enrolledAt: enrollment.enrolledAt,
        lastAccessedAt: enrollment.lastAccessedAt,
        currentLesson: enrollment.currentLesson
      } : null
    };

    // Process thumbnail URL for course
    if (responseData.thumbnail && responseData.thumbnail.includes('amazonaws.com')) {
      const urlParts = responseData.thumbnail.split('.amazonaws.com/');
      if (urlParts.length > 1) {
        const s3Key = urlParts[1];
        responseData.thumbnail = getContentUrl(s3Key, false);
      }
    }

    // If user has access, include course structure
    if (hasAccess) {
      responseData.modules = course.modules.map(module => ({
        _id: module._id,
        title: module.title,
        description: module.description,
        order: module.order,
        lessons: module.lessons.map(lesson => {
          const lessonData = {
            _id: lesson._id,
            title: lesson.title,
            description: lesson.description,
            duration: lesson.duration,
            order: lesson.order,
            isPreview: lesson.isPreview,
            content: {
              type: lesson.content.type,
              ...(lesson.content.type === 'text' ? { text: lesson.content.text } : {}),
              ...(lesson.content.type === 'quiz' ? { quiz: lesson.content.quiz } : {})
            },
            resources: lesson.resources
          };

          // Process media URLs for lessons
          if ((lesson.isPreview || hasAccess) && lesson.content.url) {
            let processedUrl = lesson.content.url;

            // Process S3 URLs to CloudFront
            if (processedUrl.includes('amazonaws.com')) {
              const urlParts = processedUrl.split('.amazonaws.com/');
              if (urlParts.length > 1) {
                const s3Key = urlParts[1];
                processedUrl = getContentUrl(s3Key, false);
              }
            }

            lessonData.content.url = processedUrl;
          }

          return lessonData;
        })
      }));
    } else {
      // Only show preview lessons with processed URLs
      const previewLessons = course.getPreviewLessons();
      responseData.previewLessons = previewLessons.map(lesson => {
        if (lesson.content && lesson.content.url && lesson.content.url.includes('amazonaws.com')) {
          const urlParts = lesson.content.url.split('.amazonaws.com/');
          if (urlParts.length > 1) {
            const s3Key = urlParts[1];
            lesson.content.url = getContentUrl(s3Key, false);
          }
        }
        return lesson;
      });
    }

    res.json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching course',
      error: error.message
    });
  }
};

// Get course categories
const getCourseCategories = () => {
  return [
    { value: 'mindfulness_basics', label: 'Mindfulness Basics' },
    { value: 'stress_management', label: 'Stress Management' },
    { value: 'sleep_meditation', label: 'Sleep & Meditation' },
    { value: 'anxiety_relief', label: 'Anxiety Relief' },
    { value: 'focus_concentration', label: 'Focus & Concentration' },
    { value: 'emotional_wellness', label: 'Emotional Wellness' },
    { value: 'relationships', label: 'Relationships' },
    { value: 'self_compassion', label: 'Self Compassion' },
    { value: 'advanced_practice', label: 'Advanced Practice' },
    { value: 'workplace_wellness', label: 'Workplace Wellness' }
  ];
};

const getCategories = (req, res) => {
  res.json({
    success: true,
    data: getCourseCategories()
  });
};

// Get course levels
const getLevels = (req, res) => {
  res.json({
    success: true,
    data: [
      { value: 'beginner', label: 'Beginner' },
      { value: 'intermediate', label: 'Intermediate' },
      { value: 'advanced', label: 'Advanced' }
    ]
  });
};

// Enroll in course (protected)
const enrollInCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { paymentId } = req.body;

    const course = await Course.findOne({ _id: id, status: 'published' });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if already enrolled
    const existingEnrollment = await CourseEnrollment.findOne({ userId, courseId: id });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this course'
      });
    }

    // Check if payment is required for paid courses
    if (course.pricing.type === 'paid') {
      if (!paymentId) {
        return res.status(400).json({
          success: false,
          message: 'Payment required for this course',
          requiresPayment: true,
          course: {
            id: course._id,
            title: course.title,
            amount: course.pricing.discountPrice || course.pricing.amount,
            currency: course.pricing.currency
          }
        });
      }

      // Verify payment exists and is completed
      const Payment = require('../models/Payment');
      const payment = await Payment.findOne({
        _id: paymentId,
        user: userId,
        type: 'course',
        'relatedItem.itemId': id,
        'relatedItem.itemType': 'Course',
        status: 'completed'
      });

      if (!payment) {
        return res.status(400).json({
          success: false,
          message: 'Valid payment not found. Please complete payment first.',
          debug: { paymentId, userId, courseId: id }
        });
      }
    }

    // Create enrollment with module and lesson structure
    const modulesProgress = course.modules.map(module => ({
      moduleId: module._id,
      lessonsProgress: module.lessons.map(lesson => ({
        lessonId: lesson._id
      }))
    }));

    const enrollment = new CourseEnrollment({
      userId,
      courseId: id,
      modulesProgress,
      paymentInfo: paymentId ? {
        transactionId: paymentId,
        amount: course.pricing.discountPrice || course.pricing.amount,
        currency: course.pricing.currency,
        paymentMethod: 'razorpay',
        paidAt: new Date()
      } : undefined
    });

    await enrollment.save();

    // Update course enrollment count
    await Course.findByIdAndUpdate(id, {
      $inc: { 'metrics.enrollmentCount': 1 }
    });

    res.status(201).json({
      success: true,
      message: 'Successfully enrolled in course',
      data: {
        enrollmentId: enrollment._id,
        status: enrollment.status,
        enrolledAt: enrollment.enrolledAt
      }
    });
  } catch (error) {
    console.error('Error enrolling in course:', error);
    res.status(500).json({
      success: false,
      message: 'Error enrolling in course',
      error: error.message
    });
  }
};

// Get user's enrolled courses (protected)
const getUserCourses = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    const enrollments = await CourseEnrollment.getUserEnrollments(userId, status);

    res.json({
      success: true,
      data: enrollments
    });
  } catch (error) {
    console.error('Error fetching user courses:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user courses',
      error: error.message
    });
  }
};

// Update lesson progress (protected)
const updateLessonProgress = async (req, res) => {
  try {
    const { courseId, moduleId, lessonId } = req.params;
    const { position, watchTime, completed } = req.body;
    const userId = req.user.id;

    const enrollment = await CourseEnrollment.findOne({ userId, courseId });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    if (completed) {
      await enrollment.markLessonComplete(moduleId, lessonId, watchTime);
    } else {
      await enrollment.updateLessonProgress(moduleId, lessonId, position, watchTime);
    }

    res.json({
      success: true,
      message: 'Progress updated successfully',
      data: {
        progress: enrollment.progress,
        currentLesson: enrollment.currentLesson
      }
    });
  } catch (error) {
    console.error('Error updating lesson progress:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating lesson progress',
      error: error.message
    });
  }
};

// Submit quiz attempt (protected)
const submitQuizAttempt = async (req, res) => {
  try {
    const { courseId, moduleId, lessonId } = req.params;
    const { answers } = req.body;
    const userId = req.user.id;

    const enrollment = await CourseEnrollment.findOne({ userId, courseId });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Get the course to validate quiz answers
    const course = await Course.findById(courseId);
    const module = course.modules.id(moduleId);
    const lesson = module.lessons.id(lessonId);

    if (!lesson || lesson.content.type !== 'quiz') {
      return res.status(400).json({
        success: false,
        message: 'Invalid quiz lesson'
      });
    }

    // Calculate score
    const quiz = lesson.content.quiz;
    let correctAnswers = 0;

    quiz.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const score = Math.round((correctAnswers / quiz.questions.length) * 100);
    const passed = score >= quiz.passingScore;

    await enrollment.addQuizAttempt(moduleId, lessonId, score, answers, passed);

    res.json({
      success: true,
      data: {
        score,
        passed,
        correctAnswers,
        totalQuestions: quiz.questions.length,
        passingScore: quiz.passingScore
      }
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting quiz',
      error: error.message
    });
  }
};

// Rate course (protected)
const rateCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { rating, review } = req.body;
    const userId = req.user.id;

    const enrollment = await CourseEnrollment.findOne({ userId, courseId });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Must be enrolled to rate course'
      });
    }

    await enrollment.rateCourse(rating, review);

    // Update course rating
    const enrollments = await CourseEnrollment.find({
      courseId,
      'rating.score': { $exists: true }
    });

    if (enrollments.length > 0) {
      const totalRating = enrollments.reduce((sum, enr) => sum + enr.rating.score, 0);
      const averageRating = totalRating / enrollments.length;

      await Course.findByIdAndUpdate(courseId, {
        'metrics.rating.average': Math.round(averageRating * 10) / 10,
        'metrics.rating.count': enrollments.length
      });
    }

    res.json({
      success: true,
      message: 'Course rated successfully'
    });
  } catch (error) {
    console.error('Error rating course:', error);
    res.status(500).json({
      success: false,
      message: 'Error rating course',
      error: error.message
    });
  }
};

// Create dummy payment for testing (protected)
const createDummyPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const course = await Course.findOne({ _id: id, status: 'published' });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if already enrolled
    const existingEnrollment = await CourseEnrollment.findOne({ userId, courseId: id });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this course'
      });
    }

    // Create a dummy payment record
    const Payment = require('../models/Payment');

    // Generate a unique dummy order ID
    const dummyOrderId = `dummy_order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const dummyPaymentId = `dummy_payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const payment = new Payment({
      user: userId,
      amount: course.pricing.discountPrice || course.pricing.amount,
      currency: course.pricing.currency || 'INR',
      type: 'course',
      status: 'completed',
      relatedItem: {
        itemId: id,
        itemType: 'Course' // Must match enum: 'Course', 'Content', or 'Subscription'
      },
      razorpay: {
        orderId: dummyOrderId,
        paymentId: dummyPaymentId,
        signature: 'dummy_signature'
      },
      metadata: {
        paymentMethod: 'dummy',
        couponCode: null,
        discountApplied: 0
      },
      completedAt: new Date()
    });

    await payment.save();

    res.json({
      success: true,
      message: 'Dummy payment created successfully',
      data: {
        paymentId: payment._id,
        amount: payment.amount,
        currency: payment.currency
      }
    });
  } catch (error) {
    console.error('Error creating dummy payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating dummy payment',
      error: error.message
    });
  }
};

module.exports = {
  getAllCourses,
  getCourseById,
  getCategories,
  getLevels,
  enrollInCourse,
  getUserCourses,
  updateLessonProgress,
  submitQuizAttempt,
  rateCourse,
  getCourseCategories,
  createDummyPayment
};
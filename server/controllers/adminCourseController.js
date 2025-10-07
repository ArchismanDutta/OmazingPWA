const Course = require('../models/Course');
const CourseEnrollment = require('../models/CourseEnrollment');
const { validationResult } = require('express-validator');
const { getCourseCategories } = require('./courseController');

// Get all courses (admin view)
const getAllCoursesAdmin = async (req, res) => {
  try {
    const {
      status,
      category,
      level,
      page = 1,
      limit = 20,
      sort = 'newest'
    } = req.query;

    // Build filter object
    const filters = {};
    if (status) filters.status = status;
    if (category) filters.category = category;
    if (level) filters.level = level;

    let sortOption = { createdAt: -1 };
    switch (sort) {
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'popular':
        sortOption = { 'metrics.enrollmentCount': -1 };
        break;
      case 'rating':
        sortOption = { 'metrics.rating.average': -1 };
        break;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const courses = await Course.find(filters)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .select('title description thumbnail instructor category level status metrics pricing createdAt updatedAt publishedAt');

    const total = await Course.countDocuments(filters);

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
    console.error('Error fetching courses (admin):', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching courses',
      error: error.message
    });
  }
};

// Get course by ID (admin view)
const getCourseByIdAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Get enrollment statistics
    const enrollmentStats = await CourseEnrollment.aggregate([
      { $match: { courseId: course._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgProgress: { $avg: '$progress.percentage' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        ...course.toObject(),
        enrollmentStats
      }
    });
  } catch (error) {
    console.error('Error fetching course (admin):', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching course',
      error: error.message
    });
  }
};

// Create new course
const createCourse = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const courseData = {
      ...req.body,
      status: 'draft'
    };

    const course = new Course(courseData);
    await course.save();

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course
    });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating course',
      error: error.message
    });
  }
};

// Update course
const updateCourse = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    const course = await Course.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.json({
      success: true,
      message: 'Course updated successfully',
      data: course
    });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating course',
      error: error.message
    });
  }
};

// Delete course
const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if course has enrollments
    const enrollmentCount = await CourseEnrollment.countDocuments({ courseId: id });

    if (enrollmentCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete course with active enrollments. Archive it instead.'
      });
    }

    const course = await Course.findByIdAndDelete(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting course',
      error: error.message
    });
  }
};

// Publish course
const publishCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Validation before publishing
    if (!course.modules || course.modules.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Course must have at least one module to be published'
      });
    }

    const hasLessons = course.modules.some(module => module.lessons && module.lessons.length > 0);
    if (!hasLessons) {
      return res.status(400).json({
        success: false,
        message: 'Course must have at least one lesson to be published'
      });
    }

    course.status = 'published';
    course.publishedAt = new Date();
    await course.save();

    res.json({
      success: true,
      message: 'Course published successfully',
      data: course
    });
  } catch (error) {
    console.error('Error publishing course:', error);
    res.status(500).json({
      success: false,
      message: 'Error publishing course',
      error: error.message
    });
  }
};

// Archive course
const archiveCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findByIdAndUpdate(
      id,
      { status: 'archived' },
      { new: true }
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.json({
      success: true,
      message: 'Course archived successfully',
      data: course
    });
  } catch (error) {
    console.error('Error archiving course:', error);
    res.status(500).json({
      success: false,
      message: 'Error archiving course',
      error: error.message
    });
  }
};

// Add module to course
const addModule = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, order } = req.body;

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const newModule = {
      title,
      description,
      order: order || course.modules.length + 1,
      lessons: []
    };

    course.modules.push(newModule);
    await course.save();

    res.status(201).json({
      success: true,
      message: 'Module added successfully',
      data: newModule
    });
  } catch (error) {
    console.error('Error adding module:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding module',
      error: error.message
    });
  }
};

// Update module
const updateModule = async (req, res) => {
  try {
    const { courseId, moduleId } = req.params;
    const { title, description, order } = req.body;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const module = course.modules.id(moduleId);

    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    if (title) module.title = title;
    if (description) module.description = description;
    if (order !== undefined) module.order = order;

    await course.save();

    res.json({
      success: true,
      message: 'Module updated successfully',
      data: module
    });
  } catch (error) {
    console.error('Error updating module:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating module',
      error: error.message
    });
  }
};

// Delete module
const deleteModule = async (req, res) => {
  try {
    const { courseId, moduleId } = req.params;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    course.modules.id(moduleId).remove();
    await course.save();

    res.json({
      success: true,
      message: 'Module deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting module:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting module',
      error: error.message
    });
  }
};

// Add lesson to module
const addLesson = async (req, res) => {
  try {
    const { courseId, moduleId } = req.params;
    const lessonData = req.body;

    console.log('Adding lesson to course:', courseId, 'module:', moduleId);
    console.log('Lesson data:', JSON.stringify(lessonData, null, 2));

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const module = course.modules.id(moduleId);

    if (!module) {
      console.log('Module not found. Available modules:', course.modules.map(m => m._id.toString()));
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    const newLesson = {
      ...lessonData,
      order: lessonData.order || module.lessons.length + 1
    };

    console.log('New lesson to be added:', newLesson);
    module.lessons.push(newLesson);

    await course.save();
    console.log('Lesson added successfully');

    // Get the newly added lesson (it will have an _id after save)
    const addedLesson = module.lessons[module.lessons.length - 1];

    res.status(201).json({
      success: true,
      message: 'Lesson added successfully',
      data: addedLesson
    });
  } catch (error) {
    console.error('Error adding lesson:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error adding lesson',
      error: error.message,
      details: error.errors ? Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      })) : undefined
    });
  }
};

// Update lesson
const updateLesson = async (req, res) => {
  try {
    const { courseId, moduleId, lessonId } = req.params;
    const updateData = req.body;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const module = course.modules.id(moduleId);

    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    const lesson = module.lessons.id(lessonId);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    Object.assign(lesson, updateData);
    await course.save();

    res.json({
      success: true,
      message: 'Lesson updated successfully',
      data: lesson
    });
  } catch (error) {
    console.error('Error updating lesson:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating lesson',
      error: error.message
    });
  }
};

// Delete lesson
const deleteLesson = async (req, res) => {
  try {
    const { courseId, moduleId, lessonId } = req.params;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const module = course.modules.id(moduleId);

    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    module.lessons.id(lessonId).remove();
    await course.save();

    res.json({
      success: true,
      message: 'Lesson deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting lesson:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting lesson',
      error: error.message
    });
  }
};

// Get course analytics
const getCourseAnalytics = async (req, res) => {
  try {
    const { id } = req.params;

    // Get basic course info
    const course = await Course.findById(id).select('title metrics');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Get enrollment analytics
    const enrollmentAnalytics = await CourseEnrollment.aggregate([
      { $match: { courseId: course._id } },
      {
        $group: {
          _id: null,
          totalEnrollments: { $sum: 1 },
          averageProgress: { $avg: '$progress.percentage' },
          averageWatchTime: { $avg: '$progress.totalWatchTime' },
          completionRate: {
            $avg: {
              $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
            }
          }
        }
      }
    ]);

    // Get progress distribution
    const progressDistribution = await CourseEnrollment.aggregate([
      { $match: { courseId: course._id } },
      {
        $bucket: {
          groupBy: '$progress.percentage',
          boundaries: [0, 25, 50, 75, 100, 101],
          default: 'Other',
          output: {
            count: { $sum: 1 }
          }
        }
      }
    ]);

    // Get enrollment trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const enrollmentTrends = await CourseEnrollment.aggregate([
      {
        $match: {
          courseId: course._id,
          enrolledAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$enrolledAt'
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        course: {
          title: course.title,
          metrics: course.metrics
        },
        analytics: enrollmentAnalytics[0] || {
          totalEnrollments: 0,
          averageProgress: 0,
          averageWatchTime: 0,
          completionRate: 0
        },
        progressDistribution,
        enrollmentTrends
      }
    });
  } catch (error) {
    console.error('Error fetching course analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching course analytics',
      error: error.message
    });
  }
};

// Get course enrollments
const getCourseEnrollments = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const enrollments = await CourseEnrollment.find({ courseId: id })
      .populate('userId', 'name email')
      .sort({ enrolledAt: -1 });

    // Format the response
    const formattedEnrollments = enrollments.map(enrollment => ({
      _id: enrollment._id,
      user: {
        name: enrollment.userId?.name || 'Unknown User',
        email: enrollment.userId?.email || 'N/A'
      },
      enrolledAt: enrollment.enrolledAt,
      progress: enrollment.progress?.percentage || 0,
      status: enrollment.status,
      payment: enrollment.payment ? {
        amount: enrollment.payment.amount,
        status: enrollment.payment.status,
        transactionId: enrollment.payment.transactionId
      } : null,
      completedAt: enrollment.completedAt
    }));

    res.json({
      success: true,
      data: formattedEnrollments
    });
  } catch (error) {
    console.error('Error fetching course enrollments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching course enrollments',
      error: error.message
    });
  }
};

module.exports = {
  getAllCoursesAdmin,
  getCourseByIdAdmin,
  createCourse,
  updateCourse,
  deleteCourse,
  publishCourse,
  archiveCourse,
  addModule,
  updateModule,
  deleteModule,
  addLesson,
  updateLesson,
  deleteLesson,
  getCourseAnalytics,
  getCourseEnrollments
};
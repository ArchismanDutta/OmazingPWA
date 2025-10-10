import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Course API functions
export const coursesAPI = {
  // Public course functions
  getAllCourses: async (params = {}) => {
    const response = await api.get('/courses', { params });
    return response.data;
  },

  getCourseById: async (id) => {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  },

  getCategories: async () => {
    const response = await api.get('/courses/categories');
    return response.data;
  },

  getLevels: async () => {
    const response = await api.get('/courses/levels');
    return response.data;
  },

  // User enrollment functions
  enrollInCourse: async (courseId, paymentData = {}) => {
    const response = await api.post(`/courses/${courseId}/enroll`, paymentData);
    return response.data;
  },

  getUserCourses: async (status = null) => {
    const params = status ? { status } : {};
    const response = await api.get('/courses/my/enrollments', { params });
    return response.data;
  },

  updateLessonProgress: async (courseId, moduleId, lessonId, progressData) => {
    const response = await api.put(
      `/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/progress`,
      progressData
    );
    return response.data;
  },

  markLessonComplete: async (courseId, lessonId, moduleId = null) => {
    // If moduleId is not provided, we need to get it from the course
    if (!moduleId) {
      const courseResponse = await api.get(`/courses/${courseId}`);
      const course = courseResponse.data.data;

      // Find the module that contains this lesson
      for (const module of course.modules) {
        if (module.lessons.find(l => l._id === lessonId)) {
          moduleId = module._id;
          break;
        }
      }

      if (!moduleId) {
        throw new Error('Module not found for lesson');
      }
    }

    const response = await api.put(
      `/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/progress`,
      { completed: true }
    );
    return response.data;
  },

  submitQuizAttempt: async (courseId, moduleId, lessonId, answers) => {
    const response = await api.post(
      `/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/quiz`,
      { answers }
    );
    return response.data;
  },

  rateCourse: async (courseId, rating, review = '') => {
    const response = await api.post(`/courses/${courseId}/rate`, {
      rating,
      review
    });
    return response.data;
  },

  // Admin functions
  admin: {
    getAllCourses: async (params = {}) => {
      const response = await api.get('/admin/courses', { params });
      return response.data;
    },

    getCourseById: async (id) => {
      const response = await api.get(`/admin/courses/${id}`);
      return response.data;
    },

    createCourse: async (courseData) => {
      const response = await api.post('/admin/courses', courseData);
      return response.data;
    },

    updateCourse: async (id, courseData) => {
      const response = await api.put(`/admin/courses/${id}`, courseData);
      return response.data;
    },

    deleteCourse: async (id) => {
      const response = await api.delete(`/admin/courses/${id}`);
      return response.data;
    },

    publishCourse: async (id) => {
      const response = await api.put(`/admin/courses/${id}/publish`);
      return response.data;
    },

    archiveCourse: async (id) => {
      const response = await api.put(`/admin/courses/${id}/archive`);
      return response.data;
    },

    // Module management
    addModule: async (courseId, moduleData) => {
      const response = await api.post(`/admin/courses/${courseId}/modules`, moduleData);
      return response.data;
    },

    updateModule: async (courseId, moduleId, moduleData) => {
      const response = await api.put(`/admin/courses/${courseId}/modules/${moduleId}`, moduleData);
      return response.data;
    },

    deleteModule: async (courseId, moduleId) => {
      const response = await api.delete(`/admin/courses/${courseId}/modules/${moduleId}`);
      return response.data;
    },

    // Lesson management
    addLesson: async (courseId, moduleId, lessonData) => {
      const response = await api.post(`/admin/courses/${courseId}/modules/${moduleId}/lessons`, lessonData);
      return response.data;
    },

    updateLesson: async (courseId, moduleId, lessonId, lessonData) => {
      const response = await api.put(`/admin/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`, lessonData);
      return response.data;
    },

    deleteLesson: async (courseId, moduleId, lessonId) => {
      const response = await api.delete(`/admin/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`);
      return response.data;
    },

    // Analytics
    getCourseAnalytics: async (courseId) => {
      const response = await api.get(`/admin/courses/${courseId}/analytics`);
      return response.data;
    },

    // Enrollments
    getCourseEnrollments: async (courseId) => {
      const response = await api.get(`/admin/courses/${courseId}/enrollments`);
      return response.data;
    }
  }
};

// Helper functions
export const courseHelpers = {
  formatDuration: (seconds) => {
    if (!seconds) return '0:00';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  },

  formatCategory: (category) => {
    return category.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  },

  calculateProgress: (enrollment) => {
    if (!enrollment || !enrollment.progress) return 0;
    return Math.round(enrollment.progress.percentage || 0);
  },

  getProgressColor: (percentage) => {
    if (percentage < 25) return 'text-red-400';
    if (percentage < 50) return 'text-orange-400';
    if (percentage < 75) return 'text-yellow-400';
    if (percentage < 100) return 'text-blue-400';
    return 'text-green-400';
  },

  getStatusBadgeColor: (status) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-500/20 text-gray-400';
      case 'published':
        return 'bg-green-500/20 text-green-400';
      case 'archived':
        return 'bg-yellow-500/20 text-yellow-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  },

  getLevelColor: (level) => {
    switch (level) {
      case 'beginner':
        return 'text-green-400';
      case 'intermediate':
        return 'text-yellow-400';
      case 'advanced':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  },

  getPricingDisplay: (pricing) => {
    if (pricing.type === 'free') return 'Free';
    if (pricing.discountPrice && pricing.discountPrice < pricing.amount) {
      return `$${pricing.discountPrice} (was $${pricing.amount})`;
    }
    return `$${pricing.amount}`;
  }
};

export default coursesAPI;
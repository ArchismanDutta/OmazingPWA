import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { coursesAPI, courseHelpers } from '../../api/courses';
import { adminAPI } from '../../api/admin';
import AdminLayout from '../../components/admin/AdminLayout';

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState({});
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    level: '',
    sort: 'newest'
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.currentPage,
        limit: 12,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        )
      };

      const response = await coursesAPI.admin.getAllCourses(params);
      setCourses(response.data || []);
      setPagination(response.pagination || {});
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [pagination.currentPage, filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleStatusChange = async (courseId, action) => {
    try {
      if (action === 'publish') {
        await coursesAPI.admin.publishCourse(courseId);
      } else if (action === 'archive') {
        await coursesAPI.admin.archiveCourse(courseId);
      }
      fetchCourses();
    } catch (error) {
      console.error(`Failed to ${action} course:`, error);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await coursesAPI.admin.deleteCourse(courseId);
        fetchCourses();
      } catch (error) {
        console.error('Failed to delete course:', error);
      }
    }
  };

  const handleImageError = (courseId) => {
    setImageErrors(prev => ({ ...prev, [courseId]: true }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Course Management</h1>
          <p className="text-gray-400 mt-1">Manage your courses, modules, and lessons</p>
        </div>
        <Link
          to="/admin/courses/new"
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Create Course
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-red-500/20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              <option value="mindfulness_basics">Mindfulness Basics</option>
              <option value="stress_management">Stress Management</option>
              <option value="sleep_meditation">Sleep Meditation</option>
              <option value="anxiety_relief">Anxiety Relief</option>
              <option value="focus_concentration">Focus & Concentration</option>
              <option value="emotional_wellness">Emotional Wellness</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Level</label>
            <select
              value={filters.level}
              onChange={(e) => handleFilterChange('level', e.target.value)}
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Course Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-red-500/20">
          <div className="text-2xl font-bold text-white">{pagination.totalItems}</div>
          <div className="text-sm text-gray-400">Total Courses</div>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-red-500/20">
          <div className="text-2xl font-bold text-green-400">
            {courses.filter(c => c.status === 'published').length}
          </div>
          <div className="text-sm text-gray-400">Published</div>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-red-500/20">
          <div className="text-2xl font-bold text-yellow-400">
            {courses.filter(c => c.status === 'draft').length}
          </div>
          <div className="text-sm text-gray-400">Drafts</div>
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div key={course._id} className="bg-slate-800/50 backdrop-blur-xl rounded-xl overflow-hidden border border-red-500/20 hover:border-red-500/40 transition-all">
            <div className="relative">
              {course.thumbnail && !imageErrors[course._id] ? (
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-48 object-cover"
                  onError={() => handleImageError(course._id)}
                />
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                  <span className="text-6xl font-bold text-white">
                    {course.title.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="absolute top-2 right-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${courseHelpers.getStatusBadgeColor(course.status)}`}>
                  {course.status}
                </span>
              </div>
            </div>

            <div className="p-4">
              <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                {course.title}
              </h3>

              <div className="flex items-center justify-between mb-3">
                <span className={`text-sm font-medium ${courseHelpers.getLevelColor(course.level)}`}>
                  {course.level}
                </span>
                <span className="text-sm text-gray-400">
                  {courseHelpers.formatCategory(course.category)}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                <span>{course.metrics?.moduleCount || 0} modules</span>
                <span>{course.metrics?.lessonCount || 0} lessons</span>
                <span>{courseHelpers.formatDuration(course.metrics?.totalDuration || 0)}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span className="text-white font-semibold">
                    {courseHelpers.getPricingDisplay(course.pricing)}
                  </span>
                  {course.pricing?.subscriptionRequired && (
                    <span className="ml-2 text-xs text-red-400">Premium</span>
                  )}
                </div>
                <span className="text-sm text-gray-400">
                  {course.metrics?.enrollmentCount || 0} enrolled
                </span>
              </div>

              <div className="flex gap-2 mt-4">
                <Link
                  to={`/admin/courses/${course._id}`}
                  className="flex-1 px-3 py-2 bg-slate-700 text-white text-sm rounded-lg hover:bg-slate-600 transition-colors text-center"
                >
                  Edit
                </Link>

                {course.status === 'draft' && (
                  <button
                    onClick={() => handleStatusChange(course._id, 'publish')}
                    className="px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Publish
                  </button>
                )}

                {course.status === 'published' && (
                  <button
                    onClick={() => handleStatusChange(course._id, 'archive')}
                    className="px-3 py-2 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    Archive
                  </button>
                )}

                <button
                  onClick={() => handleDeleteCourse(course._id)}
                  className="px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <button
            onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
            disabled={pagination.currentPage === 1}
            className="px-3 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <span className="text-gray-400">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>

          <button
            onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
            disabled={pagination.currentPage === pagination.totalPages}
            className="px-3 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
      </div>
    </AdminLayout>
  );
};

export default AdminCourses;
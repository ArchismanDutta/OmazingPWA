import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { coursesAPI, courseHelpers } from '../api/courses';
import Navigation from '../components/Navigation';

const Courses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [levels, setLevels] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    level: '',
    pricing: '',
    search: '',
    sort: 'popular',
    page: 1,
    limit: 12
  });
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [filters]);

  const fetchInitialData = async () => {
    try {
      const [categoriesResponse, levelsResponse] = await Promise.all([
        coursesAPI.getCategories(),
        coursesAPI.getLevels()
      ]);

      setCategories(categoriesResponse.data);
      setLevels(levelsResponse.data);
    } catch (err) {
      console.error('Error fetching initial data:', err);
    }
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);

      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '')
      );

      const response = await coursesAPI.getAllCourses(cleanFilters);
      setCourses(response.data || []);
      setPagination(response.pagination || {});
    } catch (err) {
      setError(err.message);
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const CourseCard = ({ course }) => (
    <Link
      to={`/courses/${course._id}`}
      className="group bg-white rounded-2xl shadow-sm hover:shadow-2xl border border-violet-100 overflow-hidden transition-all duration-300 cursor-pointer hover:-translate-y-2"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-violet-100 to-purple-100">
        <img
          src={course.thumbnail || 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=400&fit=crop'}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

        {course.pricing?.type === 'premium' && (
          <div className="absolute top-3 right-3">
            <span className="bg-violet-600 text-white text-xs px-3 py-1 rounded-full font-medium">
              Premium
            </span>
          </div>
        )}

        <div className="absolute top-3 left-3">
          <span className="text-xs px-3 py-1 rounded-full font-medium bg-white/90 text-gray-900">
            {course.level?.charAt(0).toUpperCase() + course.level?.slice(1)}
          </span>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <h3 className="font-bold text-gray-900 text-lg sm:text-xl mb-2 group-hover:text-violet-600 transition-colors line-clamp-2">
          {course.title}
        </h3>

        {course.instructor && (
          <p className="text-gray-600 text-sm mb-3">
            by {course.instructor.name}
          </p>
        )}

        {course.shortDescription && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-4">
            {course.shortDescription}
          </p>
        )}

        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <span>⏱️ {courseHelpers.formatDuration(course.metrics?.totalDuration || 0)}</span>
          <span>📚 {course.metrics?.lessonCount || 0} lessons</span>
          <span>⭐ {course.metrics?.rating?.average?.toFixed(1) || '0.0'}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">
            {course.pricing?.type === 'free' ? (
              <span className="text-green-600">Free</span>
            ) : (
              `$${course.pricing?.amount || 0}`
            )}
          </span>
          <span className="text-xs text-gray-500">
            {course.metrics?.enrollmentCount || 0} enrolled
          </span>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 pb-24 md:pb-8">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-10">
        {/* Page Header */}
        <div className="mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-violet-900 to-purple-900 bg-clip-text text-transparent mb-2">
            Mindful Courses
          </h1>
          <p className="text-base sm:text-lg text-gray-600">Structured learning paths for mindfulness and wellness</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-violet-100 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search courses..."
                className="w-full px-4 py-3 bg-white border border-violet-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-4 py-3 bg-white border border-violet-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.value} value={category.value}>{category.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Level</label>
              <select
                value={filters.level}
                onChange={(e) => handleFilterChange('level', e.target.value)}
                className="w-full px-4 py-3 bg-white border border-violet-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
              >
                <option value="">All Levels</option>
                {levels.map(level => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Pricing</label>
              <select
                value={filters.pricing}
                onChange={(e) => handleFilterChange('pricing', e.target.value)}
                className="w-full px-4 py-3 bg-white border border-violet-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
              >
                <option value="">All Pricing</option>
                <option value="free">Free</option>
                <option value="paid">Paid</option>
                <option value="premium">Premium</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Sort By</label>
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="w-full px-4 py-3 bg-white border border-violet-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
              >
                <option value="popular">Most Popular</option>
                <option value="newest">Newest</option>
                <option value="rating">Highest Rated</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-400 rounded-full animate-spin mx-auto" style={{animationDirection: 'reverse', animationDuration: '1s'}}></div>
              </div>
              <p className="mt-6 text-violet-600 font-medium">Loading courses...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="text-red-600 mb-2 text-lg font-semibold">Error loading courses</div>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={fetchCourses}
              className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-xl transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-8xl mb-6 opacity-50">📚</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No courses found</h3>
            <p className="text-gray-600 mb-8 text-lg">
              Try adjusting your filters or search terms
            </p>
          </div>
        ) : (
          <>
            {pagination.totalItems && (
              <div className="mb-6 text-sm text-gray-600">
                Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
                {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
                {pagination.totalItems} courses
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {courses.map((course, index) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center space-x-3">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="px-4 py-2 bg-white border border-violet-200 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-violet-50 text-gray-900 transition-all"
                >
                  Previous
                </button>

                {[...Array(pagination.totalPages)].map((_, index) => {
                  const page = index + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 border rounded-xl transition-all ${
                        page === pagination.currentPage
                          ? 'bg-violet-600 text-white border-violet-600 shadow-lg'
                          : 'bg-white border-violet-200 text-gray-900 hover:bg-violet-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-4 py-2 bg-white border border-violet-200 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-violet-50 text-gray-900 transition-all"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Courses;

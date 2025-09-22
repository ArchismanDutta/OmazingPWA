import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { coursesAPI, courseHelpers } from '../api/courses';
import TopNavBar from '../components/navigation/TopNavBar';
import Breadcrumbs from '../components/navigation/Breadcrumbs';

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

      // Remove empty filters
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
      page: 1 // Reset to first page when filters change
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
      className="group card-glass hover-lift block transform transition-all duration-300 hover:scale-105 border border-white/10 hover:border-white/20"
    >
      <div className="relative">
        {/* Course Thumbnail */}
        <div className="aspect-video bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-t-xl overflow-hidden">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-16 h-16 text-white/40" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/>
              </svg>
            </div>
          )}
        </div>

        {/* Premium Badge */}
        {course.pricing.type === 'premium' && (
          <div className="absolute top-3 right-3">
            <span className="bg-gradient-secondary text-white text-xs px-3 py-1 rounded-full font-medium">
              Premium
            </span>
          </div>
        )}

        {/* Level Badge */}
        <div className="absolute top-3 left-3">
          <span className={`text-xs px-3 py-1 rounded-full font-medium bg-white/20 backdrop-blur-sm ${courseHelpers.getLevelColor(course.level)}`}>
            {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
          </span>
        </div>
      </div>

      <div className="p-6">
        {/* Course Title */}
        <h3 className="font-bold text-white mb-2 line-clamp-2 text-lg group-hover:text-green-400 transition-colors">
          {course.title}
        </h3>

        {/* Instructor */}
        <p className="text-white/60 text-sm mb-3">
          by {course.instructor.name}
        </p>

        {/* Description */}
        {course.shortDescription && (
          <p className="text-white/70 text-sm mb-4 line-clamp-3 leading-relaxed">
            {course.shortDescription}
          </p>
        )}

        {/* Course Stats */}
        <div className="flex items-center justify-between text-xs text-white/50 mb-4">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
              </svg>
              {courseHelpers.formatDuration(course.metrics.totalDuration)}
            </span>
            <span className="flex items-center">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              {course.metrics.lessonCount} lessons
            </span>
          </div>
          <div className="flex items-center">
            <svg className="w-3 h-3 mr-1 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
            {course.metrics.rating.average > 0 ? course.metrics.rating.average.toFixed(1) : 'New'}
          </div>
        </div>

        {/* Category */}
        <div className="mb-4">
          <span className="bg-white/10 px-3 py-1 rounded-full font-medium text-xs text-white/70">
            {courseHelpers.formatCategory(course.category)}
          </span>
        </div>

        {/* Price and Enrollment */}
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold text-green-400">
            {courseHelpers.getPricingDisplay(course.pricing)}
          </div>
          <div className="text-xs text-white/50">
            {course.metrics.enrollmentCount} enrolled
          </div>
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-green-400/0 via-green-400/0 to-green-400/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none"></div>
    </Link>
  );

  const breadcrumbItems = [
    { label: 'Home', href: '/dashboard' },
    { label: 'Courses' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <TopNavBar
        title="Courses"
        subtitle="Structured learning paths for mindfulness and wellness"
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Breadcrumbs items={breadcrumbItems} backTo="/dashboard" />

        {/* Filters */}
        <div className="glass rounded-xl p-6 mb-8 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-semibold text-white/90 mb-2">
                Search
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search courses..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-white/90 mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Level */}
            <div>
              <label className="block text-sm font-semibold text-white/90 mb-2">
                Level
              </label>
              <select
                value={filters.level}
                onChange={(e) => handleFilterChange('level', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
              >
                <option value="">All Levels</option>
                {levels.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Pricing */}
            <div>
              <label className="block text-sm font-semibold text-white/90 mb-2">
                Pricing
              </label>
              <select
                value={filters.pricing}
                onChange={(e) => handleFilterChange('pricing', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
              >
                <option value="">All Pricing</option>
                <option value="free">Free</option>
                <option value="paid">Paid</option>
                <option value="premium">Premium</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-semibold text-white/90 mb-2">
                Sort By
              </label>
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
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
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-400 mx-auto mb-4"></div>
              <p className="text-white/60 animate-pulse">Loading courses...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="text-red-400 mb-2 text-lg font-semibold">Error loading courses</div>
            <p className="text-white/60 mb-6">{error}</p>
            <button
              onClick={fetchCourses}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-8xl mb-6 opacity-50">📚</div>
            <h3 className="text-2xl font-bold text-white mb-4">No courses found</h3>
            <p className="text-white/70 mb-8 text-lg">
              Try adjusting your filters or search terms
            </p>
          </div>
        ) : (
          <>
            {/* Results count */}
            <div className="mb-6 text-sm text-white/60">
              Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to {' '}
              {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of {' '}
              {pagination.totalItems} courses
            </div>

            {/* Courses grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {courses.map((course, index) => (
                <div key={course._id} style={{animationDelay: `${index * 0.1}s`}}>
                  <CourseCard course={course} />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center space-x-3">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="px-4 py-2 glass border border-white/10 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5 text-white transition-all"
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
                          ? 'bg-green-500 text-white border-green-500 shadow-lg'
                          : 'glass border-white/10 text-white hover:bg-white/5'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-4 py-2 glass border border-white/10 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5 text-white transition-all"
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
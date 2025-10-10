import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { coursesAPI, courseHelpers } from '../api/courses';
import TopNavBar from '../components/navigation/TopNavBar';
import Breadcrumbs from '../components/navigation/Breadcrumbs';
import CourseEnrollButton from '../components/course/CourseEnrollButton';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await coursesAPI.getCourseById(id);
      setCourse(response.data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching course:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    try {
      setEnrolling(true);
      await coursesAPI.enrollInCourse(id);
      await fetchCourse();
    } catch (err) {
      console.error('Error enrolling in course:', err);
      alert('Failed to enroll in course. Please try again.');
    } finally {
      setEnrolling(false);
    }
  };

  const handlePlayLesson = (lesson) => {
    navigate(`/courses/${id}/lessons/${lesson._id}`, {
      state: { lesson, course }
    });
  };

  const formatCategoryName = (category) => {
    if (!category) return '';
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const LessonItem = ({ lesson, moduleIndex, lessonIndex }) => (
    <div className="flex items-center justify-between p-4 sm:p-5 bg-white rounded-xl border border-violet-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          {lesson.content.type === 'video' && (
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/>
              </svg>
            </div>
          )}
          {lesson.content.type === 'audio' && (
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-400 to-violet-500 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.762l-4.09-3.121c-.229-.175-.531-.27-.842-.27H2a1 1 0 01-1-1V7.5a1 1 0 011-1h1.451c.311 0 .613-.095.842-.27l4.09-3.121a1 1 0 011.617.762z" clipRule="evenodd"/>
              </svg>
            </div>
          )}
          {lesson.content.type === 'text' && (
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd"/>
              </svg>
            </div>
          )}
          {lesson.content.type === 'quiz' && (
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
              </svg>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-gray-900 text-base sm:text-lg mb-1 line-clamp-1">{lesson.title}</h4>
          {lesson.description && (
            <p className="text-gray-600 text-sm line-clamp-2">{lesson.description}</p>
          )}
          <div className="flex items-center space-x-3 mt-2 text-xs flex-wrap gap-1">
            <span className="text-violet-600 font-medium bg-violet-50 px-2 py-0.5 rounded-full capitalize">
              {lesson.content.type}
            </span>
            {lesson.duration > 0 && (
              <span className="text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                ⏱️ {courseHelpers.formatDuration(lesson.duration)}
              </span>
            )}
            {lesson.isPreview && (
              <span className="text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">
                Preview
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex-shrink-0 ml-4">
        {course.hasAccess || lesson.isPreview ? (
          <button
            onClick={() => handlePlayLesson(lesson)}
            className="group p-2 sm:p-3 bg-gradient-to-br from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 rounded-xl transition-all duration-300 hover:scale-110 shadow-lg"
            title="Play lesson"
          >
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/>
            </svg>
          </button>
        ) : (
          <div className="p-2 sm:p-3 bg-gray-100 rounded-xl">
            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20" title="Locked - Enroll to access">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
            </svg>
          </div>
        )}
      </div>
    </div>
  );

  const ModuleSection = ({ module, index }) => (
    <div className="mb-6 sm:mb-8 animate-fade-in">
      <div className="bg-white rounded-2xl border border-violet-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
        <div className="p-5 sm:p-6 border-b border-violet-100 bg-gradient-to-r from-violet-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-1 h-6 bg-gradient-to-b from-violet-500 to-purple-500 rounded-full"></div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                  Module {index + 1}: {module.title}
                </h3>
              </div>
              {module.description && (
                <p className="text-gray-600 text-sm sm:text-base">{module.description}</p>
              )}
            </div>
            <div className="text-sm font-medium text-violet-600 bg-violet-100 px-3 py-1.5 rounded-full ml-4">
              {module.lessons.length} lessons
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-3">
          {module.lessons.map((lesson, lessonIndex) => (
            <LessonItem
              key={lesson._id}
              lesson={lesson}
              moduleIndex={index}
              lessonIndex={lessonIndex}
            />
          ))}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-16 h-16 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-400 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
          </div>
          <p className="text-violet-600 font-medium animate-pulse">Loading course...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-4">😔</div>
          <div className="text-red-600 mb-2 text-xl font-bold">Error loading course</div>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={fetchCourse} 
            className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-4">📚</div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Course Not Found</h1>
          <p className="text-gray-600 mb-6">The course you're looking for doesn't exist.</p>
          <button 
            onClick={() => navigate('/courses')} 
            className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            Browse Courses
          </button>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: 'Home', href: '/dashboard' },
    { label: 'Courses', href: '/courses' },
    { label: course.title }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 pb-8">
      <TopNavBar title={course.title} subtitle="Course Details" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Breadcrumbs items={breadcrumbItems} backTo="/courses" />

        {/* Course Header */}
        <div className="relative group mb-8 sm:mb-10 animate-fade-in">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 rounded-3xl blur-xl opacity-30 group-hover:opacity-40 transition-opacity"></div>
          <div className="relative bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-violet-100 shadow-lg overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 bg-gradient-to-br from-violet-200/30 to-purple-200/30 rounded-full -mr-16 sm:-mr-24 -mt-16 sm:-mt-24"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-tr from-pink-200/30 to-violet-200/30 rounded-full -ml-12 sm:-ml-16 -mb-12 sm:-mb-16"></div>
            
            <div className="relative grid lg:grid-cols-3 gap-6 sm:gap-8">
              {/* Course Image */}
              <div className="lg:col-span-1">
                <div className="aspect-video bg-gradient-to-br from-violet-100 to-purple-100 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-16 h-16 text-violet-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/>
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              {/* Course Info */}
              <div className="lg:col-span-2">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
                  <span className="text-xs sm:text-sm px-3 py-1.5 rounded-full font-bold text-violet-700 bg-violet-100 uppercase tracking-wide">
                    {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                  </span>
                  <span className="text-xs sm:text-sm px-3 py-1.5 rounded-full font-medium text-gray-700 bg-gray-100">
                    {formatCategoryName(course.category)}
                  </span>
                  {course.pricing.type === 'premium' && (
                    <span className="text-xs sm:text-sm px-3 py-1.5 rounded-full font-bold text-white bg-gradient-to-r from-violet-500 to-purple-600 shadow-md">
                      Premium
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">{course.title}</h1>

                <p className="text-gray-700 text-base sm:text-lg mb-6 leading-relaxed">
                  {course.description}
                </p>

                {/* Instructor */}
                <div className="mb-6">
                  <p className="text-gray-600 text-sm font-medium mb-2">Instructor</p>
                  <div className="flex items-center space-x-3">
                    {course.instructor.image ? (
                      <img
                        src={course.instructor.image}
                        alt={course.instructor.name}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-violet-200"
                      />
                    ) : (
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                        {course.instructor.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-gray-900">{course.instructor.name}</p>
                      {course.instructor.bio && (
                        <p className="text-gray-600 text-sm">{course.instructor.bio}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Course Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
                  <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                    <div className="text-xl sm:text-2xl font-bold text-green-600">
                      {course.metrics.moduleCount}
                    </div>
                    <div className="text-gray-600 text-xs sm:text-sm font-medium">Modules</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                    <div className="text-xl sm:text-2xl font-bold text-blue-600">
                      {course.metrics.lessonCount}
                    </div>
                    <div className="text-gray-600 text-xs sm:text-sm font-medium">Lessons</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border border-purple-100">
                    <div className="text-xl sm:text-2xl font-bold text-purple-600">
                      {courseHelpers.formatDuration(course.metrics.totalDuration)}
                    </div>
                    <div className="text-gray-600 text-xs sm:text-sm font-medium">Duration</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-100">
                    <div className="text-xl sm:text-2xl font-bold text-yellow-600">
                      {course.metrics.rating.average > 0 ? course.metrics.rating.average.toFixed(1) : 'New'}
                    </div>
                    <div className="text-gray-600 text-xs sm:text-sm font-medium">Rating</div>
                  </div>
                </div>

                {/* Pricing and Enrollment */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {courseHelpers.getPricingDisplay(course.pricing)}
                  </div>

                  <div className="w-full sm:w-auto">
                    {user ? (
                      course.hasAccess ? (
                        <button className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                          Start Learning
                        </button>
                      ) : (
                        <CourseEnrollButton course={course} onEnrollSuccess={fetchCourse} />
                      )
                    ) : (
                      <button
                        onClick={() => navigate('/login')}
                        className="w-full sm:w-auto bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                      >
                        Login to Enroll
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Course Content */}
        <div className="mb-8 sm:mb-10">
          <div className="flex items-center space-x-3 mb-6">
            <span className="text-2xl">📚</span>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Course Content</h2>
          </div>

          {course.modules && course.modules.length > 0 ? (
            course.modules.map((module, index) => (
              <ModuleSection key={module._id} module={module} index={index} />
            ))
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-violet-100 shadow-sm">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No content available</h3>
              <p className="text-gray-600">This course doesn't have any modules or lessons yet.</p>
            </div>
          )}
        </div>

        {/* What You'll Learn */}
        {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 mb-8 border border-violet-100 shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-2xl">✨</span>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">What You'll Learn</h3>
            </div>
            <ul className="space-y-3">
              {course.whatYouWillLearn.map((item, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-gray-700 text-base">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Requirements */}
        {course.requirements && course.requirements.length > 0 && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-violet-100 shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-2xl">📋</span>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Requirements</h3>
            </div>
            <ul className="space-y-3">
              {course.requirements.map((item, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-gray-700 text-base">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default CourseDetail;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { coursesAPI, courseHelpers } from '../api/courses';
import TopNavBar from '../components/navigation/TopNavBar';
import Breadcrumbs from '../components/navigation/Breadcrumbs';

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
      // Refresh course data to get updated enrollment status
      await fetchCourse();
    } catch (err) {
      console.error('Error enrolling in course:', err);
      alert('Failed to enroll in course. Please try again.');
    } finally {
      setEnrolling(false);
    }
  };

  const LessonItem = ({ lesson, moduleIndex, lessonIndex }) => (
    <div className="flex items-center justify-between p-4 glass border border-white/10 rounded-xl hover:bg-white/5 transition-all">
      <div className="flex items-center space-x-4">
        {/* Lesson Type Icon */}
        <div className="flex-shrink-0">
          {lesson.content.type === 'video' && (
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/>
              </svg>
            </div>
          )}
          {lesson.content.type === 'audio' && (
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.762l-4.09-3.121c-.229-.175-.531-.27-.842-.27H2a1 1 0 01-1-1V7.5a1 1 0 011-1h1.451c.311 0 .613-.095.842-.27l4.09-3.121a1 1 0 011.617.762z" clipRule="evenodd"/>
              </svg>
            </div>
          )}
          {lesson.content.type === 'text' && (
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd"/>
              </svg>
            </div>
          )}
          {lesson.content.type === 'quiz' && (
            <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
              </svg>
            </div>
          )}
        </div>

        {/* Lesson Info */}
        <div>
          <h4 className="font-semibold text-white mb-1">{lesson.title}</h4>
          {lesson.description && (
            <p className="text-white/60 text-sm">{lesson.description}</p>
          )}
          <div className="flex items-center space-x-4 mt-2 text-xs text-white/50">
            <span className="capitalize">{lesson.content.type}</span>
            {lesson.duration > 0 && (
              <span>{courseHelpers.formatDuration(lesson.duration)}</span>
            )}
            {lesson.isPreview && (
              <span className="text-green-400 font-medium">Preview</span>
            )}
          </div>
        </div>
      </div>

      {/* Access Status */}
      <div className="flex-shrink-0">
        {course.hasAccess || lesson.isPreview ? (
          <button className="text-green-400 hover:text-green-300 transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/>
            </svg>
          </button>
        ) : (
          <svg className="w-5 h-5 text-white/30" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
          </svg>
        )}
      </div>
    </div>
  );

  const ModuleSection = ({ module, index }) => (
    <div className="mb-8">
      <div className="glass rounded-xl border border-white/10 overflow-hidden">
        {/* Module Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                Module {index + 1}: {module.title}
              </h3>
              {module.description && (
                <p className="text-white/70">{module.description}</p>
              )}
            </div>
            <div className="text-sm text-white/50">
              {module.lessons.length} lessons
            </div>
          </div>
        </div>

        {/* Lessons */}
        <div className="p-6 space-y-3">
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-400 mx-auto mb-4"></div>
          <p className="text-white/60 animate-pulse">Loading course...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-2 text-lg font-semibold">Error loading course</div>
          <p className="text-white/60 mb-6">{error}</p>
          <button onClick={fetchCourse} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Course Not Found</h1>
          <p className="text-white/60 mb-6">The course you're looking for doesn't exist.</p>
          <button onClick={() => navigate('/courses')} className="btn-primary">
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <TopNavBar title={course.title} subtitle="Course Details" />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Breadcrumbs items={breadcrumbItems} backTo="/courses" />

        {/* Course Header */}
        <div className="glass rounded-xl p-8 mb-8 animate-fade-in">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Course Image */}
            <div className="lg:col-span-1">
              <div className="aspect-video bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl overflow-hidden">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-16 h-16 text-white/40" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/>
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Course Info */}
            <div className="lg:col-span-2">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className={`text-sm px-3 py-1 rounded-full font-medium bg-white/20 backdrop-blur-sm ${courseHelpers.getLevelColor(course.level)}`}>
                  {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                </span>
                <span className="bg-white/10 px-3 py-1 rounded-full font-medium text-xs text-white/70">
                  {courseHelpers.formatCategory(course.category)}
                </span>
                {course.pricing.type === 'premium' && (
                  <span className="bg-gradient-secondary text-white text-xs px-3 py-1 rounded-full font-medium">
                    Premium
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-bold text-white mb-4">{course.title}</h1>

              <p className="text-white/70 text-lg mb-6 leading-relaxed">
                {course.description}
              </p>

              {/* Instructor */}
              <div className="mb-6">
                <p className="text-white/60 text-sm mb-2">Instructor</p>
                <div className="flex items-center space-x-3">
                  {course.instructor.image && (
                    <img
                      src={course.instructor.image}
                      alt={course.instructor.name}
                      className="w-10 h-10 rounded-full"
                    />
                  )}
                  <div>
                    <p className="font-semibold text-white">{course.instructor.name}</p>
                    {course.instructor.bio && (
                      <p className="text-white/60 text-sm">{course.instructor.bio}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Course Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-3 glass rounded-lg border border-white/10">
                  <div className="text-2xl font-bold text-green-400">
                    {course.metrics.moduleCount}
                  </div>
                  <div className="text-white/60 text-sm">Modules</div>
                </div>
                <div className="text-center p-3 glass rounded-lg border border-white/10">
                  <div className="text-2xl font-bold text-blue-400">
                    {course.metrics.lessonCount}
                  </div>
                  <div className="text-white/60 text-sm">Lessons</div>
                </div>
                <div className="text-center p-3 glass rounded-lg border border-white/10">
                  <div className="text-2xl font-bold text-purple-400">
                    {courseHelpers.formatDuration(course.metrics.totalDuration)}
                  </div>
                  <div className="text-white/60 text-sm">Duration</div>
                </div>
                <div className="text-center p-3 glass rounded-lg border border-white/10">
                  <div className="text-2xl font-bold text-yellow-400">
                    {course.metrics.rating.average > 0 ? course.metrics.rating.average.toFixed(1) : 'New'}
                  </div>
                  <div className="text-white/60 text-sm">Rating</div>
                </div>
              </div>

              {/* Pricing and Enrollment */}
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-green-400">
                  {courseHelpers.getPricingDisplay(course.pricing)}
                </div>

                {user ? (
                  course.hasAccess ? (
                    <button className="btn-primary bg-green-500 hover:bg-green-600">
                      Start Learning
                    </button>
                  ) : (
                    <button
                      onClick={handleEnroll}
                      disabled={enrolling}
                      className="btn-primary"
                    >
                      {enrolling ? 'Enrolling...' : 'Enroll Now'}
                    </button>
                  )
                ) : (
                  <button
                    onClick={() => navigate('/login')}
                    className="btn-primary"
                  >
                    Login to Enroll
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Course Content */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Course Content</h2>

          {course.modules && course.modules.length > 0 ? (
            course.modules.map((module, index) => (
              <ModuleSection key={module._id} module={module} index={index} />
            ))
          ) : (
            <div className="text-center py-16 glass rounded-xl border border-white/10">
              <div className="text-6xl mb-4 opacity-50">📚</div>
              <h3 className="text-xl font-bold text-white mb-2">No content available</h3>
              <p className="text-white/60">This course doesn't have any modules or lessons yet.</p>
            </div>
          )}
        </div>

        {/* What You'll Learn */}
        {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 && (
          <div className="glass rounded-xl p-6 mb-8">
            <h3 className="text-xl font-bold text-white mb-4">What You'll Learn</h3>
            <ul className="space-y-2">
              {course.whatYouWillLearn.map((item, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-white/80">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Requirements */}
        {course.requirements && course.requirements.length > 0 && (
          <div className="glass rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Requirements</h3>
            <ul className="space-y-2">
              {course.requirements.map((item, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-white/80">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetail;
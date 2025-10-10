import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TopNavBar from '../components/navigation/TopNavBar';
import { coursesAPI, courseHelpers } from '../api/courses';
import { ChevronDown, ChevronRight, Play, FileText, CheckCircle, Clock } from 'lucide-react';

const MyCourses = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedCourses, setExpandedCourses] = useState({});

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const fetchEnrolledCourses = async () => {
    try {
      setLoading(true);
      const response = await coursesAPI.getUserCourses();

      if (response.success) {
        setEnrollments(response.data || []);
        // Auto-expand all courses by default
        const expanded = {};
        response.data.forEach(enrollment => {
          expanded[enrollment.courseId._id] = true;
        });
        setExpandedCourses(expanded);
      }
    } catch (error) {
      console.error('Failed to fetch enrolled courses:', error);
      setError('Failed to load your courses');
    } finally {
      setLoading(false);
    }
  };

  const toggleCourseExpand = (courseId) => {
    setExpandedCourses(prev => ({
      ...prev,
      [courseId]: !prev[courseId]
    }));
  };

  const getFileIcon = (contentType) => {
    switch (contentType) {
      case 'video':
        return <Play className="w-4 h-4" />;
      case 'audio':
        return <span className="text-sm">🎵</span>;
      case 'text':
        return <FileText className="w-4 h-4" />;
      case 'quiz':
        return <span className="text-sm">❓</span>;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const isLessonCompleted = (enrollment, moduleId, lessonId) => {
    const moduleProgress = enrollment.modulesProgress?.find(m => m.moduleId.toString() === moduleId.toString());
    if (!moduleProgress) return false;

    const lessonProgress = moduleProgress.lessonsProgress?.find(l => l.lessonId.toString() === lessonId.toString());
    return lessonProgress?.completed || false;
  };

  const getLessonProgress = (enrollment, moduleId, lessonId) => {
    const moduleProgress = enrollment.modulesProgress?.find(m => m.moduleId.toString() === moduleId.toString());
    if (!moduleProgress) return null;

    return moduleProgress.lessonsProgress?.find(l => l.lessonId.toString() === lessonId.toString());
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 pb-8">
        <TopNavBar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 pb-8">
      <TopNavBar />

      <main className="px-4 sm:px-6 py-6 sm:py-8 max-w-7xl mx-auto">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {enrollments.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-violet-100 p-12 text-center animate-fade-in">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No Courses Yet</h3>
            <p className="text-gray-600 mb-8">
              Start your learning journey by enrolling in a course
            </p>
            <Link
              to="/courses"
              className="inline-block px-8 py-4 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-2xl shadow-sm border border-violet-100 p-6">
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">📚</div>
                  <div>
                    <p className="text-gray-600 text-sm">Total Courses</p>
                    <p className="text-2xl font-bold text-gray-900">{enrollments.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-violet-100 p-6">
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">✅</div>
                  <div>
                    <p className="text-gray-600 text-sm">Completed</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {enrollments.filter(e => e.status === 'completed').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-violet-100 p-6">
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">📈</div>
                  <div>
                    <p className="text-gray-600 text-sm">In Progress</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {enrollments.filter(e => e.status === 'in_progress').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Enrolled Courses List */}
            {enrollments.map((enrollment) => {
              const course = enrollment.courseId;
              const isExpanded = expandedCourses[course._id];
              const progress = enrollment.progress?.percentage || 0;

              return (
                <div
                  key={enrollment._id}
                  className="bg-white rounded-2xl shadow-lg border border-violet-100 overflow-hidden animate-fade-in"
                >
                  {/* Course Header */}
                  <div className="p-6 border-b border-violet-100">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h2 className="text-2xl font-bold text-gray-900">
                            {course.title}
                          </h2>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            enrollment.status === 'completed'
                              ? 'bg-green-100 text-green-700 border border-green-200'
                              : 'bg-blue-100 text-blue-700 border border-blue-200'
                          }`}>
                            {enrollment.status === 'completed' ? 'Completed' : 'In Progress'}
                          </span>
                        </div>

                        <p className="text-gray-600 mb-4">{course.description}</p>

                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Overall Progress</span>
                            <span className="text-sm font-semibold text-gray-900">{progress}%</span>
                          </div>
                          <div className="w-full bg-violet-100 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-violet-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}</span>
                          </div>
                          {enrollment.lastAccessedAt && (
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>Last accessed: {new Date(enrollment.lastAccessedAt).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Expand/Collapse Button */}
                      <button
                        onClick={() => toggleCourseExpand(course._id)}
                        className="p-2 hover:bg-violet-50 rounded-lg transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-6 h-6 text-gray-700" />
                        ) : (
                          <ChevronRight className="w-6 h-6 text-gray-700" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Course Content - Expandable */}
                  {isExpanded && (
                    <div className="p-6 bg-violet-50">
                      <div className="space-y-6">
                        {course.modules?.map((module, moduleIndex) => (
                          <div key={module._id} className="space-y-3">
                            {/* Module Header */}
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                                {moduleIndex + 1}
                              </div>
                              <h3 className="text-lg font-bold text-gray-900">{module.title}</h3>
                            </div>

                            {/* Module Description */}
                            {module.description && (
                              <p className="text-gray-600 text-sm ml-11 mb-3">{module.description}</p>
                            )}

                            {/* Lessons List */}
                            <div className="ml-11 space-y-2">
                              {module.lessons?.map((lesson, lessonIndex) => {
                                const lessonCompleted = isLessonCompleted(enrollment, module._id, lesson._id);
                                const lessonProgress = getLessonProgress(enrollment, module._id, lesson._id);

                                return (
                                  <Link
                                    key={lesson._id}
                                    to={`/courses/${course._id}/lessons/${lesson._id}`}
                                    className="block p-4 bg-white hover:bg-violet-50 rounded-lg border border-violet-100 hover:border-violet-300 transition-all group shadow-sm"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-3 flex-1">
                                        <div className={`p-2 rounded-lg ${
                                          lessonCompleted
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-blue-100 text-blue-700'
                                        }`}>
                                          {lessonCompleted ? (
                                            <CheckCircle className="w-4 h-4" />
                                          ) : (
                                            getFileIcon(lesson.content?.type)
                                          )}
                                        </div>

                                        <div className="flex-1">
                                          <div className="flex items-center space-x-2">
                                            <span className="text-gray-900 font-medium group-hover:text-violet-600 transition-colors">
                                              {lessonIndex + 1}. {lesson.title}
                                            </span>
                                            {lesson.duration && (
                                              <span className="text-xs text-gray-500">
                                                {Math.floor(lesson.duration / 60)}min
                                              </span>
                                            )}
                                          </div>

                                          {/* Lesson Progress Bar for incomplete lessons */}
                                          {!lessonCompleted && lessonProgress?.watchTime > 0 && lesson.duration && (
                                            <div className="mt-2">
                                              <div className="w-full bg-violet-100 rounded-full h-1">
                                                <div
                                                  className="bg-violet-500 h-1 rounded-full"
                                                  style={{
                                                    width: `${Math.min((lessonProgress.watchTime / lesson.duration) * 100, 100)}%`
                                                  }}
                                                />
                                              </div>
                                            </div>
                                          )}
                                        </div>

                                        {/* Content Type Badge */}
                                        <span className="px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-xs capitalize font-medium">
                                          {lesson.content?.type || 'content'}
                                        </span>

                                        {/* Resources Count */}
                                        {lesson.resources && lesson.resources.length > 0 && (
                                          <span className="text-xs text-gray-500">
                                            📎 {lesson.resources.length}
                                          </span>
                                        )}
                                      </div>

                                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                                    </div>
                                  </Link>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Continue Learning Button */}
                      <div className="mt-6 pt-6 border-t border-violet-200">
                        <Link
                          to={`/courses/${course._id}`}
                          className="inline-block px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 w-full sm:w-auto text-center"
                        >
                          {progress === 100 ? 'Review Course' : 'Continue Learning'}
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyCourses;

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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <TopNavBar title="My Courses" subtitle="Your learning journey" />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <TopNavBar title="My Courses" subtitle="Your enrolled courses" />

      <main className="px-4 sm:px-6 py-6 sm:py-8 max-w-7xl mx-auto">
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {enrollments.length === 0 ? (
          <div className="card-glass p-12 text-center animate-fade-in">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-2xl font-bold text-white mb-4">No Courses Yet</h3>
            <p className="text-white/70 mb-8">
              Start your learning journey by enrolling in a course
            </p>
            <Link
              to="/courses"
              className="btn-primary inline-block px-8 py-4"
            >
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="card-glass p-6">
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">📚</div>
                  <div>
                    <p className="text-white/60 text-sm">Total Courses</p>
                    <p className="text-2xl font-bold text-white">{enrollments.length}</p>
                  </div>
                </div>
              </div>
              <div className="card-glass p-6">
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">✅</div>
                  <div>
                    <p className="text-white/60 text-sm">Completed</p>
                    <p className="text-2xl font-bold text-white">
                      {enrollments.filter(e => e.status === 'completed').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="card-glass p-6">
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">📈</div>
                  <div>
                    <p className="text-white/60 text-sm">In Progress</p>
                    <p className="text-2xl font-bold text-white">
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
                  className="card-glass overflow-hidden animate-fade-in"
                >
                  {/* Course Header */}
                  <div className="p-6 border-b border-white/10">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h2 className="text-2xl font-bold text-white">
                            {course.title}
                          </h2>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            enrollment.status === 'completed'
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                              : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          }`}>
                            {enrollment.status === 'completed' ? 'Completed' : 'In Progress'}
                          </span>
                        </div>

                        <p className="text-white/70 mb-4">{course.description}</p>

                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-white/60">Overall Progress</span>
                            <span className="text-sm font-semibold text-white">{progress}%</span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="flex flex-wrap gap-4 text-sm text-white/60">
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
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-6 h-6 text-white" />
                        ) : (
                          <ChevronRight className="w-6 h-6 text-white" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Course Content - Expandable */}
                  {isExpanded && (
                    <div className="p-6 bg-black/20">
                      <div className="space-y-6">
                        {course.modules?.map((module, moduleIndex) => (
                          <div key={module._id} className="space-y-3">
                            {/* Module Header */}
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-sm">
                                {moduleIndex + 1}
                              </div>
                              <h3 className="text-lg font-bold text-white">{module.title}</h3>
                            </div>

                            {/* Module Description */}
                            {module.description && (
                              <p className="text-white/60 text-sm ml-11 mb-3">{module.description}</p>
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
                                    className="block p-4 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 hover:border-white/20 transition-all group"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-3 flex-1">
                                        <div className={`p-2 rounded-lg ${
                                          lessonCompleted
                                            ? 'bg-green-500/20 text-green-400'
                                            : 'bg-blue-500/20 text-blue-400'
                                        }`}>
                                          {lessonCompleted ? (
                                            <CheckCircle className="w-4 h-4" />
                                          ) : (
                                            getFileIcon(lesson.content?.type)
                                          )}
                                        </div>

                                        <div className="flex-1">
                                          <div className="flex items-center space-x-2">
                                            <span className="text-white font-medium group-hover:text-green-400 transition-colors">
                                              {lessonIndex + 1}. {lesson.title}
                                            </span>
                                            {lesson.duration && (
                                              <span className="text-xs text-white/50">
                                                {Math.floor(lesson.duration / 60)}min
                                              </span>
                                            )}
                                          </div>

                                          {/* Lesson Progress Bar for incomplete lessons */}
                                          {!lessonCompleted && lessonProgress?.watchTime > 0 && lesson.duration && (
                                            <div className="mt-2">
                                              <div className="w-full bg-white/10 rounded-full h-1">
                                                <div
                                                  className="bg-blue-400 h-1 rounded-full"
                                                  style={{
                                                    width: `${Math.min((lessonProgress.watchTime / lesson.duration) * 100, 100)}%`
                                                  }}
                                                />
                                              </div>
                                            </div>
                                          )}
                                        </div>

                                        {/* Content Type Badge */}
                                        <span className="px-3 py-1 bg-white/10 text-white/70 rounded-full text-xs capitalize">
                                          {lesson.content?.type || 'content'}
                                        </span>

                                        {/* Resources Count */}
                                        {lesson.resources && lesson.resources.length > 0 && (
                                          <span className="text-xs text-white/50">
                                            📎 {lesson.resources.length}
                                          </span>
                                        )}
                                      </div>

                                      <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white/80 transition-colors" />
                                    </div>
                                  </Link>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Continue Learning Button */}
                      <div className="mt-6 pt-6 border-t border-white/10">
                        <Link
                          to={`/courses/${course._id}`}
                          className="btn-primary w-full sm:w-auto text-center"
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

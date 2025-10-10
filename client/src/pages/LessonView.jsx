import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { coursesAPI } from '../api/courses';
import TopNavBar from '../components/navigation/TopNavBar';
import Breadcrumbs from '../components/navigation/Breadcrumbs';
import AudioPlayer from '../components/media/AudioPlayer';
import VideoPlayer from '../components/media/VideoPlayer';
import { getOptimizedMediaUrl, checkCorsCompatibility } from '../utils/mediaUrl';

const LessonView = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [lesson, setLesson] = useState(location.state?.lesson || null);
  const [course, setCourse] = useState(location.state?.course || null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(!lesson || !course);

  useEffect(() => {
    if (!lesson || !course) {
      fetchData();
    } else {
      setIsCompleted(lesson.completed || false);
    }
  }, [courseId, lessonId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const courseResponse = await coursesAPI.getCourseById(courseId);
      const courseData = courseResponse.data;
      setCourse(courseData);

      let foundLesson = null;
      for (const module of courseData.modules) {
        foundLesson = module.lessons.find(l => l._id === lessonId);
        if (foundLesson) break;
      }

      if (foundLesson) {
        setLesson(foundLesson);
        setIsCompleted(foundLesson.completed || false);
      } else {
        throw new Error('Lesson not found');
      }
    } catch (err) {
      console.error('Error fetching lesson:', err);
      navigate(`/courses/${courseId}`);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!isCompleted) {
      setIsCompleted(true);
      try {
        await coursesAPI.markLessonComplete(courseId, lessonId);
      } catch (err) {
        console.error('Error marking lesson as complete:', err);
      }
    }
  };

  const handleProgress = (currentTime, duration) => {
    if (duration > 0 && currentTime / duration >= 0.8 && !isCompleted) {
      handleComplete();
    }
  };

  const renderContent = () => {
    if (!lesson) return null;

    const { content } = lesson;
    const mediaUrl = content.url || getOptimizedMediaUrl(content);
    checkCorsCompatibility(mediaUrl);

    switch (content.type) {
      case 'video':
        return (
          <div className="bg-white rounded-2xl overflow-hidden border border-violet-100 shadow-lg">
            {import.meta.env.DEV && (
              <div className="m-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 text-sm">
                <strong>Debug Info:</strong> Video URL: {mediaUrl}
              </div>
            )}
            <VideoPlayer
              src={mediaUrl}
              title={lesson.title}
              poster={content.thumbnail}
              onProgress={handleProgress}
              onEnded={handleComplete}
              className="w-full"
            />
          </div>
        );

      case 'audio':
        return (
          <div className="bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 rounded-2xl p-6 sm:p-8 border border-violet-200 shadow-lg">
            {import.meta.env.DEV && (
              <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-xl text-purple-700 text-sm">
                <strong>Debug Info:</strong> Audio URL: {mediaUrl}
              </div>
            )}
            <AudioPlayer
              src={mediaUrl}
              title={lesson.title}
              onProgress={handleProgress}
              onEnded={handleComplete}
              className="bg-white/50 border-violet-200"
            />
          </div>
        );

      case 'text':
        return (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-violet-100 shadow-lg">
            <div
              className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: content.content || content.text }}
            />
            <div className="mt-8 pt-6 border-t border-violet-200">
              <button
                onClick={handleComplete}
                className={`w-full px-6 py-3 rounded-xl font-bold shadow-lg transition-all duration-300 ${
                  isCompleted
                    ? 'bg-green-500 text-white cursor-default'
                    : 'bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white hover:shadow-xl hover:-translate-y-1'
                }`}
                disabled={isCompleted}
              >
                {isCompleted ? 'Completed ✓' : 'Mark as Complete'}
              </button>
            </div>
          </div>
        );

      case 'quiz':
        return (
          <div className="bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 rounded-2xl p-8 border border-yellow-200 shadow-lg">
            <div className="text-center">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Quiz</h3>
              <p className="text-gray-600 mb-8 text-lg">
                {content.description || 'Complete this quiz to test your knowledge.'}
              </p>
              <button
                onClick={handleComplete}
                className={`px-6 py-3 rounded-xl font-bold shadow-lg transition-all duration-300 ${
                  isCompleted
                    ? 'bg-green-500 text-white cursor-default'
                    : 'bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white hover:shadow-xl hover:-translate-y-1'
                }`}
                disabled={isCompleted}
              >
                {isCompleted ? 'Quiz Completed ✓' : 'Start Quiz'}
              </button>
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-8 border border-red-200 shadow-lg text-center">
            <div className="text-4xl mb-4">❌</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Unsupported Content</h3>
            <p className="text-gray-600">
              This lesson content type ({content.type}) is not supported yet.
            </p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-400 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
          </div>
          <p className="mt-6 text-violet-600 font-medium animate-pulse">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (!lesson || !course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-4">📚</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Lesson Not Found</h1>
          <button 
            onClick={() => navigate(`/courses/${courseId}`)} 
            className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: 'Home', href: '/dashboard' },
    { label: 'Courses', href: '/courses' },
    { label: course.title, href: `/courses/${courseId}` },
    { label: lesson.title }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 pb-8">
      <TopNavBar title={lesson.title} subtitle={`${course.title} • Lesson ${lesson.order || ''}`} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Breadcrumbs items={breadcrumbItems} backTo={`/courses/${courseId}`} />

        {/* Lesson Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{lesson.title}</h1>
              {lesson.description && (
                <p className="text-gray-600 text-base sm:text-lg">{lesson.description}</p>
              )}
            </div>
            {isCompleted && (
              <span className="bg-green-50 text-green-600 px-4 py-2 rounded-full text-sm font-bold border border-green-200 shadow-sm inline-block self-start">
                Completed ✓
              </span>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="mb-6 sm:mb-8 animate-fade-in">
          {renderContent()}
        </div>

        {/* Lesson Meta Info */}
        <div className="relative group animate-fade-in">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <div className="relative bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-violet-100 shadow-lg">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-4 text-center border border-violet-100">
                <div className="text-gray-600 text-sm mb-1 font-medium">Type</div>
                <div className="text-gray-900 font-bold capitalize">{lesson.content.type}</div>
              </div>
              {lesson.duration > 0 && (
                <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-4 text-center border border-violet-100">
                  <div className="text-gray-600 text-sm mb-1 font-medium">Duration</div>
                  <div className="text-gray-900 font-bold">
                    {Math.floor(lesson.duration / 60)}:{(lesson.duration % 60).toString().padStart(2, '0')}
                  </div>
                </div>
              )}
              <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-4 text-center border border-violet-100">
                <div className="text-gray-600 text-sm mb-1 font-medium">Status</div>
                <div className="text-gray-900 font-bold">
                  {isCompleted ? 'Completed' : 'In Progress'}
                </div>
              </div>
              {lesson.isPreview && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 text-center">
                  <div className="text-green-600 text-sm mb-1 font-medium">Access</div>
                  <div className="text-green-700 font-bold">Preview</div>
                </div>
              )}
            </div>
          </div>
        </div>
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

export default LessonView;
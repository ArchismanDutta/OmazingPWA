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

      // Find the lesson in the course modules
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
    // Mark as completed when 80% watched/listened
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
          <div className="glass rounded-xl overflow-hidden border border-white/10">
            {import.meta.env.DEV && (
              <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-300 text-sm">
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
          <div className="glass rounded-xl p-8 border border-white/10 bg-gradient-to-br from-purple-500/10 to-blue-500/10">
            {import.meta.env.DEV && (
              <div className="mb-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg text-purple-300 text-sm">
                <strong>Debug Info:</strong> Audio URL: {mediaUrl}
              </div>
            )}
            <AudioPlayer
              src={mediaUrl}
              title={lesson.title}
              onProgress={handleProgress}
              onEnded={handleComplete}
              className="bg-white/5 border-white/10"
            />
          </div>
        );

      case 'text':
        return (
          <div className="glass rounded-xl p-8 border border-white/10">
            <div
              className="prose prose-invert max-w-none text-white/90 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: content.content || content.text }}
            />
            <div className="mt-8 pt-6 border-t border-white/10">
              <button
                onClick={handleComplete}
                className={`btn-primary w-full ${isCompleted ? 'bg-green-600' : ''}`}
                disabled={isCompleted}
              >
                {isCompleted ? 'Completed ✓' : 'Mark as Complete'}
              </button>
            </div>
          </div>
        );

      case 'quiz':
        return (
          <div className="glass rounded-xl p-8 border border-white/10 bg-yellow-500/10">
            <div className="text-center">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-2xl font-bold text-white mb-4">Quiz</h3>
              <p className="text-white/70 mb-8 text-lg">
                {content.description || 'Complete this quiz to test your knowledge.'}
              </p>
              <button
                onClick={handleComplete}
                className={`btn-primary ${isCompleted ? 'bg-green-600' : ''}`}
                disabled={isCompleted}
              >
                {isCompleted ? 'Quiz Completed ✓' : 'Start Quiz'}
              </button>
            </div>
          </div>
        );

      default:
        return (
          <div className="glass rounded-xl p-8 border border-white/10 bg-red-500/10 text-center">
            <div className="text-4xl mb-4">❌</div>
            <h3 className="text-xl font-bold text-white mb-2">Unsupported Content</h3>
            <p className="text-white/70">
              This lesson content type ({content.type}) is not supported yet.
            </p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-400 mx-auto mb-4"></div>
          <p className="text-white/60 animate-pulse">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (!lesson || !course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Lesson Not Found</h1>
          <button onClick={() => navigate(`/courses/${courseId}`)} className="btn-primary">
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <TopNavBar title={lesson.title} subtitle={`${course.title} • Lesson ${lesson.order || ''}`} />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <Breadcrumbs items={breadcrumbItems} backTo={`/courses/${courseId}`} />

        {/* Lesson Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{lesson.title}</h1>
              {lesson.description && (
                <p className="text-white/70 text-lg">{lesson.description}</p>
              )}
            </div>
            {isCompleted && (
              <span className="bg-green-500/20 text-green-400 px-4 py-2 rounded-full text-sm font-medium border border-green-500/30">
                Completed ✓
              </span>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="mb-8">
          {renderContent()}
        </div>

        {/* Lesson Meta Info */}
        <div className="glass rounded-xl p-6 border border-white/10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <div className="text-white/60 text-sm mb-1">Type</div>
              <div className="text-white font-medium capitalize">{lesson.content.type}</div>
            </div>
            {lesson.duration > 0 && (
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <div className="text-white/60 text-sm mb-1">Duration</div>
                <div className="text-white font-medium">
                  {Math.floor(lesson.duration / 60)}:{(lesson.duration % 60).toString().padStart(2, '0')}
                </div>
              </div>
            )}
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <div className="text-white/60 text-sm mb-1">Status</div>
              <div className="text-white font-medium">
                {isCompleted ? 'Completed' : 'In Progress'}
              </div>
            </div>
            {lesson.isPreview && (
              <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-center">
                <div className="text-green-400 text-sm mb-1">Access</div>
                <div className="text-green-400 font-medium">Preview</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonView;

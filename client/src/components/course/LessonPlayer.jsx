import React, { useState } from 'react';
import AudioPlayer from '../media/AudioPlayer';
import VideoPlayer from '../media/VideoPlayer';
import { getOptimizedMediaUrl, checkCorsCompatibility } from '../../utils/mediaUrl';

const LessonPlayer = ({ lesson, course, onClose, onComplete }) => {
  const [isCompleted, setIsCompleted] = useState(lesson.completed || false);

  const handleComplete = () => {
    if (!isCompleted) {
      setIsCompleted(true);
      onComplete?.(lesson._id);
    }
  };

  const handleProgress = (currentTime, duration) => {
    // Mark as completed when 80% watched/listened
    if (duration > 0 && currentTime / duration >= 0.8 && !isCompleted) {
      handleComplete();
    }
  };

  const renderContent = () => {
    const { content } = lesson;

    // Get optimized media URL
    const mediaUrl = content.url || getOptimizedMediaUrl(content);

    // Check CORS compatibility and log warnings
    checkCorsCompatibility(mediaUrl);

    switch (content.type) {
      case 'video':
        return (
          <div>
            {/* Debug info for development */}
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
              className="w-full max-h-96"
            />
          </div>
        );

      case 'audio':
        return (
          <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-xl p-6 border border-white/10">
            {/* Debug info for development */}
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
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div
              className="prose prose-invert max-w-none text-white/90 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: content.content || content.text }}
            />
            <div className="mt-6 pt-4 border-t border-white/10">
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
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
            <div className="text-center">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-bold text-white mb-4">Quiz</h3>
              <p className="text-white/70 mb-6">
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
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
            <div className="text-4xl mb-4">❌</div>
            <h3 className="text-xl font-bold text-white mb-2">Unsupported Content</h3>
            <p className="text-white/70">
              This lesson content type ({content.type}) is not supported yet.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-xl border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">{lesson.title}</h2>
            <p className="text-white/60 text-sm">
              {course?.title} • Lesson {lesson.order || 'N/A'}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {isCompleted && (
              <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium border border-green-500/30">
                Completed ✓
              </span>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-all"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {lesson.description && (
            <div className="mb-6">
              <p className="text-white/80 leading-relaxed">{lesson.description}</p>
            </div>
          )}

          {renderContent()}

          {/* Lesson Meta Info */}
          <div className="mt-6 pt-4 border-t border-white/10">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-white/60 text-xs mb-1">Type</div>
                <div className="text-white font-medium capitalize">{lesson.content.type}</div>
              </div>
              {lesson.duration > 0 && (
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-white/60 text-xs mb-1">Duration</div>
                  <div className="text-white font-medium">
                    {Math.floor(lesson.duration / 60)}:{(lesson.duration % 60).toString().padStart(2, '0')}
                  </div>
                </div>
              )}
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-white/60 text-xs mb-1">Status</div>
                <div className="text-white font-medium">
                  {isCompleted ? 'Completed' : 'In Progress'}
                </div>
              </div>
              {lesson.isPreview && (
                <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3">
                  <div className="text-green-400 text-xs mb-1">Access</div>
                  <div className="text-green-400 font-medium">Preview</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonPlayer;
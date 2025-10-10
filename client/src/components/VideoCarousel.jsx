import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getCarouselVideos } from '../api/videoCarousel';

const VideoCarousel = () => {
  const [videos, setVideos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const carouselRef = useRef(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  // Auto-scroll effect (right to left)
  useEffect(() => {
    if (videos.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === videos.length - 1 ? 0 : prev + 1));
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [videos.length]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await getCarouselVideos();
      setVideos(response.videos || []);
    } catch (error) {
      console.error('Failed to fetch carousel videos:', error);
      setError('Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? videos.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === videos.length - 1 ? 0 : prev + 1));
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const getEmbedUrl = (video) => {
    if (video.platform === 'youtube' && video.videoId) {
      return `https://www.youtube.com/embed/${video.videoId}?autoplay=0&rel=0`;
    } else if (video.platform === 'instagram' && video.videoId) {
      return `https://www.instagram.com/p/${video.videoId}/embed`;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="w-full bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <div className="flex items-center justify-center h-40 sm:h-48">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  if (error || videos.length === 0) {
    return null; // Don't show carousel if there are no videos
  }

  const currentVideo = videos[currentIndex];
  const embedUrl = getEmbedUrl(currentVideo);

  return (
    <div className="w-full bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Carousel Content */}
      <div className="relative" ref={carouselRef}>
        {/* Video Player - Smaller aspect ratio */}
        <div className="relative w-full" style={{ paddingTop: '45%' }}>
          <div className="absolute inset-0 bg-black">
            {embedUrl ? (
              <iframe
                src={embedUrl}
                title={currentVideo.title}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                <div className="text-center text-white">
                  <div className="text-3xl sm:text-4xl mb-2">🎬</div>
                  <p className="text-sm sm:text-base">Video Unavailable</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Arrows */}
        {videos.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-sm transition-all hover:scale-110 z-10"
              aria-label="Previous video"
            >
              <ChevronLeft size={18} className="sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-sm transition-all hover:scale-110 z-10"
              aria-label="Next video"
            >
              <ChevronRight size={18} className="sm:w-5 sm:h-5" />
            </button>
          </>
        )}
      </div>

      {/* Video Info */}
      <div className="p-3 sm:p-4 md:p-5">
        <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 mb-1 sm:mb-2 line-clamp-2">
          {currentVideo.title}
        </h3>
        {currentVideo.description && (
          <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2">
            {currentVideo.description}
          </p>
        )}

        {/* Indicators */}
        {videos.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 sm:gap-2">
            {videos.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 ${
                  index === currentIndex
                    ? 'w-6 sm:w-8 h-1.5 sm:h-2 bg-purple-600 rounded-full'
                    : 'w-1.5 sm:w-2 h-1.5 sm:h-2 bg-gray-300 hover:bg-gray-400 rounded-full'
                }`}
                aria-label={`Go to video ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCarousel;

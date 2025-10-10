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
      <div className="w-full bg-slate-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
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
    <div className="w-full bg-slate-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-700/50 bg-gradient-to-r from-slate-800/80 to-slate-700/80">
        <h2 className="text-xl font-bold text-white flex items-center">
          <span className="mr-2">🎥</span>
          Featured Videos
        </h2>
      </div>

      {/* Carousel Content */}
      <div className="relative" ref={carouselRef}>
        {/* Video Player */}
        <div className="aspect-video bg-black">
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
                <div className="text-6xl mb-4">🎬</div>
                <p className="text-lg">Video Unavailable</p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Arrows */}
        {videos.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-sm transition-all hover:scale-110 z-10"
              aria-label="Previous video"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-sm transition-all hover:scale-110 z-10"
              aria-label="Next video"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}
      </div>

      {/* Video Info */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-white mb-2">
          {currentVideo.title}
        </h3>
        {currentVideo.description && (
          <p className="text-gray-400 text-sm mb-4">
            {currentVideo.description}
          </p>
        )}

        {/* Indicators */}
        {videos.length > 1 && (
          <div className="flex items-center justify-center gap-2">
            {videos.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 ${
                  index === currentIndex
                    ? 'w-8 h-2 bg-gradient-to-r from-red-500 to-red-600 rounded-full'
                    : 'w-2 h-2 bg-gray-600 hover:bg-gray-500 rounded-full'
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

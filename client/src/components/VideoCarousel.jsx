import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getCarouselVideos } from '../api/videoCarousel';

const VideoCarousel = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const scrollContainerRef = useRef(null);
  const autoScrollRef = useRef(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  // Continuous auto-scroll effect (right to left)
  useEffect(() => {
    if (videos.length <= 1 || !scrollContainerRef.current) return;

    let animationFrameId;
    const scrollSpeed = 2; // pixels per frame (adjust for speed - faster movement)

    const continuousScroll = () => {
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;

        // Scroll to the right continuously
        container.scrollLeft += scrollSpeed;

        // Check if we've reached the end, reset to beginning
        if (container.scrollLeft >= container.scrollWidth - container.offsetWidth) {
          container.scrollLeft = 0;
        }

        animationFrameId = requestAnimationFrame(continuousScroll);
      }
    };

    // Start the continuous scroll
    animationFrameId = requestAnimationFrame(continuousScroll);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
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

  const handleScroll = (direction) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = container.offsetWidth * 0.8;

      if (direction === 'left') {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
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

  return (
    <div className="relative w-full">
      {/* Navigation Arrows */}
      {videos.length > 1 && (
        <>
          <button
            onClick={() => handleScroll('left')}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 bg-white/90 hover:bg-white text-gray-800 rounded-full shadow-lg backdrop-blur-sm transition-all hover:scale-110 z-10"
            aria-label="Scroll left"
          >
            <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
          </button>
          <button
            onClick={() => handleScroll('right')}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 bg-white/90 hover:bg-white text-gray-800 rounded-full shadow-lg backdrop-blur-sm transition-all hover:scale-110 z-10"
            aria-label="Scroll right"
          >
            <ChevronRight size={20} className="sm:w-6 sm:h-6" />
          </button>
        </>
      )}

      {/* Scrollable Video Container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide px-1 py-2"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {/* Render videos twice for seamless infinite loop */}
        {[...videos, ...videos].map((video, index) => {
          const embedUrl = getEmbedUrl(video);

          return (
            <div
              key={`video-${index}`}
              className="flex-shrink-0 w-[280px] sm:w-[350px] md:w-[400px] bg-white rounded-xl shadow-md hover:shadow-xl border border-violet-100 overflow-hidden transition-all duration-300 hover:-translate-y-1"
            >
              {/* Video Player */}
              <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                <div className="absolute inset-0 bg-black">
                  {embedUrl ? (
                    <iframe
                      src={embedUrl}
                      title={video.title}
                      className="w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                      <div className="text-center text-white">
                        <div className="text-3xl mb-2">🎬</div>
                        <p className="text-sm">Video Unavailable</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Video Info */}
              <div className="p-4">
                <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1 line-clamp-2">
                  {video.title}
                </h3>
                {video.description && (
                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                    {video.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default VideoCarousel;

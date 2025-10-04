import React, { useState, useRef, useEffect } from 'react';

const VideoPlayer = ({
  src,
  title,
  poster,
  onPlay,
  onPause,
  onEnded,
  onProgress,
  autoPlay = false,
  loop = false,
  className = ''
}) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSettings, setShowSettings] = useState(false);

  const controlsTimeoutRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration || 0);
    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('durationchange', updateDuration);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('durationchange', updateDuration);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, [src]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const togglePlay = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (isPlaying) {
        video.pause();
        setIsPlaying(false);
        onPause?.();
      } else {
        await video.play();
        setIsPlaying(true);
        onPlay?.();
      }
    } catch (error) {
      console.error('Video playback error:', error);
    }
  };

  const handleSeek = (e) => {
    const video = videoRef.current;
    if (!video || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;

    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const toggleFullscreen = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (isFullscreen) {
        await document.exitFullscreen();
      } else {
        await video.requestFullscreen();
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  const showControlsTemporarily = () => {
    setShowControls(true);

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  const handleMouseMove = () => {
    if (isPlaying) {
      showControlsTemporarily();
    }
  };

  const formatTime = (time) => {
    if (!time || !isFinite(time)) return '0:00';

    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`relative bg-black rounded-lg overflow-hidden ${className}`}>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-auto max-h-64 sm:max-h-96"
        onEnded={() => {
          setIsPlaying(false);
          setShowControls(true);
          onEnded?.();
        }}
        onPause={() => {
          setIsPlaying(false);
          setShowControls(true);
        }}
        onPlay={() => {
          setIsPlaying(true);
          showControlsTemporarily();
        }}
        onMouseMove={handleMouseMove}
        onClick={togglePlay}
        onError={(e) => {
          console.error('Video error:', e.target.error);
          setIsLoading(false);
        }}
        onLoadStart={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
        onProgress={(e) => {
          if (onProgress && e.target.currentTime && e.target.duration) {
            onProgress(e.target.currentTime, e.target.duration);
          }
        }}
        preload="metadata"
        crossOrigin="anonymous"
        playsInline
      />

      {/* Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-white border-t-transparent"></div>
        </div>
      )}

      {/* Play Button Overlay */}
      {!isPlaying && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={togglePlay}
            className="w-20 h-20 sm:w-16 sm:h-16 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-110 touch-manipulation"
          >
            <span className="text-3xl sm:text-2xl text-gray-800 ml-1">▶️</span>
          </button>
        </div>
      )}

      {/* Controls Overlay */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3 sm:p-4 transition-opacity duration-300 ${
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
        }`}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => {
          if (isPlaying) {
            showControlsTemporarily();
          }
        }}
      >
        {/* Title */}
        {title && (
          <div className="mb-2">
            <h3 className="text-white font-medium truncate">{title}</h3>
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-3">
          <div
            className="w-full h-1 bg-white bg-opacity-30 rounded-full cursor-pointer hover:h-2 transition-all"
            onClick={handleSeek}
          >
            <div
              className="h-full bg-white rounded-full transition-all duration-100"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="text-white hover:text-gray-300 transition-colors"
              disabled={!src}
            >
              <span className="text-lg">
                {isPlaying ? '⏸️' : '▶️'}
              </span>
            </button>

            {/* Time */}
            <div className="text-white text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Volume Control */}
            <div className="relative">
              <button
                onClick={() => setShowVolumeSlider(!showVolumeSlider)}
                className="text-white hover:text-gray-300 transition-colors"
              >
                {volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
              </button>

              {showVolumeSlider && (
                <div className="absolute bottom-full right-0 mb-2 bg-black bg-opacity-75 border border-gray-600 rounded-lg p-3">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-16 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="text-white hover:text-gray-300 transition-colors"
            >
              {isFullscreen ? '⏷' : '⏹'}
            </button>
          </div>
        </div>
      </div>

      {/* Accessibility */}
      <div className="sr-only">
        <p>Video player for {title}</p>
        <p>Current time: {formatTime(currentTime)}</p>
        <p>Duration: {formatTime(duration)}</p>
        <p>Status: {isPlaying ? 'Playing' : 'Paused'}</p>
      </div>
    </div>
  );
};

export default VideoPlayer;
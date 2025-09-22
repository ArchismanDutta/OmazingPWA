import React, { useState, useRef, useEffect } from 'react';

const AudioPlayer = ({
  src,
  title,
  onPlay,
  onPause,
  onEnded,
  onProgress,
  autoPlay = false,
  loop = false,
  showWaveform = false,
  className = ''
}) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
      onProgress?.(audio.currentTime, audio.duration || 0);
    };
    const updateDuration = () => setDuration(audio.duration || 0);
    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleLoadedData = () => {
      setIsLoading(false);
      if (autoPlay) {
        audio.play().catch(error => {
          console.error('Autoplay failed:', error);
          setIsLoading(false);
        });
      }
    };

    const handleError = (e) => {
      console.error('Audio loading error:', e);
      setIsLoading(false);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('durationchange', updateDuration);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('error', handleError);

    // Set initial properties
    audio.loop = loop;
    audio.playbackRate = playbackRate;

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('durationchange', updateDuration);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('error', handleError);
    };
  }, [src, autoPlay, loop, playbackRate, onProgress]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) {
      console.error('Audio element not found');
      return;
    }

    if (!src) {
      console.error('No audio source provided');
      return;
    }

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
        onPause?.();
      } else {
        // Ensure audio is loaded
        if (audio.readyState === 0) {
          audio.load();
        }

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          await playPromise;
          setIsPlaying(true);
          onPlay?.();
        }
      }
    } catch (error) {
      console.error('Audio playback error:', error);
      setIsLoading(false);

      // Try to provide more specific error information
      if (error.name === 'NotAllowedError') {
        console.warn('Audio autoplay was prevented by browser policy');
      } else if (error.name === 'NotSupportedError') {
        console.error('Audio format not supported');
      } else if (error.name === 'AbortError') {
        console.warn('Audio playback was aborted');
      }
    }
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;

    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handlePlaybackRateChange = (rate) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
    setShowSettings(false);
  };

  const skip = (seconds) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = Math.max(0, Math.min(audio.currentTime + seconds, duration));
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (volume === 0) {
        setVolume(1);
        audioRef.current.volume = 1;
      } else {
        setVolume(0);
        audioRef.current.volume = 0;
      }
    }
  };

  const formatTime = (time) => {
    if (!time || !isFinite(time)) return '0:00';

    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-3 sm:p-4 ${className}`}>
      <audio
        ref={audioRef}
        src={src}
        onEnded={() => {
          setIsPlaying(false);
          onEnded?.();
        }}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onLoadStart={() => console.log('Audio load started:', src)}
        onLoadedData={() => console.log('Audio data loaded:', src)}
        onCanPlay={() => console.log('Audio can play:', src)}
        onError={(e) => console.error('Audio element error:', e.target.error)}
        preload="metadata"
        loop={loop}
        crossOrigin="anonymous"
      />

      {/* Debug Info (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
          <div>Source: {src || 'No source'}</div>
          <div>Ready State: {audioRef.current?.readyState || 'N/A'}</div>
          <div>Network State: {audioRef.current?.networkState || 'N/A'}</div>
          <div>Duration: {duration || 'Unknown'}</div>
          <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
        </div>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="mb-4 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
          <span className="ml-2 text-sm text-gray-600">Loading audio...</span>
        </div>
      )}

      {/* Title */}
      {title && (
        <div className="mb-4">
          <h3 className="font-medium text-gray-900 truncate">{title}</h3>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-3 sm:mb-4">
        <div
          className="w-full h-3 sm:h-2 bg-gray-200 rounded-full cursor-pointer touch-manipulation"
          onClick={handleSeek}
        >
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-100"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-xs sm:text-sm text-gray-500 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div className="flex items-center justify-center sm:justify-start space-x-3">
          {/* Play/Pause Button */}
          <button
            onClick={togglePlay}
            className="w-12 h-12 sm:w-10 sm:h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-colors touch-manipulation"
            disabled={!src}
          >
            {isPlaying ? '⏸️' : '▶️'}
          </button>

          {/* Time Display */}
          <div className="text-sm sm:text-base text-gray-600 hidden sm:block">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        {/* Additional Controls */}
        <div className="flex items-center justify-center space-x-3 sm:space-x-2">
          {/* Skip Backward */}
          <button
            onClick={() => skip(-10)}
            className="p-2 sm:p-1 text-gray-600 hover:text-gray-900 transition-colors touch-manipulation text-lg sm:text-base"
            title="Skip back 10 seconds"
          >
            ⏪
          </button>

          {/* Skip Forward */}
          <button
            onClick={() => skip(10)}
            className="p-2 sm:p-1 text-gray-600 hover:text-gray-900 transition-colors touch-manipulation text-lg sm:text-base"
            title="Skip forward 10 seconds"
          >
            ⏩
          </button>

          {/* Loop Toggle */}
          <button
            onClick={() => {
              const newLoop = !loop;
              if (audioRef.current) {
                audioRef.current.loop = newLoop;
              }
            }}
            className={`p-1 transition-colors ${
              loop ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
            }`}
            title={loop ? 'Disable loop' : 'Enable loop'}
          >
            🔁
          </button>

          {/* Volume Control */}
          <div className="relative">
            <button
              onClick={toggleMute}
              className="p-2 sm:p-1 text-gray-600 hover:text-gray-900 transition-colors touch-manipulation text-lg sm:text-base"
              title={volume === 0 ? 'Unmute' : 'Mute'}
            >
              {volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
            </button>

            <button
              onClick={() => setShowVolumeSlider(!showVolumeSlider)}
              className="p-2 sm:p-1 text-gray-600 hover:text-gray-900 transition-colors touch-manipulation text-lg sm:text-base ml-1"
            >
              ⚙️
            </button>

            {showVolumeSlider && (
              <div className="absolute bottom-full right-0 mb-2 bg-white border rounded-lg shadow-lg p-3">
                <div className="mb-2">
                  <label className="text-xs text-gray-600 block mb-1">Volume</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Settings */}
          <div className="relative">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 sm:p-1 text-gray-600 hover:text-gray-900 transition-colors touch-manipulation text-lg sm:text-base"
              title="Playback settings"
            >
              ⚙️
            </button>

            {showSettings && (
              <div className="absolute bottom-full right-0 mb-2 bg-white border rounded-lg shadow-lg p-3 min-w-[120px]">
                <div className="mb-2">
                  <label className="text-xs text-gray-600 block mb-1">Speed</label>
                  <div className="flex flex-col space-y-1">
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                      <button
                        key={rate}
                        onClick={() => handlePlaybackRateChange(rate)}
                        className={`text-xs px-2 py-1 rounded transition-colors ${
                          playbackRate === rate
                            ? 'bg-blue-600 text-white'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Audio Element (hidden) */}
      <div className="sr-only">
        <p>Audio player for {title}</p>
        <p>Current time: {formatTime(currentTime)}</p>
        <p>Duration: {formatTime(duration)}</p>
        <p>Status: {isPlaying ? 'Playing' : 'Paused'}</p>
      </div>
    </div>
  );
};

export default AudioPlayer;
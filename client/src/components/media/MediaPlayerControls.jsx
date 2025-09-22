import React from 'react';

const MediaPlayerControls = ({
  isPlaying,
  currentTime,
  duration,
  volume,
  playbackRate,
  loop,
  onPlay,
  onPause,
  onSeek,
  onVolumeChange,
  onPlaybackRateChange,
  onToggleLoop,
  onToggleMute,
  onSkip,
  showSettings,
  onToggleSettings,
  className = ''
}) => {
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

  const handleSeek = (e) => {
    if (!duration || !onSeek) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    onSeek(newTime);
  };

  const togglePlay = () => {
    if (isPlaying) {
      onPause?.();
    } else {
      onPlay?.();
    }
  };

  return (
    <div className={`bg-white rounded-lg border p-4 ${className}`}>
      {/* Progress Bar */}
      <div className="mb-4">
        <div
          className="w-full h-2 bg-gray-200 rounded-full cursor-pointer hover:h-3 transition-all"
          onClick={handleSeek}
        >
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-100"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Main Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Skip Backward */}
          <button
            onClick={() => onSkip?.(-10)}
            className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
            title="Skip back 10 seconds"
          >
            ⏪
          </button>

          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-colors"
          >
            {isPlaying ? '⏸️' : '▶️'}
          </button>

          {/* Skip Forward */}
          <button
            onClick={() => onSkip?.(10)}
            className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
            title="Skip forward 10 seconds"
          >
            ⏩
          </button>

          {/* Time Display */}
          <div className="text-sm text-gray-600">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        {/* Secondary Controls */}
        <div className="flex items-center space-x-2">
          {/* Loop Toggle */}
          <button
            onClick={onToggleLoop}
            className={`p-2 transition-colors ${
              loop ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
            }`}
            title={loop ? 'Disable loop' : 'Enable loop'}
          >
            🔁
          </button>

          {/* Volume Control */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onToggleMute}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              title={volume === 0 ? 'Unmute' : 'Mute'}
            >
              {volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
            </button>

            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => onVolumeChange?.(parseFloat(e.target.value))}
              className="w-16 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Settings */}
          <div className="relative">
            <button
              onClick={onToggleSettings}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              title="Playback settings"
            >
              ⚙️
            </button>

            {showSettings && (
              <div className="absolute bottom-full right-0 mb-2 bg-white border rounded-lg shadow-lg p-3 min-w-[120px] z-10">
                <div className="mb-2">
                  <label className="text-xs text-gray-600 block mb-1">Speed</label>
                  <div className="flex flex-col space-y-1">
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                      <button
                        key={rate}
                        onClick={() => onPlaybackRateChange?.(rate)}
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

      {/* Keyboard Shortcuts Help */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <details className="text-xs text-gray-500">
          <summary className="cursor-pointer hover:text-gray-700">
            Keyboard shortcuts
          </summary>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div>Space/K: Play/Pause</div>
            <div>M: Mute/Unmute</div>
            <div>←/→: Skip 10s</div>
            <div>↑/↓: Volume</div>
            <div>J/L: Skip 10s</div>
            <div>0-9: Seek to %</div>
            <div>,/.: Speed down/up</div>
            <div>F: Fullscreen</div>
          </div>
        </details>
      </div>
    </div>
  );
};

export default MediaPlayerControls;
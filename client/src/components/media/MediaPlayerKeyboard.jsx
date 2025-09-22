import { useEffect } from 'react';

const useMediaKeyboard = ({
  isActive = true,
  onPlay,
  onPause,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onPlaybackRateChange,
  currentVolume = 1,
  currentTime = 0,
  duration = 0
}) => {
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e) => {
      // Don't handle if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          if (onPlay && onPause) {
            // Toggle play/pause
            onPlay();
          }
          break;

        case 'arrowleft':
          e.preventDefault();
          if (onSeek) {
            onSeek(Math.max(0, currentTime - 10));
          }
          break;

        case 'arrowright':
          e.preventDefault();
          if (onSeek) {
            onSeek(Math.min(duration, currentTime + 10));
          }
          break;

        case 'arrowup':
          e.preventDefault();
          if (onVolumeChange) {
            onVolumeChange(Math.min(1, currentVolume + 0.1));
          }
          break;

        case 'arrowdown':
          e.preventDefault();
          if (onVolumeChange) {
            onVolumeChange(Math.max(0, currentVolume - 0.1));
          }
          break;

        case 'm':
          e.preventDefault();
          if (onToggleMute) {
            onToggleMute();
          }
          break;

        case 'j':
          e.preventDefault();
          if (onSeek) {
            onSeek(Math.max(0, currentTime - 10));
          }
          break;

        case 'l':
          e.preventDefault();
          if (onSeek) {
            onSeek(Math.min(duration, currentTime + 10));
          }
          break;

        case ',':
          e.preventDefault();
          if (onPlaybackRateChange) {
            onPlaybackRateChange(0.25);
          }
          break;

        case '.':
          e.preventDefault();
          if (onPlaybackRateChange) {
            onPlaybackRateChange(2);
          }
          break;

        case '0':
          e.preventDefault();
          if (onSeek && duration > 0) {
            onSeek(0);
          }
          break;

        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
          e.preventDefault();
          if (onSeek && duration > 0) {
            const percentage = parseInt(e.key) / 10;
            onSeek(duration * percentage);
          }
          break;

        case 'f':
          e.preventDefault();
          // Fullscreen toggle would be handled by parent component
          break;

        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [
    isActive,
    onPlay,
    onPause,
    onSeek,
    onVolumeChange,
    onToggleMute,
    onPlaybackRateChange,
    currentVolume,
    currentTime,
    duration
  ]);
};

export default useMediaKeyboard;
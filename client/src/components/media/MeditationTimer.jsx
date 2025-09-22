import React, { useState, useRef, useEffect } from 'react';

const MeditationTimer = ({
  onSessionComplete,
  onSessionStart,
  onSessionPause,
  className = ''
}) => {
  const [duration, setDuration] = useState(10 * 60); // Default 10 minutes
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [showCustomTime, setShowCustomTime] = useState(false);
  const [customMinutes, setCustomMinutes] = useState(10);

  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  // Preset durations in minutes
  const presetDurations = [5, 10, 15, 20, 30, 45, 60];

  useEffect(() => {
    if (isActive && !isPaused && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            handleSessionComplete();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    } else if (!isActive || isPaused) {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isActive, isPaused, timeLeft]);

  const handleSessionComplete = () => {
    setIsActive(false);
    setIsPaused(false);
    setSessionStarted(false);

    // Play completion sound
    if (audioRef.current) {
      audioRef.current.play().catch(console.error);
    }

    onSessionComplete?.({
      duration: duration,
      completedAt: new Date(),
      wasCompleted: true
    });
  };

  const startTimer = () => {
    if (!sessionStarted) {
      setSessionStarted(true);
      onSessionStart?.({
        duration: duration,
        startedAt: new Date()
      });
    }

    setIsActive(true);
    setIsPaused(false);
  };

  const pauseTimer = () => {
    setIsPaused(true);
    onSessionPause?.({
      timeRemaining: timeLeft,
      pausedAt: new Date()
    });
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsPaused(false);
    setSessionStarted(false);
    setTimeLeft(duration);
  };

  const setPresetDuration = (minutes) => {
    const seconds = minutes * 60;
    setDuration(seconds);
    setTimeLeft(seconds);
    setShowCustomTime(false);
    resetTimer();
  };

  const setCustomDuration = () => {
    const seconds = customMinutes * 60;
    setDuration(seconds);
    setTimeLeft(seconds);
    setShowCustomTime(false);
    resetTimer();
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercent = () => {
    return ((duration - timeLeft) / duration) * 100;
  };

  const getTimeColor = () => {
    const percentLeft = (timeLeft / duration) * 100;
    if (percentLeft <= 10) return 'text-red-600';
    if (percentLeft <= 25) return 'text-orange-600';
    return 'text-blue-600';
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg border p-6 ${className}`}>
      {/* Hidden audio element for completion sound */}
      <audio ref={audioRef} preload="auto">
        <source src="/sounds/meditation-bell.mp3" type="audio/mpeg" />
        <source src="/sounds/meditation-bell.wav" type="audio/wav" />
      </audio>

      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Meditation Timer
        </h3>
        <p className="text-sm text-gray-600">
          Set your intention and begin your practice
        </p>
      </div>

      {/* Timer Display */}
      <div className="text-center mb-8">
        <div className={`text-6xl font-mono font-bold ${getTimeColor()}`}>
          {formatTime(timeLeft)}
        </div>

        {/* Progress Circle */}
        <div className="relative w-48 h-48 mx-auto mt-6">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="#e5e7eb"
              strokeWidth="8"
              fill="transparent"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - getProgressPercent() / 100)}`}
              className={getTimeColor()}
              strokeLinecap="round"
              style={{
                transition: 'stroke-dashoffset 1s ease-in-out'
              }}
            />
          </svg>

          {/* Center content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-lg font-medium text-gray-600">
                {Math.round(getProgressPercent())}%
              </div>
              <div className="text-sm text-gray-500">
                Complete
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Duration Selection */}
      {!sessionStarted && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Choose Duration
          </h4>

          {/* Preset Durations */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            {presetDurations.map(minutes => (
              <button
                key={minutes}
                onClick={() => setPresetDuration(minutes)}
                className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                  duration === minutes * 60
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {minutes}m
              </button>
            ))}
          </div>

          {/* Custom Duration */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowCustomTime(!showCustomTime)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Custom time
            </button>

            {showCustomTime && (
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(parseInt(e.target.value) || 1)}
                  className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
                />
                <span className="text-sm text-gray-600">minutes</span>
                <button
                  onClick={setCustomDuration}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Set
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex justify-center space-x-4">
        {!isActive && !isPaused ? (
          <button
            onClick={startTimer}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <span>▶️</span>
            <span>Start Meditation</span>
          </button>
        ) : (
          <>
            <button
              onClick={isPaused ? startTimer : pauseTimer}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <span>{isPaused ? '▶️' : '⏸️'}</span>
              <span>{isPaused ? 'Resume' : 'Pause'}</span>
            </button>

            <button
              onClick={resetTimer}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
            >
              <span>🔄</span>
              <span>Reset</span>
            </button>
          </>
        )}
      </div>

      {/* Session Status */}
      {sessionStarted && (
        <div className="mt-4 text-center">
          <div className="text-sm text-gray-600">
            {isActive && !isPaused && (
              <span className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Meditation in progress...</span>
              </span>
            )}
            {isPaused && (
              <span className="text-orange-600">Session paused</span>
            )}
          </div>
        </div>
      )}

      {/* Breathing Guide (optional) */}
      {isActive && !isPaused && (
        <div className="mt-6 text-center">
          <div className="text-sm text-gray-600 mb-2">
            Focus on your breath
          </div>
          <div className="w-16 h-16 mx-auto">
            <div className="w-full h-full bg-blue-100 rounded-full animate-pulse"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeditationTimer;
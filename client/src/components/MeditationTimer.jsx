import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  X,
  Music,
  Volume2,
  VolumeX,
  Bell,
  ArrowLeft,
  Settings,
} from "lucide-react";
import { userAPI } from "../api/user";
import { useAuth } from "../contexts/AuthContext";

const MeditationTimer = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [sessions, setSessions] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  // Timer mode: 'stopwatch' or 'countdown'
  const [timerMode, setTimerMode] = useState("stopwatch");
  const [targetDuration, setTargetDuration] = useState(0); // in seconds
  const [showDurationPicker, setShowDurationPicker] = useState(false);
  const [customMinutes, setCustomMinutes] = useState(10);

  // Music/Sound options
  const [playMusic, setPlayMusic] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.5);
  const [showSettings, setShowSettings] = useState(false);

  // Animation states
  const [isAnimating, setIsAnimating] = useState(false);

  const intervalRef = useRef(null);
  const audioRef = useRef(null);
  const bellRef = useRef(null);

  // Request notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const handleTimerComplete = useCallback(() => {
    setIsRunning(false);

    // Play completion bell
    if (bellRef.current) {
      bellRef.current.play().catch(console.error);
    }

    // Show browser notification
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Meditation Complete!", {
        body: `Great job! You meditated for ${formatTime(
          targetDuration || time
        )}`,
        icon: "/logo192.png",
        badge: "/logo192.png",
        tag: "meditation-timer",
        requireInteraction: true,
      });
    }

    // Show alert
    setTimeout(() => {
      alert(
        `🧘 Meditation session complete!\n\nYou meditated for ${formatTime(
          targetDuration || time
        )}`
      );
    }, 100);

    // Save the session
    if (user) {
      saveSession(targetDuration || time);
    }

    // Reset for next session
    if (timerMode === "countdown") {
      setTime(targetDuration);
    }
  }, [targetDuration, time, user, timerMode]);

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime((prev) => {
          if (timerMode === "countdown") {
            const newTime = prev - 1;
            if (newTime <= 0) {
              handleTimerComplete();
              return 0;
            }
            return newTime;
          } else {
            return prev + 1;
          }
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timerMode, handleTimerComplete]);

  // Music playback
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = musicVolume;
      if (playMusic && isRunning) {
        audioRef.current.play().catch(console.error);
      } else {
        audioRef.current.pause();
      }
    }
  }, [playMusic, isRunning, musicVolume]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs.toString().padStart(2, "0")}:${mins
        .toString()
        .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const presetDurations = [5, 10, 15, 20, 30]; // in minutes

  const saveSession = useCallback(
    async (duration) => {
      const newSession = {
        id: Date.now(),
        duration: duration,
        date: new Date().toISOString(),
        timestamp: new Date().toLocaleString(),
      };
      setSessions((prev) => [newSession, ...prev].slice(0, 10));

      try {
        setIsSaving(true);
        const minutes = Math.floor(duration / 60);
        await userAPI.updateMindfulnessSession({
          duration: duration,
          minutes: minutes,
          completedAt: new Date().toISOString(),
        });
        console.log("Meditation session saved successfully");
      } catch (error) {
        console.error("Failed to save meditation session:", error);
      } finally {
        setIsSaving(false);
      }
    },
    [user]
  );

  const handleStart = () => {
    if (timerMode === "countdown" && targetDuration === 0) {
      setShowDurationPicker(true);
      return;
    }
    setIsAnimating(true);
    setTimeout(() => {
      setIsRunning(true);
      setIsAnimating(false);
    }, 300);
  };

  const handlePause = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsRunning(false);
      setIsAnimating(false);
    }, 150);
  };

  const handleReset = async () => {
    setIsAnimating(true);
    setIsRunning(false);

    // Only save if time was tracked and user exists
    if (time > 0 && user && timerMode === "stopwatch") {
      await saveSession(time);
    }

    // Reset timer
    setTimeout(() => {
      if (timerMode === "countdown") {
        setTime(targetDuration);
      } else {
        setTime(0);
      }
      setPlayMusic(false);
      setIsAnimating(false);
    }, 300);
  };

  const setDuration = (minutes) => {
    const seconds = minutes * 60;
    setTargetDuration(seconds);
    setTime(seconds);
    setShowDurationPicker(false);
  };

  const setCustomDuration = () => {
    if (customMinutes > 0) {
      setDuration(customMinutes);
    }
  };

  // Fixed timer mode switching functions [web:50][web:51]
  const switchToCountdown = () => {
    if (isRunning) {
      setIsRunning(false);
    }

    setIsAnimating(true);

    // Clear any existing intervals
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setTimeout(() => {
      setTimerMode("countdown");
      const defaultDuration = 600; // Default 10 min
      setTargetDuration(defaultDuration);
      setTime(defaultDuration);
      setShowDurationPicker(true);
      setIsAnimating(false);
    }, 200);
  };

  const switchToStopwatch = () => {
    if (isRunning) {
      setIsRunning(false);
    }

    setIsAnimating(true);

    // Clear any existing intervals
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setTimeout(() => {
      setTimerMode("stopwatch");
      setTime(0);
      setTargetDuration(0);
      setShowDurationPicker(false);
      setIsAnimating(false);
    }, 200);
  };

  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false);
      setShowSettings(false);
      setShowDurationPicker(false);
    }
  };

  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  const goBackToMain = () => {
    setShowDurationPicker(false);
    setShowSettings(false);
  };

  const totalMeditationTime = sessions.reduce(
    (acc, session) => acc + session.duration,
    0
  );

  return (
    <>
      {/* Floating Timer Button with Circular Text - Only show when closed */}
      {!isOpen && (
        <div className="fixed bottom-20 sm:bottom-24 right-4 sm:right-6 z-50 transition-all duration-500 ease-out transform hover:scale-105">
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center">
            {/* Circular Revolving Text */}
            <svg
              className="absolute inset-0 w-full h-full animate-spin-slow"
              viewBox="0 0 128 128"
            >
              <defs>
                <path
                  id="circlePath"
                  d="M 64, 64 m -52, 0 a 52,52 0 1,1 104,0 a 52,52 0 1,1 -104,0"
                />
              </defs>
              <text className="text-[10px] fill-violet-600 font-bold uppercase tracking-wider">
                <textPath href="#circlePath" startOffset="0%">
                  • Start your meditation timer • Start your meditation timer •
                </textPath>
              </text>
            </svg>

            {/* Button */}
            <button
              onClick={() => setIsOpen(true)}
              className="relative group transition-all duration-300 ease-out"
            >
              <div className="relative">
                {/* Pulsing glow effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 blur-xl opacity-60 group-hover:opacity-80 animate-pulse transition-opacity duration-300"></div>

                {/* Main button */}
                <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 shadow-2xl flex items-center justify-center transform group-hover:scale-110 transition-all duration-300 ease-out">
                  <Clock
                    className="w-5 h-5 sm:w-7 sm:h-7 text-white transition-transform duration-300 group-hover:rotate-12"
                    strokeWidth={2.5}
                  />
                </div>

                {/* Active indicator */}
                {isRunning && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-3 border-white shadow-lg animate-pulse flex items-center justify-center transition-all duration-300">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Timer Panel with Background Overlay - Only show when open */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm transition-all duration-500 ease-out flex items-center justify-center p-4"
          onClick={handleBackgroundClick}
        >
          {/* Modal Container - Centered for all screen sizes [web:55][web:57][web:58] */}
          <div className="relative w-full max-w-sm sm:max-w-md max-h-[90vh] transition-all duration-500 ease-out transform">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-400 via-purple-400 to-pink-400 rounded-3xl blur-2xl opacity-40 transition-opacity duration-500"></div>

            {/* Main panel */}
            <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-violet-100 overflow-hidden max-h-full overflow-y-auto transition-all duration-500">
              {/* Header */}
              <div className="relative bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 px-4 sm:px-6 py-4 sm:py-5">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    {/* Back button for sub-screens */}
                    {(showDurationPicker || showSettings) && (
                      <button
                        onClick={goBackToMain}
                        className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 flex items-center justify-center mr-2"
                      >
                        <ArrowLeft className="w-4 h-4 text-white" />
                      </button>
                    )}

                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all duration-300">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-base sm:text-lg transition-all duration-300">
                        {showDurationPicker
                          ? "Set Duration"
                          : showSettings
                          ? "Settings"
                          : "Meditation Timer"}
                      </h3>
                      <p className="text-white/80 text-xs hidden sm:block transition-all duration-300">
                        {showDurationPicker
                          ? "Choose your session length"
                          : showSettings
                          ? "Customize your experience"
                          : "Track your mindfulness"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {!showDurationPicker && !showSettings && (
                      <button
                        onClick={toggleSettings}
                        className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 flex items-center justify-center"
                      >
                        <Settings className="w-4 h-4 text-white" />
                      </button>
                    )}
                    <button
                      onClick={() => setIsOpen(false)}
                      className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 flex items-center justify-center"
                    >
                      <X className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Content Area */}
              <div className="px-4 sm:px-6 py-6 sm:py-8">
                {/* Duration Picker Screen */}
                {showDurationPicker && (
                  <div className="space-y-6 transition-all duration-500 ease-out">
                    <div className="text-center">
                      <h4 className="text-lg font-bold text-gray-800 mb-2">
                        Choose Duration
                      </h4>
                      <p className="text-sm text-gray-600">
                        Select how long you'd like to meditate
                      </p>
                    </div>

                    {/* Preset Duration Cards */}
                    <div className="grid grid-cols-2 gap-4">
                      {presetDurations.map((minutes) => (
                        <button
                          key={minutes}
                          onClick={() => setDuration(minutes)}
                          className={`group relative p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                            targetDuration === minutes * 60
                              ? "bg-gradient-to-br from-violet-500 to-purple-500 text-white shadow-xl scale-105"
                              : "bg-gradient-to-br from-gray-50 to-gray-100 text-gray-700 hover:from-violet-50 hover:to-purple-50 hover:text-violet-600 border border-gray-200"
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-2xl font-bold mb-1">
                              {minutes}
                            </div>
                            <div className="text-sm opacity-80">minutes</div>
                          </div>
                          {targetDuration === minutes * 60 && (
                            <div className="absolute top-2 right-2 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Custom Duration */}
                    <div className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl">
                      <h5 className="text-sm font-semibold text-gray-700 mb-3">
                        Custom Duration
                      </h5>
                      <div className="flex items-center space-x-3">
                        <input
                          type="number"
                          min="1"
                          max="120"
                          value={customMinutes}
                          onChange={(e) =>
                            setCustomMinutes(parseInt(e.target.value) || 1)
                          }
                          className="flex-1 px-4 py-3 text-center text-lg font-semibold border border-violet-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300"
                          placeholder="10"
                        />
                        <span className="text-gray-600 font-medium">
                          minutes
                        </span>
                        <button
                          onClick={setCustomDuration}
                          className="px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white font-semibold rounded-xl hover:from-violet-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105"
                        >
                          Set
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Settings Screen */}
                {showSettings && (
                  <div className="space-y-6 transition-all duration-500 ease-out">
                    <div className="text-center">
                      <h4 className="text-lg font-bold text-gray-800 mb-2">
                        Settings
                      </h4>
                      <p className="text-sm text-gray-600">
                        Customize your meditation experience
                      </p>
                    </div>

                    {/* Music Controls */}
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                            <Music className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800">
                              Background Music
                            </div>
                            <div className="text-sm text-gray-600">
                              Play soothing sounds during meditation
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => setPlayMusic(!playMusic)}
                          className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                            playMusic ? "bg-blue-500" : "bg-gray-300"
                          }`}
                        >
                          <div
                            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${
                              playMusic ? "left-7" : "left-1"
                            }`}
                          ></div>
                        </button>
                      </div>

                      {playMusic && (
                        <div className="flex items-center space-x-3 pt-2 border-t border-blue-100">
                          <VolumeX className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={musicVolume}
                            onChange={(e) =>
                              setMusicVolume(parseFloat(e.target.value))
                            }
                            className="flex-1 h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                          />
                          <Volume2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        </div>
                      )}
                    </div>

                    {/* Timer Mode Selection - Fixed state management [web:50][web:59] */}
                    <div className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-violet-500 rounded-full flex items-center justify-center">
                          <Clock className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">
                            Timer Mode
                          </div>
                          <div className="text-sm text-gray-600">
                            Choose how you want to track time
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={switchToStopwatch}
                          disabled={isAnimating}
                          className={`p-3 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 ${
                            timerMode === "stopwatch"
                              ? "bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-md scale-105"
                              : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                          }`}
                        >
                          <div className="text-center">
                            <div className="font-semibold">Stopwatch</div>
                            <div className="text-xs opacity-80">Count up</div>
                          </div>
                        </button>
                        <button
                          onClick={switchToCountdown}
                          disabled={isAnimating}
                          className={`p-3 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 ${
                            timerMode === "countdown"
                              ? "bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-md scale-105"
                              : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                          }`}
                        >
                          <div className="text-center">
                            <div className="font-semibold flex items-center justify-center">
                              <Bell className="w-3 h-3 mr-1" />
                              Timer
                            </div>
                            <div className="text-xs opacity-80">Count down</div>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Main Timer Screen */}
                {!showDurationPicker && !showSettings && (
                  <div className="relative transition-all duration-500 ease-out">
                    {/* Decorative circles */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 opacity-30 blur-3xl transition-opacity duration-500"></div>

                    <div
                      className={`relative text-center mb-6 sm:mb-8 transition-all duration-500 ${
                        isAnimating
                          ? "scale-95 opacity-70"
                          : "scale-100 opacity-100"
                      }`}
                    >
                      <div className="inline-block relative">
                        {/* Outer ring with improved progress visualization */}
                        <svg
                          className="w-40 h-40 sm:w-56 sm:h-56 -rotate-90 transition-all duration-500"
                          viewBox="0 0 200 200"
                        >
                          {/* Background circle */}
                          <circle
                            cx="100"
                            cy="100"
                            r="85"
                            stroke="#f3f4f6"
                            strokeWidth="10"
                            fill="none"
                            className="transition-all duration-500"
                          />
                          {/* Progress circle */}
                          <circle
                            cx="100"
                            cy="100"
                            r="85"
                            stroke="url(#gradient)"
                            strokeWidth="10"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 85}`}
                            strokeDashoffset={
                              timerMode === "countdown" && targetDuration > 0
                                ? `${
                                    2 *
                                    Math.PI *
                                    85 *
                                    (1 - time / targetDuration)
                                  }`
                                : `${2 * Math.PI * 85 * (1 - (time % 60) / 60)}`
                            }
                            className="transition-all duration-700 ease-out"
                            style={{
                              filter: isRunning
                                ? "drop-shadow(0 0 12px rgba(139, 92, 246, 0.8))"
                                : "none",
                            }}
                          />
                          {/* Inner glow circle when active */}
                          {isRunning && (
                            <circle
                              cx="100"
                              cy="100"
                              r="75"
                              stroke="url(#gradient)"
                              strokeWidth="2"
                              fill="none"
                              opacity="0.4"
                              className="animate-pulse"
                            />
                          )}
                          <defs>
                            <linearGradient
                              id="gradient"
                              x1="0%"
                              y1="0%"
                              x2="100%"
                              y2="100%"
                            >
                              <stop offset="0%" stopColor="#8b5cf6" />
                              <stop offset="50%" stopColor="#a855f7" />
                              <stop offset="100%" stopColor="#ec4899" />
                            </linearGradient>
                          </defs>
                        </svg>

                        {/* Time display with breathing animation */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <div
                            className={`text-4xl sm:text-6xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 transition-all duration-500 ${
                              isRunning ? "scale-100" : "scale-95"
                            }`}
                          >
                            {formatTime(time)}
                          </div>
                          <div className="flex flex-col items-center">
                            <div
                              className={`text-xs sm:text-sm font-medium transition-all duration-300 ${
                                isRunning ? "text-violet-600" : "text-gray-500"
                              }`}
                            >
                              {isRunning ? (
                                <span className="flex items-center space-x-1.5">
                                  <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
                                  </span>
                                  <span>
                                    {timerMode === "countdown"
                                      ? "Counting down..."
                                      : "Meditating..."}
                                  </span>
                                </span>
                              ) : time > 0 ? (
                                "Paused"
                              ) : (
                                "Ready to begin"
                              )}
                            </div>
                            {/* Show percentage for countdown mode */}
                            {timerMode === "countdown" &&
                              targetDuration > 0 && (
                                <div className="text-xs text-gray-400 mt-1 transition-all duration-300">
                                  {Math.round((time / targetDuration) * 100)}%
                                  remaining
                                </div>
                              )}
                          </div>
                        </div>

                        {/* Floating particles effect - enhanced */}
                        {isRunning && (
                          <>
                            {[...Array(8)].map((_, i) => (
                              <div
                                key={i}
                                className="absolute w-1.5 h-1.5 rounded-full animate-float"
                                style={{
                                  background: ["#8b5cf6", "#a855f7", "#ec4899"][
                                    i % 3
                                  ],
                                  top: `${15 + i * 10}%`,
                                  left: `${5 + (i % 3) * 30}%`,
                                  animationDelay: `${i * 0.3}s`,
                                  animationDuration: `${2 + (i % 3)}s`,
                                }}
                              />
                            ))}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Control Buttons */}
                    <div
                      className={`flex items-center justify-center space-x-4 sm:space-x-6 mb-8 transition-all duration-500 ${
                        isAnimating
                          ? "scale-90 opacity-70"
                          : "scale-100 opacity-100"
                      }`}
                    >
                      {!isRunning ? (
                        <button
                          onClick={handleStart}
                          disabled={isAnimating}
                          className="group relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110 disabled:opacity-50"
                        >
                          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-400 to-purple-400 blur-lg opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
                          <div className="relative flex items-center justify-center">
                            <Play
                              className="w-7 h-7 sm:w-8 sm:h-8 text-white ml-1 transition-transform duration-300 group-hover:scale-110"
                              fill="white"
                            />
                          </div>
                        </button>
                      ) : (
                        <button
                          onClick={handlePause}
                          disabled={isAnimating}
                          className="group relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110 disabled:opacity-50"
                        >
                          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 blur-lg opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
                          <div className="relative flex items-center justify-center">
                            <Pause
                              className="w-7 h-7 sm:w-8 sm:h-8 text-white transition-transform duration-300 group-hover:scale-110"
                              fill="white"
                            />
                          </div>
                        </button>
                      )}

                      <button
                        onClick={handleReset}
                        disabled={time === 0 || isSaving || isAnimating}
                        className="group relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      >
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 blur-lg opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
                        <div className="relative flex items-center justify-center">
                          {isSaving ? (
                            <div className="w-6 h-6 sm:w-7 sm:h-7 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <RotateCcw className="w-6 h-6 sm:w-7 sm:h-7 text-white transition-transform duration-300 group-hover:scale-110" />
                          )}
                        </div>
                      </button>
                    </div>

                    {/* Quick Actions */}
                    {!isRunning && time === 0 && (
                      <div className="flex items-center justify-center space-x-3 mb-6">
                        <button
                          onClick={() => setShowDurationPicker(true)}
                          className="px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-full font-semibold hover:from-violet-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
                        >
                          {timerMode === "countdown"
                            ? "Set Duration"
                            : "Switch to Timer"}
                        </button>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="pt-6 border-t border-gray-100">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 transition-all duration-300 hover:shadow-md">
                          <div className="text-2xl sm:text-3xl font-bold text-violet-600 mb-1">
                            {sessions.length}
                          </div>
                          <div className="text-xs text-gray-600">
                            Sessions Today
                          </div>
                        </div>
                        <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 transition-all duration-300 hover:shadow-md">
                          <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-1">
                            {formatTime(totalMeditationTime)}
                          </div>
                          <div className="text-xs text-gray-600">
                            Total Time
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Recent Sessions */}
                    {sessions.length > 0 && (
                      <div className="mt-6">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                          <span className="w-1 h-4 bg-gradient-to-b from-violet-500 to-purple-500 rounded-full mr-2"></span>
                          Recent Sessions
                        </h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {sessions.slice(0, 5).map((session) => (
                            <div
                              key={session.id}
                              className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-300 hover:shadow-sm"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-400 flex items-center justify-center flex-shrink-0">
                                  <Clock className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                  <div className="text-sm font-semibold text-gray-800">
                                    {formatTime(session.duration)}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {new Date(
                                      session.date
                                    ).toLocaleTimeString()}
                                  </div>
                                </div>
                              </div>
                              <div className="text-xs text-violet-600 font-medium">
                                ✓
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Hidden Audio Elements */}
                <audio
                  ref={audioRef}
                  loop
                  onError={(e) => {
                    console.error("Background music failed to load:", e);
                    setPlayMusic(false);
                  }}
                >
                  <source
                    src="https://www.bensound.com/bensound-music/bensound-relaxing.mp3"
                    type="audio/mpeg"
                  />
                </audio>
                <audio
                  ref={bellRef}
                  preload="auto"
                  onError={(e) =>
                    console.error("Bell sound failed to load:", e)
                  }
                >
                  <source
                    src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"
                    type="audio/mpeg"
                  />
                </audio>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 15s linear infinite;
          transform-origin: center;
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) translateX(0px);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-80px) translateX(15px);
            opacity: 0;
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </>
  );
};

export default MeditationTimer;

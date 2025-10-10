import React, { useState, useEffect, useRef } from 'react';
import { Clock, Play, Pause, RotateCcw, X } from 'lucide-react';

const MeditationTimer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [sessions, setSessions] = useState([]);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime(prev => prev + 1);
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
  }, [isRunning]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    if (time > 0) {
      // Save session
      const newSession = {
        id: Date.now(),
        duration: time,
        date: new Date().toISOString(),
        timestamp: new Date().toLocaleString()
      };
      setSessions(prev => [newSession, ...prev].slice(0, 10)); // Keep last 10 sessions
    }
    setTime(0);
  };

  const totalMeditationTime = sessions.reduce((acc, session) => acc + session.duration, 0);

  return (
    <>
      {/* Floating Timer Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-24 right-6 z-40 group transition-all duration-300 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
        style={{ transitionDelay: isOpen ? '0ms' : '200ms' }}
      >
        <div className="relative">
          {/* Pulsing glow effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 blur-xl opacity-60 group-hover:opacity-80 animate-pulse"></div>
          
          {/* Main button */}
          <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 shadow-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform">
            <Clock className="w-7 h-7 text-white" strokeWidth={2.5} />
          </div>

          {/* Active indicator */}
          {isRunning && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-3 border-white shadow-lg animate-pulse flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          )}
        </div>
      </button>

      {/* Timer Panel */}
      <div
        className={`fixed bottom-6 right-6 z-50 transition-all duration-500 ease-out ${
          isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-75 opacity-0 translate-y-8 pointer-events-none'
        }`}
      >
        <div className="relative">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-400 via-purple-400 to-pink-400 rounded-3xl blur-2xl opacity-30"></div>
          
          {/* Main panel */}
          <div className="relative w-96 bg-white rounded-3xl shadow-2xl border border-violet-100 overflow-hidden">
            {/* Header */}
            <div className="relative bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 px-6 py-5">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Meditation Timer</h3>
                    <p className="text-white/80 text-xs">Track your mindfulness</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors flex items-center justify-center"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Timer Display */}
            <div className="px-6 py-8">
              <div className="relative">
                {/* Decorative circles */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 opacity-30 blur-3xl"></div>
                
                <div className="relative text-center mb-8">
                  <div className="inline-block relative">
                    {/* Outer ring */}
                    <svg className="w-48 h-48 -rotate-90" viewBox="0 0 200 200">
                      <circle
                        cx="100"
                        cy="100"
                        r="90"
                        stroke="#f3f4f6"
                        strokeWidth="8"
                        fill="none"
                      />
                      {isRunning && (
                        <circle
                          cx="100"
                          cy="100"
                          r="90"
                          stroke="url(#gradient)"
                          strokeWidth="8"
                          fill="none"
                          strokeLinecap="round"
                          strokeDasharray={`${(time % 60) * (565.48 / 60)} 565.48`}
                          className="transition-all duration-1000 ease-linear"
                        />
                      )}
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="50%" stopColor="#a855f7" />
                          <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                      </defs>
                    </svg>

                    {/* Time display */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-5xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-1">
                        {formatTime(time)}
                      </div>
                      <div className="text-sm text-gray-500 font-medium">
                        {isRunning ? 'Meditating...' : time > 0 ? 'Paused' : 'Ready to start'}
                      </div>
                    </div>

                    {/* Floating particles effect */}
                    {isRunning && (
                      <>
                        <div className="absolute top-4 right-8 w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{animationDelay: '0s', animationDuration: '3s'}}></div>
                        <div className="absolute bottom-8 left-4 w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{animationDelay: '1s', animationDuration: '4s'}}></div>
                        <div className="absolute top-12 left-12 w-1.5 h-1.5 rounded-full bg-pink-400 animate-bounce" style={{animationDelay: '2s', animationDuration: '3.5s'}}></div>
                      </>
                    )}
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-center space-x-4">
                  {!isRunning ? (
                    <button
                      onClick={handleStart}
                      className="group relative w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-400 to-purple-400 blur-md opacity-50 group-hover:opacity-70 transition-opacity"></div>
                      <div className="relative flex items-center justify-center">
                        <Play className="w-7 h-7 text-white ml-1" fill="white" />
                      </div>
                    </button>
                  ) : (
                    <button
                      onClick={handlePause}
                      className="group relative w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 blur-md opacity-50 group-hover:opacity-70 transition-opacity"></div>
                      <div className="relative flex items-center justify-center">
                        <Pause className="w-7 h-7 text-white" fill="white" />
                      </div>
                    </button>
                  )}

                  <button
                    onClick={handleReset}
                    disabled={time === 0}
                    className="group relative w-16 h-16 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 blur-md opacity-50 group-hover:opacity-70 transition-opacity"></div>
                    <div className="relative flex items-center justify-center">
                      <RotateCcw className="w-6 h-6 text-white" />
                    </div>
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50">
                    <div className="text-2xl font-bold text-violet-600">{sessions.length}</div>
                    <div className="text-xs text-gray-600 mt-1">Sessions Today</div>
                  </div>
                  <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50">
                    <div className="text-2xl font-bold text-purple-600">{formatTime(totalMeditationTime)}</div>
                    <div className="text-xs text-gray-600 mt-1">Total Time</div>
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
                        className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-400 flex items-center justify-center">
                            <Clock className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-800">{formatTime(session.duration)}</div>
                            <div className="text-xs text-gray-500">{new Date(session.date).toLocaleTimeString()}</div>
                          </div>
                        </div>
                        <div className="text-xs text-violet-600 font-medium">✓</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MeditationTimer;
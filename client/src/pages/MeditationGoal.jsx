import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MeditationGoal = () => {
  const navigate = useNavigate();
  const [selectedGoals, setSelectedGoals] = useState([]);

  const goals = [
    'Reduce Stress & Anxiety',
    'Improve Focus & Concentration',
    'Enhance Sleep Quality',
    'Boost Mindfulness & Presence',
    'Increase Self-Awareness',
    'Emotional Balance & Calmness',
    'Spiritual Growth',
  ];

  const toggleGoal = (goal) => {
    if (selectedGoals.includes(goal)) {
      setSelectedGoals(selectedGoals.filter((g) => g !== goal));
    } else {
      setSelectedGoals([...selectedGoals, goal]);
    }
  };

  const handleSubmit = () => {
    // For now, just log and navigate
    console.log('Selected Goals:', selectedGoals);
    navigate('/home'); // Navigate to main app or next page
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-violet-200/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-3xl relative z-10">
        {/* Main card */}
        <div className="relative group animate-fade-in">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-400 via-purple-400 to-violet-400 rounded-3xl blur-2xl opacity-30 group-hover:opacity-40 transition-opacity"></div>
          <div className="relative bg-white rounded-3xl p-8 sm:p-12 border border-violet-100 shadow-2xl space-y-10">
            
            {/* Header */}
            <div className="text-center space-y-4 animate-fade-in">
              <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-gray-900 via-violet-900 to-purple-900 bg-clip-text text-transparent leading-tight">
                What is your meditation goal?
              </h1>
              <p className="text-gray-600 text-lg sm:text-xl leading-relaxed">
                Select one or more goals that resonate with you. This will help us guide your meditation journey.
              </p>
            </div>

            {/* Goals checkboxes */}
            <div className="grid sm:grid-cols-2 gap-4 animate-slide-in">
              {goals.map((goal, index) => (
                <button
                  key={index}
                  onClick={() => toggleGoal(goal)}
                  className={`flex items-center space-x-3 p-4 rounded-xl border transition-all duration-300 shadow-md hover:shadow-xl ${
                    selectedGoals.includes(goal)
                      ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white border-transparent'
                      : 'bg-white text-gray-700 border-violet-200 hover:border-violet-300'
                  }`}
                  style={{ transitionDelay: `${index * 0.05}s` }}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${selectedGoals.includes(goal) ? 'bg-white text-violet-600 border-white' : 'border-violet-300'}`}>
                    {selectedGoals.includes(goal) && <span className="font-bold">✓</span>}
                  </div>
                  <span className="font-medium">{goal}</span>
                </button>
              ))}
            </div>

            {/* Submit button */}
            <div className="flex justify-center pt-6">
              <button
                onClick={handleSubmit}
                disabled={selectedGoals.length === 0}
                className={`px-8 py-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-bold text-lg shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animate-slide-in {
          animation: slide-in 0.5s ease-out;
        }
        .animate-pulse {
          animation: pulse 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default MeditationGoal;

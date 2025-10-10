import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const onboardingSteps = [
    {
      title: 'Welcome to Your Mindful Space',
      description: 'Begin your journey to inner peace and tranquility. Discover guided meditations, soothing sounds, and transformative wellness practices.',
      emoji: '🧘',
      gradient: 'from-violet-400 via-purple-400 to-pink-400',
      bgGradient: 'from-violet-50 to-purple-100',
      features: ['Guided meditation sessions', 'Calming nature sounds', 'Breathing exercises']
    },
    {
      title: 'Learn & Grow at Your Pace',
      description: 'Access a rich library of mindfulness courses, meditation techniques, and wellness resources designed to fit seamlessly into your daily life.',
      emoji: '📚',
      gradient: 'from-blue-400 via-cyan-400 to-teal-400',
      bgGradient: 'from-blue-50 to-cyan-100',
      features: ['Self-paced courses', 'Expert-led lessons', 'Flexible scheduling']
    },
    {
      title: 'Track Your Transformation',
      description: 'Monitor your mindfulness journey with progress insights, save your favorite sessions, and build a sustainable meditation practice.',
      emoji: '✨',
      gradient: 'from-pink-400 via-rose-400 to-red-400',
      bgGradient: 'from-pink-50 to-rose-100',
      features: ['Progress tracking', 'Personalized favorites', 'Daily streaks']
    },
  ];

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    navigate('/register');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const step = onboardingSteps[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-violet-200/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-200/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>

      <div className="w-full max-w-5xl relative z-10">
        {/* Skip button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={handleSkip}
            className="text-gray-500 hover:text-gray-700 transition-colors text-sm font-bold px-4 py-2 rounded-lg hover:bg-white/50"
          >
            Skip
          </button>
        </div>

        {/* Main content card */}
        <div className="relative group animate-fade-in">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 rounded-3xl blur-2xl opacity-30 group-hover:opacity-40 transition-opacity"></div>
          <div className="relative bg-white rounded-3xl p-8 sm:p-12 lg:p-16 border border-violet-100 shadow-2xl space-y-10">
            {/* Progress indicators */}
            <div className="flex justify-center space-x-3">
              {onboardingSteps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2.5 rounded-full transition-all duration-500 ${
                    index === currentStep
                      ? 'w-12 bg-gradient-to-r from-violet-500 to-purple-600 shadow-lg'
                      : index < currentStep
                      ? 'w-2.5 bg-violet-300'
                      : 'w-2.5 bg-gray-200'
                  }`}
                />
              ))}
            </div>

            {/* Content container */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Image/Illustration side */}
              <div className="flex justify-center lg:justify-start order-2 lg:order-1">
                <div className="relative">
                  <div className={`absolute inset-0 bg-gradient-to-br ${step.gradient} rounded-full blur-3xl opacity-40 animate-pulse`}></div>
                  <div className={`relative w-72 h-72 sm:w-96 sm:h-96 rounded-3xl bg-gradient-to-br ${step.bgGradient} flex flex-col items-center justify-center shadow-2xl transition-all duration-700 animate-scale-in`}>
                    <div className="text-9xl mb-6 animate-bounce-slow">
                      {step.emoji}
                    </div>
                    <div className="space-y-3 px-6">
                      {step.features.map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-3 text-gray-700 animate-slide-in"
                          style={{animationDelay: `${index * 0.2}s`}}
                        >
                          <div className="w-8 h-8 rounded-full bg-white/70 backdrop-blur-sm flex items-center justify-center shadow-md">
                            <span className="text-sm">✓</span>
                          </div>
                          <span className="text-sm font-medium">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Text content side */}
              <div className="space-y-6 order-1 lg:order-2 animate-fade-in">
                <div className="inline-block">
                  <span className="text-sm font-bold text-violet-600 bg-violet-100 px-4 py-2 rounded-full">
                    Step {currentStep + 1} of {onboardingSteps.length}
                  </span>
                </div>
                
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-violet-900 to-purple-900 bg-clip-text text-transparent leading-tight">
                  {step.title}
                </h1>
                
                <p className="text-gray-600 text-lg sm:text-xl leading-relaxed">
                  {step.description}
                </p>

                {/* Navigation buttons */}
                {currentStep < onboardingSteps.length - 1 ? (
                  <div className="flex items-center space-x-4 pt-4">
                    {currentStep > 0 && (
                      <button
                        onClick={handlePrevious}
                        className="flex items-center space-x-2 px-6 py-3 rounded-xl font-bold transition-all text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      >
                        <ChevronLeft size={20} />
                        <span>Back</span>
                      </button>
                    )}

                    <button
                      onClick={handleNext}
                      className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                    >
                      <span>Continue</span>
                      <ChevronRight size={20} />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 pt-4">
                    {currentStep > 0 && (
                      <button
                        onClick={handlePrevious}
                        className="flex items-center space-x-2 px-6 py-3 rounded-xl font-bold transition-all text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      >
                        <ChevronLeft size={20} />
                        <span>Back</span>
                      </button>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4">
                      <button
                        onClick={handleComplete}
                        className="px-8 py-4 flex-1 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                      >
                        Start Your Journey
                      </button>

                      <button
                        onClick={handleLogin}
                        className="px-8 py-4 flex-1 rounded-xl font-bold text-lg text-gray-700 bg-white hover:bg-gray-50 transition-all border-2 border-violet-200 hover:border-violet-300 shadow-md hover:shadow-lg"
                      >
                        I Have an Account
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mindful quote at bottom */}
        <div className="text-center mt-8 animate-fade-in">
          <p className="text-gray-500 text-sm italic">
            "The present moment is filled with joy and happiness. If you are attentive, you will see it."
          </p>
          <p className="text-gray-400 text-xs mt-1">— Thích Nhất Hạnh</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.8s ease-out;
        }
        .animate-slide-in {
          animation: slide-in 0.5s ease-out;
          animation-fill-mode: both;
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Onboarding;
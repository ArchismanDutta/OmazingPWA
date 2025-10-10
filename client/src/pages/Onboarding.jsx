import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const onboardingSteps = [
    {
      title: 'Welcome to Omaazing',
      description: 'Your personal journey to mindfulness and inner peace starts here. Discover guided meditations, calming music, and wellness content.',
      image: '/onboarding-1.svg', // You can replace with actual images
      color: 'from-blue-600 to-purple-600',
    },
    {
      title: 'Learn at Your Own Pace',
      description: 'Access a rich library of courses, lessons, and meditation sessions designed to fit your lifestyle and schedule.',
      image: '/onboarding-2.svg',
      color: 'from-green-600 to-teal-600',
    },
    {
      title: 'Track Your Progress',
      description: 'Monitor your mindfulness journey with progress tracking, favorites, and recently played content. Stay motivated every step of the way.',
      image: '/onboarding-3.svg',
      color: 'from-purple-600 to-pink-600',
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
    // Navigate to register page
    navigate('/register');
  };

  const handleLogin = () => {
    // Navigate to login page
    navigate('/login');
  };

  const step = onboardingSteps[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        {/* Skip button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={handleSkip}
            className="text-white/60 hover:text-white/90 transition-colors text-sm font-medium"
          >
            Skip
          </button>
        </div>

        {/* Main content card */}
        <div className="card-glass p-8 sm:p-12 space-y-8">
          {/* Progress indicators */}
          <div className="flex justify-center space-x-2">
            {onboardingSteps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? 'w-8 bg-gradient-primary'
                    : 'w-2 bg-white/20'
                }`}
              />
            ))}
          </div>

          {/* Image/Illustration */}
          <div className="flex justify-center">
            <div
              className={`w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center shadow-2xl transition-all duration-500 animate-fade-in`}
            >
              <div className="text-white text-8xl font-bold opacity-50">
                {currentStep + 1}
              </div>
              {/* Replace with actual image if available */}
              {/* <img src={step.image} alt={step.title} className="w-full h-full object-contain" /> */}
            </div>
          </div>

          {/* Text content */}
          <div className="text-center space-y-4 animate-fade-in">
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              {step.title}
            </h1>
            <p className="text-white/70 text-lg sm:text-xl max-w-2xl mx-auto">
              {step.description}
            </p>
          </div>

          {/* Navigation buttons */}
          {currentStep < onboardingSteps.length - 1 ? (
            <div className="flex items-center justify-between pt-8">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                  currentStep === 0
                    ? 'opacity-0 cursor-not-allowed'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <ChevronLeft size={20} />
                <span>Previous</span>
              </button>

              <button
                onClick={handleNext}
                className="btn-primary px-8 py-3 flex items-center space-x-2"
              >
                <span>Next</span>
                <ChevronRight size={20} />
              </button>
            </div>
          ) : (
            <div className="space-y-4 pt-8">
              <button
                onClick={handlePrevious}
                className="flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all text-white/70 hover:text-white hover:bg-white/10"
              >
                <ChevronLeft size={20} />
                <span>Previous</span>
              </button>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleComplete}
                  className="btn-primary px-8 py-4 flex-1 text-lg"
                >
                  Create Account
                </button>

                <button
                  onClick={handleLogin}
                  className="px-8 py-4 flex-1 text-lg rounded-xl font-semibold text-white bg-white/10 hover:bg-white/20 transition-all border border-white/20"
                >
                  Sign In
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Page counter */}
        <div className="text-center mt-6 text-white/50 text-sm">
          {currentStep + 1} of {onboardingSteps.length}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;

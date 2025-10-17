import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import Medi2 from '../assets/Medi2.jpg';
import Medi3 from '../assets/Medi3.jpg';
import Medi4 from '../assets/Medi4.jpg';
import yogaAnimation from '../assets/Yoga Se Hi hoga.json';
import monkAnimation from '../assets/Meditating Monk.json';
import yogAnimation from '../assets/yoga meditation.json';

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
      features: ['Guided meditation sessions', 'Calming nature sounds', 'Breathing exercises'],
      animation: yogaAnimation
    },
    {
      title: 'Learn & Grow at Your Pace',
      description: 'Access a rich library of mindfulness courses, meditation techniques, and wellness resources designed to fit seamlessly into your daily life.',
      emoji: '📚',
      gradient: 'from-blue-400 via-cyan-400 to-teal-400',
      bgGradient: 'from-blue-50 to-cyan-100',
      features: ['Self-paced courses', 'Expert-led lessons', 'Flexible scheduling'],
      animation: monkAnimation
    },
    {
      title: 'Track Your Transformation',
      description: 'Monitor your mindfulness journey with progress insights, save your favorite sessions, and build a sustainable meditation practice.',
      emoji: '✨',
      gradient: 'from-pink-400 via-rose-400 to-red-400',
      bgGradient: 'from-pink-50 to-rose-100',
      features: ['Progress tracking', 'Personalized favorites', 'Daily streaks'],
      animation: yogAnimation
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
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 flex flex-col justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Advanced meditation background animation */}

      {/* Breathing circle animation - main focal point */}
      <motion.div
        className="absolute top-1/2 left-1/2 w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] lg:w-[900px] lg:h-[900px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(167, 139, 250, 0.6) 0%, rgba(196, 181, 253, 0.4) 30%, rgba(221, 214, 254, 0.25) 60%, transparent 100%)',
          transform: 'translate(-50%, -50%)',
          filter: 'blur(60px)',
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Secondary breathing circle */}
      <motion.div
        className="absolute top-1/2 left-1/2 w-[300px] h-[300px] sm:w-[450px] sm:h-[450px] lg:w-[650px] lg:h-[650px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.5) 0%, rgba(167, 139, 250, 0.35) 40%, transparent 70%)',
          transform: 'translate(-50%, -50%)',
          filter: 'blur(50px)',
        }}
        animate={{
          scale: [1.3, 1, 1.3],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Floating particles - more visible */}
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 sm:w-4 sm:h-4 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: i % 3 === 0
              ? 'rgba(167, 139, 250, 0.7)'
              : i % 3 === 1
              ? 'rgba(236, 72, 153, 0.7)'
              : 'rgba(139, 92, 246, 0.7)',
            boxShadow: '0 0 10px rgba(167, 139, 250, 0.5)',
          }}
          animate={{
            y: [0, -50, 0],
            x: [0, Math.random() * 30 - 15, 0],
            opacity: [0.4, 1, 0.4],
            scale: [1, 2, 1],
          }}
          transition={{
            duration: 3 + Math.random() * 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 2,
          }}
        />
      ))}

      {/* Rotating gradient orbs - more prominent */}
      <motion.div
        className="absolute top-20 left-20 w-64 h-64 sm:w-80 sm:h-80 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.6) 0%, rgba(236, 72, 153, 0.3) 50%, transparent 70%)',
          filter: 'blur(60px)',
        }}
        animate={{
          x: [0, 150, 0],
          y: [0, -80, 0],
          scale: [1, 1.4, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute bottom-20 right-20 w-72 h-72 sm:w-96 sm:h-96 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.65) 0%, rgba(139, 92, 246, 0.35) 50%, transparent 70%)',
          filter: 'blur(60px)',
        }}
        animate={{
          x: [0, -100, 0],
          y: [0, 80, 0],
          scale: [1, 1.5, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute top-1/3 right-1/4 w-60 h-60 sm:w-80 sm:h-80 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.55) 0%, rgba(168, 85, 247, 0.25) 50%, transparent 70%)',
          filter: 'blur(55px)',
        }}
        animate={{
          x: [0, -80, 0],
          y: [0, 100, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 11,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      {/* Additional ambient light waves */}
      <motion.div
        className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(196, 181, 253, 0.5) 0%, transparent 60%)',
          filter: 'blur(70px)',
        }}
        animate={{
          scale: [1, 1.6, 1],
          opacity: [0.3, 0.7, 0.3],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="w-full max-w-6xl mx-auto relative z-10 flex flex-col" style={{maxHeight: 'calc(100vh - 2rem)'}}>
        {/* Skip button */}
        <div className="flex justify-end mb-3 sm:mb-4 flex-shrink-0">
          <button
            onClick={handleSkip}
            className="text-gray-600 hover:text-gray-900 transition-colors text-sm sm:text-base font-bold px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl hover:bg-white/80 backdrop-blur-sm shadow-md"
          >
            Skip
          </button>
        </div>

        {/* Main content card */}
        <div className="relative group animate-fade-in flex-1 overflow-auto">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 rounded-2xl sm:rounded-3xl blur-xl sm:blur-2xl opacity-30 group-hover:opacity-40 transition-opacity"></div>
          <div className="relative bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-10 border border-violet-100 shadow-2xl space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Progress indicators */}
            <div className="flex justify-center space-x-2 sm:space-x-3">
              {onboardingSteps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 sm:h-2.5 rounded-full transition-all duration-500 ${
                    index === currentStep
                      ? 'w-10 sm:w-12 bg-gradient-to-r from-violet-500 to-purple-600 shadow-lg'
                      : index < currentStep
                      ? 'w-2 sm:w-2.5 bg-violet-300'
                      : 'w-2 sm:w-2.5 bg-gray-200'
                  }`}
                />
              ))}
            </div>

            {/* Content container */}
            <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 items-center">
              {/* Image/Illustration side */}
              <div className="flex justify-center lg:justify-start order-2 lg:order-1">
                <div className="relative w-full max-w-xs lg:max-w-sm">
                  <div className={`absolute inset-0 bg-gradient-to-br ${step.gradient} rounded-full blur-2xl opacity-40 animate-pulse`}></div>
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.5 }}
                    className={`relative w-full aspect-square max-w-[240px] sm:max-w-[280px] lg:max-w-[320px] mx-auto ${!step.animation && 'rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl'}`}
                  >
                    {step.animation ? (
                      <Lottie
                        animationData={step.animation}
                        loop={true}
                        className="w-full h-full"
                      />
                    ) : (
                      <img
                        src={step.image}
                        alt="Meditation"
                        className="w-full h-full object-cover rounded-2xl sm:rounded-3xl shadow-2xl"
                      />
                    )}
                  </motion.div>
                </div>
              </div>

              {/* Text content side */}
              <div className="space-y-3 sm:space-y-4 lg:space-y-5 order-1 lg:order-2 animate-fade-in">
                <div className="inline-block">
                  <span className="text-xs sm:text-sm font-bold text-violet-600 bg-violet-100 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full">
                    Step {currentStep + 1} of {onboardingSteps.length}
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-gray-900 via-violet-900 to-purple-900 bg-clip-text text-transparent leading-tight">
                  {step.title}
                </h1>

                <p className="text-gray-600 text-xs sm:text-sm md:text-base lg:text-lg leading-relaxed">
                  {step.description}
                </p>

                {/* Navigation buttons */}
                {currentStep < onboardingSteps.length - 1 ? (
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-2 sm:pt-3">
                    {currentStep > 0 && (
                      <button
                        onClick={handlePrevious}
                        className="flex items-center space-x-1 sm:space-x-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-semibold transition-all text-gray-600 hover:text-gray-900 hover:bg-gray-100 text-xs sm:text-sm"
                      >
                        <ChevronLeft size={16} className="sm:w-4 sm:h-4" />
                        <span>Back</span>
                      </button>
                    )}

                    <button
                      onClick={handleNext}
                      className="flex items-center space-x-1 sm:space-x-1.5 px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 text-xs sm:text-sm"
                    >
                      <span>Continue</span>
                      <ChevronRight size={16} className="sm:w-4 sm:h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 sm:space-y-3 pt-2 sm:pt-3">
                    {currentStep > 0 && (
                      <button
                        onClick={handlePrevious}
                        className="flex items-center space-x-1 sm:space-x-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-semibold transition-all text-gray-600 hover:text-gray-900 hover:bg-gray-100 text-xs sm:text-sm"
                      >
                        <ChevronLeft size={16} className="sm:w-4 sm:h-4" />
                        <span>Back</span>
                      </button>
                    )}

                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <button
                        onClick={handleComplete}
                        className="px-5 sm:px-6 py-2.5 sm:py-3 flex-1 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white rounded-xl font-semibold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                      >
                        Start Your Journey
                      </button>

                      <button
                        onClick={handleLogin}
                        className="px-5 sm:px-6 py-2.5 sm:py-3 flex-1 rounded-xl font-semibold text-sm sm:text-base text-gray-700 bg-white hover:bg-gray-50 transition-all border-2 border-violet-200 hover:border-violet-300 shadow-md hover:shadow-lg"
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
        <div className="text-center mt-4 sm:mt-6 animate-fade-in px-4 flex-shrink-0">
          <p className="text-gray-800 text-sm sm:text-base italic font-medium">
            "The present moment is filled with joy and happiness. If you are attentive, you will see it."
          </p>
          <p className="text-gray-800 text-xs sm:text-sm mt-1.5">— Thích Nhất Hạnh</p>
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
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import GoogleLoginButton from '../components/button/GoogleLoginButton';
import omazingLogo from '../assets/omazinglogo.png';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const { register, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      navigate('/meditation-goal');
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const handleGoogleLogin = (data) => {
    if (data.success) {
      // Check if user has wellness goals, if not redirect to meditation goal page
      if (!data.user?.profile?.wellnessGoals || data.user.profile.wellnessGoals.length === 0) {
        navigate('/meditation-goal');
      } else {
        navigate('/dashboard');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Meditation background animation */}

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

      {/* Floating particles */}
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

      {/* Rotating gradient orbs */}
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

      <div className="w-full max-w-md space-y-6 animate-fade-in relative z-10">
        <div className="text-center flex flex-col items-center">
          <div className="w-full max-w-md h-24 overflow-hidden flex items-center justify-center mb-2">
            <img src={omazingLogo} alt="Omazing Logo" className="w-full h-auto object-cover scale-102" style={{ objectPosition: 'center' }} />
          </div>
          <p className="text-gray-600 text-lg">
            Start your mindfulness journey today
          </p>
        </div>

        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <div className="relative bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-violet-100 shadow-xl space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                placeholder="Enter your full name"
              />
              {errors.name && (
                <p className="mt-2 text-sm text-red-600 font-medium">{errors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-600 font-medium">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                placeholder="Create a password (min. 6 characters)"
              />
              {errors.password && (
                <p className="mt-2 text-sm text-red-600 font-medium">{errors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-bold text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600 font-medium">{errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-violet-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">Or continue with</span>
              </div>
            </div>

            <div className="flex justify-center">
              <GoogleLoginButton onLogin={handleGoogleLogin} />
            </div>
          </form>

            <div className="pt-4 text-center border-t border-violet-100">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="font-bold text-violet-600 hover:text-violet-700 transition-colors">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Register;
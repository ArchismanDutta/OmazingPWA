import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, BookOpen, User } from 'lucide-react';

// Shared Navigation Component for all pages
const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home, path: '/dashboard' },
    { id: 'courses', label: 'Courses', icon: BookOpen, path: '/courses' },
    { id: 'profile', label: 'Profile', icon: User, path: '/profile' }
  ];

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Desktop Navigation - Top */}
      <nav className={`hidden md:block sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-lg shadow-lg' : 'bg-white shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 via-purple-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/30 transform hover:scale-105 transition-transform">
                <span className="text-white font-bold text-xl">Om</span>
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">Omazing</span>
                <p className="text-xs text-gray-500">Find your inner peace</p>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <div className="flex items-center space-x-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.path)}
                    className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl transition-all duration-200 ${
                      active
                        ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/30'
                        : 'text-gray-600 hover:bg-violet-50 hover:text-violet-600'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation - Logo Bar at Top */}
      <div className="md:hidden sticky top-0 z-50 bg-white/95 backdrop-blur-lg shadow-sm">
        <div className="px-4 py-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-3"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 via-purple-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/30">
              <span className="text-white font-bold text-lg">Om</span>
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">Omazing</span>
              <p className="text-xs text-gray-500">Find your inner peace</p>
            </div>
          </button>
        </div>
      </div>

      {/* Bottom Mobile Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-violet-100 shadow-2xl z-50">
        <div className="grid grid-cols-3 gap-1 px-3 py-3 safe-area-bottom">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center space-y-1.5 p-2.5 rounded-xl transition-all duration-200 ${
                  active
                    ? 'bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/30'
                    : 'text-gray-500 active:bg-violet-50'
                }`}
              >
                <Icon size={22} strokeWidth={active ? 2.5 : 2} />
                <span className="text-xs font-semibold">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .safe-area-bottom {
          padding-bottom: env(safe-area-inset-bottom, 0.75rem);
        }
      `}</style>
    </>
  );
};

export default Navigation;

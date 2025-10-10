import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getUserRoleDisplayName, isAdminUser, getDefaultRouteForUser } from '../../utils/navigation';
import { Home, BookOpen, User } from 'lucide-react';
import logo from '../../assets/logo.jpg';

const TopNavBar = ({ title, subtitle, actions = [] }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getNavigationItems = () => {
    const items = [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Courses', href: '/courses' },
      { label: 'Content', href: '/content' },
    ];

    if (user) {
      items.push(
        { label: 'My Courses', href: '/my-courses' },
        { label: 'Favorites', href: '/favorites' },
        { label: 'Recent', href: '/recently-played' }
      );

      if (user.role === 'admin') {
        items.push({ label: 'Admin', href: '/admin/users' });
      }
    }

    return items;
  };

  const getMobileNavItems = () => {
    return [
      { id: 'home', label: 'Home', icon: Home, path: '/dashboard' },
      { id: 'courses', label: 'Courses', icon: BookOpen, path: '/courses' },
      { id: 'profile', label: 'Profile', icon: User, path: '/profile' }
    ];
  };

  const isActiveRoute = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const navigationItems = getNavigationItems();
  const mobileNavItems = getMobileNavItems();
  const currentPath = location.pathname;
  const isAdminPage = currentPath.startsWith('/admin');

  return (
    <>
      {/* Mobile Sidebar for User Pages */}
      {!isAdminPage && (
        <>
          {/* Mobile Sidebar */}
          <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-white backdrop-blur-xl border-r border-violet-200 shadow-2xl transform ${showMobileSidebar ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:hidden`}>
            <div className="flex flex-col h-full">
              {/* Sidebar Header */}
              <div className="flex items-center justify-between p-6 border-b border-violet-100 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500">
                <Link
                  to="/dashboard"
                  className="flex items-center group"
                  onClick={() => setShowMobileSidebar(false)}
                >
                  <img src={logo} alt="Omazing Logo" className="h-16 w-auto object-contain group-hover:scale-105 transition-transform" />
                </Link>
                <button
                  onClick={() => setShowMobileSidebar(false)}
                  className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-all"
                >
                  ✕
                </button>
              </div>

              {/* User Profile Section */}
              {user && (
                <div className="p-6 border-b border-violet-100 bg-gradient-to-br from-violet-50 to-purple-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white text-lg font-bold">
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-gray-900 font-semibold">{user.name}</h3>
                      <p className="text-gray-600 text-sm">{user.email}</p>
                      <div className="flex items-center mt-1">
                        <span className="text-xs text-violet-600 capitalize bg-violet-100 px-2 py-1 rounded-full font-medium">
                          {getUserRoleDisplayName(user.role)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              <nav className="flex-1 px-6 py-6 space-y-2 bg-white">
                {navigationItems.map((item) => {
                  const isActive = currentPath === item.href;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setShowMobileSidebar(false)}
                      className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/30'
                          : 'text-gray-700 hover:text-violet-600 hover:bg-violet-50'
                      }`}
                    >
                      <span className="font-medium">{item.label}</span>
                      {isActive && (
                        <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* Sidebar Footer */}
              <div className="p-6 border-t border-violet-100 bg-white">
                <Link
                  to="/profile"
                  onClick={() => setShowMobileSidebar(false)}
                  className="w-full flex items-center px-4 py-3 mb-3 text-sm font-medium text-gray-700 rounded-xl hover:text-violet-600 hover:bg-violet-50 transition-all duration-200 group"
                >
                  <span className="mr-3 text-lg">👤</span>
                  <span>Profile Settings</span>
                  <svg className="ml-auto w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-violet-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>

                {/* Admin Panel Link for Admins */}
                {isAdminUser(user) && (
                  <Link
                    to="/admin/users"
                    onClick={() => setShowMobileSidebar(false)}
                    className="w-full flex items-center px-4 py-3 mb-3 text-sm font-medium text-red-600 rounded-xl hover:text-red-700 hover:bg-red-50 transition-all duration-200 group border border-red-200"
                  >
                    <span className="mr-3 text-lg">⚙️</span>
                    <span>Admin Panel</span>
                    <svg className="ml-auto w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 rounded-xl hover:text-red-700 hover:bg-red-50 transition-all duration-200 group"
                >
                  <span className="mr-3 text-lg">🚪</span>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Sidebar Overlay */}
          {showMobileSidebar && (
            <div
              className="fixed inset-0 z-40 lg:hidden"
              onClick={() => setShowMobileSidebar(false)}
            >
              <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"></div>
            </div>
          )}
        </>
      )}

      {/* Top Navigation Bar */}
      <div className={`backdrop-blur-xl border-b sticky top-0 z-50 animate-fade-in transition-all duration-300 ${
        isAdminPage
          ? 'bg-slate-900/95 border-red-500/20'
          : scrolled
            ? 'bg-white/95 border-violet-100 shadow-lg'
            : 'bg-white border-violet-100 shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Left side - Logo and Title */}
            <div className="flex items-center space-x-6">
              {/* Mobile Menu Button for User Pages */}
              {!isAdminPage && (
                <button
                  onClick={() => setShowMobileSidebar(true)}
                  className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-violet-50 transition-all mr-3"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              )}

              <Link

                to={isAdminPage ? "/admin/users" : "/dashboard"}
                className="flex items-center space-x-3 group"

          
              >
                {isAdminPage ? (
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform bg-gradient-to-br from-red-500 to-red-600">
                      <span className="text-white text-lg font-bold">A</span>
                    </div>
                    <div className="hidden sm:block">
                      <span className="text-2xl font-bold bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent">
                        Admin Panel
                      </span>
                    </div>
                  </div>
                ) : (
                  <img src={logo} alt="Omazing Logo" className="h-12 sm:h-16 w-auto object-contain group-hover:scale-105 transition-transform" />
                )}
              </Link>

              {title && (
                <div className={`pl-6 hidden md:block ${
                  isAdminPage ? 'border-l border-white/20' : 'border-l border-violet-200'
                }`}>
                  <h1 className={`text-lg font-semibold flex items-center space-x-2 ${
                    isAdminPage ? 'text-white' : 'text-gray-900'
                  }`}>
                    <span>{title}</span>
                    {user && isAdminUser(user) && currentPath.startsWith('/admin') && (
                      <span className="px-2 py-1 text-xs font-medium bg-red-500/20 text-red-300 rounded-full border border-red-500/30">
                        Admin Panel
                      </span>
                    )}
                  </h1>
                  {subtitle && (
                    <p className={`text-sm ${
                      isAdminPage ? 'text-white/60' : 'text-gray-600'
                    }`}>{subtitle}</p>
                  )}
                </div>
              )}
            </div>

            {/* Center - Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`relative px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    isAdminPage
                      ? currentPath === item.href
                        ? 'text-white bg-white/10 shadow-lg'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                      : currentPath === item.href
                        ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/30'
                        : 'text-gray-600 hover:bg-violet-50 hover:text-violet-600'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Right side - Actions and User Menu */}
            <div className="flex items-center space-x-4">
            {/* Custom Actions */}
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  action.variant === 'primary'
                    ? 'btn-primary'
                    : action.variant === 'secondary'
                    ? 'btn-secondary'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {action.label}
              </button>
            ))}

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`flex items-center space-x-3 p-1 rounded-full transition-all duration-200 group ${
                    isAdminPage
                      ? 'bg-black/20 hover:bg-black/40'
                      : 'bg-violet-50 hover:bg-violet-100'
                  }`}
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white text-sm font-bold">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="hidden sm:block">
                    <span className={`text-sm font-medium ${
                      isAdminPage ? 'text-white' : 'text-gray-900'
                    }`}>{user.name}</span>
                  </div>
                  <svg className={`w-4 h-4 transition-colors ${
                    isAdminPage ? 'text-white/60 group-hover:text-white' : 'text-gray-600 group-hover:text-gray-900'
                  }`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>

                {showUserMenu && (
                  <>
                    {/* Click outside overlay */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 mt-3 w-56 bg-white/95 backdrop-blur-xl border border-violet-100 rounded-xl shadow-2xl z-50 animate-scale-in overflow-hidden">
                      <div className="py-2">
                        <div className="px-4 py-3 border-b border-violet-100">
                          <p className="text-sm font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-600">{user.email}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-violet-600 capitalize font-medium bg-violet-50 px-2 py-1 rounded-full">
                              {getUserRoleDisplayName(user.role)}
                            </span>
                            {isAdminUser(user) && (
                              <span className="px-2 py-1 text-xs bg-red-500/10 text-red-600 rounded-full font-medium border border-red-200">
                                Admin
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Admin Navigation */}
                        {isAdminUser(user) && (
                          <>
                            {!currentPath.startsWith('/admin') ? (
                              <Link
                                to="/admin/users"
                                className="flex items-center space-x-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors border-b border-violet-100"
                                onClick={() => setShowUserMenu(false)}
                              >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                </svg>
                                <span>Switch to Admin Panel</span>
                              </Link>
                            ) : (
                              <Link
                                to="/dashboard"
                                className="flex items-center space-x-3 px-4 py-3 text-sm text-violet-600 hover:bg-violet-50 transition-colors border-b border-violet-100"
                                onClick={() => setShowUserMenu(false)}
                              >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                                <span>Switch to User Panel</span>
                              </Link>
                            )}
                          </>
                        )}

                        <Link
                          to="/profile"
                          className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-600 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                          <span>Profile Settings</span>
                        </Link>

                        <Link
                          to="/favorites"
                          className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-600 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                          </svg>
                          <span>My Favorites</span>
                        </Link>

                        <Link
                          to="/my-courses"
                          className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-600 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                          </svg>
                          <span>My Courses</span>
                        </Link>

                        <Link
                          to="/recently-played"
                          className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-600 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          <span>Recently Played</span>
                        </Link>

                        {user.role === 'admin' && (
                          <>
                            <div className="border-t border-violet-100 my-2"></div>
                            <Link
                              to="/admin/users"
                              className="flex items-center space-x-3 px-4 py-3 text-sm text-violet-600 hover:bg-violet-50 hover:text-violet-700 transition-colors"
                              onClick={() => setShowUserMenu(false)}
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                              </svg>
                              <span>Admin Dashboard</span>
                            </Link>
                          </>
                        )}

                        <div className="border-t border-violet-100 my-2"></div>
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            handleLogout();
                          }}
                          className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                          </svg>
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className={`text-sm font-medium transition-colors px-3 py-2 rounded-full ${
                    isAdminPage
                      ? 'text-white/70 hover:text-white hover:bg-white/5'
                      : 'text-gray-600 hover:text-violet-600 hover:bg-violet-50'
                  }`}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 text-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Mobile Navigation Bar - Only for non-admin pages */}
      {!isAdminPage && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-violet-100 shadow-2xl z-50">
          <div className="grid grid-cols-3 gap-1 px-3 py-3 safe-area-bottom">
            {mobileNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActiveRoute(item.path);
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
      )}

      <style jsx>{`
        .safe-area-bottom {
          padding-bottom: env(safe-area-inset-bottom, 0.75rem);
        }
      `}</style>
    </>
  );
};

export default TopNavBar;
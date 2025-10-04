import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getUserRoleDisplayName, isAdminUser, getDefaultRouteForUser } from '../../utils/navigation';

const TopNavBar = ({ title, subtitle, actions = [] }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

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
      { label: 'Browse Content', href: '/content' },
      { label: 'Courses', href: '/courses' },
      { label: 'Dashboard', href: '/dashboard' },
    ];

    if (user) {
      items.push(
        { label: 'Favorites', href: '/favorites' },
        { label: 'Recent', href: '/recently-played' }
      );

      if (user.role === 'admin') {
        items.push({ label: 'Admin', href: '/admin' });
      }
    }

    return items;
  };

  const navigationItems = getNavigationItems();
  const currentPath = location.pathname;
  const isAdminPage = currentPath.startsWith('/admin');

  return (
    <>
      {/* Mobile Sidebar for User Pages */}
      {!isAdminPage && (
        <>
          {/* Mobile Sidebar */}
          <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-gradient-to-br from-gray-900 via-black to-gray-900 backdrop-blur-xl border-r border-white/10 shadow-2xl transform ${showMobileSidebar ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:hidden`}>
            <div className="flex flex-col h-full">
              {/* Sidebar Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-3 group"
                  onClick={() => setShowMobileSidebar(false)}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                    <span className="text-white text-lg font-bold">O</span>
                  </div>
                  <span className="text-xl font-bold text-gradient">Omaazing</span>
                </Link>
                <button
                  onClick={() => setShowMobileSidebar(false)}
                  className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all"
                >
                  ✕
                </button>
              </div>

              {/* User Profile Section */}
              {user && (
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-secondary rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white text-lg font-bold">
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{user.name}</h3>
                      <p className="text-white/60 text-sm">{user.email}</p>
                      <div className="flex items-center mt-1">
                        <span className="text-xs text-green-400 capitalize bg-green-500/10 px-2 py-1 rounded-full">
                          {getUserRoleDisplayName(user.role)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              <nav className="flex-1 px-6 py-6 space-y-2">
                {navigationItems.map((item) => {
                  const isActive = currentPath === item.href;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setShowMobileSidebar(false)}
                      className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-300 border border-green-500/30 shadow-lg'
                          : 'text-white/70 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <span className="font-medium">{item.label}</span>
                      {isActive && (
                        <div className="ml-auto w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* Sidebar Footer */}
              <div className="p-6 border-t border-white/10">
                <Link
                  to="/profile"
                  onClick={() => setShowMobileSidebar(false)}
                  className="w-full flex items-center px-4 py-3 mb-3 text-sm font-medium text-white/70 rounded-xl hover:text-white hover:bg-white/10 transition-all duration-200 group"
                >
                  <span className="mr-3 text-lg">👤</span>
                  <span>Profile Settings</span>
                  <svg className="ml-auto w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>

                {/* Admin Panel Link for Admins */}
                {isAdminUser(user) && (
                  <Link
                    to="/admin"
                    onClick={() => setShowMobileSidebar(false)}
                    className="w-full flex items-center px-4 py-3 mb-3 text-sm font-medium text-red-300 rounded-xl hover:text-red-200 hover:bg-red-500/10 transition-all duration-200 group border border-red-500/30"
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
                  className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-400 rounded-xl hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 group"
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
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
            </div>
          )}
        </>
      )}

      {/* Top Navigation Bar */}
      <div className={`backdrop-blur-xl border-b sticky top-0 z-50 animate-fade-in ${
        isAdminPage
          ? 'bg-slate-900/95 border-red-500/20'
          : 'bg-black/80 border-white/10'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Left side - Logo and Title */}
            <div className="flex items-center space-x-6">
              {/* Mobile Menu Button for User Pages */}
              {!isAdminPage && (
                <button
                  onClick={() => setShowMobileSidebar(true)}
                  className="lg:hidden p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all mr-3"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              )}

              <Link
                to={isAdminPage ? "/admin" : "/dashboard"}
                className="flex items-center space-x-3 group"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform ${
                  isAdminPage
                    ? 'bg-gradient-to-br from-red-500 to-red-600'
                    : 'bg-gradient-primary'
                }`}>
                  <span className="text-white text-lg font-bold">
                    {isAdminPage ? 'A' : 'O'}
                  </span>
                </div>
                <span className={`text-xl font-bold hidden sm:block ${
                  isAdminPage
                    ? 'bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent'
                    : 'text-gradient'
                }`}>
                  {isAdminPage ? 'Admin Panel' : 'Omaazing'}
                </span>
              </Link>

              {title && (
                <div className="border-l border-white/20 pl-6 hidden md:block">
                  <h1 className="text-lg font-semibold text-white flex items-center space-x-2">
                    <span>{title}</span>
                    {user && isAdminUser(user) && currentPath.startsWith('/admin') && (
                      <span className="px-2 py-1 text-xs font-medium bg-red-500/20 text-red-300 rounded-full border border-red-500/30">
                        Admin Panel
                      </span>
                    )}
                  </h1>
                  {subtitle && (
                    <p className="text-sm text-white/60">{subtitle}</p>
                  )}
                </div>
              )}
            </div>

          {/* Center - Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  currentPath === item.href
                    ? 'text-white bg-white/10 shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.label}
                {currentPath === item.href && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-green-400 rounded-full"></div>
                )}
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
                  className="flex items-center space-x-3 p-1 rounded-full bg-black/20 hover:bg-black/40 transition-all duration-200 group"
                >
                  <div className="w-9 h-9 bg-gradient-secondary rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white text-sm font-bold">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="hidden sm:block">
                    <span className="text-white text-sm font-medium">{user.name}</span>
                  </div>
                  <svg className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-3 w-56 bg-slate-900/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl shadow-black/50 z-50 animate-scale-in overflow-hidden">
                    <div className="py-2">
                      <div className="px-4 py-3 border-b border-gray-700/50">
                        <p className="text-sm font-medium text-white">{user.name}</p>
                        <p className="text-xs text-white/60">{user.email}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-green-400 capitalize">
                            {getUserRoleDisplayName(user.role)}
                          </span>
                          {isAdminUser(user) && (
                            <span className="px-2 py-1 text-xs bg-red-500/20 text-red-300 rounded-full">
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
                              to="/admin"
                              className="flex items-center space-x-3 px-4 py-3 text-sm text-red-300 hover:bg-red-500/10 transition-colors border-b border-gray-700/50"
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
                              className="flex items-center space-x-3 px-4 py-3 text-sm text-blue-300 hover:bg-blue-500/10 transition-colors border-b border-gray-700/50"
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
                        className="flex items-center space-x-3 px-4 py-3 text-sm text-white/90 hover:bg-slate-800/80 hover:text-white transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        <span>Profile Settings</span>
                      </Link>

                      <Link
                        to="/favorites"
                        className="flex items-center space-x-3 px-4 py-3 text-sm text-white/90 hover:bg-slate-800/80 hover:text-white transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                        <span>My Favorites</span>
                      </Link>

                      <Link
                        to="/recently-played"
                        className="flex items-center space-x-3 px-4 py-3 text-sm text-white/90 hover:bg-slate-800/80 hover:text-white transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <span>Recently Played</span>
                      </Link>

                      {user.role === 'admin' && (
                        <>
                          <div className="border-t border-gray-700/50 my-2"></div>
                          <Link
                            to="/admin"
                            className="flex items-center space-x-3 px-4 py-3 text-sm text-purple-400 hover:bg-purple-500/10 hover:text-purple-300 transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                            </svg>
                            <span>Admin Dashboard</span>
                          </Link>
                        </>
                      )}

                      <div className="border-t border-gray-700/50 my-2"></div>
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          handleLogout();
                        }}
                        className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                        </svg>
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-sm font-medium text-white/70 hover:text-white transition-colors px-3 py-2 rounded-full hover:bg-white/5"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>

          {/* Click outside to close user menu */}
          {showUserMenu && (
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowUserMenu(false)}
            ></div>
          )}
        </div>
      </div>
    </>
  );
};

export default TopNavBar;
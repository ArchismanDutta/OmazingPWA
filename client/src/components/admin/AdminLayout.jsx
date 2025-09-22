import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: '📊' },
    { name: 'Users', href: '/admin/users', icon: '👥' },
    { name: 'Content', href: '/admin/content', icon: '📝' },
    { name: 'Analytics', href: '/admin/analytics', icon: '📈' },
    { name: 'Settings', href: '/admin/settings', icon: '⚙️' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
      <div className="flex">
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900/95 backdrop-blur-xl border-r border-red-500/20 shadow-2xl transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between h-16 px-4 border-b border-red-500/30">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
                  <span className="text-white text-sm font-bold">A</span>
                </div>
                <div className="text-xl font-bold bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent">
                  Admin Panel
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1 rounded-md text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-300 border border-red-500/30 shadow-lg'
                        : 'text-gray-300 hover:text-white hover:bg-slate-800/80'
                    }`}
                  >
                    <span className="mr-3 text-lg">{item.icon}</span>
                    <span className="font-medium">{item.name}</span>
                    {isActive && (
                      <div className="ml-auto w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-red-500/20">
              <div className="flex items-center mb-4 p-3 rounded-xl bg-slate-800/50">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">{user?.name}</p>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 text-xs bg-red-500/20 text-red-300 rounded-full border border-red-500/30">
                      {user?.role?.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              <Link
                to="/dashboard"
                className="w-full flex items-center px-4 py-3 mb-2 text-sm font-medium text-gray-300 rounded-xl hover:text-white hover:bg-slate-800/80 transition-all duration-200 group"
              >
                <span className="mr-3 text-lg">👤</span>
                <span>Switch to User Panel</span>
                <svg className="ml-auto w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-300 rounded-xl hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 group"
              >
                <span className="mr-3 text-lg">🚪</span>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 lg:ml-0">
          <div className="lg:hidden">
            <div className="flex items-center justify-between h-16 px-4 bg-slate-900/95 border-b border-red-500/20 backdrop-blur-xl">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-slate-800 transition-all"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
              <div className="text-lg font-semibold bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent">
                Admin Panel
              </div>
              <div></div>
            </div>
          </div>

          <main className="p-3 sm:p-6 min-h-screen">
            {children}
          </main>
        </div>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;
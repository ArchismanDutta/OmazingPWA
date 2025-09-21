import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Omaazing</h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="hidden sm:block text-sm text-gray-700">Welcome, {user?.name}</span>
              <Link
                to="/profile"
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              Welcome to your mindfulness journey! 🧘‍♀️
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">
              Your personalized wellness dashboard
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="text-3xl mb-3">🎵</div>
              <h3 className="text-lg font-semibold mb-2">Meditation Music</h3>
              <p className="text-gray-600 text-sm mb-4">
                Curated calming meditation tracks
              </p>
              <button className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                Browse Music
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="text-3xl mb-3">📚</div>
              <h3 className="text-lg font-semibold mb-2">Mindfulness Courses</h3>
              <p className="text-gray-600 text-sm mb-4">
                Structured learning paths for growth
              </p>
              <button className="w-full bg-green-600 text-white py-2 rounded-lg text-sm hover:bg-green-700 transition-colors">
                View Courses
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6 sm:col-span-2 lg:col-span-1">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="text-lg font-semibold mb-2">Progress Tracking</h3>
              <p className="text-gray-600 text-sm mb-4">
                Monitor meditation streaks & milestones
              </p>
              <button className="w-full bg-purple-600 text-white py-2 rounded-lg text-sm hover:bg-purple-700 transition-colors">
                View Progress
              </button>
            </div>
          </div>

          {user && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Profile</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Name:</span>
                  <p className="text-gray-900">{user.name}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Email:</span>
                  <p className="text-gray-900 break-all">{user.email}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Role:</span>
                  <p className="text-gray-900 capitalize">{user.role}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Member since:</span>
                  <p className="text-gray-900">{new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
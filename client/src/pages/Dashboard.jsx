import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import TopNavBar from '../components/navigation/TopNavBar';

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <TopNavBar
        title="Dashboard"
        subtitle={`Welcome back, ${user?.name}!`}
      />

      <main className="px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Welcome to your mindfulness journey! 🧘‍♀️
            </h2>
            <p className="text-white/70 text-lg sm:text-xl mb-8">
              Your personalized wellness dashboard
            </p>
            <Link
              to="/content"
              className="btn-primary text-lg px-8 py-4 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
            >
              Explore Content Library
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <div className="card-glass hover-lift p-8 group animate-slide-up">
              <div className="text-5xl mb-6 group-hover:scale-110 transition-transform">🎵</div>
              <h3 className="text-xl font-bold text-white mb-3">Meditation Music</h3>
              <p className="text-white/70 mb-6 leading-relaxed">
                Curated calming meditation tracks for deep relaxation
              </p>
              <Link
                to="/content?type=audio&category=music"
                className="btn-primary w-full text-center"
              >
                Browse Music
              </Link>
            </div>

            <div className="card-glass hover-lift p-8 group animate-slide-up" style={{animationDelay: '0.1s'}}>
              <div className="text-5xl mb-6 group-hover:scale-110 transition-transform">📚</div>
              <h3 className="text-xl font-bold text-white mb-3">Mindfulness Courses</h3>
              <p className="text-white/70 mb-6 leading-relaxed">
                Structured learning paths for personal growth
              </p>
              <Link
                to="/content?type=video&category=guided_meditation"
                className="btn-secondary w-full text-center"
              >
                View Courses
              </Link>
            </div>

            <div className="card-glass hover-lift p-8 group sm:col-span-2 lg:col-span-1 animate-slide-up" style={{animationDelay: '0.2s'}}>
              <div className="text-5xl mb-6 group-hover:scale-110 transition-transform">📊</div>
              <h3 className="text-xl font-bold text-white mb-3">Progress Tracking</h3>
              <p className="text-white/70 mb-6 leading-relaxed">
                Monitor meditation streaks & milestones
              </p>
              <Link
                to="/recently-played"
                className="bg-gradient-secondary text-white py-3 rounded-xl text-sm font-semibold hover:shadow-lg transition-all text-center block w-full"
              >
                View Progress
              </Link>
            </div>
          </div>

          {/* Quick Access */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-white mb-8 flex items-center">
              <span className="w-1 h-8 bg-gradient-primary rounded-full mr-4"></span>
              Quick Access
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Link
                to="/favorites"
                className="card-glass hover-lift p-6 group animate-slide-up"
              >
                <div className="flex items-center space-x-4">
                  <div className="text-3xl group-hover:scale-110 transition-transform">❤️</div>
                  <div>
                    <h4 className="font-bold text-white text-lg group-hover:text-green-400 transition-colors">Favorites</h4>
                    <p className="text-white/60">
                      {user?.activities?.favoriteContent?.length || 0} saved items
                    </p>
                  </div>
                  <svg className="w-5 h-5 text-white/40 group-hover:text-white/80 transition-colors ml-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                  </svg>
                </div>
              </Link>

              <Link
                to="/recently-played"
                className="card-glass hover-lift p-6 group animate-slide-up" style={{animationDelay: '0.1s'}}
              >
                <div className="flex items-center space-x-4">
                  <div className="text-3xl group-hover:scale-110 transition-transform">⏱️</div>
                  <div>
                    <h4 className="font-bold text-white text-lg group-hover:text-green-400 transition-colors">Recently Played</h4>
                    <p className="text-white/60">
                      {user?.activities?.recentlyPlayed?.length || 0} recent items
                    </p>
                  </div>
                  <svg className="w-5 h-5 text-white/40 group-hover:text-white/80 transition-colors ml-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                  </svg>
                </div>
              </Link>
            </div>
          </div>

          {user && (
            <div className="card-glass p-8 animate-slide-up">
              <h3 className="text-2xl font-bold text-white mb-8 flex items-center">
                <span className="w-1 h-8 bg-gradient-primary rounded-full mr-4"></span>
                Your Profile
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <span className="font-semibold text-white/70 text-sm uppercase tracking-wide">Name</span>
                  <p className="text-white text-lg font-medium mt-1">{user.name}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <span className="font-semibold text-white/70 text-sm uppercase tracking-wide">Email</span>
                  <p className="text-white text-lg font-medium mt-1 break-all">{user.email}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <span className="font-semibold text-white/70 text-sm uppercase tracking-wide">Role</span>
                  <p className="text-white text-lg font-medium mt-1 capitalize">{user.role}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <span className="font-semibold text-white/70 text-sm uppercase tracking-wide">Member Since</span>
                  <p className="text-white text-lg font-medium mt-1">{new Date(user.createdAt).toLocaleDateString()}</p>
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
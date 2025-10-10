import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { contentAPI } from '../api/content';
import TopNavBar from '../components/navigation/TopNavBar';
import Breadcrumbs from '../components/navigation/Breadcrumbs';

const RecentlyPlayed = () => {
  const { user } = useAuth();
  const [recentContent, setRecentContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRecentlyPlayed();
  }, [user]);

  const fetchRecentlyPlayed = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get user's recently played content
      const recentlyPlayed = user.activities?.recentlyPlayed || [];

      if (recentlyPlayed.length === 0) {
        setRecentContent([]);
        setLoading(false);
        return;
      }

      // Fetch content details for each recently played item
      const contentWithDetails = await Promise.all(
        recentlyPlayed.map(async (item) => {
          try {
            const response = await contentAPI.getContentById(item.contentId);
            return {
              ...response.data,
              playedAt: item.playedAt,
              duration: item.duration
            };
          } catch (err) {
            console.error(`Error fetching content ${item.contentId}:`, err);
            return null;
          }
        })
      );

      // Filter out any null results and sort by playedAt
      const validContent = contentWithDetails
        .filter(item => item !== null)
        .sort((a, b) => new Date(b.playedAt) - new Date(a.playedAt));

      setRecentContent(validContent);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching recently played:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCategory = (category) => {
    return category.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getContentIcon = (type) => {
    switch (type) {
      case 'audio': return '🎵';
      case 'video': return '🎥';
      case 'image': return '🖼️';
      case 'document': return '📄';
      default: return '📁';
    }
  };

  const formatPlayedTime = (playedAt) => {
    const now = new Date();
    const played = new Date(playedAt);
    const diffInMs = now - played;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return played.toLocaleDateString();
  };

  const formatDuration = (seconds) => {
    if (!seconds) return null;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const ContentCard = ({ item }) => (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl border border-violet-100 p-6 group animate-slide-up transition-all duration-300 hover:-translate-y-1">
      <Link
        to={`/content/${item._id}`}
        className="block"
      >
        <div className="flex items-start space-x-4 mb-4">
          <div className="text-3xl opacity-80 group-hover:opacity-100 transition-opacity">{getContentIcon(item.type)}</div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 group-hover:text-violet-600 transition-colors truncate mb-1 text-lg">
              {item.title}
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              {formatCategory(item.category)}
            </p>
            <p className="text-xs text-gray-500 flex items-center">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
              </svg>
              Played {formatPlayedTime(item.playedAt)}
            </p>
          </div>
          {item.isPremium && (
            <span className="bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xs px-3 py-1 rounded-full font-bold shadow-md">
              Premium
            </span>
          )}
        </div>

        {item.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        )}

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-3 text-gray-500">
            <span className="flex items-center bg-gray-100 px-2 py-1 rounded-full">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
              </svg>
              {item.viewCount || 0}
            </span>
            {item.duration && (
              <span className="flex items-center bg-gray-100 px-2 py-1 rounded-full">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                </svg>
                {formatDuration(item.duration)}
              </span>
            )}
          </div>
          <div className="text-violet-600 font-bold flex items-center group-hover:text-violet-700 transition-colors">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/>
            </svg>
            Continue
          </div>
        </div>

        {item.price > 0 && (
          <div className="mt-4 pt-3 border-t border-violet-100">
            <div className="text-sm font-bold text-green-600">
              ${item.price.toFixed(2)}
            </div>
          </div>
        )}
      </Link>
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center animate-fade-in max-w-md mx-auto px-4">
          <div className="text-8xl mb-6 opacity-50">🔒</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Please Log In</h1>
          <p className="text-gray-600 mb-8 text-lg">You need to be logged in to view your recently played content</p>
          <Link
            to="/login"
            className="inline-block bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            Log In
          </Link>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: 'Home', href: '/dashboard' },
    { label: 'Recently Played' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 pb-8">
      <TopNavBar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Breadcrumbs items={breadcrumbItems} backTo="/dashboard" />

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-400 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
              </div>
              <p className="mt-6 text-violet-600 font-medium animate-pulse">Loading recent activity...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">😔</div>
            <div className="text-red-600 mb-2 text-xl font-bold">Error loading recently played</div>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={fetchRecentlyPlayed}
              className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              Try Again
            </button>
          </div>
        ) : recentContent.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-8xl mb-6 opacity-50">🎯</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No recent activity</h3>
            <p className="text-gray-600 mb-8 text-lg">
              Start exploring content and it will appear here for quick access
            </p>
            <Link
              to="/content"
              className="inline-block bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              Browse Content
            </Link>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="relative group mb-8 animate-fade-in">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-violet-100 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                      {recentContent.length} Recent Item{recentContent.length !== 1 ? 's' : ''}
                    </h3>
                    <p className="text-gray-600 text-sm sm:text-base">
                      Last activity: {formatPlayedTime(recentContent[0]?.playedAt)}
                    </p>
                  </div>
                  <div className="text-4xl opacity-80">
                    <svg className="w-10 h-10 sm:w-12 sm:h-12 text-violet-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Recently Played Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {recentContent.map((item, index) => (
                <div key={`${item._id}-${item.playedAt}`} style={{animationDelay: `${index * 0.1}s`}}>
                  <ContentCard item={item} />
                </div>
              ))}
            </div>

            {/* Clear History Option */}
            <div className="mt-12 text-center">
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to clear your recently played history?')) {
                    // Implement clear history functionality if needed
                    console.log('Clear history functionality would go here');
                  }
                }}
                className="text-red-600 hover:text-red-700 text-sm transition-colors px-4 py-2 rounded-lg hover:bg-red-50 border border-red-200 font-medium"
              >
                Clear History
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RecentlyPlayed;
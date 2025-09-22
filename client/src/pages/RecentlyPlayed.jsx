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
    <div className="card-glass hover-lift p-6 group animate-slide-up border border-white/10 hover:border-white/20">
      <Link
        to={`/content/${item._id}`}
        className="block"
      >
        <div className="flex items-start space-x-4 mb-4">
          <div className="text-3xl opacity-80 group-hover:opacity-100 transition-opacity">{getContentIcon(item.type)}</div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white group-hover:text-green-400 transition-colors truncate mb-1 text-lg">
              {item.title}
            </h3>
            <p className="text-sm text-white/60 mb-2">
              {formatCategory(item.category)}
            </p>
            <p className="text-xs text-white/50 flex items-center">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
              </svg>
              Played {formatPlayedTime(item.playedAt)}
            </p>
          </div>
          {item.isPremium && (
            <span className="bg-gradient-secondary text-white text-xs px-3 py-1 rounded-full font-medium">
              Premium
            </span>
          )}
        </div>

        {item.description && (
          <p className="text-white/70 text-sm mb-4 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-white/50">
          <div className="flex items-center space-x-3">
            <span className="flex items-center">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
              </svg>
              {item.viewCount || 0}
            </span>
            {item.duration && (
              <span className="flex items-center">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                </svg>
                {formatDuration(item.duration)}
              </span>
            )}
          </div>
          <div className="text-green-400 font-medium flex items-center group-hover:text-green-300 transition-colors">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/>
            </svg>
            Continue
          </div>
        </div>

        {item.price > 0 && (
          <div className="mt-4 pt-3 border-t border-white/10">
            <div className="text-sm font-bold text-green-400">
              ${item.price.toFixed(2)}
            </div>
          </div>
        )}
      </Link>
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="text-8xl mb-6 opacity-50">🔒</div>
          <h1 className="text-3xl font-bold text-white mb-4">Please Log In</h1>
          <p className="text-white/70 mb-8 text-lg">You need to be logged in to view your recently played content</p>
          <Link
            to="/login"
            className="btn-primary inline-block"
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <TopNavBar
        title="Recently Played"
        subtitle="Pick up where you left off"
      />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <Breadcrumbs items={breadcrumbItems} backTo="/dashboard" />

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-400 mx-auto mb-4"></div>
              <p className="text-white/60 animate-pulse">Loading recent activity...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="text-red-400 mb-2 text-lg font-semibold">Error loading recently played</div>
            <p className="text-white/60 mb-6">{error}</p>
            <button
              onClick={fetchRecentlyPlayed}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        ) : recentContent.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-8xl mb-6 opacity-50">🎯</div>
            <h3 className="text-2xl font-bold text-white mb-4">No recent activity</h3>
            <p className="text-white/70 mb-8 text-lg">
              Start exploring content and it will appear here for quick access
            </p>
            <Link
              to="/content"
              className="btn-primary inline-block"
            >
              Browse Content
            </Link>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="mb-8 card-glass p-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {recentContent.length} Recent Item{recentContent.length !== 1 ? 's' : ''}
                  </h3>
                  <p className="text-white/70">
                    Last activity: {formatPlayedTime(recentContent[0]?.playedAt)}
                  </p>
                </div>
                <div className="text-4xl opacity-80">
                  <svg className="w-10 h-10 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Recently Played Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                className="text-red-400 hover:text-red-300 text-sm transition-colors px-4 py-2 rounded-lg hover:bg-red-500/10 border border-red-500/20 font-medium"
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
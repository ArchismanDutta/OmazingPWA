import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { contentAPI } from '../api/content';
import { userAPI } from '../api/user';
import TopNavBar from '../components/navigation/TopNavBar';
import Breadcrumbs from '../components/navigation/Breadcrumbs';

const Favorites = () => {
  const { user, updateUser } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFavorites();
  }, [user?.activities?.favoriteContent]);

  const fetchFavorites = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const favoriteIds = user.activities?.favoriteContent || [];

      if (favoriteIds.length === 0) {
        setFavorites([]);
        setLoading(false);
        return;
      }

      const favoriteContent = await Promise.all(
        favoriteIds.map(async (id) => {
          try {
            const response = await contentAPI.getContentById(id);
            return response.data;
          } catch (err) {
            console.error(`Error fetching content ${id}:`, err);
            return null;
          }
        })
      );

      setFavorites(favoriteContent.filter(item => item !== null));
    } catch (err) {
      setError(err.message);
      console.error('Error fetching favorites:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (contentId) => {
    try {
      const response = await userAPI.toggleFavorite(contentId);

      if (response.data?.user) {
        updateUser(response.data.user);
      }

      setFavorites(prev => prev.filter(item => item._id !== contentId));
    } catch (err) {
      console.error('Error removing favorite:', err);
      alert('Failed to remove from favorites. Please try again.');
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

  const ContentCard = ({ item }) => (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl border border-violet-100 p-5 sm:p-6 group transition-all duration-300 hover:-translate-y-1 animate-slide-up">
      <div className="flex items-start justify-between mb-4">
        <Link
          to={`/content/${item._id}`}
          className="flex items-center space-x-4 flex-1 min-w-0"
        >
          <div className="text-3xl sm:text-4xl opacity-80 group-hover:opacity-100 transition-opacity transform group-hover:scale-110 duration-300">
            {getContentIcon(item.type)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 group-hover:text-violet-600 transition-colors truncate mb-1 text-base sm:text-lg">
              {item.title}
            </h3>
            <p className="text-sm text-gray-600 truncate">
              {formatCategory(item.category)}
            </p>
          </div>
        </Link>

        <button
          onClick={() => handleRemoveFavorite(item._id)}
          className="text-red-500 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-xl group/btn"
          title="Remove from favorites"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
          </svg>
        </button>
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
              {Math.round(item.duration / 60)}m
            </span>
          )}
        </div>
        {item.isPremium && (
          <span className="bg-gradient-to-r from-violet-500 to-purple-600 text-white px-3 py-1 rounded-full font-bold text-xs shadow-md">
            Premium
          </span>
        )}
      </div>

      {item.price > 0 && (
        <div className="mt-4 pt-3 border-t border-violet-100">
          <div className="text-sm font-bold text-green-600">
            ${item.price.toFixed(2)}
          </div>
        </div>
      )}
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center animate-fade-in max-w-md mx-auto px-4">
          <div className="text-8xl mb-6 opacity-50">🔒</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Please Log In</h1>
          <p className="text-gray-600 mb-8 text-lg">You need to be logged in to view your favorites</p>
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
    { label: 'Your Favorites' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 pb-8">
      <TopNavBar
        title="Your Favorites"
        subtitle="Content you've saved for later"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Breadcrumbs items={breadcrumbItems} backTo="/dashboard" />

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-400 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
              </div>
              <p className="mt-6 text-violet-600 font-medium animate-pulse">Loading your favorites...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">😔</div>
            <div className="text-red-600 mb-2 text-xl font-bold">Error loading favorites</div>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={fetchFavorites}
              className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              Try Again
            </button>
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-8xl mb-6 opacity-50">💕</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No favorites yet</h3>
            <p className="text-gray-600 mb-8 text-lg">
              Start exploring content and save your favorites for easy access
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
                      {favorites.length} Favorite{favorites.length !== 1 ? 's' : ''}
                    </h3>
                    <p className="text-gray-600 text-sm sm:text-base">
                      {favorites.filter(f => f.type === 'audio').length} audio, {' '}
                      {favorites.filter(f => f.type === 'video').length} video, {' '}
                      {favorites.filter(f => f.type === 'image').length} image, {' '}
                      {favorites.filter(f => f.type === 'document').length} document
                    </p>
                  </div>
                  <div className="text-4xl opacity-80">
                    <svg className="w-10 h-10 sm:w-12 sm:h-12 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Favorites Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {favorites.map((item, index) => (
                <div key={item._id} style={{animationDelay: `${index * 0.1}s`}}>
                  <ContentCard item={item} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Favorites;
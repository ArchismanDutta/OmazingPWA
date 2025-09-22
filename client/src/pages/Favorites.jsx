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
  }, [user?.activities?.favoriteContent]); // Re-fetch when favorites change

  const fetchFavorites = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get user's favorite content IDs
      const favoriteIds = user.activities?.favoriteContent || [];

      if (favoriteIds.length === 0) {
        setFavorites([]);
        setLoading(false);
        return;
      }

      // Fetch each favorite content
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

      // Filter out any null results (failed fetches)
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

      // Update global user context
      if (response.data?.user) {
        updateUser(response.data.user);
      }

      // Update local favorites list
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
    <div className="card-glass hover-lift p-6 group animate-slide-up border border-white/10 hover:border-white/20">
      <div className="flex items-start justify-between mb-4">
        <Link
          to={`/content/${item._id}`}
          className="flex items-center space-x-4 flex-1 min-w-0"
        >
          <div className="text-3xl opacity-80 group-hover:opacity-100 transition-opacity">{getContentIcon(item.type)}</div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white group-hover:text-green-400 transition-colors truncate mb-1 text-lg">
              {item.title}
            </h3>
            <p className="text-sm text-white/60 truncate">
              {formatCategory(item.category)}
            </p>
          </div>
        </Link>

        <button
          onClick={() => handleRemoveFavorite(item._id)}
          className="text-red-400 hover:text-red-300 transition-colors p-2 hover:bg-red-500/10 rounded-lg group/btn"
          title="Remove from favorites"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
          </svg>
        </button>
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
              {Math.round(item.duration / 60)}m
            </span>
          )}
        </div>
        {item.isPremium && (
          <span className="bg-gradient-secondary text-white px-3 py-1 rounded-full font-medium">
            Premium
          </span>
        )}
      </div>

      {item.price > 0 && (
        <div className="mt-4 pt-3 border-t border-white/10">
          <div className="text-sm font-bold text-green-400">
            ${item.price.toFixed(2)}
          </div>
        </div>
      )}
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="text-8xl mb-6 opacity-50">🔒</div>
          <h1 className="text-3xl font-bold text-white mb-4">Please Log In</h1>
          <p className="text-white/70 mb-8 text-lg">You need to be logged in to view your favorites</p>
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
    { label: 'Your Favorites' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <TopNavBar
        title="Your Favorites"
        subtitle="Content you've saved for later"
      />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <Breadcrumbs items={breadcrumbItems} backTo="/dashboard" />

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-400 mx-auto mb-4"></div>
              <p className="text-white/60 animate-pulse">Loading your favorites...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="text-red-400 mb-2 text-lg font-semibold">Error loading favorites</div>
            <p className="text-white/60 mb-6">{error}</p>
            <button
              onClick={fetchFavorites}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-8xl mb-6 opacity-50">💕</div>
            <h3 className="text-2xl font-bold text-white mb-4">No favorites yet</h3>
            <p className="text-white/70 mb-8 text-lg">
              Start exploring content and save your favorites for easy access
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
                    {favorites.length} Favorite{favorites.length !== 1 ? 's' : ''}
                  </h3>
                  <p className="text-white/70">
                    {favorites.filter(f => f.type === 'audio').length} audio, {' '}
                    {favorites.filter(f => f.type === 'video').length} video, {' '}
                    {favorites.filter(f => f.type === 'image').length} image, {' '}
                    {favorites.filter(f => f.type === 'document').length} document
                  </p>
                </div>
                <div className="text-4xl opacity-80">
                  <svg className="w-10 h-10 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Favorites Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((item, index) => (
                <div key={item._id} style={{animationDelay: `${index * 0.1}s`}}>
                  <ContentCard item={item} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Favorites;
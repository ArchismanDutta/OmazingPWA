import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { contentAPI } from '../api/content';
import { userAPI } from '../api/user';
import AudioPlayer from '../components/media/AudioPlayer';
import VideoPlayer from '../components/media/VideoPlayer';
import ImageViewer from '../components/media/ImageViewer';
import TopNavBar from '../components/navigation/TopNavBar';
import Breadcrumbs from '../components/navigation/Breadcrumbs';

const ContentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [relatedContent, setRelatedContent] = useState([]);

  useEffect(() => {
    fetchContent();
  }, [id]);

  useEffect(() => {
    if (user && user.activities?.favoriteContent) {
      const isCurrentlyFavorite = user.activities.favoriteContent.includes(id);
      setIsFavorite(isCurrentlyFavorite);
    } else {
      setIsFavorite(false);
    }
  }, [user, id]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = user
        ? await contentAPI.getContentById(id)
        : await contentAPI.getPublicContentById(id);

      setContent(response.data);

      if (response.data) {
        fetchRelatedContent(response.data.category, response.data.type);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching content:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedContent = async (category, type) => {
    try {
      const response = user
        ? await contentAPI.getAllContent({ category, limit: 4 })
        : await contentAPI.getPublicContent({ category, limit: 4 });

      const related = response.data.filter(item => item._id !== id);
      setRelatedContent(related.slice(0, 3));
    } catch (err) {
      console.error('Error fetching related content:', err);
    }
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const response = await userAPI.toggleFavorite(id);

      if (response.data?.user) {
        const updatedUser = response.data.user;
        updateUser(updatedUser);

        const isNowFavorite = updatedUser.activities?.favoriteContent?.includes(id) || false;
        setIsFavorite(isNowFavorite);

        console.log('Favorite toggled:', response.data.action, 'Is now favorite:', isNowFavorite);
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      alert('Failed to update favorites. Please try again.');
    }
  };

  const handleAddToRecentlyPlayed = async (duration = 0) => {
    if (!user) return;

    try {
      await userAPI.addRecentlyPlayed(id, duration);
    } catch (err) {
      console.error('Error adding to recently played:', err);
    }
  };

  const formatCategory = (category) => {
    return category.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };

  const formatDuration = (seconds) => {
    if (!seconds) return null;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
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

  const MediaPlayer = ({ content }) => {
    const mediaUrl = content.storage?.url || content.storage?.signedUrl;

    console.log('MediaPlayer - Content:', content);
    console.log('MediaPlayer - MediaURL:', mediaUrl);

    if (!mediaUrl) {
      return (
        <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-12 text-center border border-violet-200">
          <div className="text-6xl mb-6 opacity-50">{getContentIcon(content.type)}</div>
          <p className="text-gray-600 text-lg mb-4">Media preview not available</p>
          <div className="text-xs text-gray-500 space-y-1 bg-white/50 rounded-xl p-4 inline-block">
            <div className="font-semibold text-gray-700 mb-2">Debug info:</div>
            <div>Content ID: {content._id}</div>
            <div>File: {content.fileName}</div>
            <div>Storage type: {content.storage?.type || 'unknown'}</div>
            <div>Storage location: {content.storage?.location || 'none'}</div>
          </div>
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4">
              <a
                href="/debug/media"
                target="_blank"
                className="text-violet-600 hover:text-violet-700 text-sm underline font-medium"
              >
                Open Media Debug Tool
              </a>
            </div>
          )}
        </div>
      );
    }

    const handleMediaPlay = () => {
      handleAddToRecentlyPlayed();
    };

    switch (content.type) {
      case 'audio':
        return (
          <AudioPlayer
            src={mediaUrl}
            title={content.title}
            onPlay={handleMediaPlay}
            className="w-full"
          />
        );

      case 'video':
        return (
          <VideoPlayer
            src={mediaUrl}
            title={content.title}
            poster={content.thumbnail}
            onPlay={handleMediaPlay}
            className="w-full"
          />
        );

      case 'image':
        return (
          <ImageViewer
            src={mediaUrl}
            title={content.title}
            alt={content.description}
            onLoad={handleMediaPlay}
            className="w-full"
          />
        );

      case 'document':
        return (
          <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-12 text-center border border-violet-200">
            <div className="text-6xl mb-6 opacity-70">📄</div>
            <p className="text-gray-700 mb-6 text-lg font-medium">Document: {content.originalName}</p>
            <a
              href={mediaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              onClick={() => handleAddToRecentlyPlayed()}
            >
              Open Document
            </a>
          </div>
        );

      default:
        return (
          <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-12 text-center border border-violet-200">
            <div className="text-6xl mb-6 opacity-50">{getContentIcon(content.type)}</div>
            <p className="text-gray-600 text-lg">Preview not available for this content type</p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-16 h-16 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-400 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
          </div>
          <p className="text-violet-600 font-medium animate-pulse">Loading content...</p>
        </div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-8xl mb-6 opacity-50">😞</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Content Not Found</h1>
          <p className="text-gray-600 mb-8 text-lg">{error || 'The requested content could not be found.'}</p>
          <Link
            to="/content"
            className="inline-block bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            Browse Content
          </Link>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: 'Home', href: '/dashboard' },
    { label: 'Content Library', href: '/content' },
    { label: content?.title || 'Loading...' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 pb-8">
      <TopNavBar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex items-center justify-between mb-6">
          <Breadcrumbs items={breadcrumbItems} backTo="/content" />

          {/* Compact Favorites Button */}
          {user && (
            <button
              onClick={handleToggleFavorite}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium text-sm shadow-sm hover:shadow-md transition-all ${
                isFavorite
                  ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                  : 'bg-white text-gray-700 border border-violet-200 hover:bg-violet-50'
              }`}
            >
              <span className="text-lg">{isFavorite ? '❤️' : '🤍'}</span>
              <span>{isFavorite ? 'Favorited' : 'Favorite'}</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Media player */}
            <div className="relative group mb-6 sm:mb-8 animate-fade-in">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-violet-100 shadow-lg">
                <MediaPlayer content={content} />
              </div>
            </div>

            {/* Content details */}
            <div className="relative group animate-fade-in">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-violet-100 shadow-lg">
                <div className="flex items-center flex-wrap justify-between gap-3 mb-6 text-sm">
                  <div className="flex items-center flex-wrap gap-3">
                    <span className="bg-violet-100 text-violet-700 px-3 py-1.5 rounded-full font-bold uppercase tracking-wide text-xs">
                      {formatCategory(content.category)}
                    </span>
                    <span className="flex items-center text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                      </svg>
                      {content.viewCount || 0} views
                    </span>
                    {content.duration && (
                      <span className="flex items-center text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                        </svg>
                        {formatDuration(content.duration)}
                      </span>
                    )}
                  </div>
                  {content.isPremium && (
                    <span className="bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm px-4 py-2 rounded-full font-bold shadow-lg">
                      Premium
                    </span>
                  )}
                </div>

                {content.description && (
                  <div className="mb-8">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-1 h-6 bg-gradient-to-b from-violet-500 to-purple-500 rounded-full"></div>
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Description</h3>
                    </div>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base sm:text-lg">
                      {content.description}
                    </p>
                  </div>
                )}

                {content.tags && content.tags.length > 0 && (
                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-1 h-6 bg-gradient-to-b from-violet-500 to-purple-500 rounded-full"></div>
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Tags</h3>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                      {content.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm px-4 py-2 rounded-full font-medium shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Content info */}
            <div className="bg-white rounded-2xl p-6 border border-violet-100 shadow-sm animate-slide-up">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-1 h-6 bg-gradient-to-b from-violet-500 to-purple-500 rounded-full"></div>
                <h3 className="text-xl font-bold text-gray-900">Content Info</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center p-3 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl border border-violet-100">
                  <span className="text-gray-600 font-medium">Type:</span>
                  <span className="font-bold text-gray-900">{content.type.charAt(0).toUpperCase() + content.type.slice(1)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl border border-violet-100">
                  <span className="text-gray-600 font-medium">Size:</span>
                  <span className="font-bold text-gray-900">{formatFileSize(content.fileSize)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl border border-violet-100">
                  <span className="text-gray-600 font-medium">Uploaded:</span>
                  <span className="font-bold text-gray-900">{new Date(content.createdAt).toLocaleDateString()}</span>
                </div>
                {content.price > 0 && (
                  <div className="flex justify-between items-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                    <span className="text-gray-600 font-medium">Price:</span>
                    <span className="font-bold text-green-600 text-lg">${content.price.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Related content */}
            {relatedContent.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-violet-100 shadow-sm animate-slide-up">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-1 h-6 bg-gradient-to-b from-violet-500 to-purple-500 rounded-full"></div>
                  <h3 className="text-xl font-bold text-gray-900">Related Content</h3>
                </div>
                <div className="space-y-3">
                  {relatedContent.map((item) => (
                    <Link
                      key={item._id}
                      to={`/content/${item._id}`}
                      className="block p-4 bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all group"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="text-2xl opacity-70 group-hover:opacity-100 transition-opacity">
                          {getContentIcon(item.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-gray-900 group-hover:text-violet-600 transition-colors truncate mb-1">
                            {item.title}
                          </h4>
                          <p className="text-xs text-gray-600">
                            {formatCategory(item.category)}
                          </p>
                        </div>
                        <svg className="w-4 h-4 text-gray-400 group-hover:text-violet-600 transition-colors" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                        </svg>
                      </div>
                    </Link>
                  ))}
                </div>
                <Link
                  to={`/content?category=${content.category}`}
                  className="block mt-6 text-center bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
                >
                  View all in {formatCategory(content.category)}
                </Link>
              </div>
            )}
          </div>
        </div>
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

export default ContentDetail;
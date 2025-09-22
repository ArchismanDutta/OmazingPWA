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
    // Update favorite state when user data changes
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

      // Fetch related content
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

      // Filter out current content
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

      // Update the global user context with the latest data from server
      if (response.data?.user) {
        const updatedUser = response.data.user;
        updateUser(updatedUser);

        // Update local state
        const isNowFavorite = updatedUser.activities?.favoriteContent?.includes(id) || false;
        setIsFavorite(isNowFavorite);

        console.log('Favorite toggled:', response.data.action, 'Is now favorite:', isNowFavorite);
        console.log('Updated user:', updatedUser);
        console.log('Favorite content IDs:', updatedUser.activities?.favoriteContent);
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
    console.log('MediaPlayer - Storage:', content.storage);

    if (!mediaUrl) {
      return (
        <div className="bg-white/5 rounded-xl p-12 text-center border border-white/10">
          <div className="text-6xl mb-6 opacity-50">{getContentIcon(content.type)}</div>
          <p className="text-white/60 text-lg mb-4">Media preview not available</p>
          <div className="text-xs text-white/40 space-y-1">
            <div>Debug info:</div>
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
                className="text-blue-400 hover:text-blue-300 text-sm underline"
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
          <div className="bg-white/5 rounded-xl p-12 text-center border border-white/10">
            <div className="text-6xl mb-6 opacity-70">📄</div>
            <p className="text-white/80 mb-6 text-lg">Document: {content.originalName}</p>
            <a
              href={mediaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-block"
              onClick={() => handleAddToRecentlyPlayed()}
            >
              Open Document
            </a>
          </div>
        );

      default:
        return (
          <div className="bg-white/5 rounded-xl p-12 text-center border border-white/10">
            <div className="text-6xl mb-6 opacity-50">{getContentIcon(content.type)}</div>
            <p className="text-white/60 text-lg">Preview not available for this content type</p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-400 mx-auto mb-4"></div>
          <p className="text-white/60 animate-pulse">Loading content...</p>
        </div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-6 opacity-50">😞</div>
          <h1 className="text-3xl font-bold text-white mb-4">Content Not Found</h1>
          <p className="text-white/60 mb-8 text-lg">{error || 'The requested content could not be found.'}</p>
          <Link
            to="/content"
            className="btn-primary inline-block"
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

  const navActions = [];

  if (user) {
    navActions.push({
      label: isFavorite ? '❤️ Favorited' : '🤍 Add to Favorites',
      onClick: handleToggleFavorite,
      variant: isFavorite ? 'secondary' : 'primary'
    });
  }

  navActions.push({
    label: 'Browse More',
    onClick: () => navigate('/content'),
    variant: 'secondary'
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <TopNavBar
        title={content?.title}
        subtitle={content ? formatCategory(content.category) : 'Loading...'}
        actions={navActions}
      />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <Breadcrumbs items={breadcrumbItems} backTo="/content" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Media player */}
            <div className="card-glass p-8 mb-8 animate-fade-in">
              <MediaPlayer content={content} />
            </div>

            {/* Content details */}
            <div className="card-glass p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-white mb-3 text-gradient">
                    {content.title}
                  </h1>
                  <div className="flex items-center space-x-6 text-sm text-white/70">
                    <span className="bg-white/10 px-3 py-1 rounded-full font-medium">
                      {formatCategory(content.category)}
                    </span>
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                      </svg>
                      {content.viewCount || 0} views
                    </span>
                    {content.duration && (
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                        </svg>
                        {formatDuration(content.duration)}
                      </span>
                    )}
                  </div>
                </div>
                {content.isPremium && (
                  <span className="bg-gradient-secondary text-white text-sm px-4 py-2 rounded-full font-semibold shadow-lg">
                    Premium
                  </span>
                )}
              </div>

              {content.description && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <span className="w-1 h-6 bg-gradient-primary rounded-full mr-3"></span>
                    Description
                  </h3>
                  <p className="text-white/80 leading-relaxed whitespace-pre-wrap text-lg">
                    {content.description}
                  </p>
                </div>
              )}

              {content.tags && content.tags.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <span className="w-1 h-6 bg-gradient-primary rounded-full mr-3"></span>
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {content.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-gradient-primary text-white text-sm px-4 py-2 rounded-full font-medium shadow-md hover:shadow-lg transition-shadow"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Content info */}
            <div className="card-glass p-6 animate-slide-up">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <span className="w-1 h-6 bg-gradient-primary rounded-full mr-3"></span>
                Content Info
              </h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-white/70">Type:</span>
                  <span className="font-semibold text-white">{content.type.charAt(0).toUpperCase() + content.type.slice(1)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-white/70">Size:</span>
                  <span className="font-semibold text-white">{formatFileSize(content.fileSize)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-white/70">Uploaded:</span>
                  <span className="font-semibold text-white">{new Date(content.createdAt).toLocaleDateString()}</span>
                </div>
                {content.price > 0 && (
                  <div className="flex justify-between items-center p-3 bg-gradient-primary/20 rounded-lg border border-green-400/30">
                    <span className="text-white/70">Price:</span>
                    <span className="font-bold text-green-400 text-lg">${content.price.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Related content */}
            {relatedContent.length > 0 && (
              <div className="card-glass p-6 animate-slide-up">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                  <span className="w-1 h-6 bg-gradient-primary rounded-full mr-3"></span>
                  Related Content
                </h3>
                <div className="space-y-3">
                  {relatedContent.map((item) => (
                    <Link
                      key={item._id}
                      to={`/content/${item._id}`}
                      className="block p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all group"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="text-2xl opacity-70 group-hover:opacity-100 transition-opacity">
                          {getContentIcon(item.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-white group-hover:text-green-400 transition-colors truncate mb-1">
                            {item.title}
                          </h4>
                          <p className="text-xs text-white/60">
                            {formatCategory(item.category)}
                          </p>
                        </div>
                        <svg className="w-4 h-4 text-white/40 group-hover:text-white/80 transition-colors" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                        </svg>
                      </div>
                    </Link>
                  ))}
                </div>
                <Link
                  to={`/content?category=${content.category}`}
                  className="block mt-6 text-center btn-secondary text-sm"
                >
                  View all in {formatCategory(content.category)}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentDetail;
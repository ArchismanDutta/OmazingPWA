import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { contentAPI } from '../api/content';
import TopNavBar from '../components/navigation/TopNavBar';
import Breadcrumbs from '../components/navigation/Breadcrumbs';

const ContentLibrary = () => {
  const { user } = useAuth();
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    search: '',
    page: 1,
    limit: 12
  });
  const [pagination, setPagination] = useState({});

  const categories = contentAPI.getCategories();
  const contentTypes = contentAPI.getContentTypes();

  useEffect(() => {
    fetchContent();
  }, [filters]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      setError(null);

      // Remove empty filters
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '')
      );

      const response = user
        ? await contentAPI.getAllContent(cleanFilters)
        : await contentAPI.getPublicContent(cleanFilters);

      setContent(response.data || []);
      setPagination(response.pagination || {});
    } catch (err) {
      setError(err.message);
      console.error('Error fetching content:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
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
    <Link
      to={`/content/${item._id}`}
      className="group card-glass hover-lift block transform transition-all duration-300 hover:scale-105 border border-white/10 hover:border-white/20"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-3xl opacity-80 group-hover:opacity-100 transition-opacity">
            {getContentIcon(item.type)}
          </div>
          {item.isPremium && (
            <span className="bg-gradient-secondary text-white text-xs px-3 py-1 rounded-full font-medium">
              Premium
            </span>
          )}
        </div>

        <h3 className="font-bold text-white mb-3 line-clamp-2 text-lg group-hover:text-green-400 transition-colors">
          {item.title}
        </h3>

        {item.description && (
          <p className="text-white/60 text-sm mb-4 line-clamp-3 leading-relaxed">
            {item.description}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-white/50">
          <span className="bg-white/10 px-3 py-1 rounded-full font-medium">
            {formatCategory(item.category)}
          </span>
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
        </div>

        {item.price > 0 && (
          <div className="mt-4 pt-3 border-t border-white/10">
            <div className="text-sm font-bold text-green-400">
              ${item.price.toFixed(2)}
            </div>
          </div>
        )}
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-green-400/0 via-green-400/0 to-green-400/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none"></div>
    </Link>
  );

  const breadcrumbItems = [
    { label: 'Home', href: '/dashboard' },
    { label: 'Content Library' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <TopNavBar
        title="Content Library"
        subtitle="Discover meditation content, music, and wellness resources"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Breadcrumbs items={breadcrumbItems} backTo="/dashboard" />

        {/* Filters */}
        <div className="glass rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Search
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search content..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
              />
            </div>

            {/* Content Type */}
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
              >
                <option value="">All Types</option>
                {contentTypes.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {formatCategory(category)}
                  </option>
                ))}
              </select>
            </div>

            {/* Items per page */}
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Per Page
              </label>
              <select
                value={filters.limit}
                onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
              >
                <option value={12}>12</option>
                <option value={24}>24</option>
                <option value={48}>48</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400"></div>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="text-red-400 mb-2 text-lg font-semibold">Error loading content</div>
            <p className="text-white/60 mb-6">{error}</p>
            <button
              onClick={fetchContent}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        ) : content.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-6">🔍</div>
            <h3 className="text-xl font-semibold text-white mb-3">No content found</h3>
            <p className="text-white/60">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <>
            {/* Results count */}
            <div className="mb-6 text-sm text-white/60">
              Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to {' '}
              {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of {' '}
              {pagination.totalItems} results
            </div>

            {/* Content grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
              {content.map(item => (
                <ContentCard key={item._id} item={item} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center space-x-3">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="px-4 py-2 glass border border-white/10 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5 text-white transition-all"
                >
                  Previous
                </button>

                {[...Array(pagination.totalPages)].map((_, index) => {
                  const page = index + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 border rounded-xl transition-all ${
                        page === pagination.currentPage
                          ? 'bg-green-500 text-white border-green-500 shadow-lg'
                          : 'glass border-white/10 text-white hover:bg-white/5'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-4 py-2 glass border border-white/10 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5 text-white transition-all"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ContentLibrary;
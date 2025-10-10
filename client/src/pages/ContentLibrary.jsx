import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { contentAPI } from '../api/content';
import TopNavBar from '../components/navigation/TopNavBar';
import Breadcrumbs from '../components/navigation/Breadcrumbs';
import image from '../assets/image.png';
import audio from '../assets/audio.png';
import video from '../assets/video.png';
import document from '../assets/document.png';

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
      page: 1
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
    case 'audio':
      return <img src={audio} alt="Audio" className="w-8 h-8" />;
    case 'video':
      return <img src={video} alt="Video" className="w-8 h-8" />;
    case 'image':
      return <img src={image} alt="Image" className="w-8 h-8" />;
    case 'document':
      return <img src={document} alt="Image" className="w-8 h-8" />;
    default:
      return <span className="text-2xl">📁</span>;
  }
};

  const ContentCard = ({ item }) => (
    <Link
      to={`/content/${item._id}`}
      className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-violet-100 overflow-hidden transition-all duration-300 hover:-translate-y-1 block"
    >
      <div className="p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-3xl sm:text-4xl opacity-80 group-hover:opacity-100 transition-opacity transform group-hover:scale-110 duration-300">
            {getContentIcon(item.type)}
          </div>
          {item.isPremium && (
            <span className="bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xs px-3 py-1 rounded-full font-bold shadow-md">
              Premium
            </span>
          )}
        </div>

        <h3 className="font-bold text-gray-900 mb-3 line-clamp-2 text-base sm:text-lg group-hover:text-violet-600 transition-colors">
          {item.title}
        </h3>

        {item.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
            {item.description}
          </p>
        )}

        <div className="flex items-center justify-between text-xs">
          <span className="bg-violet-100 text-violet-700 px-3 py-1 rounded-full font-bold uppercase tracking-wide">
            {formatCategory(item.category)}
          </span>
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
        </div>

        {item.price > 0 && (
          <div className="mt-4 pt-3 border-t border-violet-100">
            <div className="text-sm font-bold text-green-600">
              ${item.price.toFixed(2)}
            </div>
          </div>
        )}
      </div>
    </Link>
  );

  const breadcrumbItems = [
    { label: 'Home', href: '/dashboard' },
    { label: 'Content Library' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 pb-8">
      <TopNavBar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Breadcrumbs items={breadcrumbItems} backTo="/dashboard" />

        {/* Filters */}
        <div className="relative group mb-6 sm:mb-8 animate-fade-in">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <div className="relative bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-violet-100 shadow-lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Search content..."
                  className="w-full px-4 py-3 bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Content Type */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full px-4 py-3 bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
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
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-4 py-3 bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
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
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Per Page
                </label>
                <select
                  value={filters.limit}
                  onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                >
                  <option value={12}>12</option>
                  <option value={24}>24</option>
                  <option value={48}>48</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">😔</div>
            <div className="text-red-600 mb-2 text-xl font-bold">Error loading content</div>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={fetchContent}
              className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              Try Again
            </button>
          </div>
        ) : content.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-6">🔍</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">No content found</h3>
            <p className="text-gray-600">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <>
            {/* Results count */}
            <div className="mb-6 text-sm text-gray-600 font-medium">
              Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to {' '}
              {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of {' '}
              {pagination.totalItems} results
            </div>

            {/* Content grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 mb-8 sm:mb-12">
              {content.map(item => (
                <ContentCard key={item._id} item={item} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 sm:space-x-3">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="px-4 py-2 bg-white border border-violet-200 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-violet-50 text-gray-700 font-medium transition-all shadow-sm hover:shadow-md"
                >
                  Previous
                </button>

                {[...Array(pagination.totalPages)].map((_, index) => {
                  const page = index + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 border rounded-xl font-semibold transition-all shadow-sm hover:shadow-md ${
                        page === pagination.currentPage
                          ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white border-transparent shadow-lg'
                          : 'bg-white border-violet-200 text-gray-700 hover:bg-violet-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-4 py-2 bg-white border border-violet-200 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-violet-50 text-gray-700 font-medium transition-all shadow-sm hover:shadow-md"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ContentLibrary;
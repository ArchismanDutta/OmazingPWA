import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { getAllVideosAdmin, createVideo, updateVideo, deleteVideo, toggleVideoStatus } from '../../api/videoCarousel';

const AdminVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    order: 0,
    isActive: true
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await getAllVideosAdmin();
      setVideos(response.videos || []);
    } catch (error) {
      console.error('Failed to fetch videos:', error);
      setError('Failed to fetch videos');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingVideo) {
        await updateVideo(editingVideo._id, formData);
        setSuccess('Video updated successfully');
      } else {
        await createVideo(formData);
        setSuccess('Video added successfully');
      }

      setShowModal(false);
      setEditingVideo(null);
      setFormData({ title: '', url: '', description: '', order: 0, isActive: true });
      fetchVideos();
    } catch (error) {
      console.error('Failed to save video:', error);
      setError(error.message || 'Failed to save video');
    }
  };

  const handleEdit = (video) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      url: video.url,
      description: video.description || '',
      order: video.order,
      isActive: video.isActive
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this video?')) return;

    try {
      await deleteVideo(id);
      setSuccess('Video deleted successfully');
      fetchVideos();
    } catch (error) {
      console.error('Failed to delete video:', error);
      setError('Failed to delete video');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await toggleVideoStatus(id);
      setSuccess('Video status updated');
      fetchVideos();
    } catch (error) {
      console.error('Failed to toggle status:', error);
      setError('Failed to toggle status');
    }
  };

  const handleAddNew = () => {
    setEditingVideo(null);
    setFormData({ title: '', url: '', description: '', order: 0, isActive: true });
    setShowModal(true);
  };

  const getEmbedPreview = (video) => {
    if (video.platform === 'youtube' && video.videoId) {
      return (
        <iframe
          width="100%"
          height="150"
          src={`https://www.youtube.com/embed/${video.videoId}`}
          title={video.title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="rounded-lg"
        ></iframe>
      );
    } else if (video.platform === 'instagram') {
      return (
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg h-[150px] flex items-center justify-center">
          <span className="text-white text-4xl">📸</span>
        </div>
      );
    }
    return (
      <div className="bg-gray-700 rounded-lg h-[150px] flex items-center justify-center">
        <span className="text-gray-400 text-4xl">🎥</span>
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Video Carousel Management
            </h1>
            <p className="text-gray-400 mt-1">Add YouTube & Instagram videos to the carousel</p>
          </div>
          <button
            onClick={handleAddNew}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
          >
            + Add Video
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl">
            {success}
          </div>
        )}

        {/* Videos Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
          </div>
        ) : videos.length === 0 ? (
          <div className="bg-slate-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">🎥</div>
            <h3 className="text-xl font-semibold text-white mb-2">No Videos Yet</h3>
            <p className="text-gray-400 mb-6">Add your first video to the carousel</p>
            <button
              onClick={handleAddNew}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all"
            >
              Add Video
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <div
                key={video._id}
                className="bg-slate-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl overflow-hidden hover:border-red-500/50 transition-all group"
              >
                {/* Video Preview */}
                <div className="p-4">
                  {getEmbedPreview(video)}
                </div>

                {/* Video Info */}
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-lg font-semibold text-white line-clamp-2 flex-1">
                      {video.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      video.isActive
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                    }`}>
                      {video.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {video.description && (
                    <p className="text-sm text-gray-400 line-clamp-2">{video.description}</p>
                  )}

                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="px-2 py-1 bg-slate-700/50 rounded-full capitalize">
                      {video.platform}
                    </span>
                    <span>Order: {video.order}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleEdit(video)}
                      className="flex-1 px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleStatus(video._id)}
                      className="flex-1 px-3 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-all text-sm font-medium"
                    >
                      {video.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDelete(video._id)}
                      className="flex-1 px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 border border-gray-700 rounded-xl p-6 w-full max-w-lg">
              <h2 className="text-xl font-bold text-white mb-4">
                {editingVideo ? 'Edit Video' : 'Add New Video'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-slate-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter video title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Video URL * (YouTube or Instagram)
                  </label>
                  <input
                    type="url"
                    name="url"
                    value={formData.url}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-slate-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Paste YouTube or Instagram video URL
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 bg-slate-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Brief description (optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Order
                  </label>
                  <input
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-slate-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="0"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-red-500 bg-slate-700 border-gray-600 rounded focus:ring-red-500"
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm text-gray-300">
                    Active (visible to users)
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingVideo(null);
                      setFormData({ title: '', url: '', description: '', order: 0, isActive: true });
                    }}
                    className="flex-1 px-4 py-2 bg-slate-700 text-gray-300 rounded-lg hover:bg-slate-600 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all"
                  >
                    {editingVideo ? 'Update' : 'Add'} Video
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminVideos;

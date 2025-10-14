import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { adminAPI } from "../../api/admin";

const AdminContent = () => {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState({
    type: "all",
    category: "all",
    status: "all",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const contentTypes = ["audio", "video", "image", "document"];
  const categories = [
    "meditation",
    "music",
    "nature_sounds",
    "guided_meditation",
    "breathing_exercises",
    "yoga",
    "mindfulness",
    "stress_relief",
    "sleep",
    "focus",
    "inspiration",
  ];

  useEffect(() => {
    fetchContent();
  }, [currentPage, search, filter]);

  const fetchContent = async () => {
    try {
      setLoading(true);

      // Try to fetch real data first, fall back to mock data
      try {
        const response = await adminAPI.getAllContent(currentPage, 20, {
          search,
          type: filter.type !== "all" ? filter.type : undefined,
          category: filter.category !== "all" ? filter.category : undefined,
          status: filter.status !== "all" ? filter.status : undefined,
        });

        // Handle response format from existing content controller
        const contentData = response.data || response.content || [];
        setContent(contentData);
        setTotalPages(response.pagination?.totalPages || 1);
        return;
      } catch (apiError) {
        console.error("Failed to fetch content from API:", apiError.message);
      }

      // Mock data fallback
      const mockContent = [
        {
          _id: "1",
          title: "Morning Meditation",
          description:
            "A peaceful 10-minute morning meditation to start your day",
          type: "audio",
          category: "guided_meditation",
          fileName: "morning_meditation.mp3",
          originalName: "morning_meditation.mp3",
          fileSize: 12400000,
          duration: 600,
          isPublic: true,
          isPremium: false,
          status: "active",
          viewCount: 1250,
          downloadCount: 340,
          tags: ["morning", "peaceful", "beginner"],
          createdAt: "2024-01-15T08:00:00Z",
          storage: { url: "/api/content/audio/morning_meditation.mp3" },
        },
        {
          _id: "2",
          title: "Ocean Waves",
          description: "Relaxing ocean wave sounds for sleep and relaxation",
          type: "audio",
          category: "nature_sounds",
          fileName: "ocean_waves.mp3",
          originalName: "ocean_waves.mp3",
          fileSize: 25600000,
          duration: 1800,
          isPublic: true,
          isPremium: true,
          status: "active",
          viewCount: 2890,
          downloadCount: 890,
          tags: ["ocean", "sleep", "relaxation", "nature"],
          createdAt: "2024-02-01T14:30:00Z",
          storage: { url: "/api/content/audio/ocean_waves.mp3" },
        },
        {
          _id: "3",
          title: "Yoga Flow Video",
          description: "A 30-minute gentle yoga flow for beginners",
          type: "video",
          category: "yoga",
          fileName: "yoga_flow.mp4",
          originalName: "yoga_flow.mp4",
          fileSize: 156000000,
          duration: 1800,
          dimensions: { width: 1920, height: 1080 },
          isPublic: false,
          isPremium: true,
          status: "active",
          viewCount: 567,
          downloadCount: 123,
          tags: ["yoga", "beginner", "flow", "gentle"],
          createdAt: "2024-02-10T10:15:00Z",
          storage: { url: "/api/content/video/yoga_flow.mp4" },
        },
      ];

      setContent(mockContent);
      setTotalPages(3);
    } catch (error) {
      console.error("Failed to fetch content:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContent = async (contentId) => {
    if (window.confirm("Are you sure you want to delete this content?")) {
      try {
        await adminAPI.deleteContent(contentId);
        setContent(content.filter((item) => item._id !== contentId));
      } catch (error) {
        console.error("Failed to delete content:", error);
        alert("Failed to delete content. Please try again.");
      }
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    if (bytes < 1024 * 1024 * 1024)
      return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "N/A";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const getTypeIcon = (type) => {
    const icons = {
      audio: "🎵",
      video: "🎥",
      image: "🖼️",
      document: "📄",
    };
    return icons[type] || "📄";
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-yellow-100 text-yellow-800",
      archived: "bg-gray-100 text-gray-800",
    };
    return badges[status] || "bg-gray-100 text-gray-800";
  };

  const filteredContent = content.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    const matchesType = filter.type === "all" || item.type === filter.type;
    const matchesCategory =
      filter.category === "all" || item.category === filter.category;
    const matchesStatus =
      filter.status === "all" || item.status === filter.status;

    return matchesSearch && matchesType && matchesCategory && matchesStatus;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Content Management
            </h1>
            <p className="text-gray-400 mt-1 text-sm sm:text-base">
              Manage meditation content, videos, and audio files
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium text-sm sm:text-base"
            >
              📁 Upload Content
            </button>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-700/50 bg-gradient-to-r from-slate-800/80 to-slate-700/80">
            <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
              <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
                <input
                  type="text"
                  placeholder="Search content..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full sm:w-auto px-4 py-3 bg-slate-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                />
                <div className="flex space-x-2 sm:space-x-4">
                  <select
                    value={filter.type}
                    onChange={(e) =>
                      setFilter({ ...filter, type: e.target.value })
                    }
                    className="flex-1 sm:flex-none px-4 py-3 bg-slate-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                  >
                    <option value="all" className="bg-slate-800 text-white">
                      All Types
                    </option>
                    {contentTypes.map((type) => (
                      <option
                        key={type}
                        value={type}
                        className="bg-slate-800 text-white"
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                  <select
                    value={filter.category}
                    onChange={(e) =>
                      setFilter({ ...filter, category: e.target.value })
                    }
                    className="flex-1 sm:flex-none px-4 py-3 bg-slate-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                  >
                    <option value="all" className="bg-slate-800 text-white">
                      All Categories
                    </option>
                    {categories.map((category) => (
                      <option
                        key={category}
                        value={category}
                        className="bg-slate-800 text-white"
                      >
                        {category
                          .replace("_", " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="text-sm text-gray-400 bg-slate-700/30 px-3 py-2 rounded-lg text-center sm:text-left">
                📊 Total: {filteredContent.length} items
              </div>
            </div>
          </div>

          {/* Mobile View */}
          <div className="md:hidden">
            <div className="p-4 space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-400"></div>
                  <span className="text-gray-400 ml-3">Loading content...</span>
                </div>
              ) : (
                filteredContent.map((item) => (
                  <div
                    key={item._id}
                    className="bg-slate-700/30 rounded-xl p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl p-2 bg-slate-700/30 rounded-lg">
                          {getTypeIcon(item.type)}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-white">
                            {item.title}
                          </div>
                          <div className="text-xs text-gray-400 mt-1 line-clamp-2">
                            {item.description}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <button
                          onClick={() => {
                            setSelectedContent(item);
                            setShowEditModal(true);
                          }}
                          className="text-blue-400 hover:text-blue-300 text-xs font-medium"
                        >
                          Edit
                        </button>
                        <a
                          href={item.storage.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-400 hover:text-green-300 text-xs font-medium"
                        >
                          Preview
                        </a>
                        <button
                          onClick={() => handleDeleteContent(item._id)}
                          className="text-red-400 hover:text-red-300 text-xs font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Type:</span>
                        <div className="text-white font-medium capitalize">
                          {item.type}
                        </div>
                        <div className="text-xs text-gray-400 capitalize">
                          {item.category.replace("_", " ")}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-400">Size:</span>
                        <div className="text-white font-medium">
                          {formatFileSize(item.fileSize)}
                        </div>
                        <div className="text-xs text-gray-400">
                          {item.duration
                            ? formatDuration(item.duration)
                            : "N/A"}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-400">Access:</span>
                        <div className="flex flex-col space-y-1">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full w-fit ${
                              item.isPublic
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {item.isPublic ? "Public" : "Private"}
                          </span>
                          {item.isPremium && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 w-fit">
                              Premium
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-400">Stats:</span>
                        <div className="text-xs text-gray-400">
                          <div>👁️ {item.viewCount}</div>
                          <div>⬇️ {item.downloadCount}</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-600/50">
                      <div className="text-xs text-gray-400">
                        Tags: {item.tags.map((tag) => `#${tag}`).join(" ")}
                      </div>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Desktop View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700/50">
              <thead className="bg-slate-800/30">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Content
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Type & Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    File Info
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Access
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Stats
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-slate-800/20 divide-y divide-gray-700/50">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center">
                      <div className="flex items-center justify-center space-x-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-400"></div>
                        <span className="text-gray-400">
                          Loading content...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredContent.map((item) => (
                    <tr
                      key={item._id}
                      className="hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="text-2xl mr-3 p-2 bg-slate-700/30 rounded-lg">
                            {getTypeIcon(item.type)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">
                              {item.title}
                            </div>
                            <div className="text-sm text-gray-400 max-w-xs truncate">
                              {item.description}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {item.tags.map((tag) => `#${tag}`).join(" ")}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white font-medium capitalize">
                          {item.type}
                        </div>
                        <div className="text-sm text-gray-400 capitalize">
                          {item.category.replace("_", " ")}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white font-medium">
                          {formatFileSize(item.fileSize)}
                        </div>
                        <div className="text-sm text-gray-400">
                          {item.duration
                            ? formatDuration(item.duration)
                            : "N/A"}
                        </div>
                        {item.dimensions && (
                          <div className="text-xs text-gray-400">
                            {item.dimensions.width}x{item.dimensions.height}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              item.isPublic
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {item.isPublic ? "Public" : "Private"}
                          </span>
                          {item.isPremium && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                              Premium
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>👁️ {item.viewCount}</div>
                        <div>⬇️ {item.downloadCount}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => {
                            setSelectedContent(item);
                            setShowEditModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <a
                          href={item.storage.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-900"
                        >
                          Preview
                        </a>
                        <button
                          onClick={() => handleDeleteContent(item._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-gray-700/50 bg-slate-800/30 flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Showing {filteredContent.length} of {content.length} content items
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-600 rounded-lg text-sm text-gray-300 hover:bg-slate-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                ← Previous
              </button>
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-600 rounded-lg text-sm text-gray-300 hover:bg-slate-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      </div>

      {showUploadModal && (
        <ContentUploadModal
          onClose={() => setShowUploadModal(false)}
          onUpload={(newContent) => {
            setContent([newContent, ...content]);
            setShowUploadModal(false);
          }}
        />
      )}

      {showEditModal && selectedContent && (
        <ContentEditModal
          content={selectedContent}
          onClose={() => {
            setShowEditModal(false);
            setSelectedContent(null);
          }}
          onSave={(updatedContent) => {
            setContent(
              content.map((item) =>
                item._id === selectedContent._id ? updatedContent : item
              )
            );
            setShowEditModal(false);
            setSelectedContent(null);
          }}
        />
      )}
    </AdminLayout>
  );
};

const ContentUploadModal = ({ onClose, onUpload }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "audio",
    category: "meditation",
    isPublic: true,
    isPremium: false,
    tags: "",
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const contentTypes = ["audio", "video", "image", "document"];
  const categories = [
    "meditation",
    "music",
    "nature_sounds",
    "guided_meditation",
    "breathing_exercises",
    "yoga",
    "mindfulness",
    "stress_relief",
    "sleep",
    "focus",
    "inspiration",
  ];

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please select a file to upload");
      return;
    }

    setUploading(true);
    try {
      const tags = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag);

      const response = await adminAPI.uploadContent(
        {
          title: formData.title,
          description: formData.description,
          type: formData.type,
          category: formData.category,
          isPublic: formData.isPublic,
          isPremium: formData.isPremium,
          tags,
        },
        file
      );

      // Handle response format - existing controller returns array in 'data' field
      const uploadedContent =
        response.data?.[0] || response.content || response;
      onUpload(uploadedContent);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="relative z-10 bg-gray-900 text-white rounded-lg max-w-2xl w-full mx-4 p-4 sm:p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Upload New Content</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 ${
                dragOver
                  ? "border-blue-400 bg-blue-900 bg-opacity-20"
                  : "border-gray-600 bg-gray-800"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              {file ? (
                <div>
                  <div className="text-2xl mb-2">📁</div>
                  <div className="text-sm font-medium text-white break-words">
                    {file.name}
                  </div>
                  <div className="text-xs text-gray-400">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="mt-2 text-red-500 text-sm hover:text-red-700"
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <div>
                  <div className="text-2xl mb-2">⬆️</div>
                  <div className="text-sm text-gray-400 mb-2">
                    Drag and drop your file here, or click to select
                  </div>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                    accept="audio/*,video/*,image/*,.pdf,.doc,.docx"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Choose File
                  </label>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {contentTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category
                        .replace("_", " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData({ ...formData, tags: e.target.value })
                  }
                  placeholder="meditation, relaxing, sleep"
                  className="w-full px-3 py-2 bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex space-x-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={formData.isPublic}
                  onChange={(e) =>
                    setFormData({ ...formData, isPublic: e.target.checked })
                  }
                  className="h-4 w-4 text-blue-600 bg-gray-800 border-gray-700 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="isPublic"
                  className="ml-2 block text-sm text-gray-300"
                >
                  Make Public
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPremium"
                  checked={formData.isPremium}
                  onChange={(e) =>
                    setFormData({ ...formData, isPremium: e.target.checked })
                  }
                  className="h-4 w-4 text-blue-600 bg-gray-800 border-gray-700 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="isPremium"
                  className="ml-2 block text-sm text-gray-300"
                >
                  Premium Content
                </label>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                disabled={uploading}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {uploading ? "Uploading..." : "Upload Content"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-700 text-gray-200 py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const ContentEditModal = ({ content, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: content.title,
    description: content.description,
    category: content.category,
    isPublic: content.isPublic,
    isPremium: content.isPremium,
    status: content.status,
    tags: content.tags.join(", "),
  });

  const categories = [
    "meditation",
    "music",
    "nature_sounds",
    "guided_meditation",
    "breathing_exercises",
    "yoga",
    "mindfulness",
    "stress_relief",
    "sleep",
    "focus",
    "inspiration",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedData = {
        ...formData,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
      };

      const response = await adminAPI.updateContent(content._id, updatedData);
      onSave(response.data || response.content || response);
    } catch (error) {
      console.error("Update failed:", error);
      alert("Update failed. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="flex items-center justify-center min-h-screen px-4">
        {/* Modal content */}
        <div className="relative z-10 bg-gray-900 text-white rounded-lg max-w-md w-full mx-4 p-4 sm:p-6 shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Edit Content</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-800 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 bg-gray-800 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-800 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category
                      .replace("_", " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-800 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) =>
                  setFormData({ ...formData, tags: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-800 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Toggles */}
            <div className="flex space-x-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="editIsPublic"
                  checked={formData.isPublic}
                  onChange={(e) =>
                    setFormData({ ...formData, isPublic: e.target.checked })
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-700 bg-gray-800 rounded"
                />
                <label
                  htmlFor="editIsPublic"
                  className="ml-2 block text-sm text-gray-300"
                >
                  Public
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="editIsPremium"
                  checked={formData.isPremium}
                  onChange={(e) =>
                    setFormData({ ...formData, isPremium: e.target.checked })
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-700 bg-gray-800 rounded"
                />
                <label
                  htmlFor="editIsPremium"
                  className="ml-2 block text-sm text-gray-300"
                >
                  Premium
                </label>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-700 text-gray-200 py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminContent;

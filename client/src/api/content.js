const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');

  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

export const contentAPI = {
  // Get public content (no auth required)
  getPublicContent: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/content/public${queryString ? `?${queryString}` : ''}`);
  },

  // Get all content (auth required)
  getAllContent: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/content${queryString ? `?${queryString}` : ''}`);
  },

  // Get single content by ID
  getContentById: (id) =>
    apiRequest(`/content/${id}`),

  // Get public content by ID (no auth required)
  getPublicContentById: (id) =>
    apiRequest(`/content/public/${id}`),

  // Content categories and types
  getCategories: () => [
    'meditation',
    'music',
    'nature_sounds',
    'guided_meditation',
    'breathing_exercises',
    'yoga',
    'mindfulness',
    'stress_relief',
    'sleep',
    'focus',
    'inspiration'
  ],

  getContentTypes: () => ['audio', 'video', 'image', 'document'],

  // Search content
  searchContent: (searchTerm, filters = {}) =>
    apiRequest(`/content/public?search=${encodeURIComponent(searchTerm)}&${new URLSearchParams(filters).toString()}`),

  // Admin functions
  uploadContent: (formData) =>
    apiRequest('/content/upload', {
      method: 'POST',
      headers: {
        // Remove Content-Type to let browser set it for FormData
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    }),

  updateContent: (id, contentData) =>
    apiRequest(`/content/${id}`, {
      method: 'PUT',
      body: JSON.stringify(contentData),
    }),

  deleteContent: (id) =>
    apiRequest(`/content/${id}`, {
      method: 'DELETE',
    }),

  getContentStats: () =>
    apiRequest('/content/admin/stats'),
};

export default contentAPI;
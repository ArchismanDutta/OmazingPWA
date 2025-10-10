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

export const userAPI = {
  getUserProfile: () =>
    apiRequest('/user/profile'),

  updateUserProfile: (profileData) =>
    apiRequest('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }),

  updateMindfulnessSession: (sessionData) =>
    apiRequest('/user/mindfulness/session', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    }),

  toggleFavorite: (contentId) =>
    apiRequest('/user/favorites', {
      method: 'POST',
      body: JSON.stringify({ contentId }),
    }),

  addRecentlyPlayed: (contentId, duration) =>
    apiRequest('/user/recently-played', {
      method: 'POST',
      body: JSON.stringify({ contentId, duration }),
    }),

  clearRecentlyPlayed: () =>
    apiRequest('/user/recently-played', {
      method: 'DELETE',
    }),

  getUserStats: () =>
    apiRequest('/user/stats'),

  deleteAccount: (confirmDelete = true) =>
    apiRequest('/user/account', {
      method: 'DELETE',
      body: JSON.stringify({ confirmDelete }),
    }),
};

export default userAPI;
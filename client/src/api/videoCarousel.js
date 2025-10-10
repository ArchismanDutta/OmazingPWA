import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Get auth token
const getAuthToken = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Public API
export const getCarouselVideos = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/v1/carousel`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch carousel videos' };
  }
};

// Admin APIs
export const getAllVideosAdmin = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/v1/admin/videos`, {
      headers: getAuthToken()
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch videos' };
  }
};

export const getVideoById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/api/v1/admin/videos/${id}`, {
      headers: getAuthToken()
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch video' };
  }
};

export const createVideo = async (videoData) => {
  try {
    const response = await axios.post(`${API_URL}/api/v1/admin/videos`, videoData, {
      headers: getAuthToken()
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create video' };
  }
};

export const updateVideo = async (id, videoData) => {
  try {
    const response = await axios.put(`${API_URL}/api/v1/admin/videos/${id}`, videoData, {
      headers: getAuthToken()
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update video' };
  }
};

export const deleteVideo = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/api/v1/admin/videos/${id}`, {
      headers: getAuthToken()
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete video' };
  }
};

export const toggleVideoStatus = async (id) => {
  try {
    const response = await axios.put(`${API_URL}/api/v1/admin/videos/${id}/toggle`, {}, {
      headers: getAuthToken()
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to toggle video status' };
  }
};

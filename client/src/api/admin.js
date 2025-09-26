const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const adminAPI = {
  async getDashboardStats() {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch dashboard stats');
    }

    return response.json();
  },

  async getAllUsers(page = 1, limit = 20, search = '') {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search })
    });

    const response = await fetch(`${API_BASE_URL}/admin/users?${queryParams}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch users');
    }

    return response.json();
  },

  async getUserById(userId) {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch user');
    }

    return response.json();
  },

  async updateUser(userId, userData) {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update user');
    }

    return response.json();
  },

  async deleteUser(userId) {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete user');
    }

    return response.json();
  },

  async getAnalytics(period = '30d') {
    const response = await fetch(`${API_BASE_URL}/admin/analytics?period=${period}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch analytics');
    }

    return response.json();
  },

  async exportUsers() {
    const response = await fetch(`${API_BASE_URL}/admin/export/users`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to export users');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  },

  // Content Management APIs
  async getAllContent(page = 1, limit = 20, filters = {}) {
    // Clean up filters to remove undefined values
    const cleanFilters = {};
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        cleanFilters[key] = filters[key];
      }
    });

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...cleanFilters
    });

    const response = await fetch(`${API_BASE_URL}/content?${queryParams}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch content');
    }

    return response.json();
  },

  async uploadContent(contentData, file) {
    const formData = new FormData();
    formData.append('files', file); // Note: the existing route expects 'files' not 'file'
    formData.append('title', contentData.title);
    formData.append('description', contentData.description);
    formData.append('category', contentData.category);
    formData.append('isPublic', contentData.isPublic);
    formData.append('isPremium', contentData.isPremium);
    if (contentData.tags && contentData.tags.length > 0) {
      formData.append('tags', contentData.tags.join(','));
    }

    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/content/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload content');
    }

    return response.json();
  },

  async updateContent(contentId, contentData) {
    const response = await fetch(`${API_BASE_URL}/content/${contentId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(contentData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update content');
    }

    return response.json();
  },

  async deleteContent(contentId) {
    const response = await fetch(`${API_BASE_URL}/content/${contentId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete content');
    }

    return response.json();
  },

  async getContentStats() {
    const response = await fetch(`${API_BASE_URL}/content/admin/stats`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch content stats');
    }

    return response.json();
  },

  // File Upload APIs
  async uploadThumbnail(file) {
    const formData = new FormData();
    formData.append('thumbnail', file);

    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/admin/upload/thumbnail`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload thumbnail');
    }

    return response.json();
  },

  async uploadLessonMedia(file) {
    const formData = new FormData();
    formData.append('media', file);

    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/admin/upload/lesson-media`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload lesson media');
    }

    return response.json();
  },

  async uploadResources(files) {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('resources', file);
    });

    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/admin/upload/resources`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload resources');
    }

    return response.json();
  }
};
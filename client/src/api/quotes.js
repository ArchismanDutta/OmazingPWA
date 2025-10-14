const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const quotesAPI = {
  // Public endpoint - Get daily quote
  async getDailyQuote() {
    const response = await fetch(`${API_BASE_URL}/quotes/daily`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch daily quote');
    }

    return response.json();
  },

  // Admin endpoints
  async getAllQuotes(page = 1, limit = 50, filters = {}) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    });

    const response = await fetch(`${API_BASE_URL}/admin/quotes?${queryParams}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch quotes');
    }

    return response.json();
  },

  async getQuoteById(quoteId) {
    const response = await fetch(`${API_BASE_URL}/admin/quotes/${quoteId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch quote');
    }

    return response.json();
  },

  async createQuote(quoteData) {
    const response = await fetch(`${API_BASE_URL}/admin/quotes`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(quoteData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create quote');
    }

    return response.json();
  },

  async updateQuote(quoteId, quoteData) {
    const response = await fetch(`${API_BASE_URL}/admin/quotes/${quoteId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(quoteData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update quote');
    }

    return response.json();
  },

  async deleteQuote(quoteId) {
    const response = await fetch(`${API_BASE_URL}/admin/quotes/${quoteId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete quote');
    }

    return response.json();
  },

  async toggleQuoteStatus(quoteId) {
    const response = await fetch(`${API_BASE_URL}/admin/quotes/${quoteId}/toggle`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to toggle quote status');
    }

    return response.json();
  },

  async seedPredefinedQuotes() {
    const response = await fetch(`${API_BASE_URL}/admin/quotes/seed`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to seed quotes');
    }

    return response.json();
  },

  async getQuoteStats() {
    const response = await fetch(`${API_BASE_URL}/admin/quotes/stats`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch quote statistics');
    }

    return response.json();
  },
};

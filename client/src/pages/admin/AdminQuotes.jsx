import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { quotesAPI } from '../../api/quotes';

const AdminQuotes = () => {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingQuote, setEditingQuote] = useState(null);
  const [formData, setFormData] = useState({
    text: '',
    author: '',
    isActive: true,
    displayPriority: 5,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState(null);
  const [filterActive, setFilterActive] = useState('');

  useEffect(() => {
    fetchQuotes();
    fetchStats();
  }, [filterActive]);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (filterActive !== '') filters.isActive = filterActive;

      const response = await quotesAPI.getAllQuotes(1, 100, filters);
      setQuotes(response.data || []);
    } catch (error) {
      console.error('Failed to fetch quotes:', error);
      setError('Failed to fetch quotes');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await quotesAPI.getQuoteStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
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
      const quoteData = { ...formData };

      if (editingQuote) {
        await quotesAPI.updateQuote(editingQuote._id, quoteData);
        setSuccess('Quote updated successfully');
      } else {
        await quotesAPI.createQuote(quoteData);
        setSuccess('Quote added successfully');
      }

      setShowModal(false);
      setEditingQuote(null);
      setFormData({
        text: '',
        author: '',
        isActive: true,
        displayPriority: 5,
      });
      fetchQuotes();
      fetchStats();
    } catch (error) {
      console.error('Failed to save quote:', error);
      setError(error.message || 'Failed to save quote');
    }
  };

  const handleEdit = (quote) => {
    setEditingQuote(quote);
    setFormData({
      text: quote.text,
      author: quote.author,
      isActive: quote.isActive,
      displayPriority: quote.displayPriority || 5,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this quote?')) return;

    try {
      await quotesAPI.deleteQuote(id);
      setSuccess('Quote deleted successfully');
      fetchQuotes();
      fetchStats();
    } catch (error) {
      console.error('Failed to delete quote:', error);
      setError('Failed to delete quote');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await quotesAPI.toggleQuoteStatus(id);
      setSuccess('Quote status updated');
      fetchQuotes();
      fetchStats();
    } catch (error) {
      console.error('Failed to toggle status:', error);
      setError('Failed to toggle status');
    }
  };

  const handleAddNew = () => {
    setEditingQuote(null);
    setFormData({
      text: '',
      author: '',
      isActive: true,
      displayPriority: 5,
    });
    setShowModal(true);
  };

  const handleSeedPredefined = async () => {
    if (!confirm('This will add predefined quotes if they don\'t exist. Continue?')) return;

    try {
      const response = await quotesAPI.seedPredefinedQuotes();
      setSuccess(response.message);
      fetchQuotes();
      fetchStats();
    } catch (error) {
      console.error('Failed to seed quotes:', error);
      setError(error.message || 'Failed to seed quotes');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Quote Management
            </h1>
            <p className="text-gray-400 mt-1">Manage daily quotes displayed on the dashboard</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSeedPredefined}
              className="px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
            >
              Seed Predefined
            </button>
            <button
              onClick={handleAddNew}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
            >
              + Add Quote
            </button>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-4">
              <div className="text-gray-400 text-sm mb-1">Total Quotes</div>
              <div className="text-2xl font-bold text-white">{stats.totalQuotes}</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-xl border border-green-700/50 rounded-xl p-4">
              <div className="text-gray-400 text-sm mb-1">Active Quotes</div>
              <div className="text-2xl font-bold text-green-400">{stats.activeQuotes}</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-xl border border-blue-700/50 rounded-xl p-4">
              <div className="text-gray-400 text-sm mb-1">Custom Quotes</div>
              <div className="text-2xl font-bold text-blue-400">{stats.customQuotes}</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-xl border border-purple-700/50 rounded-xl p-4">
              <div className="text-gray-400 text-sm mb-1">Predefined</div>
              <div className="text-2xl font-bold text-purple-400">{stats.predefinedQuotes}</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-4 flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Status
            </label>
            <select
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
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

        {/* Quotes List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
          </div>
        ) : quotes.length === 0 ? (
          <div className="bg-slate-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-xl font-semibold text-white mb-2">No Quotes Yet</h3>
            <p className="text-gray-400 mb-6">Add your first quote or seed predefined quotes</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleSeedPredefined}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all"
              >
                Seed Predefined
              </button>
              <button
                onClick={handleAddNew}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all"
              >
                Add Custom Quote
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {quotes.map((quote) => (
              <div
                key={quote._id}
                className="bg-slate-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6 hover:border-red-500/50 transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="text-4xl text-gray-600">"</div>
                      <div className="flex-1">
                        <p className="text-white text-lg leading-relaxed mb-2">
                          {quote.text}
                        </p>
                        <p className="text-gray-400 text-sm font-medium">
                          — {quote.author}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        quote.isActive
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                      }`}>
                        {quote.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {quote.isPredefined && (
                        <span className="px-3 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-full text-xs font-medium">
                          Predefined
                        </span>
                      )}
                      <span className="px-3 py-1 bg-slate-700/50 text-gray-400 rounded-full text-xs">
                        Priority: {quote.displayPriority}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 min-w-[100px]">
                    <button
                      onClick={() => handleEdit(quote)}
                      className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleStatus(quote._id)}
                      className="px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-all text-sm font-medium"
                    >
                      {quote.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDelete(quote._id)}
                      className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all text-sm font-medium"
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
            <div className="bg-slate-800 border border-gray-700 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-white mb-4">
                {editingQuote ? 'Edit Quote' : 'Add New Quote'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Quote Text *
                  </label>
                  <textarea
                    name="text"
                    value={formData.text}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-4 py-2 bg-slate-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter the quote text (10-500 characters)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Author *
                  </label>
                  <input
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-slate-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter author name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Display Priority (0-10)
                  </label>
                  <input
                    type="number"
                    name="displayPriority"
                    value={formData.displayPriority}
                    onChange={handleInputChange}
                    min="0"
                    max="10"
                    className="w-full px-4 py-2 bg-slate-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
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
                    Active (quote will be shown in rotation)
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingQuote(null);
                      setFormData({
                        text: '',
                        author: '',
                        isActive: true,
                        displayPriority: 5,
                      });
                    }}
                    className="flex-1 px-4 py-2 bg-slate-700 text-gray-300 rounded-lg hover:bg-slate-600 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all"
                  >
                    {editingQuote ? 'Update' : 'Add'} Quote
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

export default AdminQuotes;

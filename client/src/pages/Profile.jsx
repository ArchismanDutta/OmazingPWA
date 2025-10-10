import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../api/user';
import TopNavBar from '../components/navigation/TopNavBar';
import Breadcrumbs from '../components/navigation/Breadcrumbs';

const ACCENT_PINK = '#f19ad2';
const ACCENT_PURPLE = '#ab4ee1';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    profile: {
      bio: '',
      location: '',
      wellnessGoals: [],
      meditationExperience: 'beginner',
      preferredSessionLength: 10,
    },
    preferences: {
      notifications: {
        email: true,
        push: true,
        dailyReminder: false,
        reminderTime: '09:00'
      },
      privacy: {
        profileVisibility: 'private',
        shareProgress: false
      },
      content: {
        favoriteCategories: [],
        language: 'en',
        contentRating: 'all'
      }
    }
  });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const [profileResponse, statsResponse] = await Promise.all([
        userAPI.getUserProfile(),
        userAPI.getUserStats()
      ]);

      setUserProfile(profileResponse.data.user);
      setStats(statsResponse.data.stats);

      setFormData({
        name: profileResponse.data.user.name || '',
        mobile: profileResponse.data.user.mobile || '',
        profile: {
          bio: profileResponse.data.user.profile?.bio || '',
          location: profileResponse.data.user.profile?.location || '',
          wellnessGoals: profileResponse.data.user.profile?.wellnessGoals || [],
          meditationExperience: profileResponse.data.user.profile?.meditationExperience || 'beginner',
          preferredSessionLength: profileResponse.data.user.profile?.preferredSessionLength || 10,
        },
        preferences: {
          notifications: {
            email: profileResponse.data.user.preferences?.notifications?.email ?? true,
            push: profileResponse.data.user.preferences?.notifications?.push ?? true,
            dailyReminder: profileResponse.data.user.preferences?.notifications?.dailyReminder ?? false,
            reminderTime: profileResponse.data.user.preferences?.notifications?.reminderTime || '09:00'
          },
          privacy: {
            profileVisibility: profileResponse.data.user.preferences?.privacy?.profileVisibility || 'private',
            shareProgress: profileResponse.data.user.preferences?.privacy?.shareProgress ?? false
          },
          content: {
            favoriteCategories: profileResponse.data.user.preferences?.content?.favoriteCategories || [],
            language: profileResponse.data.user.preferences?.content?.language || 'en',
            contentRating: profileResponse.data.user.preferences?.content?.contentRating || 'all'
          }
        }
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const keys = name.split('.');

    setFormData(prev => {
      const newData = { ...prev };
      let current = newData;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = type === 'checkbox' ? checked : value;
      return newData;
    });
  };

  const handleArrayInputChange = (field, value) => {
    const goals = value.split(',').map(goal => goal.trim()).filter(goal => goal);
    setFormData(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        [field]: goals
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await userAPI.updateUserProfile(formData);
      await fetchUserData();
      setIsEditing(false);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-white border-b px-4 sm:px-6 py-4">
        <div className="flex justify-between items-center">
          <Link to="/dashboard" className="text-blue-600 hover:text-blue-700">
            ← Back
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">Profile</h1>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700 transition-colors"
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border">

            {/* Stats Dashboard */}
            {stats && (
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Mindfulness Journey</h2>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                    <div className="text-xl font-bold text-blue-600">{stats.mindfulness.totalSessions}</div>
                    <div className="text-xs text-blue-800">Total Sessions</div>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
                    <div className="text-xl font-bold text-green-600">{stats.mindfulness.totalMinutes}</div>
                    <div className="text-xs text-green-800">Minutes Meditated</div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
                    <div className="text-xl font-bold text-purple-600">{stats.mindfulness.currentStreak}</div>
                    <div className="text-xs text-purple-800">Current Streak</div>
                  </div>
                  <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg">
                    <div className="text-xl font-bold text-orange-600">Level {stats.mindfulness.level}</div>
                    <div className="text-xs text-orange-800">Mindfulness Level</div>
                  </div>
                </div>
              </div>
            )}

            {/* Profile Form */}
            <div className="p-4">
              <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Mobile</label>
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                    />
                  </div>
                </div>
              </div>

              {/* Profile Details */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Bio</label>
                    <textarea
                      name="profile.bio"
                      value={formData.profile.bio}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      rows={3}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                      placeholder="Tell us about your mindfulness journey..."
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Location</label>
                      <input
                        type="text"
                        name="profile.location"
                        value={formData.profile.location}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Meditation Experience</label>
                      <select
                        name="profile.meditationExperience"
                        value={formData.profile.meditationExperience}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Wellness Goals (comma-separated)</label>
                    <input
                      type="text"
                      value={formData.profile.wellnessGoals.join(', ')}
                      onChange={(e) => handleArrayInputChange('wellnessGoals', e.target.value)}
                      disabled={!isEditing}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                      placeholder="e.g., stress reduction, better sleep, mindfulness"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Preferred Session Length (minutes)</label>
                    <input
                      type="number"
                      name="profile.preferredSessionLength"
                      value={formData.profile.preferredSessionLength}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      min="5"
                      max="60"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                    />
                  </div>
                </div>
              </div>

              {/* Preferences */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Preferences</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-md font-medium text-gray-800">Notifications</h4>
                    <div className="mt-2 space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="preferences.notifications.email"
                          checked={formData.preferences.notifications.email}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Email notifications</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="preferences.notifications.push"
                          checked={formData.preferences.notifications.push}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Push notifications</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="preferences.notifications.dailyReminder"
                          checked={formData.preferences.notifications.dailyReminder}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Daily meditation reminder</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </form>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Profile;

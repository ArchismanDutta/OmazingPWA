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
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">
        <TopNavBar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto"></div>
              <div
                className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-400 rounded-full animate-spin mx-auto"
                style={{ animationDirection: 'reverse', animationDuration: '1s' }}
              />
            </div>
            <p className="mt-6 text-violet-600 font-medium">Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">
        <TopNavBar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-xl">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 pb-24 md:pb-8">
      <TopNavBar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-10">
        <div className="bg-white rounded-2xl shadow-lg border border-violet-100 overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-5 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500">
            <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="px-5 py-2 rounded-xl text-white font-semibold shadow-lg transition-all duration-300 hover:-translate-y-0.5"
              style={{
                background: isEditing ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.95)',
                color: isEditing ? '#fff' : ACCENT_PURPLE,
                border: isEditing ? '2px solid rgba(255, 255, 255, 0.5)' : 'none'
              }}
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {/* Stats Dashboard */}
          {stats && (
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r"
                 style={{ background: `linear-gradient(90deg, #f8e3f8 10%, #f5d7f8 100%)` }}>
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Your Mindfulness Journey</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border border-[#f19ad2] p-4 rounded-lg shadow" >
                  <div className="text-xl font-bold" style={{ color: ACCENT_PURPLE }}>
                    {stats.mindfulness.totalSessions}
                  </div>
                  <div className="text-xs text-[#ab4ee1]">Total Sessions</div>
                </div>
                <div className="bg-white border border-[#f19ad2] p-4 rounded-lg shadow" >
                  <div className="text-xl font-bold" style={{ color: ACCENT_PINK }}>
                    {stats.mindfulness.totalMinutes}
                  </div>
                  <div className="text-xs" style={{ color: ACCENT_PINK }}>Minutes Meditated</div>
                </div>
                <div className="bg-white border border-[#f19ad2] p-4 rounded-lg shadow">
                  <div className="text-xl font-bold" style={{ color: ACCENT_PURPLE }}>
                    {stats.mindfulness.currentStreak}
                  </div>
                  <div className="text-xs text-[#ab4ee1]">Current Streak</div>
                </div>
                <div className="bg-white border border-[#ab4ee1] p-4 rounded-lg shadow">
                  <div className="text-xl font-bold" style={{ color: ACCENT_PURPLE }}>
                    Level {stats.mindfulness.level}
                  </div>
                  <div className="text-xs" style={{ color: ACCENT_PURPLE }}>Mindfulness Level</div>
                </div>
              </div>
            </div>
          )}

          {/* Profile Form */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ab4ee1] focus:border-[#ab4ee1] disabled:bg-gray-50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Mobile</label>
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ab4ee1] focus:border-[#ab4ee1] disabled:bg-gray-50 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Profile Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Profile Details</h3>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Bio</label>
                    <textarea
                      name="profile.bio"
                      value={formData.profile.bio}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ab4ee1] focus:border-[#ab4ee1] disabled:bg-gray-50 transition-all"
                      placeholder="Tell us about your mindfulness journey..."
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Location</label>
                      <input
                        type="text"
                        name="profile.location"
                        value={formData.profile.location}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ab4ee1] focus:border-[#ab4ee1] disabled:bg-gray-50 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Meditation Experience</label>
                      <select
                        name="profile.meditationExperience"
                        value={formData.profile.meditationExperience}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ab4ee1] focus:border-[#ab4ee1] disabled:bg-gray-50 transition-all"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Wellness Goals (comma-separated)</label>
                    <input
                      type="text"
                      value={formData.profile.wellnessGoals.join(', ')}
                      onChange={(e) => handleArrayInputChange('wellnessGoals', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ab4ee1] focus:border-[#ab4ee1] disabled:bg-gray-50 transition-all"
                      placeholder="e.g., stress reduction, better sleep, mindfulness"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Preferred Session Length (minutes)</label>
                    <input
                      type="number"
                      name="profile.preferredSessionLength"
                      value={formData.profile.preferredSessionLength}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      min="5"
                      max="60"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ab4ee1] focus:border-[#ab4ee1] disabled:bg-gray-50 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Preferences */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Preferences</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-md font-medium text-[#ab4ee1]">Notifications</h4>
                    <div className="mt-2 space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="preferences.notifications.email"
                          checked={formData.preferences.notifications.email}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="rounded border-gray-400 text-[#ab4ee1] focus:ring-[#ab4ee1]"
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
                          className="rounded border-gray-400 text-[#ab4ee1] focus:ring-[#ab4ee1]"
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
                          className="rounded border-gray-400 text-[#ab4ee1] focus:ring-[#ab4ee1]"
                        />
                        <span className="ml-2 text-sm text-gray-700">Daily meditation reminder</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              {isEditing && (
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-[#ab4ee1] text-[#ab4ee1] rounded-md font-semibold bg-white hover:bg-[#f19ad2]/20 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      background: ACCENT_PURPLE,
                      color: "#fff",
                      border: "none"
                    }}
                    className="px-4 py-2 rounded-md font-semibold shadow hover:opacity-90"
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
  );
};

export default Profile;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../api/user';
import TopNavBar from '../components/navigation/TopNavBar';
import Breadcrumbs from '../components/navigation/Breadcrumbs';

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
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-400 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
          </div>
          <p className="mt-6 text-violet-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-xl max-w-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 pb-8">
      {/* Mobile Header */}
      <div className="bg-white border-b border-violet-100 px-4 sm:px-6 py-4 shadow-sm">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <Link to="/dashboard" className="text-violet-600 hover:text-violet-700 font-semibold flex items-center space-x-1">
            <span>←</span>
            <span>Back</span>
          </Link>
          <h1 className="text-lg font-bold text-gray-900">Your Profile</h1>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg ${
              isEditing 
                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                : 'bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700'
            }`}
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Profile Header Card */}
          <div className="relative group animate-fade-in">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div className="relative bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-violet-100 shadow-lg">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-3xl sm:text-4xl font-bold shadow-xl">
                  {formData.name.charAt(0).toUpperCase() || '🧘'}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{formData.name || 'User'}</h2>
                  <p className="text-gray-600">{user?.email}</p>
                  {formData.profile.location && (
                    <p className="text-sm text-gray-500 mt-1">📍 {formData.profile.location}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Dashboard */}
          {stats && (
            <div className="relative group animate-fade-in">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-violet-100 shadow-lg">
                <div className="flex items-center space-x-3 mb-6">
                  <span className="text-2xl">✨</span>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Your Mindfulness Journey</h3>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-5 rounded-xl border border-blue-100">
                    <div className="text-3xl font-bold text-blue-600 mb-1">{stats.mindfulness.totalSessions}</div>
                    <div className="text-sm font-medium text-blue-800">Total Sessions</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl border border-green-100">
                    <div className="text-3xl font-bold text-green-600 mb-1">{stats.mindfulness.totalMinutes}</div>
                    <div className="text-sm font-medium text-green-800">Minutes</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-5 rounded-xl border border-purple-100">
                    <div className="text-3xl font-bold text-purple-600 mb-1">{stats.mindfulness.currentStreak}</div>
                    <div className="text-sm font-medium text-purple-800">Day Streak</div>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-5 rounded-xl border border-orange-100">
                    <div className="text-3xl font-bold text-orange-600 mb-1">Level {stats.mindfulness.level}</div>
                    <div className="text-sm font-medium text-orange-800">Progress</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Profile Form */}
          <div className="relative group animate-fade-in">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div className="relative bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-violet-100 shadow-lg">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information */}
                <div>
                  <div className="flex items-center space-x-3 mb-6">
                    <span className="text-2xl">👤</span>
                    <h3 className="text-xl font-bold text-gray-900">Basic Information</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Mobile</label>
                      <input
                        type="tel"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Profile Details */}
                <div>
                  <div className="flex items-center space-x-3 mb-6">
                    <span className="text-2xl">🧘</span>
                    <h3 className="text-xl font-bold text-gray-900">Meditation Profile</h3>
                  </div>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Bio</label>
                      <textarea
                        name="profile.bio"
                        value={formData.profile.bio}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        rows={4}
                        className="w-full px-4 py-3 bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all resize-none"
                        placeholder="Tell us about your mindfulness journey..."
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Location</label>
                        <input
                          type="text"
                          name="profile.location"
                          value={formData.profile.location}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full px-4 py-3 bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Experience Level</label>
                        <select
                          name="profile.meditationExperience"
                          value={formData.profile.meditationExperience}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full px-4 py-3 bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                        >
                          <option value="beginner">🌱 Beginner</option>
                          <option value="intermediate">🌿 Intermediate</option>
                          <option value="advanced">🌳 Advanced</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Wellness Goals</label>
                      <input
                        type="text"
                        value={formData.profile.wellnessGoals.join(', ')}
                        onChange={(e) => handleArrayInputChange('wellnessGoals', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                        placeholder="e.g., stress reduction, better sleep, mindfulness"
                      />
                      <p className="text-xs text-gray-500 mt-2">Separate goals with commas</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Preferred Session Length</label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="range"
                          name="profile.preferredSessionLength"
                          value={formData.profile.preferredSessionLength}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          min="5"
                          max="60"
                          step="5"
                          className="flex-1 h-2 bg-violet-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
                        />
                        <span className="text-lg font-bold text-violet-600 min-w-[4rem]">
                          {formData.profile.preferredSessionLength} min
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preferences */}
                <div>
                  <div className="flex items-center space-x-3 mb-6">
                    <span className="text-2xl">⚙️</span>
                    <h3 className="text-xl font-bold text-gray-900">Preferences</h3>
                  </div>
                  <div className="space-y-4 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-5 border border-violet-200">
                    <h4 className="text-md font-bold text-gray-800 mb-3">Notifications</h4>
                    <label className="flex items-center space-x-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        name="preferences.notifications.email"
                        checked={formData.preferences.notifications.email}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-5 h-5 rounded border-violet-300 text-violet-600 focus:ring-violet-500 disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Email notifications</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        name="preferences.notifications.push"
                        checked={formData.preferences.notifications.push}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-5 h-5 rounded border-violet-300 text-violet-600 focus:ring-violet-500 disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Push notifications</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        name="preferences.notifications.dailyReminder"
                        checked={formData.preferences.notifications.dailyReminder}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-5 h-5 rounded border-violet-300 text-violet-600 focus:ring-violet-500 disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Daily meditation reminder</span>
                    </label>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t border-violet-200">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-3 border-2 border-violet-200 rounded-xl text-gray-700 font-bold hover:bg-violet-50 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
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
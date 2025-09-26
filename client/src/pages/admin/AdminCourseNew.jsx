import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { coursesAPI } from '../../api/courses';
import { adminAPI } from '../../api/admin';
import AdminLayout from '../../components/admin/AdminLayout';

const AdminCourseNew = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);

  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    instructor: {
      name: '',
      bio: '',
      image: '',
      credentials: []
    },
    thumbnail: '',
    category: 'mindfulness_basics',
    level: 'beginner',
    language: 'en',
    tags: [],
    pricing: {
      type: 'free',
      amount: 0,
      currency: 'USD',
      discountPrice: null,
      subscriptionRequired: false
    },
    requirements: [],
    whatYouWillLearn: [],
    targetAudience: [],
    settings: {
      allowDownloads: false,
      allowDiscussions: true,
      autoEnroll: false,
      certificateEnabled: true
    }
  });

  const [errors, setErrors] = useState({});
  const [newTag, setNewTag] = useState('');
  const [newRequirement, setNewRequirement] = useState('');
  const [newLearning, setNewLearning] = useState('');
  const [newAudience, setNewAudience] = useState('');
  const [newCredential, setNewCredential] = useState('');

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setCourseData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setCourseData(prev => ({ ...prev, [field]: value }));
    }

    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleThumbnailUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setUploadingThumbnail(true);
      const response = await adminAPI.uploadThumbnail(file);
      setCourseData(prev => ({ ...prev, thumbnail: response.data.url }));
    } catch (error) {
      console.error('Failed to upload thumbnail:', error);
      alert('Failed to upload thumbnail: ' + error.message);
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const addToArray = (field, value, setter) => {
    if (value.trim()) {
      if (field === 'instructor.credentials') {
        handleInputChange('instructor.credentials', [...courseData.instructor.credentials, value.trim()]);
      } else {
        setCourseData(prev => ({
          ...prev,
          [field]: [...prev[field], value.trim()]
        }));
      }
      setter('');
    }
  };

  const removeFromArray = (field, index) => {
    if (field === 'instructor.credentials') {
      const newCredentials = courseData.instructor.credentials.filter((_, i) => i !== index);
      handleInputChange('instructor.credentials', newCredentials);
    } else {
      setCourseData(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!courseData.title.trim()) newErrors.title = 'Title is required';
    if (!courseData.description.trim()) newErrors.description = 'Description is required';
    if (!courseData.instructor.name.trim()) newErrors['instructor.name'] = 'Instructor name is required';
    if (!courseData.thumbnail) newErrors.thumbnail = 'Thumbnail is required';
    if (courseData.pricing.type === 'paid' && (!courseData.pricing.amount || courseData.pricing.amount <= 0)) {
      newErrors['pricing.amount'] = 'Price must be greater than 0 for paid courses';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      await coursesAPI.admin.createCourse(courseData);
      navigate('/admin/courses');
    } catch (error) {
      console.error('Failed to create course:', error);
      alert('Failed to create course: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Create New Course</h1>
          <p className="text-gray-400 mt-1">Fill in the details to create a new course</p>
        </div>
        <button
          onClick={() => navigate('/admin/courses')}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-red-500/20">
          <h2 className="text-xl font-semibold text-white mb-4">Basic Information</h2>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Course Title *</label>
              <input
                type="text"
                value={courseData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`w-full px-3 py-2 bg-slate-700/50 border rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                  errors.title ? 'border-red-500' : 'border-slate-600'
                }`}
                placeholder="Enter course title"
                maxLength={200}
              />
              {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Short Description</label>
              <input
                type="text"
                value={courseData.shortDescription}
                onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Brief description for course listings"
                maxLength={300}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Full Description *</label>
              <textarea
                value={courseData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className={`w-full px-3 py-2 bg-slate-700/50 border rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                  errors.description ? 'border-red-500' : 'border-slate-600'
                }`}
                placeholder="Detailed course description"
                maxLength={2000}
              />
              {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category *</label>
                <select
                  value={courseData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="mindfulness_basics">Mindfulness Basics</option>
                  <option value="stress_management">Stress Management</option>
                  <option value="sleep_meditation">Sleep Meditation</option>
                  <option value="anxiety_relief">Anxiety Relief</option>
                  <option value="focus_concentration">Focus & Concentration</option>
                  <option value="emotional_wellness">Emotional Wellness</option>
                  <option value="relationships">Relationships</option>
                  <option value="self_compassion">Self Compassion</option>
                  <option value="advanced_practice">Advanced Practice</option>
                  <option value="workplace_wellness">Workplace Wellness</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Level *</label>
                <select
                  value={courseData.level}
                  onChange={(e) => handleInputChange('level', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Language</label>
                <select
                  value={courseData.language}
                  onChange={(e) => handleInputChange('language', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Thumbnail */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-red-500/20">
          <h2 className="text-xl font-semibold text-white mb-4">Course Thumbnail *</h2>

          <div className="space-y-4">
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbnailUpload}
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              {uploadingThumbnail && <p className="text-blue-400 text-sm mt-1">Uploading...</p>}
              {errors.thumbnail && <p className="text-red-400 text-sm mt-1">{errors.thumbnail}</p>}
            </div>

            {courseData.thumbnail && (
              <div className="mt-4">
                <img
                  src={courseData.thumbnail}
                  alt="Course thumbnail preview"
                  className="w-64 h-36 object-cover rounded-lg border border-slate-600"
                />
              </div>
            )}
          </div>
        </div>

        {/* Instructor */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-red-500/20">
          <h2 className="text-xl font-semibold text-white mb-4">Instructor Information</h2>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Instructor Name *</label>
              <input
                type="text"
                value={courseData.instructor.name}
                onChange={(e) => handleInputChange('instructor.name', e.target.value)}
                className={`w-full px-3 py-2 bg-slate-700/50 border rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                  errors['instructor.name'] ? 'border-red-500' : 'border-slate-600'
                }`}
                placeholder="Enter instructor name"
              />
              {errors['instructor.name'] && <p className="text-red-400 text-sm mt-1">{errors['instructor.name']}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Instructor Bio</label>
              <textarea
                value={courseData.instructor.bio}
                onChange={(e) => handleInputChange('instructor.bio', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Brief biography of the instructor"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Instructor Image URL</label>
              <input
                type="url"
                value={courseData.instructor.image}
                onChange={(e) => handleInputChange('instructor.image', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="https://example.com/instructor-photo.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Credentials</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newCredential}
                  onChange={(e) => setNewCredential(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter credential"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('instructor.credentials', newCredential, setNewCredential))}
                />
                <button
                  type="button"
                  onClick={() => addToArray('instructor.credentials', newCredential, setNewCredential)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {courseData.instructor.credentials.map((credential, index) => (
                  <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-slate-700 text-white">
                    {credential}
                    <button
                      type="button"
                      onClick={() => removeFromArray('instructor.credentials', index)}
                      className="ml-2 text-red-400 hover:text-red-300"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-red-500/20">
          <h2 className="text-xl font-semibold text-white mb-4">Pricing</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Pricing Type</label>
              <select
                value={courseData.pricing.type}
                onChange={(e) => handleInputChange('pricing.type', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="free">Free</option>
                <option value="paid">Paid</option>
                <option value="premium">Premium Only</option>
              </select>
            </div>

            {courseData.pricing.type === 'paid' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Price *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={courseData.pricing.amount}
                    onChange={(e) => handleInputChange('pricing.amount', parseFloat(e.target.value) || 0)}
                    className={`w-full px-3 py-2 bg-slate-700/50 border rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                      errors['pricing.amount'] ? 'border-red-500' : 'border-slate-600'
                    }`}
                    placeholder="0.00"
                  />
                  {errors['pricing.amount'] && <p className="text-red-400 text-sm mt-1">{errors['pricing.amount']}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Discount Price</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={courseData.pricing.discountPrice || ''}
                    onChange={(e) => handleInputChange('pricing.discountPrice', parseFloat(e.target.value) || null)}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Optional discount price"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Currency</label>
                  <select
                    value={courseData.pricing.currency}
                    onChange={(e) => handleInputChange('pricing.currency', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
              </>
            )}

            <div className="flex items-center">
              <input
                type="checkbox"
                id="subscriptionRequired"
                checked={courseData.pricing.subscriptionRequired}
                onChange={(e) => handleInputChange('pricing.subscriptionRequired', e.target.checked)}
                className="w-4 h-4 text-red-600 bg-slate-700 border-slate-600 rounded focus:ring-red-500"
              />
              <label htmlFor="subscriptionRequired" className="ml-2 text-sm text-gray-300">
                Requires Premium Subscription
              </label>
            </div>
          </div>
        </div>

        {/* Course Details */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-red-500/20">
          <h2 className="text-xl font-semibold text-white mb-4">Course Details</h2>

          <div className="space-y-6">
            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter tag"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('tags', newTag, setNewTag))}
                />
                <button
                  type="button"
                  onClick={() => addToArray('tags', newTag, setNewTag)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {courseData.tags.map((tag, index) => (
                  <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-slate-700 text-white">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeFromArray('tags', index)}
                      className="ml-2 text-red-400 hover:text-red-300"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Requirements */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Requirements</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newRequirement}
                  onChange={(e) => setNewRequirement(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter requirement"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('requirements', newRequirement, setNewRequirement))}
                />
                <button
                  type="button"
                  onClick={() => addToArray('requirements', newRequirement, setNewRequirement)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="space-y-1">
                {courseData.requirements.map((req, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-slate-700/30 rounded">
                    <span className="text-white text-sm">{req}</span>
                    <button
                      type="button"
                      onClick={() => removeFromArray('requirements', index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* What You Will Learn */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">What You Will Learn</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newLearning}
                  onChange={(e) => setNewLearning(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter learning outcome"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('whatYouWillLearn', newLearning, setNewLearning))}
                />
                <button
                  type="button"
                  onClick={() => addToArray('whatYouWillLearn', newLearning, setNewLearning)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="space-y-1">
                {courseData.whatYouWillLearn.map((learning, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-slate-700/30 rounded">
                    <span className="text-white text-sm">{learning}</span>
                    <button
                      type="button"
                      onClick={() => removeFromArray('whatYouWillLearn', index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Target Audience */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Target Audience</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newAudience}
                  onChange={(e) => setNewAudience(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter target audience"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('targetAudience', newAudience, setNewAudience))}
                />
                <button
                  type="button"
                  onClick={() => addToArray('targetAudience', newAudience, setNewAudience)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="space-y-1">
                {courseData.targetAudience.map((audience, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-slate-700/30 rounded">
                    <span className="text-white text-sm">{audience}</span>
                    <button
                      type="button"
                      onClick={() => removeFromArray('targetAudience', index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Course Settings */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-red-500/20">
          <h2 className="text-xl font-semibold text-white mb-4">Course Settings</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="allowDownloads"
                checked={courseData.settings.allowDownloads}
                onChange={(e) => handleInputChange('settings.allowDownloads', e.target.checked)}
                className="w-4 h-4 text-red-600 bg-slate-700 border-slate-600 rounded focus:ring-red-500"
              />
              <label htmlFor="allowDownloads" className="ml-2 text-sm text-gray-300">
                Allow Downloads
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="allowDiscussions"
                checked={courseData.settings.allowDiscussions}
                onChange={(e) => handleInputChange('settings.allowDiscussions', e.target.checked)}
                className="w-4 h-4 text-red-600 bg-slate-700 border-slate-600 rounded focus:ring-red-500"
              />
              <label htmlFor="allowDiscussions" className="ml-2 text-sm text-gray-300">
                Allow Discussions
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoEnroll"
                checked={courseData.settings.autoEnroll}
                onChange={(e) => handleInputChange('settings.autoEnroll', e.target.checked)}
                className="w-4 h-4 text-red-600 bg-slate-700 border-slate-600 rounded focus:ring-red-500"
              />
              <label htmlFor="autoEnroll" className="ml-2 text-sm text-gray-300">
                Auto Enroll New Users
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="certificateEnabled"
                checked={courseData.settings.certificateEnabled}
                onChange={(e) => handleInputChange('settings.certificateEnabled', e.target.checked)}
                className="w-4 h-4 text-red-600 bg-slate-700 border-slate-600 rounded focus:ring-red-500"
              />
              <label htmlFor="certificateEnabled" className="ml-2 text-sm text-gray-300">
                Enable Certificate
              </label>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Creating...' : 'Create Course'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/courses')}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
      </div>
    </AdminLayout>
  );
};

export default AdminCourseNew;
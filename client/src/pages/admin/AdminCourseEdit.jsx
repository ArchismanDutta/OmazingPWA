import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { coursesAPI, courseHelpers } from '../../api/courses';
import { adminAPI } from '../../api/admin';
import AdminLayout from '../../components/admin/AdminLayout';

const AdminCourseEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('details'); // details, modules, analytics

  // Module/Lesson management
  const [editingModule, setEditingModule] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState(null);

  // Form states
  const [moduleForm, setModuleForm] = useState({ title: '', description: '', order: 1 });
  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    content: {
      type: 'video',
      url: '',
      text: '',
      quiz: { questions: [], passingScore: 70 }
    },
    duration: 0,
    order: 1,
    isPreview: false,
    resources: []
  });

  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetchCourse();
  }, [id]);

  useEffect(() => {
    if (activeTab === 'analytics') {
      fetchAnalytics();
    }
  }, [activeTab, id]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await coursesAPI.admin.getCourseById(id);
      setCourse(response.data);
    } catch (error) {
      console.error('Failed to fetch course:', error);
      navigate('/admin/courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await coursesAPI.admin.getCourseAnalytics(id);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  const handleCourseUpdate = async (updates) => {
    try {
      setSaving(true);
      await coursesAPI.admin.updateCourse(id, updates);
      setCourse(prev => ({ ...prev, ...updates }));
    } catch (error) {
      console.error('Failed to update course:', error);
      alert('Failed to update course: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (action) => {
    try {
      if (action === 'publish') {
        await coursesAPI.admin.publishCourse(id);
        setCourse(prev => ({ ...prev, status: 'published', publishedAt: new Date() }));
      } else if (action === 'archive') {
        await coursesAPI.admin.archiveCourse(id);
        setCourse(prev => ({ ...prev, status: 'archived' }));
      }
    } catch (error) {
      console.error(`Failed to ${action} course:`, error);
      alert(`Failed to ${action} course: ` + error.message);
    }
  };

  // Module Management
  const handleAddModule = async () => {
    try {
      const response = await coursesAPI.admin.addModule(id, moduleForm);
      setCourse(prev => ({
        ...prev,
        modules: [...prev.modules, response.data]
      }));
      setModuleForm({ title: '', description: '', order: course.modules.length + 2 });
      setShowModuleForm(false);
    } catch (error) {
      console.error('Failed to add module:', error);
      alert('Failed to add module: ' + error.message);
    }
  };

  const handleUpdateModule = async (moduleId, updates) => {
    try {
      await coursesAPI.admin.updateModule(id, moduleId, updates);
      setCourse(prev => ({
        ...prev,
        modules: prev.modules.map(m => m._id === moduleId ? { ...m, ...updates } : m)
      }));
      setEditingModule(null);
    } catch (error) {
      console.error('Failed to update module:', error);
      alert('Failed to update module: ' + error.message);
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (window.confirm('Are you sure you want to delete this module?')) {
      try {
        await coursesAPI.admin.deleteModule(id, moduleId);
        setCourse(prev => ({
          ...prev,
          modules: prev.modules.filter(m => m._id !== moduleId)
        }));
      } catch (error) {
        console.error('Failed to delete module:', error);
        alert('Failed to delete module: ' + error.message);
      }
    }
  };

  // Lesson Management
  const handleMediaUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setUploadingMedia(true);
      const response = await adminAPI.uploadLessonMedia(file);
      setLessonForm(prev => ({
        ...prev,
        content: {
          ...prev.content,
          url: response.data.url
        }
      }));
    } catch (error) {
      console.error('Failed to upload media:', error);
      alert('Failed to upload media: ' + error.message);
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleAddLesson = async (moduleId) => {
    try {
      const response = await coursesAPI.admin.addLesson(id, moduleId, lessonForm);
      setCourse(prev => ({
        ...prev,
        modules: prev.modules.map(m =>
          m._id === moduleId
            ? { ...m, lessons: [...m.lessons, response.data] }
            : m
        )
      }));
      setLessonForm({
        title: '',
        description: '',
        content: { type: 'video', url: '', text: '', quiz: { questions: [], passingScore: 70 } },
        duration: 0,
        order: 1,
        isPreview: false,
        resources: []
      });
      setShowLessonForm(false);
      setSelectedModuleId(null);
    } catch (error) {
      console.error('Failed to add lesson:', error);
      alert('Failed to add lesson: ' + error.message);
    }
  };

  const handleUpdateLesson = async (moduleId, lessonId, updates) => {
    try {
      await coursesAPI.admin.updateLesson(id, moduleId, lessonId, updates);
      setCourse(prev => ({
        ...prev,
        modules: prev.modules.map(m =>
          m._id === moduleId
            ? {
                ...m,
                lessons: m.lessons.map(l => l._id === lessonId ? { ...l, ...updates } : l)
              }
            : m
        )
      }));
      setEditingLesson(null);
    } catch (error) {
      console.error('Failed to update lesson:', error);
      alert('Failed to update lesson: ' + error.message);
    }
  };

  const handleDeleteLesson = async (moduleId, lessonId) => {
    if (window.confirm('Are you sure you want to delete this lesson?')) {
      try {
        await coursesAPI.admin.deleteLesson(id, moduleId, lessonId);
        setCourse(prev => ({
          ...prev,
          modules: prev.modules.map(m =>
            m._id === moduleId
              ? { ...m, lessons: m.lessons.filter(l => l._id !== lessonId) }
              : m
          )
        }));
      } catch (error) {
        console.error('Failed to delete lesson:', error);
        alert('Failed to delete lesson: ' + error.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-white">Course not found</h2>
        <button
          onClick={() => navigate('/admin/courses')}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Back to Courses
        </button>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{course.title}</h1>
          <div className="flex items-center space-x-4 mt-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${courseHelpers.getStatusBadgeColor(course.status)}`}>
              {course.status}
            </span>
            <span className="text-gray-400 text-sm">
              {course.metrics?.enrollmentCount || 0} enrolled
            </span>
            <span className="text-gray-400 text-sm">
              {course.modules?.length || 0} modules
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          {course.status === 'draft' && (
            <button
              onClick={() => handleStatusChange('publish')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Publish
            </button>
          )}
          {course.status === 'published' && (
            <button
              onClick={() => handleStatusChange('archive')}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Archive
            </button>
          )}
          <button
            onClick={() => navigate('/admin/courses')}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Back
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6">
        {['details', 'modules', 'analytics'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-red-500 text-white'
                : 'bg-slate-800/50 text-gray-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'details' && (
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-red-500/20">
          <h2 className="text-xl font-semibold text-white mb-4">Course Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />

              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-medium text-gray-300">Instructor</h3>
                  <p className="text-white">{course.instructor?.name}</p>
                  {course.instructor?.bio && (
                    <p className="text-gray-400 text-sm mt-1">{course.instructor.bio}</p>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-300">Category & Level</h3>
                  <div className="flex gap-2 mt-1">
                    <span className="px-2 py-1 bg-slate-700 text-white text-xs rounded">
                      {courseHelpers.formatCategory(course.category)}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded ${courseHelpers.getLevelColor(course.level)} bg-slate-700`}>
                      {course.level}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-300">Pricing</h3>
                  <p className="text-white">{courseHelpers.getPricingDisplay(course.pricing)}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-300">Description</h3>
                <p className="text-white text-sm leading-relaxed">{course.description}</p>
              </div>

              {course.whatYouWillLearn?.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-300 mb-2">What You Will Learn</h3>
                  <ul className="space-y-1">
                    {course.whatYouWillLearn.map((item, index) => (
                      <li key={index} className="text-white text-sm flex items-start">
                        <span className="text-green-400 mr-2">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {course.requirements?.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-300 mb-2">Requirements</h3>
                  <ul className="space-y-1">
                    {course.requirements.map((req, index) => (
                      <li key={index} className="text-white text-sm flex items-start">
                        <span className="text-red-400 mr-2">•</span>
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {course.tags?.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-300 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {course.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-slate-700 text-white text-xs rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'modules' && (
        <div className="space-y-6">
          {/* Add Module Button */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Course Modules</h2>
            <button
              onClick={() => {
                setModuleForm({ title: '', description: '', order: course.modules.length + 1 });
                setShowModuleForm(true);
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Add Module
            </button>
          </div>

          {/* Add Module Form */}
          {showModuleForm && (
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-red-500/20">
              <h3 className="text-lg font-semibold text-white mb-4">Add New Module</h3>
              <div className="grid grid-cols-1 gap-4">
                <input
                  type="text"
                  placeholder="Module title"
                  value={moduleForm.title}
                  onChange={(e) => setModuleForm(prev => ({ ...prev, title: e.target.value }))}
                  className="px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <textarea
                  placeholder="Module description"
                  value={moduleForm.description}
                  onChange={(e) => setModuleForm(prev => ({ ...prev, description: e.target.value }))}
                  className="px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  rows={3}
                />
                <input
                  type="number"
                  placeholder="Order"
                  value={moduleForm.order}
                  onChange={(e) => setModuleForm(prev => ({ ...prev, order: parseInt(e.target.value) }))}
                  className="px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddModule}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Add Module
                  </button>
                  <button
                    onClick={() => setShowModuleForm(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modules List */}
          {course.modules?.map((module, moduleIndex) => (
            <div key={module._id} className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-red-500/20 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{module.title}</h3>
                    <p className="text-gray-400 text-sm">{module.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                      <span>{module.lessons?.length || 0} lessons</span>
                      <span>Order: {module.order}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setLessonForm({
                          title: '',
                          description: '',
                          content: { type: 'video', url: '', text: '', quiz: { questions: [], passingScore: 70 } },
                          duration: 0,
                          order: (module.lessons?.length || 0) + 1,
                          isPreview: false,
                          resources: []
                        });
                        setSelectedModuleId(module._id);
                        setShowLessonForm(true);
                      }}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                    >
                      Add Lesson
                    </button>
                    <button
                      onClick={() => setEditingModule(module._id)}
                      className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteModule(module._id)}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Lessons */}
                {module.lessons?.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-md font-medium text-white">Lessons</h4>
                    {module.lessons.map((lesson, lessonIndex) => (
                      <div key={lesson._id} className="bg-slate-700/30 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="text-white font-medium">{lesson.title}</h5>
                            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-400">
                              <span className="capitalize">{lesson.content.type}</span>
                              <span>{courseHelpers.formatDuration(lesson.duration)}</span>
                              <span>Order: {lesson.order}</span>
                              {lesson.isPreview && (
                                <span className="text-blue-400">Preview</span>
                              )}
                            </div>
                            {lesson.description && (
                              <p className="text-gray-400 text-sm mt-1">{lesson.description}</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingLesson({ moduleId: module._id, lessonId: lesson._id, lesson })}
                              className="px-2 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteLesson(module._id, lesson._id)}
                              className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Add Lesson Form */}
          {showLessonForm && (
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-red-500/20">
              <h3 className="text-lg font-semibold text-white mb-4">Add New Lesson</h3>
              <div className="grid grid-cols-1 gap-4">
                <input
                  type="text"
                  placeholder="Lesson title"
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm(prev => ({ ...prev, title: e.target.value }))}
                  className="px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <textarea
                  placeholder="Lesson description"
                  value={lessonForm.description}
                  onChange={(e) => setLessonForm(prev => ({ ...prev, description: e.target.value }))}
                  className="px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  rows={3}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <select
                    value={lessonForm.content.type}
                    onChange={(e) => setLessonForm(prev => ({
                      ...prev,
                      content: { ...prev.content, type: e.target.value }
                    }))}
                    className="px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="video">Video</option>
                    <option value="audio">Audio</option>
                    <option value="text">Text</option>
                    <option value="quiz">Quiz</option>
                  </select>

                  <input
                    type="number"
                    placeholder="Duration (seconds)"
                    value={lessonForm.duration}
                    onChange={(e) => setLessonForm(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                    className="px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />

                  <input
                    type="number"
                    placeholder="Order"
                    value={lessonForm.order}
                    onChange={(e) => setLessonForm(prev => ({ ...prev, order: parseInt(e.target.value) }))}
                    className="px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                {/* Content-specific fields */}
                {(lessonForm.content.type === 'video' || lessonForm.content.type === 'audio') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Upload Media File
                    </label>
                    <input
                      type="file"
                      accept={lessonForm.content.type === 'video' ? 'video/*' : 'audio/*'}
                      onChange={handleMediaUpload}
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                    {uploadingMedia && <p className="text-blue-400 text-sm mt-1">Uploading...</p>}
                    {lessonForm.content.url && (
                      <p className="text-green-400 text-sm mt-1">✓ Media uploaded successfully</p>
                    )}
                  </div>
                )}

                {lessonForm.content.type === 'text' && (
                  <textarea
                    placeholder="Text content"
                    value={lessonForm.content.text}
                    onChange={(e) => setLessonForm(prev => ({
                      ...prev,
                      content: { ...prev.content, text: e.target.value }
                    }))}
                    className="px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    rows={6}
                  />
                )}

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPreview"
                    checked={lessonForm.isPreview}
                    onChange={(e) => setLessonForm(prev => ({ ...prev, isPreview: e.target.checked }))}
                    className="w-4 h-4 text-red-600 bg-slate-700 border-slate-600 rounded focus:ring-red-500"
                  />
                  <label htmlFor="isPreview" className="ml-2 text-sm text-gray-300">
                    Allow as Preview Lesson
                  </label>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddLesson(selectedModuleId)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Add Lesson
                  </button>
                  <button
                    onClick={() => {
                      setShowLessonForm(false);
                      setSelectedModuleId(null);
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-white">Course Analytics</h2>

          {analytics ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-red-500/20">
                <h3 className="text-sm font-medium text-gray-300">Total Enrollments</h3>
                <p className="text-2xl font-bold text-white mt-2">
                  {analytics.analytics.totalEnrollments || 0}
                </p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-red-500/20">
                <h3 className="text-sm font-medium text-gray-300">Average Progress</h3>
                <p className="text-2xl font-bold text-blue-400 mt-2">
                  {Math.round(analytics.analytics.averageProgress || 0)}%
                </p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-red-500/20">
                <h3 className="text-sm font-medium text-gray-300">Completion Rate</h3>
                <p className="text-2xl font-bold text-green-400 mt-2">
                  {Math.round((analytics.analytics.completionRate || 0) * 100)}%
                </p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-red-500/20">
                <h3 className="text-sm font-medium text-gray-300">Avg Watch Time</h3>
                <p className="text-2xl font-bold text-yellow-400 mt-2">
                  {courseHelpers.formatDuration(analytics.analytics.averageWatchTime || 0)}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-red-500/20">
              <p className="text-gray-400">Loading analytics...</p>
            </div>
          )}
        </div>
      )}
      </div>
    </AdminLayout>
  );
};

export default AdminCourseEdit;
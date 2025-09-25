import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    general: {
      siteName: 'OmazingPWA',
      siteDescription: 'Mindfulness & Meditation Platform',
      contactEmail: 'admin@omazingpwa.com',
      timezone: 'UTC',
      language: 'en',
      maintenanceMode: false
    },
    security: {
      passwordMinLength: 6,
      enableTwoFactor: false,
      sessionTimeout: 7200,
      maxLoginAttempts: 5,
      lockoutDuration: 900
    },
    email: {
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpUsername: '',
      smtpPassword: '',
      fromEmail: 'noreply@omazingpwa.com',
      fromName: 'OmazingPWA'
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      adminAlerts: true,
      userRegistration: true,
      systemErrors: true
    },
    content: {
      autoModeration: true,
      contentApproval: false,
      maxFileSize: 100,
      allowedFileTypes: ['mp3', 'mp4', 'jpg', 'png', 'pdf'],
      defaultContentVisibility: 'public'
    },
    api: {
      rateLimitEnabled: true,
      requestsPerMinute: 100,
      enableCors: true,
      allowedOrigins: ['http://localhost:3000'],
      apiKeyRequired: false
    }
  });

  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const tabs = [
    { id: 'general', name: 'General', icon: '⚙️' },
    { id: 'security', name: 'Security', icon: '🔒' },
    { id: 'email', name: 'Email', icon: '📧' },
    { id: 'notifications', name: 'Notifications', icon: '🔔' },
    { id: 'content', name: 'Content', icon: '📝' },
    { id: 'api', name: 'API', icon: '🔌' }
  ];

  const timezones = [
    'UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London',
    'Europe/Paris', 'Asia/Tokyo', 'Asia/Shanghai', 'Australia/Sydney'
  ];

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' }
  ];

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const SettingCard = ({ title, children, description }) => (
    <div className="bg-slate-700/30 rounded-xl p-6 space-y-4">
      <div>
        <h4 className="text-lg font-semibold text-white">{title}</h4>
        {description && <p className="text-sm text-gray-400 mt-1">{description}</p>}
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );

  const InputField = ({ label, type = 'text', value, onChange, placeholder, required = false }) => (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-slate-600/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
      />
    </div>
  );

  const SelectField = ({ label, value, onChange, options, required = false }) => (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 bg-slate-600/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
      >
        {options.map((option) => (
          <option key={option.value || option.code || option} value={option.value || option.code || option} className="bg-slate-800">
            {option.label || option.name || option}
          </option>
        ))}
      </select>
    </div>
  );

  const ToggleField = ({ label, value, onChange, description }) => (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm font-medium text-white">{label}</div>
        {description && <div className="text-xs text-gray-400 mt-1">{description}</div>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-800 ${
          value ? 'bg-red-500' : 'bg-gray-600'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            value ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <SettingCard title="Site Information" description="Basic site configuration and branding">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Site Name"
                  value={settings.general.siteName}
                  onChange={(value) => handleSettingChange('general', 'siteName', value)}
                  required
                />
                <SelectField
                  label="Timezone"
                  value={settings.general.timezone}
                  onChange={(value) => handleSettingChange('general', 'timezone', value)}
                  options={timezones}
                />
              </div>
              <InputField
                label="Site Description"
                value={settings.general.siteDescription}
                onChange={(value) => handleSettingChange('general', 'siteDescription', value)}
                placeholder="Brief description of your platform"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Contact Email"
                  type="email"
                  value={settings.general.contactEmail}
                  onChange={(value) => handleSettingChange('general', 'contactEmail', value)}
                  required
                />
                <SelectField
                  label="Default Language"
                  value={settings.general.language}
                  onChange={(value) => handleSettingChange('general', 'language', value)}
                  options={languages}
                />
              </div>
              <ToggleField
                label="Maintenance Mode"
                value={settings.general.maintenanceMode}
                onChange={(value) => handleSettingChange('general', 'maintenanceMode', value)}
                description="Temporarily disable public access to the site"
              />
            </SettingCard>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <SettingCard title="Password Security" description="Configure password requirements and policies">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Minimum Password Length"
                  type="number"
                  value={settings.security.passwordMinLength}
                  onChange={(value) => handleSettingChange('security', 'passwordMinLength', parseInt(value))}
                />
                <InputField
                  label="Session Timeout (seconds)"
                  type="number"
                  value={settings.security.sessionTimeout}
                  onChange={(value) => handleSettingChange('security', 'sessionTimeout', parseInt(value))}
                />
              </div>
              <ToggleField
                label="Enable Two-Factor Authentication"
                value={settings.security.enableTwoFactor}
                onChange={(value) => handleSettingChange('security', 'enableTwoFactor', value)}
                description="Require 2FA for admin accounts"
              />
            </SettingCard>

            <SettingCard title="Account Protection" description="Login attempt limits and lockout settings">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Max Login Attempts"
                  type="number"
                  value={settings.security.maxLoginAttempts}
                  onChange={(value) => handleSettingChange('security', 'maxLoginAttempts', parseInt(value))}
                />
                <InputField
                  label="Lockout Duration (seconds)"
                  type="number"
                  value={settings.security.lockoutDuration}
                  onChange={(value) => handleSettingChange('security', 'lockoutDuration', parseInt(value))}
                />
              </div>
            </SettingCard>
          </div>
        );

      case 'email':
        return (
          <div className="space-y-6">
            <SettingCard title="SMTP Configuration" description="Configure email server settings">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="SMTP Host"
                  value={settings.email.smtpHost}
                  onChange={(value) => handleSettingChange('email', 'smtpHost', value)}
                  placeholder="smtp.gmail.com"
                />
                <InputField
                  label="SMTP Port"
                  type="number"
                  value={settings.email.smtpPort}
                  onChange={(value) => handleSettingChange('email', 'smtpPort', parseInt(value))}
                  placeholder="587"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="SMTP Username"
                  value={settings.email.smtpUsername}
                  onChange={(value) => handleSettingChange('email', 'smtpUsername', value)}
                  placeholder="your-email@gmail.com"
                />
                <InputField
                  label="SMTP Password"
                  type="password"
                  value={settings.email.smtpPassword}
                  onChange={(value) => handleSettingChange('email', 'smtpPassword', value)}
                  placeholder="••••••••"
                />
              </div>
            </SettingCard>

            <SettingCard title="Email Sender" description="Configure sender information for outgoing emails">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="From Email"
                  type="email"
                  value={settings.email.fromEmail}
                  onChange={(value) => handleSettingChange('email', 'fromEmail', value)}
                  placeholder="noreply@yourdomain.com"
                />
                <InputField
                  label="From Name"
                  value={settings.email.fromName}
                  onChange={(value) => handleSettingChange('email', 'fromName', value)}
                  placeholder="Your App Name"
                />
              </div>
            </SettingCard>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <SettingCard title="Notification Preferences" description="Configure what notifications to send">
              <div className="space-y-4">
                <ToggleField
                  label="Email Notifications"
                  value={settings.notifications.emailNotifications}
                  onChange={(value) => handleSettingChange('notifications', 'emailNotifications', value)}
                  description="Send notifications via email"
                />
                <ToggleField
                  label="Push Notifications"
                  value={settings.notifications.pushNotifications}
                  onChange={(value) => handleSettingChange('notifications', 'pushNotifications', value)}
                  description="Send browser push notifications"
                />
                <ToggleField
                  label="Admin Alerts"
                  value={settings.notifications.adminAlerts}
                  onChange={(value) => handleSettingChange('notifications', 'adminAlerts', value)}
                  description="Notify admins of important events"
                />
                <ToggleField
                  label="User Registration Notifications"
                  value={settings.notifications.userRegistration}
                  onChange={(value) => handleSettingChange('notifications', 'userRegistration', value)}
                  description="Notify when new users register"
                />
                <ToggleField
                  label="System Error Alerts"
                  value={settings.notifications.systemErrors}
                  onChange={(value) => handleSettingChange('notifications', 'systemErrors', value)}
                  description="Send alerts for system errors"
                />
              </div>
            </SettingCard>
          </div>
        );

      case 'content':
        return (
          <div className="space-y-6">
            <SettingCard title="Content Moderation" description="Configure content approval and moderation settings">
              <div className="space-y-4">
                <ToggleField
                  label="Auto Moderation"
                  value={settings.content.autoModeration}
                  onChange={(value) => handleSettingChange('content', 'autoModeration', value)}
                  description="Automatically moderate content using AI"
                />
                <ToggleField
                  label="Content Approval Required"
                  value={settings.content.contentApproval}
                  onChange={(value) => handleSettingChange('content', 'contentApproval', value)}
                  description="Require manual approval for new content"
                />
                <SelectField
                  label="Default Content Visibility"
                  value={settings.content.defaultContentVisibility}
                  onChange={(value) => handleSettingChange('content', 'defaultContentVisibility', value)}
                  options={[
                    { value: 'public', label: 'Public' },
                    { value: 'private', label: 'Private' },
                    { value: 'premium', label: 'Premium Only' }
                  ]}
                />
              </div>
            </SettingCard>

            <SettingCard title="File Upload Settings" description="Configure file upload limits and restrictions">
              <InputField
                label="Maximum File Size (MB)"
                type="number"
                value={settings.content.maxFileSize}
                onChange={(value) => handleSettingChange('content', 'maxFileSize', parseInt(value))}
              />
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Allowed File Types</label>
                <div className="flex flex-wrap gap-2">
                  {['mp3', 'mp4', 'wav', 'jpg', 'png', 'gif', 'pdf', 'doc', 'docx'].map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        const currentTypes = settings.content.allowedFileTypes;
                        const newTypes = currentTypes.includes(type)
                          ? currentTypes.filter(t => t !== type)
                          : [...currentTypes, type];
                        handleSettingChange('content', 'allowedFileTypes', newTypes);
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        settings.content.allowedFileTypes.includes(type)
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                      }`}
                    >
                      .{type}
                    </button>
                  ))}
                </div>
              </div>
            </SettingCard>
          </div>
        );

      case 'api':
        return (
          <div className="space-y-6">
            <SettingCard title="API Rate Limiting" description="Configure API request limits and throttling">
              <div className="space-y-4">
                <ToggleField
                  label="Enable Rate Limiting"
                  value={settings.api.rateLimitEnabled}
                  onChange={(value) => handleSettingChange('api', 'rateLimitEnabled', value)}
                  description="Limit the number of API requests per client"
                />
                <InputField
                  label="Requests Per Minute"
                  type="number"
                  value={settings.api.requestsPerMinute}
                  onChange={(value) => handleSettingChange('api', 'requestsPerMinute', parseInt(value))}
                />
              </div>
            </SettingCard>

            <SettingCard title="CORS & Security" description="Configure cross-origin requests and API security">
              <div className="space-y-4">
                <ToggleField
                  label="Enable CORS"
                  value={settings.api.enableCors}
                  onChange={(value) => handleSettingChange('api', 'enableCors', value)}
                  description="Allow cross-origin requests"
                />
                <ToggleField
                  label="API Key Required"
                  value={settings.api.apiKeyRequired}
                  onChange={(value) => handleSettingChange('api', 'apiKeyRequired', value)}
                  description="Require API key for all requests"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Allowed Origins</label>
                  <div className="space-y-2">
                    {settings.api.allowedOrigins.map((origin, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={origin}
                          onChange={(e) => {
                            const newOrigins = [...settings.api.allowedOrigins];
                            newOrigins[index] = e.target.value;
                            handleSettingChange('api', 'allowedOrigins', newOrigins);
                          }}
                          className="flex-1 px-4 py-2 bg-slate-600/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                        />
                        <button
                          onClick={() => {
                            const newOrigins = settings.api.allowedOrigins.filter((_, i) => i !== index);
                            handleSettingChange('api', 'allowedOrigins', newOrigins);
                          }}
                          className="p-2 text-red-400 hover:text-red-300 transition-colors"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        handleSettingChange('api', 'allowedOrigins', [...settings.api.allowedOrigins, '']);
                      }}
                      className="text-sm text-red-400 hover:text-red-300 transition-colors"
                    >
                      + Add Origin
                    </button>
                  </div>
                </div>
              </div>
            </SettingCard>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Settings
            </h1>
            <p className="text-gray-400 mt-1 text-sm sm:text-base">Configure platform settings and preferences</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium text-sm sm:text-base transition-all duration-200 shadow-lg hover:shadow-xl ${
                saving
                  ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                  : saved
                  ? 'bg-green-500 text-white'
                  : 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700'
              }`}
            >
              {saving ? '💾 Saving...' : saved ? '✅ Saved!' : '💾 Save Settings'}
            </button>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-700/50 bg-gradient-to-r from-slate-800/80 to-slate-700/80">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 sm:px-6 py-4 text-sm font-medium whitespace-nowrap transition-all duration-200 border-b-2 ${
                    activeTab === tab.id
                      ? 'border-red-500 text-red-400 bg-red-500/10'
                      : 'border-transparent text-gray-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
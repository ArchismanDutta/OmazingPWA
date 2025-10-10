import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuth } from '../../contexts/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSessions: 0,
    totalRevenue: 0,
    activeUsers: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setStats({
        totalUsers: 1247,
        totalSessions: 8563,
        totalRevenue: 45230,
        activeUsers: 324
      });

      setRecentActivity([
        { id: 1, action: 'New user registered', user: 'John Doe', time: '2 minutes ago' },
        { id: 2, action: 'Premium subscription purchased', user: 'Jane Smith', time: '15 minutes ago' },
        { id: 3, action: 'Meditation session completed', user: 'Mike Johnson', time: '1 hour ago' },
        { id: 4, action: 'Course completed', user: 'Sarah Wilson', time: '2 hours ago' },
      ]);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  const StatCard = ({ title, value, icon, change, changeType }) => (
    <div className="bg-slate-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6 hover:bg-slate-800/70 transition-all duration-200 group">
      <div className="flex items-center">
        <div className="text-3xl mr-4 p-3 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-xl border border-red-500/30 group-hover:scale-105 transition-transform">
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-white mb-2">{value.toLocaleString()}</p>
          {change && (
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${changeType === 'increase' ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <p className={`text-sm font-medium ${changeType === 'increase' ? 'text-green-400' : 'text-red-400'}`}>
                {changeType === 'increase' ? '↗' : '↘'} {change}% from last month
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-gray-400">Welcome back, {user?.name}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium text-sm">
              Export Report
            </button>
            <button className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-slate-800 hover:text-white transition-colors text-sm">
              Refresh Data
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon="👥"
            change={12}
            changeType="increase"
          />
          <StatCard
            title="Total Sessions"
            value={stats.totalSessions}
            icon="🧘"
            change={8}
            changeType="increase"
          />
          <StatCard
            title="Revenue"
            value={stats.totalRevenue}
            icon="💰"
            change={15}
            changeType="increase"
          />
          <StatCard
            title="Active Users"
            value={stats.activeUsers}
            icon="🟢"
            change={5}
            changeType="increase"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-slate-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-gray-700/50 bg-gradient-to-r from-slate-800/80 to-slate-700/80">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <span className="mr-2">⚡</span>
                Recent Activity
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-slate-700/50 transition-colors">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-full flex items-center justify-center border border-red-500/30">
                        <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">{activity.action}</p>
                      <p className="text-sm text-gray-400">{activity.user}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <p className="text-xs text-gray-500 bg-slate-700/50 px-2 py-1 rounded-full">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-gray-700/50 bg-gradient-to-r from-slate-800/80 to-slate-700/80">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <span className="mr-2">⚡</span>
                Quick Actions
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  to="/admin/users"
                  className="group p-6 border-2 border-dashed border-gray-600 rounded-xl hover:border-red-500/50 hover:bg-red-500/10 transition-all duration-200 text-center"
                >
                  <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">👥</div>
                  <div className="text-sm font-medium text-gray-300 group-hover:text-white">Manage Users</div>
                </Link>
                <Link
                  to="/admin/courses"
                  className="group p-6 border-2 border-dashed border-gray-600 rounded-xl hover:border-red-500/50 hover:bg-red-500/10 transition-all duration-200 text-center"
                >
                  <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">🎓</div>
                  <div className="text-sm font-medium text-gray-300 group-hover:text-white">Manage Courses</div>
                </Link>
                <Link
                  to="/admin/videos"
                  className="group p-6 border-2 border-dashed border-gray-600 rounded-xl hover:border-red-500/50 hover:bg-red-500/10 transition-all duration-200 text-center"
                >
                  <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">🎥</div>
                  <div className="text-sm font-medium text-gray-300 group-hover:text-white">Manage Videos</div>
                </Link>
                <button className="group p-6 border-2 border-dashed border-gray-600 rounded-xl hover:border-red-500/50 hover:bg-red-500/10 transition-all duration-200 text-center">
                  <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">⚙️</div>
                  <div className="text-sm font-medium text-gray-300 group-hover:text-white">Settings</div>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-gray-700/50 bg-gradient-to-r from-slate-800/80 to-slate-700/80">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <span className="mr-2">🔧</span>
              System Status
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="text-center p-4 bg-slate-700/30 rounded-xl border border-green-500/30">
                <div className="text-3xl mb-3">
                  <div className="w-6 h-6 bg-green-400 rounded-full mx-auto animate-pulse"></div>
                </div>
                <div className="text-sm font-medium text-white mb-1">Server Status</div>
                <div className="text-xs text-green-400 font-medium">Online</div>
              </div>
              <div className="text-center p-4 bg-slate-700/30 rounded-xl border border-green-500/30">
                <div className="text-3xl mb-3">
                  <div className="w-6 h-6 bg-green-400 rounded-full mx-auto animate-pulse"></div>
                </div>
                <div className="text-sm font-medium text-white mb-1">Database</div>
                <div className="text-xs text-green-400 font-medium">Connected</div>
              </div>
              <div className="text-center p-4 bg-slate-700/30 rounded-xl border border-yellow-500/30">
                <div className="text-3xl mb-3">
                  <div className="w-6 h-6 bg-yellow-400 rounded-full mx-auto animate-pulse"></div>
                </div>
                <div className="text-sm font-medium text-white mb-1">CDN</div>
                <div className="text-xs text-yellow-400 font-medium">Slow Response</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
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
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className="text-2xl mr-4">{icon}</div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
          {change && (
            <p className={`text-sm ${changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
              {changeType === 'increase' ? '↗' : '↘'} {change}% from last month
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.name}</p>
          </div>
          <div className="flex space-x-3">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Export Report
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              Refresh Data
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-500">{activity.user}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <Link to="/admin/users" className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors text-center">
                  <div className="text-2xl mb-2">👥</div>
                  <div className="text-sm font-medium text-gray-900">Manage Users</div>
                </Link>
                <Link to="/admin/content" className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors text-center">
                  <div className="text-2xl mb-2">📝</div>
                  <div className="text-sm font-medium text-gray-900">Manage Content</div>
                </Link>
                <Link to="/admin/analytics" className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors text-center">
                  <div className="text-2xl mb-2">📊</div>
                  <div className="text-sm font-medium text-gray-900">View Analytics</div>
                </Link>
                <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors text-center">
                  <div className="text-2xl mb-2">⚙️</div>
                  <div className="text-sm font-medium text-gray-900">Settings</div>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">System Status</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl mb-2">🟢</div>
                <div className="text-sm font-medium text-gray-900">Server Status</div>
                <div className="text-xs text-gray-500">Online</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">🟢</div>
                <div className="text-sm font-medium text-gray-900">Database</div>
                <div className="text-xs text-gray-500">Connected</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">🟡</div>
                <div className="text-sm font-medium text-gray-900">CDN</div>
                <div className="text-xs text-gray-500">Slow Response</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
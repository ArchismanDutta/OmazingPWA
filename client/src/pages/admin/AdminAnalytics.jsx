import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';

const AdminAnalytics = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [analyticsData, setAnalyticsData] = useState({
    userGrowth: [],
    sessionStats: [],
    revenueData: [],
    contentPopularity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      // Mock analytics data
      const mockData = {
        userGrowth: [
          { date: '2024-01-01', users: 1000, newUsers: 50 },
          { date: '2024-01-15', users: 1100, newUsers: 75 },
          { date: '2024-02-01', users: 1200, newUsers: 90 },
          { date: '2024-02-15', users: 1300, newUsers: 85 },
          { date: '2024-03-01', users: 1400, newUsers: 100 }
        ],
        sessionStats: {
          totalSessions: 15420,
          averageSessionLength: 18.5,
          completionRate: 78.3,
          popularTimes: [
            { hour: 6, sessions: 890 },
            { hour: 7, sessions: 1250 },
            { hour: 8, sessions: 1680 },
            { hour: 18, sessions: 1950 },
            { hour: 19, sessions: 2100 },
            { hour: 20, sessions: 1850 },
            { hour: 21, sessions: 1420 }
          ]
        },
        revenueData: {
          totalRevenue: 45230,
          monthlyRevenue: 12340,
          subscriptions: {
            free: 85,
            premium: 12,
            lifetime: 3
          }
        },
        contentPopularity: [
          { title: 'Mindful Breathing', sessions: 2840, category: 'Breathing' },
          { title: 'Sleep Stories', sessions: 2560, category: 'Sleep' },
          { title: 'Daily Meditation', sessions: 2340, category: 'Meditation' },
          { title: 'Stress Relief', sessions: 1980, category: 'Stress' },
          { title: 'Focus Training', sessions: 1750, category: 'Focus' }
        ]
      };

      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const MetricCard = ({ title, value, subtitle, icon, trend }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className="text-2xl mr-4">{icon}</div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500">{subtitle}</p>
          )}
          {trend && (
            <p className={`text-sm ${trend.type === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
              {trend.type === 'increase' ? '↗' : '↘'} {trend.value}% from last period
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const TimeRangeSelector = () => (
    <div className="flex space-x-2">
      {['7d', '30d', '90d', '1y'].map((range) => (
        <button
          key={range}
          onClick={() => setTimeRange(range)}
          className={`px-3 py-1 rounded-md text-sm ${
            timeRange === range
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {range}
        </button>
      ))}
    </div>
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
            <p className="text-gray-600">Insights into platform usage and performance</p>
          </div>
          <div className="flex space-x-3">
            <TimeRangeSelector />
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Export Report
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Sessions"
            value={analyticsData.sessionStats.totalSessions?.toLocaleString()}
            icon="🧘"
            trend={{ type: 'increase', value: 12 }}
          />
          <MetricCard
            title="Average Session"
            value={`${analyticsData.sessionStats.averageSessionLength}min`}
            icon="⏱️"
            trend={{ type: 'increase', value: 5 }}
          />
          <MetricCard
            title="Completion Rate"
            value={`${analyticsData.sessionStats.completionRate}%`}
            icon="✅"
            trend={{ type: 'increase', value: 3 }}
          />
          <MetricCard
            title="Monthly Revenue"
            value={`$${analyticsData.revenueData.monthlyRevenue?.toLocaleString()}`}
            icon="💰"
            trend={{ type: 'increase', value: 18 }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">User Growth</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {analyticsData.userGrowth.map((point, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      {new Date(point.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm font-medium text-gray-900">
                        {point.users.toLocaleString()} total
                      </div>
                      <div className="text-sm text-green-600">
                        +{point.newUsers} new
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Popular Session Times</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {analyticsData.sessionStats.popularTimes?.map((time, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-12 text-sm text-gray-600">
                      {time.hour}:00
                    </div>
                    <div className="flex-1 mx-3">
                      <div className="bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${(time.sessions / 2100) * 100}%`
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="w-16 text-sm text-gray-900 text-right">
                      {time.sessions}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Content Popularity</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {analyticsData.contentPopularity.map((content, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{content.title}</div>
                      <div className="text-xs text-gray-500">{content.category}</div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-sm text-gray-600">{content.sessions} sessions</div>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{
                            width: `${(content.sessions / 2840) * 100}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Subscription Distribution</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Free Users</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-900">{analyticsData.revenueData.subscriptions?.free}%</span>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gray-600 h-2 rounded-full"
                        style={{ width: `${analyticsData.revenueData.subscriptions?.free}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Premium Users</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-900">{analyticsData.revenueData.subscriptions?.premium}%</span>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${analyticsData.revenueData.subscriptions?.premium}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Lifetime Users</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-900">{analyticsData.revenueData.subscriptions?.lifetime}%</span>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${analyticsData.revenueData.subscriptions?.lifetime}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Total Revenue</span>
                  <span className="text-lg font-bold text-green-600">
                    ${analyticsData.revenueData.totalRevenue?.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Export Options</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors text-center">
                <div className="text-2xl mb-2">📊</div>
                <div className="text-sm font-medium text-gray-900">User Analytics</div>
                <div className="text-xs text-gray-500">CSV format</div>
              </button>
              <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors text-center">
                <div className="text-2xl mb-2">📈</div>
                <div className="text-sm font-medium text-gray-900">Session Report</div>
                <div className="text-xs text-gray-500">PDF format</div>
              </button>
              <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors text-center">
                <div className="text-2xl mb-2">💰</div>
                <div className="text-sm font-medium text-gray-900">Revenue Report</div>
                <div className="text-xs text-gray-500">Excel format</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
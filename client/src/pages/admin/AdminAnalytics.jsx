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
    <div className="bg-slate-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6 hover:bg-slate-800/70 transition-all duration-200 group">
      <div className="flex items-center">
        <div className="text-3xl mr-4 p-3 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-xl border border-red-500/30 group-hover:scale-105 transition-transform">{icon}</div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-white mb-2">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${trend.type === 'increase' ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <p className={`text-sm font-medium ${trend.type === 'increase' ? 'text-green-400' : 'text-red-400'}`}>
                {trend.type === 'increase' ? '↗' : '↘'} {trend.value}% from last period
              </p>
            </div>
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
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
            timeRange === range
              ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
              : 'bg-slate-700/50 text-gray-300 hover:bg-slate-600 hover:text-white border border-gray-600'
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-400"></div>
          <span className="ml-3 text-gray-400">Loading analytics...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Analytics & Reports
            </h1>
            <p className="text-gray-400 mt-1 text-sm sm:text-base">Insights into platform usage and performance</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <TimeRangeSelector />
            <button className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium text-sm sm:text-base">
              📊 Export Report
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-slate-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-gray-700/50 bg-gradient-to-r from-slate-800/80 to-slate-700/80">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <span className="mr-2">📈</span>
                User Growth
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {analyticsData.userGrowth.map((point, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-700/50 transition-colors">
                    <div className="text-sm text-gray-400">
                      {new Date(point.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm font-medium text-white">
                        {point.users.toLocaleString()} total
                      </div>
                      <div className="text-sm text-green-400 bg-green-500/10 px-2 py-1 rounded-full">
                        +{point.newUsers} new
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-gray-700/50 bg-gradient-to-r from-slate-800/80 to-slate-700/80">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <span className="mr-2">🕰️</span>
                Popular Session Times
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {analyticsData.sessionStats.popularTimes?.map((time, index) => (
                  <div key={index} className="flex items-center p-2 rounded-lg hover:bg-slate-700/30 transition-colors">
                    <div className="w-12 text-sm text-gray-300 font-medium">
                      {time.hour}:00
                    </div>
                    <div className="flex-1 mx-3">
                      <div className="bg-slate-700/50 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-red-500 to-red-400 h-3 rounded-full transition-all duration-500"
                          style={{
                            width: `${(time.sessions / 2100) * 100}%`
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="w-16 text-sm text-white text-right font-medium">
                      {time.sessions}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-slate-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-gray-700/50 bg-gradient-to-r from-slate-800/80 to-slate-700/80">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <span className="mr-2">📅</span>
                Content Popularity
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {analyticsData.contentPopularity.map((content, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-700/50 transition-colors">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">{content.title}</div>
                      <div className="text-xs text-gray-400">{content.category}</div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-sm text-gray-300">{content.sessions} sessions</div>
                      <div className="w-20 bg-slate-700/50 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-green-500 to-green-400 h-3 rounded-full transition-all duration-500"
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

          <div className="bg-slate-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-gray-700/50 bg-gradient-to-r from-slate-800/80 to-slate-700/80">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <span className="mr-2">📊</span>
                Subscription Distribution
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-700/30 transition-colors">
                  <span className="text-sm font-medium text-gray-300">Free Users</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-white font-medium">{analyticsData.revenueData.subscriptions?.free}%</span>
                    <div className="w-24 bg-slate-700/50 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-gray-500 to-gray-400 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${analyticsData.revenueData.subscriptions?.free}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-700/30 transition-colors">
                  <span className="text-sm font-medium text-gray-300">Premium Users</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-white font-medium">{analyticsData.revenueData.subscriptions?.premium}%</span>
                    <div className="w-24 bg-slate-700/50 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-400 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${analyticsData.revenueData.subscriptions?.premium}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-700/30 transition-colors">
                  <span className="text-sm font-medium text-gray-300">Lifetime Users</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-white font-medium">{analyticsData.revenueData.subscriptions?.lifetime}%</span>
                    <div className="w-24 bg-slate-700/50 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-purple-400 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${analyticsData.revenueData.subscriptions?.lifetime}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-700/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-300">Total Revenue</span>
                  <span className="text-lg font-bold text-green-400">
                    ${analyticsData.revenueData.totalRevenue?.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-gray-700/50 bg-gradient-to-r from-slate-800/80 to-slate-700/80">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <span className="mr-2">📤</span>
              Export Options
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="p-4 border-2 border-dashed border-gray-600/50 bg-slate-700/30 rounded-xl hover:border-red-500/50 hover:bg-slate-700/50 transition-all duration-200 text-center group">
                <div className="text-2xl mb-2 group-hover:scale-105 transition-transform">📊</div>
                <div className="text-sm font-medium text-white">User Analytics</div>
                <div className="text-xs text-gray-400">CSV format</div>
              </button>
              <button className="p-4 border-2 border-dashed border-gray-600/50 bg-slate-700/30 rounded-xl hover:border-red-500/50 hover:bg-slate-700/50 transition-all duration-200 text-center group">
                <div className="text-2xl mb-2 group-hover:scale-105 transition-transform">📈</div>
                <div className="text-sm font-medium text-white">Session Report</div>
                <div className="text-xs text-gray-400">PDF format</div>
              </button>
              <button className="p-4 border-2 border-dashed border-gray-600/50 bg-slate-700/30 rounded-xl hover:border-red-500/50 hover:bg-slate-700/50 transition-all duration-200 text-center group">
                <div className="text-2xl mb-2 group-hover:scale-105 transition-transform">💰</div>
                <div className="text-sm font-medium text-white">Revenue Report</div>
                <div className="text-xs text-gray-400">Excel format</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
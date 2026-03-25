import React, { useEffect, useState } from 'react';
import { TrendingUp, DollarSign, BarChart3 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Layout } from '../components/Layout';
import { apiClient } from '../api/client';

export const Analytics: React.FC = () => {
  const [timelineData, setTimelineData] = useState<any[]>([]);
  const [failureBreakdown, setFailureBreakdown] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [timeline, breakdown] = await Promise.all([
        apiClient.getTimelineStats(timeRange),
        apiClient.getFailureBreakdown(),
      ]);
      setTimelineData(timeline);
      setFailureBreakdown(breakdown);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const calculateMetrics = () => {
    const totalFailed = timelineData.reduce((sum, d) => sum + d.failed_amount, 0);
    const totalRecovered = timelineData.reduce((sum, d) => sum + d.recovered_amount, 0);
    const recoveryRate = totalFailed > 0 ? (totalRecovered / totalFailed) * 100 : 0;

    return {
      totalFailed: formatCurrency(totalFailed),
      totalRecovered: formatCurrency(totalRecovered),
      recoveryRate: recoveryRate.toFixed(1),
    };
  };

  const metrics = calculateMetrics();

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Analytics</h1>
            <p className="text-gray-400">Deep dive into your payment recovery performance</p>
          </div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(parseInt(e.target.value))}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Total Failed</span>
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
                <div className="text-2xl font-bold text-white">{metrics.totalFailed}</div>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Total Recovered</span>
                  <DollarSign className="h-5 w-5 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-white">{metrics.totalRecovered}</div>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Recovery Rate</span>
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-white">{metrics.recoveryRate}%</div>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Failed vs Recovered Over Time</h2>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="date"
                    stroke="#9ca3af"
                    tick={{ fill: '#9ca3af' }}
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    tick={{ fill: '#9ca3af' }}
                    tickFormatter={(value) => `$${(value / 100).toFixed(0)}`}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                    labelStyle={{ color: '#f3f4f6' }}
                    formatter={(value: number) => formatCurrency(value)}
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="failed_amount"
                    stroke="#ef4444"
                    name="Failed Amount"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="recovered_amount"
                    stroke="#10b981"
                    name="Recovered Amount"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Failure Reasons by Amount</h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={failureBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="failure_code"
                    stroke="#9ca3af"
                    tick={{ fill: '#9ca3af' }}
                    tickFormatter={(code) => code.replace(/_/g, ' ')}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    tick={{ fill: '#9ca3af' }}
                    tickFormatter={(value) => `$${(value / 100).toFixed(0)}`}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                    labelStyle={{ color: '#f3f4f6' }}
                    formatter={(value: number) => formatCurrency(value)}
                    labelFormatter={(code) => code.replace(/_/g, ' ')}
                  />
                  <Legend />
                  <Bar dataKey="total_amount" fill="#3b82f6" name="Total Amount" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Failure Type Statistics</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Failure Type</th>
                      <th className="text-right py-3 px-4 text-gray-400 font-medium">Count</th>
                      <th className="text-right py-3 px-4 text-gray-400 font-medium">Total Amount</th>
                      <th className="text-right py-3 px-4 text-gray-400 font-medium">Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {failureBreakdown.map((item) => (
                      <tr key={item.failure_code} className="border-b border-gray-800">
                        <td className="py-3 px-4 text-white">
                          {item.failure_code.replace(/_/g, ' ')}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-300">{item.count}</td>
                        <td className="py-3 px-4 text-right text-gray-300">
                          {formatCurrency(item.total_amount)}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-300">
                          {item.percentage}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

function AlertCircle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

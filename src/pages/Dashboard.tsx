import React, { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Layout } from '../components/Layout';
import { apiClient } from '../api/client';

interface DashboardStats {
  revenue_at_risk: number;
  revenue_recovered: number;
  recovery_rate: number;
  active_retries: number;
  timeline: Array<{ date: string; recovered_amount: number; failed_amount: number }>;
  failure_breakdown: Array<{ failure_code: string; count: number; percentage: number }>;
}

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiClient.getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1'];

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Overview of your payment recovery performance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Revenue at Risk</span>
              <AlertCircle className="h-5 w-5 text-orange-500" />
            </div>
            <div className="text-2xl font-bold text-white">
              {formatCurrency(stats?.revenue_at_risk || 0)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Currently in retry</p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Revenue Recovered</span>
              <DollarSign className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-white">
              {formatCurrency(stats?.revenue_recovered || 0)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Recovery Rate</span>
              <TrendingUp className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-white">
              {stats?.recovery_rate.toFixed(1)}%
            </div>
            <p className="text-xs text-gray-500 mt-1">Success rate</p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Active Retries</span>
              <RefreshCw className="h-5 w-5 text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-white">
              {stats?.active_retries || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">In progress</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Recovery Timeline</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats?.timeline || []}>
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
                  dataKey="recovered_amount"
                  stroke="#10b981"
                  name="Recovered"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="failed_amount"
                  stroke="#ef4444"
                  name="Failed"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Failure Type Breakdown</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats?.failure_breakdown || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ failure_code, percentage }) =>
                    `${failure_code.replace(/_/g, ' ')}: ${percentage.toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {(stats?.failure_breakdown || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  formatter={(value: number, name: string, props: any) => [
                    `${value} (${props.payload.percentage.toFixed(1)}%)`,
                    props.payload.failure_code.replace(/_/g, ' ')
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Recent Failed Payments</h2>
          <p className="text-gray-400 text-center py-8">
            View all failed payments in the <a href="/payments" className="text-blue-500 hover:text-blue-400">Failed Payments</a> section
          </p>
        </div>
      </div>
    </Layout>
  );
};

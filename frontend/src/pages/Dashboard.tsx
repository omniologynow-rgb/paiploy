import React, { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, AlertCircle, RefreshCw, CreditCard, Mail, CheckCircle } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Layout } from '../components/Layout';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';

interface DashboardStats {
  revenue_at_risk: number;
  revenue_recovered: number;
  recovery_rate: number;
  active_retries: number;
  timeline: Array<{ date: string; recovered_amount: number; failed_amount: number }>;
  failure_breakdown: Array<{ failure_code: string; count: number; percentage: number }>;
}

const formatCurrency = (cents: number) =>
  `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const COLORS = ['#10b981', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1'];

const EmptyDashboard = () => (
  <div className="card p-10 text-center" data-testid="dashboard-empty-state">
    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-5">
      <CheckCircle className="h-8 w-8 text-emerald-400" />
    </div>
    <h3 className="text-xl font-semibold text-slate-100 mb-2">No failed payments detected yet</h3>
    <p className="text-slate-400 max-w-md mx-auto leading-relaxed">
      This is a good thing! We're monitoring your Stripe account and will alert you the moment a payment fails.
    </p>
  </div>
);

const activityMock = [
  { type: 'recovered', text: 'Payment of $49.99 recovered from john@example.com', time: '2 min ago', color: 'bg-emerald-400' },
  { type: 'retry', text: 'Retry #2 attempted for $99.00 charge', time: '15 min ago', color: 'bg-amber-400' },
  { type: 'email', text: 'Dunning email sent to sarah@startup.io', time: '1 hour ago', color: 'bg-blue-400' },
  { type: 'failed', text: 'Payment of $29.00 failed - insufficient funds', time: '2 hours ago', color: 'bg-red-400' },
  { type: 'recovered', text: 'Payment of $199.00 recovered from mike@corp.com', time: '3 hours ago', color: 'bg-emerald-400' },
];

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.getDashboardStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <RefreshCw className="h-10 w-10 text-emerald-500 animate-spin" />
          <p className="text-slate-400 text-sm">Loading your recovery data...</p>
        </div>
      </Layout>
    );
  }

  const hasData = stats && (stats.revenue_at_risk > 0 || stats.revenue_recovered > 0 || stats.active_retries > 0);

  return (
    <Layout>
      <div className="space-y-6" data-testid="dashboard-page">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 mb-1">Dashboard</h1>
          <p className="text-slate-400">Overview of your payment recovery performance</p>
        </div>

        {/* Quick Stats Bar */}
        {hasData && (
          <div className="card px-6 py-3 flex flex-wrap items-center gap-6 text-sm" data-testid="quick-stats-bar">
            <span className="text-slate-400">This Month:</span>
            <span className="text-emerald-400 font-semibold">{formatCurrency(stats!.revenue_recovered)} recovered</span>
            <span className="text-slate-600">|</span>
            <span className="text-amber-400 font-semibold">{stats!.active_retries} active</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-300 font-semibold">{stats!.recovery_rate.toFixed(1)}% rate</span>
          </div>
        )}

        {!hasData ? (
          <EmptyDashboard />
        ) : (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="card p-5 relative overflow-hidden group hover:scale-[1.02]" data-testid="stat-revenue-at-risk">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400 text-sm">Revenue at Risk</span>
                    <AlertCircle className="h-5 w-5 text-amber-400" />
                  </div>
                  <div className="text-2xl font-bold text-amber-400">{formatCurrency(stats!.revenue_at_risk)}</div>
                  <p className="text-xs text-slate-500 mt-1">Currently in retry</p>
                </div>
              </div>

              <div className="card p-5 relative overflow-hidden group hover:scale-[1.02]" data-testid="stat-revenue-recovered">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400 text-sm">Revenue Recovered</span>
                    <DollarSign className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-bold text-emerald-400">{formatCurrency(stats!.revenue_recovered)}</div>
                  <p className="text-xs text-slate-500 mt-1">Last 30 days</p>
                </div>
              </div>

              <div className="card p-5 relative overflow-hidden group hover:scale-[1.02]" data-testid="stat-recovery-rate">
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400 text-sm">Recovery Rate</span>
                    <TrendingUp className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-bold text-slate-100">{stats!.recovery_rate.toFixed(1)}%</div>
                  <p className="text-xs text-slate-500 mt-1">Success rate</p>
                </div>
              </div>

              <div className="card p-5 relative overflow-hidden group hover:scale-[1.02]" data-testid="stat-active-retries">
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400 text-sm">Active Retries</span>
                    <RefreshCw className="h-5 w-5 text-teal-400" />
                  </div>
                  <div className="text-2xl font-bold text-slate-100">{stats!.active_retries}</div>
                  <p className="text-xs text-slate-500 mt-1">In progress</p>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card p-6" data-testid="recovery-timeline-chart">
                <h2 className="text-lg font-semibold text-slate-100 mb-4">Recovery Timeline</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats!.timeline}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="date" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }}
                      tickFormatter={(d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                    <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }}
                      tickFormatter={(v) => `$${(v / 100).toFixed(0)}`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#111827', border: '1px solid #1e293b', borderRadius: '12px', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.5)' }}
                      labelStyle={{ color: '#f1f5f9' }}
                      formatter={(value: number) => formatCurrency(value)}
                      labelFormatter={(d) => new Date(d).toLocaleDateString()}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="recovered_amount" stroke="#10b981" name="Recovered" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="failed_amount" stroke="#ef4444" name="Failed" strokeWidth={2} dot={false} strokeDasharray="6 3" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="card p-6" data-testid="failure-breakdown-chart">
                <h2 className="text-lg font-semibold text-slate-100 mb-4">Failure Breakdown</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={stats!.failure_breakdown} cx="50%" cy="50%" labelLine={false}
                      label={({ failure_code, percentage }) => `${failure_code.replace(/_/g, ' ')}: ${percentage.toFixed(0)}%`}
                      outerRadius={80} fill="#8884d8" dataKey="count">
                      {(stats!.failure_breakdown).map((_, i) => (
                        <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#111827', border: '1px solid #1e293b', borderRadius: '12px' }}
                      formatter={(value: number, _: string, props: any) => [
                        `${value} (${props.payload.percentage.toFixed(1)}%)`,
                        props.payload.failure_code.replace(/_/g, ' ')
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card p-6" data-testid="recent-activity-feed">
              <h2 className="text-lg font-semibold text-slate-100 mb-4">Recent Activity</h2>
              <div className="space-y-3">
                {activityMock.map((a, i) => (
                  <div key={i} className="flex items-start gap-3 py-2">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${a.color}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-300">{a.text}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{a.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

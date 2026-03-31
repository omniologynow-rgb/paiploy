import React, { useEffect, useState } from 'react';
import { TrendingUp, DollarSign, AlertCircle, RefreshCw, BarChart3 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Layout } from '../components/Layout';
import { apiClient } from '../api/client';

export const Analytics: React.FC = () => {
  const [timelineData, setTimelineData] = useState<any[]>([]);
  const [failureBreakdown, setFailureBreakdown] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiClient.getTimelineStats(timeRange),
      apiClient.getFailureBreakdown(),
    ])
      .then(([timeline, breakdown]) => {
        setTimelineData(timeline);
        setFailureBreakdown(breakdown);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [timeRange]);

  const formatCurrency = (cents: number) =>
    `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const totalFailed = timelineData.reduce((s, d) => s + d.failed_amount, 0);
  const totalRecovered = timelineData.reduce((s, d) => s + d.recovered_amount, 0);
  const recoveryRate = totalFailed > 0 ? ((totalRecovered / totalFailed) * 100).toFixed(1) : '0.0';

  return (
    <Layout>
      <div className="space-y-6" data-testid="analytics-page">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-100 mb-1">Analytics</h1>
            <p className="text-slate-400">Deep dive into your payment recovery performance</p>
          </div>
          <select
            data-testid="analytics-time-range"
            value={timeRange}
            onChange={(e) => setTimeRange(parseInt(e.target.value))}
            className="input-field w-auto"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <RefreshCw className="h-8 w-8 text-emerald-500 animate-spin" />
            <p className="text-slate-400 text-sm">Loading your recovery data...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="card p-5" data-testid="analytics-total-failed">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm">Total Failed</span>
                  <AlertCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="text-2xl font-bold text-slate-100">{formatCurrency(totalFailed)}</div>
              </div>
              <div className="card p-5" data-testid="analytics-total-recovered">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm">Total Recovered</span>
                  <DollarSign className="h-5 w-5 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-emerald-400">{formatCurrency(totalRecovered)}</div>
              </div>
              <div className="card p-5" data-testid="analytics-recovery-rate">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm">Recovery Rate</span>
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-slate-100">{recoveryRate}%</div>
              </div>
            </div>

            <div className="card p-6" data-testid="analytics-timeline-chart">
              <h2 className="text-lg font-semibold text-slate-100 mb-4">Failed vs Recovered Over Time</h2>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={timelineData}>
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
                  <Line type="monotone" dataKey="failed_amount" stroke="#ef4444" name="Failed" strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="recovered_amount" stroke="#10b981" name="Recovered" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="card p-6" data-testid="analytics-breakdown-chart">
              <h2 className="text-lg font-semibold text-slate-100 mb-4">Failure Reasons by Amount</h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={failureBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="failure_code" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }}
                    tickFormatter={(c) => c.replace(/_/g, ' ')} />
                  <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }}
                    tickFormatter={(v) => `$${(v / 100).toFixed(0)}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #1e293b', borderRadius: '12px' }}
                    labelStyle={{ color: '#f1f5f9' }}
                    formatter={(value: number) => formatCurrency(value)}
                    labelFormatter={(c) => c.replace(/_/g, ' ')}
                  />
                  <Legend />
                  <Bar dataKey="total_amount" fill="#10b981" name="Total Amount" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card p-6" data-testid="analytics-failure-table">
              <h2 className="text-lg font-semibold text-slate-100 mb-4">Failure Type Statistics</h2>
              {failureBreakdown.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-500/10 border border-slate-500/20 mb-4">
                    <BarChart3 className="h-7 w-7 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-200 mb-2">No data yet</h3>
                  <p className="text-slate-400 text-sm">Analytics will populate as payments are processed.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#1e293b]">
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Failure Type</th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Count</th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Amount</th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {failureBreakdown.map((item: any) => (
                        <tr key={item.failure_code} className="border-b border-[#1e293b]/50 hover:bg-surface-tertiary/30 transition-colors">
                          <td className="py-3 px-4 text-sm text-slate-200">{item.failure_code.replace(/_/g, ' ')}</td>
                          <td className="py-3 px-4 text-sm text-slate-400 text-right">{item.count}</td>
                          <td className="py-3 px-4 text-sm text-slate-400 text-right">{formatCurrency(item.total_amount)}</td>
                          <td className="py-3 px-4 text-sm text-slate-400 text-right">{item.percentage}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

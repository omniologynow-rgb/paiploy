import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, RefreshCw, X, Eye, CreditCard, ChevronLeft, ChevronRight } from 'lucide-react';
import { Layout } from '../components/Layout';
import { apiClient } from '../api/client';
import { useToast } from '../context/ToastContext';

interface FailedPayment {
  id: number;
  stripe_customer_id: string;
  customer_email: string;
  customer_name: string | null;
  amount_cents: number;
  currency: string;
  failure_code: string;
  failed_at: string;
  status: string;
  retry_count: number;
}

const statusBadge: Record<string, string> = {
  detected: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  retrying: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  recovered: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  exhausted: 'bg-red-500/10 text-red-400 border-red-500/20',
  canceled: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

export const FailedPayments: React.FC = () => {
  const { showToast } = useToast();
  const [payments, setPayments] = useState<FailedPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedFailureCode, setSelectedFailureCode] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const perPage = 10;

  useEffect(() => { fetchPayments(); }, [selectedStatus, selectedFailureCode]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (selectedStatus) filters.status = selectedStatus;
      if (selectedFailureCode) filters.failure_code = selectedFailureCode;
      const data = await apiClient.getFailedPayments(filters);
      setPayments(data);
      setPage(0);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async (id: number) => {
    try {
      await apiClient.retryPayment(id);
      showToast('Payment retry initiated', 'success');
      fetchPayments();
    } catch (error: any) {
      showToast(error.message || 'Failed to retry payment', 'error');
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm('Cancel recovery for this payment?')) return;
    try {
      await apiClient.cancelPayment(id);
      showToast('Recovery canceled', 'info');
      fetchPayments();
    } catch (error: any) {
      showToast(error.message || 'Failed to cancel', 'error');
    }
  };

  const formatCurrency = (cents: number, currency: string) =>
    `${currency.toUpperCase()} ${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const filtered = payments.filter(p =>
    p.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.stripe_customer_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice(page * perPage, (page + 1) * perPage);

  return (
    <Layout>
      <div className="space-y-6" data-testid="failed-payments-page">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 mb-1">Failed Payments</h1>
          <p className="text-slate-400">Monitor and manage failed payment recovery</p>
        </div>

        <div className="card p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                data-testid="payments-search"
                type="text"
                placeholder="Search by email, name, or customer ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <select
              data-testid="payments-status-filter"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="input-field"
            >
              <option value="">All Statuses</option>
              <option value="detected">Detected</option>
              <option value="retrying">Retrying</option>
              <option value="recovered">Recovered</option>
              <option value="exhausted">Exhausted</option>
              <option value="canceled">Canceled</option>
            </select>
            <select
              data-testid="payments-failure-filter"
              value={selectedFailureCode}
              onChange={(e) => setSelectedFailureCode(e.target.value)}
              className="input-field"
            >
              <option value="">All Failure Types</option>
              <option value="card_declined">Card Declined</option>
              <option value="insufficient_funds">Insufficient Funds</option>
              <option value="expired_card">Expired Card</option>
              <option value="processing_error">Processing Error</option>
              <option value="authentication_required">Auth Required</option>
            </select>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <RefreshCw className="h-8 w-8 text-emerald-500 animate-spin" />
              <p className="text-slate-400 text-sm">Loading your recovery data...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16" data-testid="payments-empty-state">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-500/10 border border-slate-500/20 mb-4">
                <CreditCard className="h-7 w-7 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-200 mb-2">No failed payments found</h3>
              <p className="text-slate-400 text-sm">When payments fail, they'll appear here for recovery.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full" data-testid="payments-table">
                  <thead>
                    <tr className="border-b border-[#1e293b]">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Failure</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Retries</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((p) => (
                      <tr key={p.id} className="border-b border-[#1e293b]/50 hover:bg-surface-tertiary/30 transition-colors" data-testid={`payment-row-${p.id}`}>
                        <td className="py-3 px-4">
                          <div className="text-sm font-medium text-slate-200">{p.customer_name || 'Unknown'}</div>
                          <div className="text-xs text-slate-500">{p.customer_email}</div>
                        </td>
                        <td className="py-3 px-4 text-sm font-medium text-slate-200">{formatCurrency(p.amount_cents, p.currency)}</td>
                        <td className="py-3 px-4 text-sm text-slate-400">{p.failure_code.replace(/_/g, ' ')}</td>
                        <td className="py-3 px-4 text-sm text-slate-400">{new Date(p.failed_at).toLocaleDateString()}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full border ${statusBadge[p.status] || statusBadge.detected}`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-400">{p.retry_count}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link to={`/payments/${p.id}`} data-testid={`payment-view-${p.id}`}
                              className="p-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-all" title="View">
                              <Eye className="h-4 w-4" />
                            </Link>
                            {p.status !== 'recovered' && p.status !== 'canceled' && (
                              <>
                                <button onClick={() => handleRetry(p.id)} data-testid={`payment-retry-${p.id}`}
                                  className="p-2 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 rounded-lg transition-all" title="Retry">
                                  <RefreshCw className="h-4 w-4" />
                                </button>
                                <button onClick={() => handleCancel(p.id)} data-testid={`payment-cancel-${p.id}`}
                                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all" title="Cancel">
                                  <X className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-[#1e293b] mt-4" data-testid="payments-pagination">
                  <span className="text-sm text-slate-500">
                    Showing {page * perPage + 1}-{Math.min((page + 1) * perPage, filtered.length)} of {filtered.length}
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                      data-testid="pagination-prev"
                      className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-surface-tertiary disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                      data-testid="pagination-next"
                      className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-surface-tertiary disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

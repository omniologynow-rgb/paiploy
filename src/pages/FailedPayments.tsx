import React, { useEffect, useState } from 'react';
import { Search, RefreshCw, X, Eye } from 'lucide-react';
import { Layout } from '../components/Layout';
import { apiClient } from '../api/client';

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

export const FailedPayments: React.FC = () => {
  const [payments, setPayments] = useState<FailedPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedFailureCode, setSelectedFailureCode] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPayments();
  }, [selectedStatus, selectedFailureCode]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (selectedStatus) filters.status = selectedStatus;
      if (selectedFailureCode) filters.failure_code = selectedFailureCode;

      const data = await apiClient.getFailedPayments(filters);
      setPayments(data);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async (id: number) => {
    try {
      await apiClient.retryPayment(id);
      fetchPayments();
    } catch (error) {
      console.error('Failed to retry payment:', error);
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm('Are you sure you want to cancel recovery for this payment?')) return;

    try {
      await apiClient.cancelPayment(id);
      fetchPayments();
    } catch (error) {
      console.error('Failed to cancel payment:', error);
    }
  };

  const formatCurrency = (cents: number, currency: string) => {
    return `${currency.toUpperCase()} ${(cents / 100).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      detected: 'bg-yellow-900/50 text-yellow-300 border-yellow-700',
      retrying: 'bg-blue-900/50 text-blue-300 border-blue-700',
      recovered: 'bg-green-900/50 text-green-300 border-green-700',
      exhausted: 'bg-red-900/50 text-red-300 border-red-700',
      canceled: 'bg-gray-700/50 text-gray-300 border-gray-600',
    };

    return (
      <span className={`px-2 py-1 text-xs rounded-full border ${colors[status] || colors.detected}`}>
        {status}
      </span>
    );
  };

  const filteredPayments = payments.filter(
    (payment) =>
      payment.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.stripe_customer_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Failed Payments</h1>
          <p className="text-gray-400">Monitor and manage failed payment recovery</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by email, name, or customer ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="detected">Detected</option>
              <option value="retrying">Retrying</option>
              <option value="recovered">Recovered</option>
              <option value="exhausted">Exhausted</option>
              <option value="canceled">Canceled</option>
            </select>

            <select
              value={selectedFailureCode}
              onChange={(e) => setSelectedFailureCode(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              No failed payments found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Customer</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Amount</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Failure Reason</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Failed At</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Retries</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="py-3 px-4">
                        <div className="text-white font-medium">
                          {payment.customer_name || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-400">{payment.customer_email}</div>
                      </td>
                      <td className="py-3 px-4 text-white">
                        {formatCurrency(payment.amount_cents, payment.currency)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-300">
                          {payment.failure_code.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-300">
                        {new Date(payment.failed_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(payment.status)}</td>
                      <td className="py-3 px-4 text-gray-300">{payment.retry_count}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => window.location.href = `/payments/${payment.id}`}
                            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-gray-800 rounded"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {payment.status !== 'recovered' && payment.status !== 'canceled' && (
                            <>
                              <button
                                onClick={() => handleRetry(payment.id)}
                                className="p-2 text-green-400 hover:text-green-300 hover:bg-gray-800 rounded"
                                title="Retry Now"
                              >
                                <RefreshCw className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleCancel(payment.id)}
                                className="p-2 text-red-400 hover:text-red-300 hover:bg-gray-800 rounded"
                                title="Cancel Recovery"
                              >
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
          )}
        </div>
      </div>
    </Layout>
  );
};

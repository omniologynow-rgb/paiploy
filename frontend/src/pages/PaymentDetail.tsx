import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Mail, X, User, CreditCard, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Layout } from '../components/Layout';
import { apiClient } from '../api/client';
import { useToast } from '../context/ToastContext';

interface PaymentData {
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
  max_retries?: number;
  recovery_events?: Array<{ type: string; timestamp: string; details?: string }>;
}

const failureExplanations: Record<string, string> = {
  card_declined: 'The card was declined by the issuing bank. This can happen for various reasons including suspected fraud or spending limits.',
  insufficient_funds: 'The customer does not have enough funds in their account to cover the charge.',
  expired_card: 'The card has expired and needs to be updated by the customer.',
  processing_error: 'A temporary error occurred during payment processing. Retrying usually resolves this.',
  authentication_required: 'The payment requires additional authentication (like 3D Secure) from the cardholder.',
};

const formatCurrency = (cents: number, currency: string = 'usd') =>
  `${currency.toUpperCase()} ${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const PaymentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();
  const [payment, setPayment] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    apiClient.getFailedPayment(Number(id))
      .then(setPayment)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleRetry = async () => {
    if (!payment) return;
    try {
      await apiClient.retryPayment(payment.id);
      showToast('Payment retry initiated', 'success');
      const updated = await apiClient.getFailedPayment(payment.id);
      setPayment(updated);
    } catch (err: any) {
      showToast(err.message || 'Retry failed', 'error');
    }
  };

  const handleSendEmail = async () => {
    if (!payment) return;
    try {
      await apiClient.sendDunningEmail(payment.id);
      showToast('Dunning email sent', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to send email', 'error');
    }
  };

  const handleCancel = async () => {
    if (!payment || !confirm('Cancel recovery for this payment?')) return;
    try {
      await apiClient.cancelPayment(payment.id);
      showToast('Recovery canceled', 'info');
      const updated = await apiClient.getFailedPayment(payment.id);
      setPayment(updated);
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel', 'error');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <RefreshCw className="h-8 w-8 text-emerald-500 animate-spin" />
          <p className="text-slate-400 text-sm">Loading payment details...</p>
        </div>
      </Layout>
    );
  }

  if (!payment) {
    return (
      <Layout>
        <div className="text-center py-16" data-testid="payment-not-found">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-500/10 border border-slate-500/20 mb-4">
            <AlertCircle className="h-7 w-7 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-200 mb-2">Payment not found</h3>
          <Link to="/payments" className="text-emerald-400 hover:text-emerald-300 text-sm">Back to payments</Link>
        </div>
      </Layout>
    );
  }

  const maxRetries = payment.max_retries || 5;
  const timelineSteps = [];
  timelineSteps.push({ label: 'Failed', done: true, icon: XCircle, color: 'text-red-400 bg-red-500/10 border-red-500/20' });
  for (let i = 1; i <= maxRetries; i++) {
    const done = i <= payment.retry_count;
    const isCurrent = i === payment.retry_count + 1 && payment.status !== 'recovered' && payment.status !== 'canceled';
    if (done) {
      timelineSteps.push({ label: `Retry ${i}`, done: true, icon: RefreshCw, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' });
    } else if (isCurrent) {
      timelineSteps.push({ label: `Retry ${i}`, done: false, current: true, icon: Clock, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' });
    } else {
      timelineSteps.push({ label: `Retry ${i}`, done: false, icon: Clock, color: 'text-slate-500 bg-slate-500/10 border-slate-500/20' });
    }
    if (i <= 3) {
      const emailDone = done;
      timelineSteps.push({ label: `Email ${i}`, done: emailDone, icon: Mail, color: emailDone ? 'text-blue-400 bg-blue-500/10 border-blue-500/20' : 'text-slate-500 bg-slate-500/10 border-slate-500/20' });
    }
  }
  if (payment.status === 'recovered') {
    timelineSteps.push({ label: 'Recovered', done: true, icon: CheckCircle, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' });
  }

  const statusColors: Record<string, string> = {
    detected: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    retrying: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    recovered: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    exhausted: 'bg-red-500/10 text-red-400 border-red-500/20',
    canceled: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  };

  return (
    <Layout>
      <div className="space-y-6" data-testid="payment-detail-page">
        <div className="flex items-center gap-4">
          <Link to="/payments" data-testid="payment-back-btn" className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-surface-tertiary transition-all">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Payment #{payment.id}</h1>
            <p className="text-sm text-slate-400">{payment.customer_email}</p>
          </div>
          <span className={`ml-auto inline-flex px-3 py-1.5 text-xs font-semibold rounded-full border ${statusColors[payment.status] || statusColors.detected}`}>
            {payment.status}
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Customer Info */}
          <div className="card p-6" data-testid="payment-customer-info">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Customer Info</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-200">{payment.customer_name || 'Unknown'}</p>
                  <p className="text-xs text-slate-500">{payment.customer_email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-500/10 flex items-center justify-center">
                  <CreditCard className="h-4 w-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Stripe Customer ID</p>
                  <p className="text-sm font-mono text-slate-300">{payment.stripe_customer_id}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="card p-6" data-testid="payment-details">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Payment Details</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-500">Amount</p>
                <p className="text-2xl font-bold text-amber-400">{formatCurrency(payment.amount_cents, payment.currency)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Failure Code</p>
                <p className="text-sm font-medium text-red-400">{payment.failure_code.replace(/_/g, ' ')}</p>
                <p className="text-xs text-slate-500 mt-1">{failureExplanations[payment.failure_code] || 'Payment processing failed.'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Failed At</p>
                <p className="text-sm text-slate-300">{new Date(payment.failed_at).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recovery Timeline */}
        <div className="card p-6" data-testid="recovery-timeline">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6">Recovery Timeline</h3>
          <div className="flex flex-wrap gap-2 items-center">
            {timelineSteps.map((step, i) => {
              const Icon = step.icon;
              return (
                <React.Fragment key={i}>
                  {i > 0 && <div className={`w-6 h-px ${step.done ? 'bg-emerald-500/30' : 'bg-slate-700'}`} />}
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${step.color} ${(step as any).current ? 'ring-1 ring-blue-500/30' : ''}`}>
                    <Icon className="h-4 w-4" />
                    <span className="text-xs font-medium whitespace-nowrap">{step.label}</span>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        {payment.status !== 'recovered' && payment.status !== 'canceled' && (
          <div className="flex flex-wrap gap-3" data-testid="payment-actions">
            <button onClick={handleRetry} data-testid="payment-retry-btn" className="btn-primary px-5 py-2.5 flex items-center gap-2">
              <RefreshCw className="h-4 w-4" /> Retry Now
            </button>
            <button onClick={handleSendEmail} data-testid="payment-send-email-btn" className="btn-secondary px-5 py-2.5 flex items-center gap-2">
              <Mail className="h-4 w-4" /> Send Email
            </button>
            <button onClick={handleCancel} data-testid="payment-cancel-btn" className="btn-danger px-5 py-2.5 flex items-center gap-2">
              <X className="h-4 w-4" /> Cancel Recovery
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

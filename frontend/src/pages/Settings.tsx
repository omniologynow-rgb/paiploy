import React, { useEffect, useState } from 'react';
import { Save, Link as LinkIcon, Unlink, CreditCard, ArrowRight, Trash2, AlertTriangle, RefreshCw } from 'lucide-react';
import { Layout } from '../components/Layout';
import { apiClient } from '../api/client';
import { useToast } from '../context/ToastContext';

interface UserSettings {
  id: number;
  max_retry_attempts: number;
  retry_interval_1_hours: number;
  retry_interval_2_hours: number;
  retry_interval_3_hours: number;
  retry_interval_4_hours: number;
  retry_interval_5_hours: number;
  send_friendly_reminder: boolean;
  send_urgent_notice: boolean;
  send_card_update_request: boolean;
  send_final_warning: boolean;
  support_email: string | null;
}

export const Settings: React.FC = () => {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    Promise.all([
      apiClient.getSettings().then(setSettings).catch(console.error),
      apiClient.getConnectionStatus().then(() => setIsConnected(true)).catch(() => setIsConnected(false)),
    ]).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await apiClient.updateSettings(settings);
      showToast('Settings saved successfully', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleConnectStripe = async () => {
    try {
      const { authorization_url } = await apiClient.getAuthorizeUrl();
      window.location.href = authorization_url;
    } catch (error) {
      showToast('Failed to get authorization URL', 'error');
    }
  };

  const handleDisconnectStripe = async () => {
    if (!confirm('Disconnect your Stripe account? Recovery will stop.')) return;
    try {
      await apiClient.disconnectStripe();
      setIsConnected(false);
      showToast('Stripe account disconnected', 'info');
    } catch (error: any) {
      showToast(error.message || 'Failed to disconnect', 'error');
    }
  };

  const retrySteps = settings ? [
    { label: 'Retry 1', key: 'retry_interval_1_hours', value: settings.retry_interval_1_hours },
    { label: 'Retry 2', key: 'retry_interval_2_hours', value: settings.retry_interval_2_hours },
    { label: 'Retry 3', key: 'retry_interval_3_hours', value: settings.retry_interval_3_hours },
    { label: 'Retry 4', key: 'retry_interval_4_hours', value: settings.retry_interval_4_hours },
    { label: 'Retry 5', key: 'retry_interval_5_hours', value: settings.retry_interval_5_hours },
  ] : [];

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <RefreshCw className="h-8 w-8 text-emerald-500 animate-spin" />
          <p className="text-slate-400 text-sm">Loading your recovery data...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6" data-testid="settings-page">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 mb-1">Settings</h1>
          <p className="text-slate-400">Configure your payment recovery preferences</p>
        </div>

        {/* Stripe Connection - Hero Card */}
        <div className={`card p-6 ${isConnected ? 'border-emerald-500/20' : 'border-amber-500/20'}`} data-testid="stripe-connection-card">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex-shrink-0">
              <CreditCard className="h-7 w-7 text-emerald-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-100 mb-1">Stripe Connection</h2>
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]'}`} />
                <span className="text-sm text-slate-300">{isConnected ? 'Connected' : 'Not connected'}</span>
              </div>
              <p className="text-sm text-slate-500">{isConnected ? 'Your Stripe account is linked and monitoring for failed payments.' : 'Connect your Stripe account to start recovering failed payments.'}</p>
            </div>
            {isConnected ? (
              <button onClick={handleDisconnectStripe} data-testid="disconnect-stripe-btn"
                className="btn-danger px-5 py-2.5 flex items-center gap-2 flex-shrink-0">
                <Unlink className="h-4 w-4" /> Disconnect
              </button>
            ) : (
              <button onClick={handleConnectStripe} data-testid="connect-stripe-btn"
                className="btn-primary px-5 py-2.5 flex items-center gap-2 flex-shrink-0">
                <LinkIcon className="h-4 w-4" /> Connect Stripe
              </button>
            )}
          </div>
        </div>

        {settings && (
          <>
            {/* Retry Schedule - Visual Timeline */}
            <div className="card p-6" data-testid="retry-schedule-section">
              <h2 className="text-xl font-bold text-slate-100 mb-2">Retry Schedule</h2>
              <p className="text-sm text-slate-400 mb-6">Configure when retries happen after a payment fails.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Maximum Retry Attempts</label>
                  <input data-testid="settings-max-retries" type="number" min="1" max="10"
                    value={settings.max_retry_attempts}
                    onChange={(e) => setSettings({ ...settings, max_retry_attempts: parseInt(e.target.value) })}
                    className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Support Email</label>
                  <input data-testid="settings-support-email" type="email"
                    value={settings.support_email || ''}
                    onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
                    placeholder="support@yourcompany.com" className="input-field" />
                </div>
              </div>

              {/* Visual Timeline */}
              <div className="bg-surface-primary rounded-xl p-5 border border-[#1e293b]" data-testid="retry-timeline-visual">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Retry Timeline</p>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
                    Payment Fails
                  </div>
                  {retrySteps.slice(0, settings.max_retry_attempts).map((step, i) => (
                    <React.Fragment key={step.key}>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <ArrowRight className="h-3 w-3" />
                        <span>{step.value}h</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                        <span className="text-xs font-medium text-amber-400">{step.label}</span>
                        <input
                          data-testid={`settings-${step.key}`}
                          type="number" min="1"
                          value={step.value}
                          onChange={(e) => setSettings({ ...settings, [step.key]: parseInt(e.target.value) })}
                          className="w-14 px-2 py-1 text-xs bg-surface-input border border-[#1e293b] rounded text-slate-200 text-center focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                        />
                        <span className="text-xs text-slate-500">hrs</span>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            {/* Email Notifications */}
            <div className="card p-6" data-testid="email-notifications-section">
              <h2 className="text-xl font-bold text-slate-100 mb-2">Email Notifications</h2>
              <p className="text-sm text-slate-400 mb-5">Choose which dunning emails to send during recovery.</p>
              <div className="space-y-3">
                {[
                  { key: 'send_friendly_reminder', label: 'Friendly Reminder (Attempt 2)', checked: settings.send_friendly_reminder },
                  { key: 'send_urgent_notice', label: 'Urgent Notice (Attempt 3)', checked: settings.send_urgent_notice },
                  { key: 'send_card_update_request', label: 'Card Update Request (Attempt 4)', checked: settings.send_card_update_request },
                  { key: 'send_final_warning', label: 'Final Warning (Attempt 5)', checked: settings.send_final_warning },
                ].map(item => (
                  <label key={item.key} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-surface-tertiary/30 cursor-pointer transition-colors">
                    <input
                      data-testid={`settings-${item.key}`}
                      type="checkbox" checked={item.checked}
                      onChange={(e) => setSettings({ ...settings, [item.key]: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-600 text-emerald-600 focus:ring-emerald-500 bg-surface-input"
                    />
                    <span className="text-sm text-slate-300">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button onClick={handleSave} disabled={saving} data-testid="settings-save-btn"
                className="btn-primary px-6 py-3 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
                <Save className="h-5 w-5" />
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>

            {/* Danger Zone */}
            <div className="card p-6 border-red-500/20" data-testid="danger-zone">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <h2 className="text-lg font-bold text-red-400">Danger Zone</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                {isConnected && (
                  <button onClick={handleDisconnectStripe} data-testid="danger-disconnect-stripe"
                    className="btn-danger px-5 py-2.5 flex items-center gap-2">
                    <Unlink className="h-4 w-4" /> Disconnect Stripe
                  </button>
                )}
                <button data-testid="danger-delete-account"
                  className="btn-danger px-5 py-2.5 flex items-center gap-2"
                  onClick={() => { if (confirm('This action is irreversible. Delete your account?')) showToast('Account deletion is handled by support', 'info'); }}
                >
                  <Trash2 className="h-4 w-4" /> Delete Account
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

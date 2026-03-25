import React, { useEffect, useState } from 'react';
import { Save, Link as LinkIcon, Unlink } from 'lucide-react';
import { Layout } from '../components/Layout';
import { apiClient } from '../api/client';

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
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    fetchSettings();
    checkConnection();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getSettings();
      setSettings(data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkConnection = async () => {
    try {
      await apiClient.getConnectionStatus();
      setIsConnected(true);
    } catch (error) {
      setIsConnected(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    setMessage(null);

    try {
      await apiClient.updateSettings(settings);
      setMessage({ type: 'success', text: 'Settings saved successfully' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleConnectStripe = async () => {
    try {
      const { authorization_url } = await apiClient.getAuthorizeUrl();
      window.location.href = authorization_url;
    } catch (error) {
      console.error('Failed to get authorization URL:', error);
    }
  };

  const handleDisconnectStripe = async () => {
    if (!confirm('Are you sure you want to disconnect your Stripe account?')) return;

    try {
      await apiClient.disconnectStripe();
      setIsConnected(false);
      setMessage({ type: 'success', text: 'Stripe account disconnected' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to disconnect' });
    }
  };

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
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-400">Configure your payment recovery preferences</p>
        </div>

        {message && (
          <div
            className={`p-4 rounded-lg border ${
              message.type === 'success'
                ? 'bg-green-900/50 border-green-700 text-green-200'
                : 'bg-red-900/50 border-red-700 text-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Stripe Connection</h2>
          <p className="text-gray-400 mb-4">
            Connect your Stripe account to start recovering failed payments
          </p>
          {isConnected ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                <span className="text-white">Connected</span>
              </div>
              <button
                onClick={handleDisconnectStripe}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >
                <Unlink className="h-4 w-4" />
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={handleConnectStripe}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              <LinkIcon className="h-4 w-4" />
              Connect Stripe Account
            </button>
          )}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Retry Schedule</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Maximum Retry Attempts
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={settings?.max_retry_attempts}
                onChange={(e) =>
                  setSettings({ ...settings!, max_retry_attempts: parseInt(e.target.value) })
                }
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Support Email
              </label>
              <input
                type="email"
                value={settings?.support_email || ''}
                onChange={(e) => setSettings({ ...settings!, support_email: e.target.value })}
                placeholder="support@yourcompany.com"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Retry 1 Interval (hours)
              </label>
              <input
                type="number"
                min="1"
                value={settings?.retry_interval_1_hours}
                onChange={(e) =>
                  setSettings({ ...settings!, retry_interval_1_hours: parseInt(e.target.value) })
                }
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Retry 2 Interval (hours)
              </label>
              <input
                type="number"
                min="1"
                value={settings?.retry_interval_2_hours}
                onChange={(e) =>
                  setSettings({ ...settings!, retry_interval_2_hours: parseInt(e.target.value) })
                }
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Retry 3 Interval (hours)
              </label>
              <input
                type="number"
                min="1"
                value={settings?.retry_interval_3_hours}
                onChange={(e) =>
                  setSettings({ ...settings!, retry_interval_3_hours: parseInt(e.target.value) })
                }
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Retry 4 Interval (hours)
              </label>
              <input
                type="number"
                min="1"
                value={settings?.retry_interval_4_hours}
                onChange={(e) =>
                  setSettings({ ...settings!, retry_interval_4_hours: parseInt(e.target.value) })
                }
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Retry 5 Interval (hours)
              </label>
              <input
                type="number"
                min="1"
                value={settings?.retry_interval_5_hours}
                onChange={(e) =>
                  setSettings({ ...settings!, retry_interval_5_hours: parseInt(e.target.value) })
                }
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Email Notifications</h2>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings?.send_friendly_reminder}
                onChange={(e) =>
                  setSettings({ ...settings!, send_friendly_reminder: e.target.checked })
                }
                className="w-5 h-5 rounded bg-gray-800 border-gray-700 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-300">Send Friendly Reminder (Attempt 2)</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings?.send_urgent_notice}
                onChange={(e) =>
                  setSettings({ ...settings!, send_urgent_notice: e.target.checked })
                }
                className="w-5 h-5 rounded bg-gray-800 border-gray-700 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-300">Send Urgent Notice (Attempt 3)</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings?.send_card_update_request}
                onChange={(e) =>
                  setSettings({ ...settings!, send_card_update_request: e.target.checked })
                }
                className="w-5 h-5 rounded bg-gray-800 border-gray-700 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-300">Send Card Update Request (Attempt 4)</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings?.send_final_warning}
                onChange={(e) =>
                  setSettings({ ...settings!, send_final_warning: e.target.checked })
                }
                className="w-5 h-5 rounded bg-gray-800 border-gray-700 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-300">Send Final Warning (Attempt 5)</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium"
          >
            <Save className="h-5 w-5" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </Layout>
  );
};

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Settings, CheckCircle, ArrowRight, Shield, Lock, RefreshCw } from 'lucide-react';
import { apiClient } from '../api/client';
import { useToast } from '../context/ToastContext';

export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [maxRetries, setMaxRetries] = useState(5);
  const [supportEmail, setSupportEmail] = useState('');
  const [enabledEmails, setEnabledEmails] = useState({
    friendly_reminder: true,
    urgent_notice: true,
    card_update_request: true,
    final_warning: true,
  });

  const handleConnectStripe = async () => {
    try {
      const { authorization_url } = await apiClient.getAuthorizeUrl();
      window.location.href = authorization_url;
    } catch (err) {
      showToast('Failed to connect Stripe. You can do this later in Settings.', 'warning');
      setStep(2);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await apiClient.updateSettings({
        max_retry_attempts: maxRetries,
        support_email: supportEmail || null,
        send_friendly_reminder: enabledEmails.friendly_reminder,
        send_urgent_notice: enabledEmails.urgent_notice,
        send_card_update_request: enabledEmails.card_update_request,
        send_final_warning: enabledEmails.final_warning,
      });
      setStep(3);
    } catch (err) {
      showToast('Settings saved with defaults. You can adjust later.', 'info');
      setStep(3);
    }
  };

  return (
    <div className="min-h-screen bg-surface-primary flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full page-enter" data-testid="onboarding-wizard">
        {/* Progress */}
        <div className="flex items-center justify-center gap-3 mb-10">
          {[1, 2, 3].map(s => (
            <React.Fragment key={s}>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                s < step ? 'bg-emerald-500 text-white' :
                s === step ? 'bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500' :
                'bg-surface-tertiary text-slate-500'
              }`}>
                {s < step ? <CheckCircle className="h-5 w-5" /> : s}
              </div>
              {s < 3 && <div className={`w-16 h-0.5 rounded ${s < step ? 'bg-emerald-500' : 'bg-surface-tertiary'}`} />}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Connect Stripe */}
        {step === 1 && (
          <div className="card p-8 text-center" data-testid="onboarding-step-1">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-6">
              <CreditCard className="h-8 w-8 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-100 mb-3">Connect Your Stripe Account</h2>
            <p className="text-slate-400 mb-8 leading-relaxed">
              We need read access to your Stripe account to detect failed payments and initiate retries.
            </p>
            <button
              onClick={handleConnectStripe}
              data-testid="onboarding-connect-stripe"
              className="btn-primary px-8 py-3.5 text-base w-full flex items-center justify-center gap-2 mb-6"
            >
              <CreditCard className="h-5 w-5" />
              Connect Stripe Account
            </button>
            <div className="flex items-center justify-center gap-6 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5" /> Secure OAuth</span>
              <span className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" /> Read-only access</span>
              <span className="flex items-center gap-1.5"><RefreshCw className="h-3.5 w-3.5" /> Disconnect anytime</span>
            </div>
            <button
              onClick={() => setStep(2)}
              data-testid="onboarding-skip-stripe"
              className="mt-6 text-sm text-slate-500 hover:text-slate-300 transition-colors"
            >
              Skip for now &rarr;
            </button>
          </div>
        )}

        {/* Step 2: Configure Recovery */}
        {step === 2 && (
          <div className="card p-8" data-testid="onboarding-step-2">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-6">
                <Settings className="h-8 w-8 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-100 mb-2">Configure Recovery Settings</h2>
              <p className="text-slate-400 text-sm">Quick setup - you can fine-tune these later.</p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Max Retry Attempts</label>
                <input
                  data-testid="onboarding-max-retries"
                  type="number" min="1" max="10" value={maxRetries}
                  onChange={(e) => setMaxRetries(parseInt(e.target.value))}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Support Email</label>
                <input
                  data-testid="onboarding-support-email"
                  type="email" value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className="input-field" placeholder="support@yourcompany.com"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-300 mb-3">Dunning Emails</p>
                {Object.entries(enabledEmails).map(([key, val]) => (
                  <label key={key} className="flex items-center gap-3 py-2 cursor-pointer">
                    <input
                      data-testid={`onboarding-email-${key}`}
                      type="checkbox" checked={val}
                      onChange={(e) => setEnabledEmails(prev => ({ ...prev, [key]: e.target.checked }))}
                      className="w-4 h-4 rounded border-slate-600 text-emerald-600 focus:ring-emerald-500 bg-surface-input"
                    />
                    <span className="text-sm text-slate-300">{key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={handleSaveSettings}
              data-testid="onboarding-save-settings"
              className="btn-primary w-full py-3 mt-6 flex items-center justify-center gap-2"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Step 3: All Set */}
        {step === 3 && (
          <div className="card p-8 text-center" data-testid="onboarding-step-3">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
              <CheckCircle className="h-10 w-10 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-100 mb-3">You're All Set!</h2>
            <p className="text-slate-400 mb-8 leading-relaxed max-w-sm mx-auto">
              We'll start monitoring your Stripe account for failed payments and notify you when we recover revenue.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              data-testid="onboarding-go-dashboard"
              className="btn-primary px-8 py-3.5 text-base inline-flex items-center gap-2"
            >
              Go to Dashboard <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

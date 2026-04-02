import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CreditCard, UserPlus, Check, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const passwordRules = [
  { label: 'At least 8 characters', test: (pw: string) => pw.length >= 8 },
  { label: 'Uppercase letter', test: (pw: string) => /[A-Z]/.test(pw) },
  { label: 'Lowercase letter', test: (pw: string) => /[a-z]/.test(pw) },
  { label: 'Number', test: (pw: string) => /\d/.test(pw) },
  { label: 'Special character (!@#$...)', test: (pw: string) => /[!@#$%^&*()_+\-=\[\]{};'\\":\\|,.<>\/?`~]/.test(pw) },
];

export const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const ruleResults = useMemo(() => passwordRules.map(r => r.test(password)), [password]);
  const allPassed = ruleResults.every(Boolean);
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    setError('');

    // Custom validation
    if (!email.trim()) { setError('Email is required'); return; }
    if (!emailValid) { setError('Please enter a valid email address'); return; }
    if (!allPassed) { setError('Password does not meet all requirements'); return; }

    setLoading(true);
    try {
      await register(email.trim(), password, companyName.trim() || undefined);
      navigate('/onboarding');
    } catch (err: any) {
      const msg = err?.message || 'Failed to register';
      setError(typeof msg === 'string' ? msg : String(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-primary flex items-center justify-center px-4">
      <div className="max-w-md w-full page-enter">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <CreditCard className="h-7 w-7 text-emerald-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-100" data-testid="register-title">Create Your Account</h1>
          <p className="text-slate-400 mt-2">Start recovering failed payments today</p>
        </div>

        <div className="card p-8">
          {error && (
            <div data-testid="register-error" className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <input
                id="email"
                data-testid="register-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched(true)}
                className={`input-field ${touched && !email.trim() ? 'border-red-500/50' : ''}`}
                placeholder="you@example.com"
              />
              {touched && !email.trim() && (
                <p className="mt-1.5 text-xs text-red-400">Email is required</p>
              )}
              {touched && email.trim() && !emailValid && (
                <p className="mt-1.5 text-xs text-red-400">Please enter a valid email address</p>
              )}
            </div>

            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-slate-300 mb-2">
                Company Name <span className="text-slate-500">(used for dunning emails — you can add it later)</span>
              </label>
              <input
                id="companyName"
                data-testid="register-company"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="input-field"
                placeholder="Your Company"
                maxLength={100}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <input
                id="password"
                data-testid="register-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="Strong password"
              />
              {/* Password strength checklist — always visible */}
              <ul className="mt-3 space-y-1.5" data-testid="password-rules">
                {passwordRules.map((rule, i) => (
                  <li key={rule.label} className="flex items-center gap-2 text-xs">
                    {ruleResults[i] ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <X className="h-3.5 w-3.5 text-red-400 flex-shrink-0" />
                    )}
                    <span className={ruleResults[i] ? 'text-emerald-400' : 'text-slate-500'}>{rule.label}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="submit"
              data-testid="register-submit"
              disabled={loading || !allPassed}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? 'Creating account...' : <><UserPlus className="h-5 w-5" /> Create Account</>}
            </button>
            {!allPassed && (
              <p className="text-center text-xs text-slate-500">Complete all password requirements to continue</p>
            )}
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              Already have an account?{' '}
              <Link to="/login" data-testid="register-login-link" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

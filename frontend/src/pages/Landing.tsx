import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CreditCard, TrendingUp, Mail, BarChart3, Check, X as XIcon, ArrowRight,
  Zap, Shield, Clock, Bell, Calculator, ChevronRight, Link2, Settings, ChevronDown, HelpCircle, MessageCircle,
  Instagram, ExternalLink, User, Heart, Rocket
} from 'lucide-react';

const DashboardMockup = () => (
  <div className="relative w-full max-w-md mx-auto">
    <div className="absolute -inset-4 bg-emerald-500/10 rounded-3xl blur-2xl" />
    <div className="relative bg-surface-secondary border border-[#1e293b] rounded-2xl p-5 shadow-2xl">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
        <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
        <span className="ml-2 text-[10px] text-slate-500">Paiploy Dashboard</span>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-surface-primary rounded-lg p-3 border border-[#1e293b]">
          <p className="text-[10px] text-slate-500 mb-1">Recovered</p>
          <p className="text-lg font-bold text-emerald-400">$12,847</p>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className="h-3 w-3 text-emerald-400" />
            <span className="text-[10px] text-emerald-400">+23%</span>
          </div>
        </div>
        <div className="bg-surface-primary rounded-lg p-3 border border-[#1e293b]">
          <p className="text-[10px] text-slate-500 mb-1">Recovery Rate</p>
          <p className="text-lg font-bold text-slate-100">38.2%</p>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className="h-3 w-3 text-emerald-400" />
            <span className="text-[10px] text-emerald-400">+5.1%</span>
          </div>
        </div>
      </div>
      <div className="bg-surface-primary rounded-lg p-3 border border-[#1e293b]">
        <div className="flex justify-between items-center mb-3">
          <span className="text-[10px] text-slate-500">Recovery Trend</span>
          <span className="text-[10px] text-emerald-400">Last 7 days</span>
        </div>
        <svg viewBox="0 0 200 60" className="w-full h-12">
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M0,50 L30,40 L60,45 L90,30 L120,35 L150,20 L180,15 L200,10 L200,60 L0,60Z" fill="url(#chartGrad)" />
          <path d="M0,50 L30,40 L60,45 L90,30 L120,35 L150,20 L180,15 L200,10" fill="none" stroke="#10b981" strokeWidth="2" />
        </svg>
      </div>
    </div>
  </div>
);

const features = [
  { icon: CreditCard, title: 'Automated Payment Retries', description: 'Smart retry logic with exponential backoff to maximize recovery success rates.' },
  { icon: Mail, title: 'Intelligent Dunning Campaigns', description: 'Professional email templates that engage customers and encourage payment updates.' },
  { icon: BarChart3, title: 'Real-time Analytics', description: 'Track recovery rates, revenue saved, and identify trends in payment failures.' },
  { icon: TrendingUp, title: 'Reduce Churn', description: 'Recover 30-40% of failed payments automatically and reduce involuntary churn.' },
  { icon: Clock, title: 'AI-Powered Retry Timing', description: 'Optimal retry windows based on decline codes and card type for maximum success.' },
  { icon: Bell, title: 'Pre-Dunning Alerts', description: 'Catch expiring cards before they fail with proactive customer notifications.' },
];

const RevenueCalculator = () => {
  const [revenue, setRevenue] = useState(50000);
  const [failRate, setFailRate] = useState(5);
  const RECOVERY_RATE = 0.67;

  const monthlyLost = revenue * (failRate / 100);
  const monthlyRecovered = monthlyLost * RECOVERY_RATE;

  const fmt = (n: number) =>
    n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

  return (
    <div className="card p-8" data-testid="revenue-calculator">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label htmlFor="calc-revenue" className="block text-sm font-medium text-slate-300 mb-2">
              Monthly Revenue
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
              <input
                id="calc-revenue"
                data-testid="calc-revenue-input"
                type="number"
                min="0"
                step="1000"
                value={revenue}
                onChange={(e) => setRevenue(Math.max(0, Number(e.target.value)))}
                className="input-field pl-8 text-lg font-semibold"
              />
            </div>
          </div>
          <div>
            <label htmlFor="calc-fail-rate" className="flex items-center justify-between text-sm font-medium text-slate-300 mb-2">
              <span>Failed Payment Rate</span>
              <span className="text-emerald-400 font-bold">{failRate}%</span>
            </label>
            <input
              id="calc-fail-rate"
              data-testid="calc-fail-rate-input"
              type="range"
              min="1"
              max="20"
              value={failRate}
              onChange={(e) => setFailRate(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer bg-surface-tertiary
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500
                [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(16,185,129,0.4)] [&::-webkit-slider-thumb]:cursor-pointer"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>1%</span>
              <span>Industry avg: 5%</span>
              <span>20%</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center text-center bg-surface-primary rounded-xl p-6 border border-[#1e293b]">
          <p className="text-sm text-red-400 font-medium mb-1">You're losing</p>
          <p className="text-2xl font-bold text-red-400 mb-4" data-testid="calc-losing-amount">{fmt(monthlyLost)}/mo</p>
          <div className="w-12 h-px bg-[#1e293b] mb-4" />
          <p className="text-sm text-emerald-400 font-medium mb-1">Paiploy recovers</p>
          <p className="text-4xl font-extrabold text-emerald-400 mb-1" data-testid="calc-recovered-amount">~{fmt(monthlyRecovered)}</p>
          <p className="text-xs text-slate-500 mb-6">per month (67% avg recovery rate)</p>
          <Link
            to="/register"
            data-testid="calc-cta"
            className="btn-primary px-6 py-2.5 text-sm inline-flex items-center gap-2"
          >
            Start Free <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

const comparisonData = [
  { feature: 'Smart Retries', paiploy: true, churnBuster: true, churnKey: true, diy: false },
  { feature: 'Dunning Emails', paiploy: true, churnBuster: true, churnKey: true, diy: false },
  { feature: 'AI Retry Timing', paiploy: 'soon' as const, churnBuster: false, churnKey: true, diy: false },
  { feature: 'Pre-Dunning', paiploy: true, churnBuster: true, churnKey: true, diy: false },
  { feature: 'SMS Recovery', paiploy: 'soon' as const, churnBuster: true, churnKey: true, diy: false },
  { feature: 'Cancel Deflection', paiploy: false, churnBuster: false, churnKey: true, diy: false },
  { feature: 'Custom Templates', paiploy: true, churnBuster: true, churnKey: true, diy: false },
  { feature: 'Free Tier', paiploy: true, churnBuster: false, churnKey: false, diy: true },
];

const plans = [
  {
    name: 'Free',
    price: '$0',
    desc: 'Get started with basics',
    features: ['Up to $5K MRR', 'Smart retries', '4 email templates', 'Basic dashboard'],
  },
  {
    name: 'Pro',
    price: '$39',
    popular: true,
    desc: 'For growing businesses',
    features: ['Unlimited MRR', 'AI retry optimization', 'Custom email templates', 'SMS dunning', 'Full analytics'],
  },
  {
    name: 'Business',
    price: '$99',
    desc: 'For scaling teams',
    features: ['Everything in Pro', 'In-app payment wall', 'Multi-account management', 'API access', 'Priority support'],
  },
];

const FaqItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-4 p-5 text-left hover:bg-surface-tertiary/30 transition-colors"
      >
        <span className="text-sm font-medium text-slate-200">{question}</span>
        <ChevronDown className={`h-5 w-5 text-slate-400 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-5 pb-5 -mt-1">
          <p className="text-sm text-slate-400 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
};

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-surface-primary text-slate-100">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-surface-primary/80 backdrop-blur-xl border-b border-[#1e293b]/50" data-testid="landing-navbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/15">
                <CreditCard className="h-4.5 w-4.5 text-emerald-400" />
              </div>
              <span className="text-lg font-bold text-slate-100 tracking-tight" data-testid="landing-logo">Paiploy</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-slate-400 hover:text-slate-200 transition-colors">Features</a>
              <a href="#pricing" className="text-sm text-slate-400 hover:text-slate-200 transition-colors">Pricing</a>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/login" data-testid="landing-login" className="text-sm text-slate-300 hover:text-slate-100 transition-colors px-3 py-2">
                Login
              </Link>
              <Link to="/register" data-testid="landing-cta-start" className="btn-primary px-5 py-2 text-sm">
                Start Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4" data-testid="hero-section">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-6">
              <Zap className="h-3.5 w-3.5" />
              Recover 40% of failed payments
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] mb-6">
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Stop Losing Revenue
              </span>
              <br />
              to Failed Payments
            </h1>
            <p className="text-lg text-slate-400 mb-8 max-w-lg leading-relaxed">
              Paiploy automatically retries failed transactions, sends intelligent dunning emails, and recovers revenue you thought was lost.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/register" data-testid="hero-cta" className="btn-primary px-7 py-3.5 text-base inline-flex items-center gap-2">
                Start Recovering Free
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
            <p className="mt-4 text-sm text-slate-500">No credit card required</p>
          </div>
          <DashboardMockup />
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 border-y border-[#1e293b]" data-testid="social-proof-section">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-center text-sm text-slate-500 mb-8">Built for subscription businesses of every size</p>
          <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
            {[
              { num: '67%', label: 'avg recovery rate' },
              { num: '<5min', label: 'setup time' },
              { num: '$0', label: 'to get started' },
              { num: '13', label: 'webhook events tracked' },
              { num: '24/7', label: 'automated retries' },
            ].map(item => (
              <div key={item.label} className="text-center">
                <p className="text-lg font-bold text-emerald-400">{item.num}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem / Solution */}
      <section className="py-24 px-4" data-testid="problem-solution-section">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12">
          <div className="card p-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 mb-6">
              <XIcon className="h-6 w-6 text-red-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-100 mb-4">The Problem</h3>
            <ul className="space-y-4 text-slate-400">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 flex-shrink-0" />
                <span>67% of failed payments go unrecovered without proper dunning</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 flex-shrink-0" />
                <span>$443 billion lost globally in payment failures each year</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 flex-shrink-0" />
                <span>Manual recovery processes drain engineering resources</span>
              </li>
            </ul>
          </div>
          <div className="card p-8 border-emerald-500/20">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-6">
              <Check className="h-6 w-6 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-100 mb-4">The Paiploy Solution</h3>
            <ul className="space-y-4 text-slate-400">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                <span>Smart retries based on decline codes and optimal timing</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                <span>Escalating dunning emails that convert</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                <span>Real-time analytics to track every dollar recovered</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4 bg-surface-secondary" data-testid="features-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Powerful Features to Maximize Recovery</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Everything you need to recover failed payments and reduce involuntary churn.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="group card p-6 hover:border-emerald-500/30 hover:scale-[1.02] transition-all duration-300">
                <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-4 group-hover:bg-emerald-500/15 transition-colors">
                  <f.icon className="h-5 w-5 text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-100 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-4" data-testid="how-it-works-section">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Get set up in under 5 minutes. No code, no complex integrations.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                icon: Link2,
                title: 'Connect Stripe',
                description: 'Authorize Paiploy with one click via Stripe OAuth. We get read-only access to your payment data — your credentials stay with Stripe.',
              },
              {
                step: '2',
                icon: Settings,
                title: 'Configure Recovery',
                description: 'Set your retry schedule, customize dunning email templates, and choose notification preferences. Smart defaults are already loaded.',
              },
              {
                step: '3',
                icon: TrendingUp,
                title: 'Recover Revenue',
                description: 'Paiploy monitors your payments 24/7. Failed charges are automatically retried with optimal timing and escalating dunning emails.',
              },
            ].map((item) => (
              <div key={item.step} className="relative text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-5 group-hover:bg-emerald-500/15 transition-colors">
                  <item.icon className="h-7 w-7 text-emerald-400" />
                </div>
                <div className="absolute -top-2 -right-2 sm:right-auto sm:left-[calc(50%+20px)] w-7 h-7 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-slate-100 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link to="/register" className="btn-primary px-6 py-3 inline-flex items-center gap-2">
              Get Started Free <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-24 px-4 bg-surface-secondary" data-testid="comparison-section">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">See How Paiploy Compares</h2>
            <p className="text-slate-400">More features, fraction of the cost.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="comparison-table">
              <thead>
                <tr className="border-b border-[#1e293b]">
                  <th className="text-left py-4 px-4 text-sm font-medium text-slate-400">Feature</th>
                  <th className="py-4 px-4 text-sm font-bold text-emerald-400 bg-emerald-500/5 border-x border-emerald-500/10">Paiploy<br/><span className="font-normal text-xs text-slate-400">$39/mo</span></th>
                  <th className="py-4 px-4 text-sm font-medium text-slate-400">Churn Buster<br/><span className="font-normal text-xs">$249/mo</span></th>
                  <th className="py-4 px-4 text-sm font-medium text-slate-400">Churnkey<br/><span className="font-normal text-xs">$250/mo</span></th>
                  <th className="py-4 px-4 text-sm font-medium text-slate-400">DIY / Stripe<br/><span className="font-normal text-xs">Free</span></th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row) => {
                  const renderCell = (val: boolean | 'soon', highlight?: boolean) => {
                    if (val === 'soon') return <span className="text-xs font-medium text-amber-400">Soon</span>;
                    if (val) return <Check className={`h-5 w-5 mx-auto ${highlight ? 'text-emerald-400' : 'text-slate-500'}`} />;
                    return <XIcon className="h-5 w-5 text-red-400/60 mx-auto" />;
                  };
                  return (
                    <tr key={row.feature} className="border-b border-[#1e293b]/50 hover:bg-surface-secondary/50">
                      <td className="py-3.5 px-4 text-sm text-slate-300">{row.feature}</td>
                      <td className="py-3.5 px-4 text-center bg-emerald-500/5 border-x border-emerald-500/10">
                        {renderCell(row.paiploy, true)}
                      </td>
                      <td className="py-3.5 px-4 text-center">{renderCell(row.churnBuster)}</td>
                      <td className="py-3.5 px-4 text-center">{renderCell(row.churnKey)}</td>
                      <td className="py-3.5 px-4 text-center">{renderCell(row.diy)}</td>
                    </tr>
                  );
                })}
                <tr className="border-b border-[#1e293b]/50">
                  <td className="py-3.5 px-4 text-sm font-semibold text-slate-200">Price</td>
                  <td className="py-3.5 px-4 text-center bg-emerald-500/5 border-x border-emerald-500/10">
                    <span className="font-bold text-emerald-400">From $0/mo</span>
                  </td>
                  <td className="py-3.5 px-4 text-center text-sm text-slate-400">$249/mo</td>
                  <td className="py-3.5 px-4 text-center text-sm text-slate-400">$250/mo</td>
                  <td className="py-3.5 px-4 text-center text-sm text-slate-400">Free</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-4 bg-surface-secondary" data-testid="pricing-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-slate-400">Start free, upgrade as you grow.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                data-testid={`pricing-card-${plan.name.toLowerCase()}`}
                className={`relative card p-8 ${plan.popular ? 'border-emerald-500/40 ring-1 ring-emerald-500/20' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-emerald-600 text-white px-4 py-1 rounded-full text-xs font-bold tracking-wide">
                      Most Popular
                    </span>
                  </div>
                )}
                <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                <p className="text-sm text-slate-400 mb-5">{plan.desc}</p>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold">{plan.price}</span>
                  <span className="text-slate-400 text-sm">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <Check className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-300">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/register"
                  data-testid={`pricing-cta-${plan.name.toLowerCase()}`}
                  className={`block w-full text-center py-3 rounded-lg font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                    plan.popular
                      ? 'btn-primary'
                      : 'bg-surface-tertiary hover:bg-slate-600 text-slate-200 border border-slate-600'
                  }`}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Revenue Recovery Calculator */}
      <section className="py-24 px-4" data-testid="calculator-section">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-5">
              <Calculator className="h-7 w-7 text-emerald-400" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">How Much Are You Losing?</h2>
            <p className="text-slate-400 max-w-lg mx-auto">Enter your numbers and see how much revenue Paiploy can recover for you.</p>
          </div>
          <RevenueCalculator />
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-4 bg-surface-secondary" data-testid="faq-section">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-5">
              <HelpCircle className="h-7 w-7 text-emerald-400" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-slate-400">Everything you need to know about Paiploy.</p>
          </div>
          <div className="space-y-4">
            {[
              {
                q: 'How does Paiploy recover failed payments?',
                a: 'Paiploy monitors your Stripe account via webhooks. When a payment fails, we analyze the decline code and schedule smart retries at optimal times. We also send escalating dunning emails to encourage customers to update their payment method.',
              },
              {
                q: 'Is my Stripe data safe?',
                a: 'Absolutely. We connect via Stripe\'s official OAuth flow and only request the permissions we need. Your API keys and sensitive customer data never touch our servers. All webhook payloads are verified with Stripe signature validation.',
              },
              {
                q: 'How long does setup take?',
                a: 'Under 5 minutes. Connect your Stripe account, configure your retry schedule and dunning preferences, and you\'re live. Smart defaults are pre-loaded so you can start recovering revenue immediately.',
              },
              {
                q: 'What if I\'m already using Stripe\'s built-in retries?',
                a: 'Stripe\'s built-in retries are basic — fixed timing, no dunning emails, limited visibility. Paiploy adds intelligent retry scheduling based on decline codes, customizable email sequences, and detailed analytics. Specialized tools recover 67% more revenue on average.',
              },
              {
                q: 'Can I use Paiploy for free?',
                a: 'Yes! Our Free plan includes up to 50 recoveries per month with smart retries and basic analytics. No credit card required. Upgrade to Pro ($39/mo) or Business ($99/mo) when you need unlimited recoveries and advanced features.',
              },
              {
                q: 'Do you support payment processors other than Stripe?',
                a: 'Currently, Paiploy is built specifically for Stripe. We\'re exploring support for additional processors like Braintree and Recurly. Join our mailing list to be notified when new integrations launch.',
              },
              {
                q: 'How do I cancel my subscription?',
                a: 'You can cancel anytime from Settings → Subscription & Billing → Manage Billing. No contracts, no cancellation fees. You\'ll keep access to your current plan until the end of your billing period.',
              },
            ].map((faq, i) => (
              <FaqItem key={i} question={faq.q} answer={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* Meet the Founder */}
      <section id="about" className="py-24 px-4" data-testid="founder-section">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Built by a Founder Who Gets It</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">No VC funding. No dev team. Just relentless focus on solving a real problem for subscription businesses.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="card p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="flex items-center gap-4 mb-6">
                <img src="/matt-ball.png" alt="Matt Ball, Founder of Paiploy" className="w-14 h-14 rounded-full object-cover object-top border-2 border-emerald-500/40" />
                <div>
                  <h3 className="text-lg font-bold text-slate-100">Matt Ball</h3>
                  <p className="text-sm text-slate-400">Founder &amp; Builder</p>
                </div>
              </div>
              <p className="text-slate-300 leading-relaxed mb-4">
                Two years ago I decided to transform completely. I started with a desk built to the Golden Ratio and began building tools on top of it.
              </p>
              <p className="text-slate-300 leading-relaxed mb-6">
                9 months later I've launched two SaaS products designed to solve real problems. Just me, a suite of AI tools, and the belief that I can. Paiploy exists because failed payments shouldn't be one more thing founders lose sleep over.
              </p>
              <div className="flex items-center gap-4">
                <a href="https://instagram.com/mattyball" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
                  <Instagram className="h-4 w-4" /> @mattyball
                </a>
                <a href="https://instagram.com/paiployrecovery" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
                  <Instagram className="h-4 w-4" /> @paiployrecovery
                </a>
              </div>
            </div>
            <div className="space-y-5">
              {[
                { icon: <Rocket className="h-5 w-5 text-emerald-400" />, title: 'Bootstrapped & Profitable', desc: 'No investors to please. Every decision optimizes for you, the user — not for growth metrics.' },
                { icon: <Shield className="h-5 w-5 text-emerald-400" />, title: '100% Transparent', desc: 'Open pricing, honest comparison table, and "Coming Soon" badges on features we haven\'t shipped yet.' },
                { icon: <Heart className="h-5 w-5 text-emerald-400" />, title: 'Built With Empathy', desc: 'As a solo founder, I know every dollar matters. That\'s why Paiploy starts at $0 — you upgrade when you\'re ready.' },
                { icon: <Zap className="h-5 w-5 text-emerald-400" />, title: 'AI-Powered Development', desc: 'Leveraging cutting-edge AI to ship faster, iterate quicker, and keep prices lower than legacy competitors.' },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 shrink-0 mt-0.5">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-100 mb-1">{item.title}</h4>
                    <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Early Access */}
      <section className="py-16 px-4 bg-surface-secondary border-y border-[#1e293b]" data-testid="early-access-section">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-semibold tracking-widest text-emerald-400 uppercase mb-4">Early Access</p>
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Be One of the First to Recover Revenue Automatically</h2>
          <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
            Paiploy is new, which means you get founder-level support, direct input on the roadmap, and pricing that won't last forever.
          </p>
          <div className="grid sm:grid-cols-3 gap-6 mb-8">
            {[
              { value: '$0', label: 'To get started', sub: 'No credit card required' },
              { value: '< 5 min', label: 'Setup time', sub: 'Connect Stripe & go live' },
              { value: '67%', label: 'More recovered', sub: 'vs basic Stripe retries' },
            ].map((stat, i) => (
              <div key={i} className="card p-5">
                <p className="text-2xl font-extrabold text-emerald-400 mb-1">{stat.value}</p>
                <p className="text-sm font-medium text-slate-200">{stat.label}</p>
                <p className="text-xs text-slate-500 mt-1">{stat.sub}</p>
              </div>
            ))}
          </div>
          <Link to="/register" className="btn-primary px-7 py-3 text-base inline-flex items-center gap-2">
            Claim Your Free Account <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4" data-testid="final-cta-section">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">Start recovering lost revenue today</h2>
          <p className="text-lg text-slate-400 mb-8">Setup takes less than 5 minutes. No credit card required.</p>
          <Link to="/register" data-testid="final-cta-btn" className="btn-primary px-8 py-4 text-base inline-flex items-center gap-2">
            Get Started Free
            <ChevronRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1e293b] py-12 px-4" data-testid="footer">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center justify-center w-7 h-7 rounded-md bg-emerald-500/15">
                  <CreditCard className="h-4 w-4 text-emerald-400" />
                </div>
                <span className="font-bold text-slate-100">Paiploy</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">Automated failed payment recovery for subscription businesses.</p>
            </div>
            <div>
              <h4 className="text-xs font-semibold tracking-widest text-slate-400 uppercase mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">Features</a></li>
                <li><a href="#pricing" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold tracking-widest text-slate-400 uppercase mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><Link to="/docs" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">Docs</Link></li>
                <li><a href="#about" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">About</a></li>
                <li><a href="mailto:support@paiploy.com" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold tracking-widest text-slate-400 uppercase mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link to="/privacy" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">Privacy</Link></li>
                <li><Link to="/terms" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#1e293b] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500" data-testid="footer-copyright">&copy; 2026 Paiploy. All rights reserved.</p>
            <div className="flex items-center gap-5">
              <a href="https://instagram.com/paiployrecovery" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-emerald-400 transition-colors" aria-label="Paiploy on Instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://instagram.com/mattyball" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-emerald-400 transition-colors" aria-label="Founder on Instagram">
                <User className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

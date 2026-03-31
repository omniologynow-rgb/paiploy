import React from 'react';
import { Link } from 'react-router-dom';
import {
  CreditCard, TrendingUp, Mail, BarChart3, Check, X as XIcon, ArrowRight,
  Zap, Shield, Clock, Bell, MessageSquare, FileText, ChevronRight
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

const comparisonData = [
  { feature: 'Smart Retries', paiploy: true, churnBuster: true, churnKey: true, diy: false },
  { feature: 'Dunning Emails', paiploy: true, churnBuster: true, churnKey: true, diy: false },
  { feature: 'AI Retry Timing', paiploy: true, churnBuster: false, churnKey: true, diy: false },
  { feature: 'Pre-Dunning', paiploy: true, churnBuster: true, churnKey: true, diy: false },
  { feature: 'SMS Recovery', paiploy: true, churnBuster: true, churnKey: true, diy: false },
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
          <p className="text-center text-sm text-slate-500 mb-8">Trusted by 500+ subscription businesses</p>
          <div className="flex flex-wrap justify-center gap-8">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="w-24 h-8 rounded-lg bg-slate-800/50 border border-[#1e293b]" />
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

      {/* Comparison Table */}
      <section className="py-24 px-4" data-testid="comparison-section">
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
                {comparisonData.map((row) => (
                  <tr key={row.feature} className="border-b border-[#1e293b]/50 hover:bg-surface-secondary/50">
                    <td className="py-3.5 px-4 text-sm text-slate-300">{row.feature}</td>
                    <td className="py-3.5 px-4 text-center bg-emerald-500/5 border-x border-emerald-500/10">
                      {row.paiploy ? <Check className="h-5 w-5 text-emerald-400 mx-auto" /> : <XIcon className="h-5 w-5 text-red-400 mx-auto" />}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {row.churnBuster ? <Check className="h-5 w-5 text-slate-500 mx-auto" /> : <XIcon className="h-5 w-5 text-red-400 mx-auto" />}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {row.churnKey ? <Check className="h-5 w-5 text-slate-500 mx-auto" /> : <XIcon className="h-5 w-5 text-red-400 mx-auto" />}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {row.diy ? <Check className="h-5 w-5 text-slate-500 mx-auto" /> : <XIcon className="h-5 w-5 text-red-400 mx-auto" />}
                    </td>
                  </tr>
                ))}
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
                <li><a href="#" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">Docs</a></li>
                <li><a href="#" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold tracking-widest text-slate-400 uppercase mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">Privacy</a></li>
                <li><a href="#" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#1e293b] pt-6 text-center">
            <p className="text-sm text-slate-500" data-testid="footer-copyright">&copy; 2026 Paiploy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

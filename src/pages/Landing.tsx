import React from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, TrendingUp, Mail, BarChart3, Check, ArrowRight } from 'lucide-react';

export const Landing: React.FC = () => {
  const features = [
    {
      icon: CreditCard,
      title: 'Automated Payment Retries',
      description: 'Smart retry logic with exponential backoff to maximize recovery success rates.',
    },
    {
      icon: Mail,
      title: 'Intelligent Dunning Campaigns',
      description: 'Professional email templates that engage customers and encourage payment updates.',
    },
    {
      icon: BarChart3,
      title: 'Real-time Analytics',
      description: 'Track recovery rates, revenue saved, and identify trends in payment failures.',
    },
    {
      icon: TrendingUp,
      title: 'Reduce Churn',
      description: 'Recover 30-40% of failed payments automatically and reduce involuntary churn.',
    },
  ];

  const plans = [
    {
      name: 'Free',
      price: '$0',
      features: ['Up to 100 failed payments/month', 'Basic retry logic', 'Email templates', '7-day analytics'],
    },
    {
      name: 'Pro',
      price: '$49',
      popular: true,
      features: [
        'Unlimited failed payments',
        'Advanced retry strategies',
        'Custom email templates',
        'Full analytics & reporting',
        'Priority support',
      ],
    },
    {
      name: 'Enterprise',
      price: '$149',
      features: [
        'Everything in Pro',
        'Multi-account management',
        'Custom integrations',
        'Dedicated account manager',
        'SLA guarantee',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <nav className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <CreditCard className="h-8 w-8 text-blue-500" />
              <span className="ml-2 text-xl font-bold text-white">RecoverPay</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            Recover Lost Revenue Automatically
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto">
            Stop losing customers to failed payments. RecoverPay automatically retries failed transactions,
            sends intelligent dunning emails, and recovers up to 40% of failed payments.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/register"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium flex items-center"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <a
              href="#features"
              className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-3 rounded-lg text-lg font-medium"
            >
              Learn More
            </a>
          </div>
        </div>

        <div id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <h2 className="text-3xl font-bold text-center mb-12">Powerful Features to Maximize Recovery</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-blue-500 transition-colors"
              >
                <feature.icon className="h-12 w-12 text-blue-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-900 py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-4">Simple, Transparent Pricing</h2>
            <p className="text-center text-gray-400 mb-12">Choose the plan that fits your needs</p>
            <div className="grid md:grid-cols-3 gap-8">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`bg-gray-800 rounded-lg p-8 ${
                    plan.popular ? 'ring-2 ring-blue-500' : 'border border-gray-700'
                  } relative`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-8 transform -translate-y-1/2">
                      <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-gray-400">/month</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/register"
                    className={`block w-full text-center py-3 rounded-lg font-medium ${
                      plan.popular
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-700 hover:bg-gray-600 text-white'
                    }`}
                  >
                    Get Started
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Recover Lost Revenue?</h2>
          <p className="text-xl text-gray-400 mb-8">
            Join hundreds of SaaS companies using RecoverPay to reduce churn and maximize revenue.
          </p>
          <Link
            to="/register"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium inline-flex items-center"
          >
            Start Free Trial
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>

      <footer className="bg-gray-900 border-t border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-400">
          <p>&copy; 2024 RecoverPay. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

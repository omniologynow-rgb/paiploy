import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import {
  LayoutDashboard, CreditCard, Mail, BarChart3, Settings,
  LogOut, ChevronLeft, ChevronRight, Menu, X, Zap, Crown, Shield
} from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [stripeConnected, setStripeConnected] = useState(false);

  useEffect(() => {
    apiClient.getConnectionStatus()
      .then(() => setStripeConnected(true))
      .catch(() => setStripeConnected(false));
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const mainNav = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/payments', icon: CreditCard, label: 'Failed Payments' },
    { path: '/dunning', icon: Mail, label: 'Dunning Emails' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  ];

  const settingsNav = [
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  const tier = user?.subscription_tier || 'free';
  const tierConfig: Record<string, { label: string; icon: React.ElementType; cls: string }> = {
    free: { label: 'Free', icon: Zap, cls: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
    pro: { label: 'Pro', icon: Crown, cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    business: { label: 'Business', icon: Shield, cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  };
  const currentTier = tierConfig[tier] || tierConfig.free;
  const TierIcon = currentTier.icon;

  const userInitial = user?.email?.charAt(0).toUpperCase() || 'U';

  const NavItem = ({ path, icon: Icon, label, badge }: { path: string; icon: React.ElementType; label: string; badge?: React.ReactNode }) => {
    const active = location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path));
    return (
      <Link
        to={path}
        data-testid={`nav-${label.toLowerCase().replace(/\s+/g, '-')}`}
        className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
          ${active
            ? 'bg-emerald-500/10 text-emerald-400'
            : 'text-slate-400 hover:text-slate-200 hover:bg-surface-tertiary'
          }
        `}
      >
        {active && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-emerald-500" />
        )}
        <Icon className="h-5 w-5 flex-shrink-0" />
        {!collapsed && <span className="truncate">{label}</span>}
        {!collapsed && badge}
      </Link>
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 py-5 border-b border-[#1e293b]">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-500/15">
          <CreditCard className="h-5 w-5 text-emerald-400" />
        </div>
        {!collapsed && (
          <span className="text-lg font-bold text-slate-100 tracking-tight" data-testid="sidebar-logo">
            Paiploy
          </span>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {!collapsed && (
          <p className="px-3 text-[10px] font-semibold tracking-widest text-slate-500 uppercase mb-2">Main</p>
        )}
        {mainNav.map(item => (
          <NavItem key={item.path} {...item} />
        ))}

        <div className="pt-4">
          {!collapsed && (
            <p className="px-3 text-[10px] font-semibold tracking-widest text-slate-500 uppercase mb-2">Settings</p>
          )}
          {settingsNav.map(item => (
            <NavItem
              key={item.path}
              {...item}
              badge={
                !collapsed ? (
                  <div
                    data-testid="stripe-status-dot"
                    className={`w-2 h-2 rounded-full ml-auto flex-shrink-0 ${
                      stripeConnected ? 'bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.5)]' : 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.5)]'
                    }`}
                  />
                ) : undefined
              }
            />
          ))}
        </div>

        <div className="pt-4">
          {!collapsed && (
            <p className="px-3 text-[10px] font-semibold tracking-widest text-slate-500 uppercase mb-2">Account</p>
          )}
          {!collapsed && (
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${currentTier.cls}`}>
              <TierIcon className="h-4 w-4 flex-shrink-0" />
              <span className="text-xs font-semibold">{currentTier.label} Plan</span>
              {tier === 'free' && (
                <Link
                  to="/settings#billing"
                  data-testid="upgrade-cta"
                  className="ml-auto text-[10px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                  onClick={() => {
                    // If already on settings page, scroll to billing
                    setTimeout(() => {
                      document.getElementById('billing')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                >
                  Upgrade
                </Link>
              )}
            </div>
          )}
        </div>
      </nav>

      <div className="border-t border-[#1e293b] px-3 py-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/15 text-emerald-400 text-sm font-bold flex-shrink-0">
            {userInitial}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-200 truncate">{user?.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            data-testid="sidebar-logout"
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all flex-shrink-0"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface-primary">
      {/* Desktop Sidebar */}
      <aside
        data-testid="sidebar"
        className={`hidden lg:flex flex-col fixed inset-y-0 left-0 z-40
          bg-surface-secondary border-r border-[#1e293b]
          transition-all duration-300
          ${collapsed ? 'w-16' : 'w-[260px]'}
        `}
      >
        <SidebarContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          data-testid="sidebar-toggle"
          className="absolute -right-3 top-8 w-6 h-6 rounded-full bg-surface-tertiary border border-[#334155] flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors"
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-surface-secondary border-b border-[#1e293b] flex items-center px-4">
        <button
          onClick={() => setMobileOpen(true)}
          data-testid="mobile-menu-toggle"
          className="p-2 text-slate-400 hover:text-slate-200"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2 ml-3">
          <CreditCard className="h-5 w-5 text-emerald-400" />
          <span className="font-bold text-slate-100">Paiploy</span>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-[280px] bg-surface-secondary border-r border-[#1e293b] animate-slideIn">
            <div className="absolute top-3 right-3">
              <button
                onClick={() => setMobileOpen(false)}
                data-testid="mobile-menu-close"
                className="p-2 text-slate-400 hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main
        className={`transition-all duration-300
          lg:pt-0 pt-14
          ${collapsed ? 'lg:ml-16' : 'lg:ml-[260px]'}
        `}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-enter">
          {children}
        </div>
      </main>
    </div>
  );
};

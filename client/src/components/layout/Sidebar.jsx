import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Filter,
  Globe,
  FileText,
  Layers,
  Users,
  Mail,
  Zap,
  Package,
  ShoppingCart,
  CreditCard,
  BarChart3,
  Network,
  Puzzle,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/funnels', label: 'Funnels', icon: Filter },
  { path: '/websites', label: 'Websites', icon: Globe },
  { path: '/landing-pages', label: 'Landing Pages', icon: FileText },
  { path: '/templates', label: 'Funnel Templates', icon: Layers, badge: '12' },
  { path: '/contacts', label: 'Contacts (CRM)', icon: Users },
  { path: '/email-marketing', label: 'Email Marketing', icon: Mail },
  { path: '/automations', label: 'Automations', icon: Zap },
  { path: '/products', label: 'Products', icon: Package },
  { path: '/orders', label: 'Orders', icon: ShoppingCart },
  { path: '/payments', label: 'Payments & Coupons', icon: CreditCard },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/domains', label: 'Domains & SSL', icon: Network },
  { path: '/integrations', label: 'Integrations', icon: Puzzle },
  { path: '/settings', label: 'Settings', icon: Settings },
  { path: '/help', label: 'Help Center', icon: HelpCircle },
];

const Sidebar = ({ isCollapsed, toggleCollapse, isMobileOpen, closeMobile }) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-20' : 'w-64'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Brand Logo Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200 dark:border-slate-800">
          <Link to="/dashboard" className="flex items-center gap-3 overflow-hidden">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-md shadow-indigo-500/20 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 bg-clip-text text-transparent">
                  FunnelPro
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider -mt-1">
                  SaaS Enterprise
                </span>
              </div>
            )}
          </Link>

          <button
            onClick={toggleCollapse}
            className="hidden lg:flex items-center justify-center p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeMobile}
                className={({ isActive }) => `
                  group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100'
                  }
                  ${isCollapsed ? 'justify-center px-2' : ''}
                `}
                title={isCollapsed ? item.label : undefined}
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                    {!isCollapsed && (
                      <span className="truncate flex-1">{item.label}</span>
                    )}
                    {!isCollapsed && item.badge && (
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${isActive ? 'bg-indigo-700 text-white' : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400'}`}>
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Quick Launch Funnel Banner (when not collapsed) */}
        {!isCollapsed && (
          <div className="p-3 m-3 rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-slate-800/80 dark:to-indigo-950/40 border border-indigo-100 dark:border-slate-700/60">
            <div className="flex items-center gap-2 mb-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
              <Zap className="w-3.5 h-3.5 fill-indigo-600 text-indigo-600" />
              <span>Stripe Test Mode</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
              Simulation environment active. Safe for live client demonstrations.
            </p>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;


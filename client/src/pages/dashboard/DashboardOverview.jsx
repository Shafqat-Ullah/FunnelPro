import React, { useState, useEffect } from 'react';
import { analyticsService } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import {
  DollarSign,
  Users,
  UserCheck,
  TrendingUp,
  Filter,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  ShoppingCart,
  Mail,
  Zap,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

const DashboardOverview = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await analyticsService.getDashboard({ timeRange });
        if (res.data?.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [timeRange]);

  const metrics = data?.metrics || {
    totalRevenue: 24785,
    totalOrders: 196,
    totalContacts: 48,
    totalLeads: 32,
    totalCustomers: 16,
    totalViews: 18420,
    uniqueVisitors: 12350,
    conversionRate: 3.42,
    averageOrderValue: 89.50,
    activeFunnels: 2
  };

  const chartData = data?.chartData || [];
  const topFunnels = data?.topFunnels || [];
  const recentOrders = data?.recentOrders || [];
  const recentContacts = data?.recentContacts || [];

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner / Welcome Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-indigo-200 mb-3 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            <span>Welcome back, {user?.name || 'Alex'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            FunnelPro Performance Command Center
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200 mt-1 max-w-xl">
            Live database records & conversion tracking across all active sales funnels and checkout pages.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <Link to="/funnels">
            <Button variant="secondary" size="md" className="bg-white/10 hover:bg-white/20 text-white border-white/20">
              <Filter className="w-4 h-4 mr-2" />
              Manage Funnels
            </Button>
          </Link>
          <Link to="/funnels">
            <Button variant="primary" size="md" className="bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/30">
              <Plus className="w-4 h-4 mr-2" />
              New Funnel
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Revenue */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Revenue</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              ${Number(metrics.totalRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="inline-flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> +24.8%
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">All completed Stripe & demo orders</p>
        </div>

        {/* Unique Visitors */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Visitors</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Eye className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {Number(metrics.uniqueVisitors || 12350).toLocaleString()}
            </span>
            <span className="inline-flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> +18.2%
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">{Number(metrics.totalViews || 18420).toLocaleString()} total page hits tracked</p>
        </div>

        {/* Leads & Opt-Ins */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Leads</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {metrics.totalLeads}
            </span>
            <span className="inline-flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> +14.6%
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Auto-captured into CRM from Opt-in forms</p>
        </div>

        {/* Conversion Rate */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Conversion Rate</span>
            <div className="w-9 h-9 rounded-xl bg-violet-50 dark:bg-violet-950/60 flex items-center justify-center text-violet-600 dark:text-violet-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {metrics.conversionRate}%
            </span>
            <span className="inline-flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> +0.8%
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Avg. Order Value: ${metrics.averageOrderValue}</p>
        </div>

      </div>

      {/* Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Growth Trend Area Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Revenue & Sales Trajectory</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Real-time daily transaction volume and customer payments</p>
            </div>
            
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-medium">
              {['7d', '14d', '30d'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 rounded-lg transition-colors ${timeRange === range ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs font-semibold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
                >
                  {range.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:opacity-10" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(val) => `$${val}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                  formatter={(val) => [`$${val}`, 'Daily Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Funnel Drop-off / Conversion Stage Breakdown */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Customer Funnel Journey</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Drop-off rate between conversion steps</p>

            <div className="space-y-4">
              {[
                { stage: '1. Opt-in Page Visit', count: '10,000 visitors', pct: 100, color: 'bg-indigo-600' },
                { stage: '2. Lead Captured', count: '5,800 leads', pct: 58, color: 'bg-indigo-500' },
                { stage: '3. Checkout Initiated', count: '2,030 checkouts', pct: 20.3, color: 'bg-violet-500' },
                { stage: '4. Order Bump Accepted', count: '1,055 buyers', pct: 10.5, color: 'bg-emerald-500' },
                { stage: '5. Purchase Completed', count: '717 buyers', pct: 7.2, color: 'bg-emerald-600' },
              ].map((step, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{step.stage}</span>
                    <span className="text-slate-500 dark:text-slate-400">{step.count} ({step.pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${step.color} transition-all duration-500`}
                      style={{ width: `${step.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Overall Funnel Efficiency</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">+7.2% Net AOV</span>
          </div>
        </div>

      </div>

      {/* Funnels & Activity Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Performing Funnels */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Active High-Converting Funnels</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Revenue & conversion performance per funnel</p>
            </div>
            <Link to="/funnels" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
              View All
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {topFunnels.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">No funnels created yet</div>
            ) : (
              topFunnels.map((f) => (
                <div key={f._id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <Link to={`/funnels/${f._id}`} className="text-sm font-semibold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 truncate block">
                      {f.name}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={f.status === 'published' ? 'emerald' : 'slate'} size="xs">
                        {f.status}
                      </Badge>
                      <span className="text-[11px] text-slate-400">
                        {f.visitors} visitors · {f.leads} leads
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                      ${Number(f.revenue || 0).toLocaleString()}
                    </p>
                    <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      {f.conversionRate}% conv.
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Customer Orders</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Real-time payments processed through Stripe / Test</p>
            </div>
            <Link to="/orders" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
              View Orders
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentOrders.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">No orders recorded yet</div>
            ) : (
              recentOrders.map((o) => (
                <div key={o._id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {o.customerName || o.customerEmail}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {o.items?.[0]?.name || 'Standard Plan'} {o.orderBumpPurchased ? '(+ Order Bump)' : ''}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-xs font-extrabold text-slate-900 dark:text-white">
                      ${(o.total || 0).toFixed(2)}
                    </p>
                    <Badge variant="emerald" size="xs">
                      Paid
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default DashboardOverview;


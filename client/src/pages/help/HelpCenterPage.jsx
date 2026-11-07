import React from 'react';
import {
  HelpCircle,
  BookOpen,
  Zap,
  TrendingUp,
  CreditCard,
  Layers,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

const ARTICLES = [
  {
    category: 'Getting Started',
    title: 'How to build your first 7-figure funnel in 10 minutes',
    desc: 'Step-by-step roadmap from choosing a starter template to publishing your live domain.'
  },
  {
    category: 'Checkout & Payments',
    title: 'Configuring Order Bumps & 1-Click Upsells',
    desc: 'How adding an impulse order bump at checkout instantly raises your Average Order Value by 30%.'
  },
  {
    category: 'Marketing Automations',
    title: 'Setting up lead magnet delivery sequences',
    desc: 'Automatically tagging opt-in contacts and triggering welcome nurture email broadcasts.'
  },
  {
    category: 'Domains & DNS',
    title: 'Connecting GoDaddy, Namecheap, or Cloudflare DNS',
    desc: 'How to configure CNAME and TXT records to point any custom domain to FunnelPro.'
  },
  {
    category: 'Conversion Optimization',
    title: 'Headline and CTA formula cheat sheet',
    desc: 'Tested direct-response copywriting frameworks that consistently convert cold traffic above 5%.'
  },
  {
    category: 'Integrations',
    title: 'Connecting Stripe Test Mode & Webhooks',
    desc: 'Testing checkout orders and receiving automated payment intent webhooks.'
  }
];

const HelpCenterPage = () => {
  return (
    <div className="space-y-6 max-w-5xl pb-12">
      {/* Header */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-indigo-900 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
          FunnelPro Knowledge Base & Strategy Academy
        </h1>
        <p className="text-xs sm:text-sm text-indigo-200 mt-2 max-w-xl">
          Everything you need to master funnel architecture, maximize conversion rates, and scale your SaaS or digital offers.
        </p>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ARTICLES.map((art, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                {art.category}
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                {art.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                {art.desc}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              <span>Read Guide</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HelpCenterPage;


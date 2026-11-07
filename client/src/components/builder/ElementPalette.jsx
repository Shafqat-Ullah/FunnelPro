import React, { useState } from 'react';
import {
  Type,
  AlignLeft,
  Image,
  Video,
  MousePointerClick,
  CheckSquare,
  Clock,
  MessageSquare,
  DollarSign,
  HelpCircle,
  Package,
  Code,
  Layout,
  Columns,
  Sparkles,
  Award
} from 'lucide-react';

const ELEMENTS = [
  { type: 'heading', label: 'Heading', icon: Type, description: 'Title or section headline', defaultContent: { text: 'Turn Cold Visitors Into High-Paying Clients', level: 'h2' } },
  { type: 'paragraph', label: 'Paragraph', icon: AlignLeft, description: 'Body text or marketing copy', defaultContent: { text: 'Experience the next-generation sales funnel software built for 7-figure creators and modern growth teams.' } },
  { type: 'button', label: 'Call to Action', icon: MousePointerClick, description: 'Direct checkout or opt-in button', defaultContent: { text: 'Claim Your Exclusive Discount Now', link: '#', styleType: 'primary' } },
  { type: 'badge', label: 'Badge / Pill', icon: Award, description: 'Highlight scarcity or tags', defaultContent: { text: '⭐ LIMITED TIME SPECIAL OFFER', color: '#6366f1', bgColor: '#eef2ff' } },
  { type: 'form', label: 'Opt-in Form', icon: CheckSquare, description: 'Capture name, email & phone', defaultContent: { buttonText: 'Get Instant Free Access', fields: [{ name: 'name', type: 'text', placeholder: 'Your First Name' }, { name: 'email', type: 'email', placeholder: 'Your Work Email' }] } },
  { type: 'countdown', label: 'Countdown Timer', icon: Clock, description: 'Create urgency and scarcity', defaultContent: { targetHours: 24, label: 'Offer Expires In:' } },
  { type: 'image', label: 'Image', icon: Image, description: 'Product photos or hero banner', defaultContent: { url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80', alt: 'FunnelPro Dashboard' } },
  { type: 'video', label: 'Video Player', icon: Video, description: 'VSL or product walk-through', defaultContent: { embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', title: 'Product Video' } },
  { type: 'testimonial', label: 'Testimonial Card', icon: MessageSquare, description: 'Social proof and quote', defaultContent: { quote: 'FunnelPro increased our checkout conversion rate by 42% in just two weeks.', author: 'Marcus Vance', role: 'Founder & CEO, TechScale', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120' } },
  { type: 'pricing', label: 'Pricing Table', icon: DollarSign, description: 'Feature tiers and pricing', defaultContent: { planName: 'Growth Mastermind', price: 97, period: '/month', features: ['Unlimited Funnel Steps', 'Stripe 1-Click Upsells', 'Full CRM & Automation', 'Custom Domain & SSL'] } },
  { type: 'faq', label: 'FAQ Accordion', icon: HelpCircle, description: 'Overcome objections', defaultContent: { question: 'Is there a money-back guarantee?', answer: 'Yes! We offer a 30-day, no-questions-asked, 100% money back guarantee.' } },
  { type: 'product-card', label: 'Product Card', icon: Package, description: 'Product with price and buy CTA', defaultContent: { name: 'FunnelPro SaaS Accelerator', price: 149, comparePrice: 299, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600' } },
  { type: 'html', label: 'Custom HTML/Embed', icon: Code, description: 'Raw custom code block', defaultContent: { code: '<div style="padding: 16px; border: 1px dashed #6366f1; border-radius: 8px; text-align: center; color: #6366f1; font-weight: bold;">⚡ Custom HTML Block</div>' } }
];

const SECTION_TEMPLATES = [
  {
    name: 'Hero Section',
    icon: Layout,
    description: 'Headline, sub-headline, and high-converting CTA',
    data: {
      name: 'Hero Showcase',
      styles: { backgroundColor: '#ffffff', padding: '60px 20px', textAlign: 'center' },
      elements: [
        { type: 'badge', content: { text: '🚀 NEW RELEASE V2', color: '#6366f1', bgColor: '#eef2ff' }, styles: { margin: '0 auto 16px auto', display: 'inline-block' } },
        { type: 'heading', content: { text: 'Scale Your Sales Funnel Beyond 7-Figures', level: 'h1' }, styles: { fontSize: '42px', fontWeight: '800', color: '#0f172a', margin: '0 auto 16px auto' } },
        { type: 'paragraph', content: { text: 'Discover the exact high-converting sales architecture top founders use.' }, styles: { fontSize: '18px', color: '#64748b', maxWidth: '640px', margin: '0 auto 24px auto' } },
        { type: 'button', content: { text: 'Get Started Today', link: '#', styleType: 'primary' }, styles: { margin: '0 auto' } }
      ]
    }
  },
  {
    name: 'Opt-in Box',
    icon: CheckSquare,
    description: 'Lead magnet opt-in form with bullet points',
    data: {
      name: 'Lead Opt-in Section',
      styles: { backgroundColor: '#f8fafc', padding: '50px 20px', textAlign: 'center' },
      elements: [
        { type: 'heading', content: { text: 'Download The Free 50-Page Funnel Guide', level: 'h2' }, styles: { fontSize: '32px', fontWeight: '800', color: '#0f172a' } },
        { type: 'paragraph', content: { text: 'Enter your email below for instant PDF delivery.' }, styles: { fontSize: '16px', color: '#64748b', margin: '8px auto 20px auto' } },
        { type: 'form', content: { buttonText: 'Instant Download Free Guide', fields: [{ name: 'name', type: 'text', placeholder: 'Your Name' }, { name: 'email', type: 'email', placeholder: 'Your Best Email' }] }, styles: { maxWidth: '420px', margin: '0 auto' } }
      ]
    }
  },
  {
    name: 'Testimonial Spotlight',
    icon: MessageSquare,
    description: 'High-trust customer proof card',
    data: {
      name: 'Social Proof Section',
      styles: { backgroundColor: '#ffffff', padding: '60px 20px', textAlign: 'center' },
      elements: [
        { type: 'testimonial', content: { quote: 'FunnelPro doubled our sales conversions in less than 3 weeks. Absolutely indispensable.', author: 'Marcus Sterling', role: 'Founder, Apex Ventures', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' }, styles: { maxWidth: '600px', margin: '0 auto' } }
      ]
    }
  }
];

const ElementPalette = ({ onAddElement, onAddSectionTemplate }) => {
  const [tab, setTab] = useState('elements'); // 'elements' | 'sections'

  return (
    <div className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full shrink-0 select-none">
      {/* Tab Switcher */}
      <div className="flex items-center p-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
        <button
          onClick={() => setTab('elements')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
            tab === 'elements'
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Elements
        </button>
        <button
          onClick={() => setTab('sections')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
            tab === 'sections'
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Section Presets
        </button>
      </div>

      {/* Elements List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {tab === 'elements' ? (
          <>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
              Click to insert into canvas
            </p>
            <div className="grid grid-cols-2 gap-2">
              {ELEMENTS.map((el) => {
                const Icon = el.icon;
                return (
                  <button
                    key={el.type}
                    onClick={() => onAddElement(el.type, el.defaultContent)}
                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 text-center transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-colors mb-2">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      {el.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
              Pre-built high-converting sections
            </p>
            <div className="space-y-2.5">
              {SECTION_TEMPLATES.map((st, idx) => {
                const Icon = st.icon;
                return (
                  <div
                    key={idx}
                    onClick={() => onAddSectionTemplate(st.data)}
                    className="cursor-pointer p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {st.name}
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {st.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ElementPalette;


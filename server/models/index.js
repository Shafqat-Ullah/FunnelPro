const { createModel } = require('../utils/dbAdapter');

const User = createModel('users', {
  name: '',
  email: '',
  password: '',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  role: 'user',
  businessName: 'My Sales Empire',
  bio: 'Entrepreneur & Funnel Builder',
  emailVerified: true,
  settings: {
    currency: 'USD',
    theme: 'light',
    brandColor: '#6366f1',
    notifications: { email: true, orders: true, leads: true }
  }
});

const Funnel = createModel('funnels', {
  name: 'New Funnel',
  description: '',
  slug: '',
  status: 'draft', // draft, published, archived
  category: 'sales', // sales, leadgen, webinar, ecommerce, coaching
  steps: [],
  customDomain: '',
  trackingCodes: { headCode: '', bodyCode: '' },
  stats: { visitors: 0, leads: 0, orders: 0, revenue: 0, conversionRate: 0 }
});

const FunnelStep = createModel('funnelSteps', {
  funnelId: '',
  name: 'Step',
  stepType: 'optin', // optin, sales, checkout, confirmation, upsell, downsell, thankyou, webinar-reg, webinar-sales, leadgen
  slug: '',
  order: 0,
  pageId: '',
  nextStepId: null,
  upsellStepId: null,
  downsellStepId: null,
  stats: { views: 0, conversions: 0, conversionRate: 0 }
});

const Page = createModel('pages', {
  funnelId: null,
  funnelStepId: null,
  title: 'Untitled Page',
  slug: '',
  sections: [],
  seo: { title: '', description: '', ogImage: '', keywords: '' },
  customCss: '',
  status: 'draft', // draft, published
  publishedUrl: '',
  version: 1
});

const Template = createModel('templates', {
  name: '',
  category: 'SaaS', // Business, SaaS, E-commerce, Coaching, Fitness, Real Estate, Restaurant, Healthcare, Webinar, Digital Products, Lead Generation, Agency
  description: '',
  thumbnail: '',
  type: 'funnel', // funnel, page
  sections: [],
  tags: []
});

const Contact = createModel('contacts', {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  tags: [],
  source: 'direct', // optin_form, checkout, manual, import
  sourceFunnelId: null,
  sourceStepId: null,
  status: 'lead', // lead, customer, unsubscribed
  totalOrders: 0,
  totalSpent: 0,
  customFields: {},
  activityLog: []
});

const Product = createModel('products', {
  name: '',
  description: '',
  price: 0,
  compareAtPrice: 0,
  currency: 'USD',
  type: 'digital', // digital, physical, service
  images: [],
  orderBump: {
    enabled: false,
    headline: 'Yes! Add This Exclusive Offer',
    description: 'Get our companion workbook at 70% off',
    price: 27
  },
  upsell: {
    enabled: false,
    headline: 'Special One-Time Upgrade Offer',
    description: 'Upgrade to VIP Mastermind Access',
    price: 97
  },
  digitalFileUrl: '',
  inventory: 100,
  status: 'active'
});

const Order = createModel('orders', {
  orderNumber: '',
  contactId: null,
  customerName: '',
  customerEmail: '',
  funnelId: null,
  items: [],
  orderBumpPurchased: false,
  orderBumpPrice: 0,
  upsellsPurchased: [],
  subtotal: 0,
  discount: 0,
  total: 0,
  currency: 'USD',
  status: 'completed', // pending, completed, refunded, failed
  paymentProvider: 'stripe',
  paymentId: '',
  couponCode: '',
  billingDetails: {},
  isDemo: false
});

const Coupon = createModel('coupons', {
  code: '',
  discountType: 'percentage', // percentage, fixed
  discountValue: 10,
  minPurchase: 0,
  maxUses: 100,
  usedCount: 0,
  expiresAt: null,
  isActive: true
});

const EmailCampaign = createModel('emailCampaigns', {
  title: '',
  subject: '',
  senderName: 'FunnelPro Team',
  senderEmail: 'hello@funnelpro.io',
  previewText: '',
  content: '',
  audienceFilter: { all: true, tags: [] },
  status: 'draft', // draft, scheduled, sent
  scheduledAt: null,
  sentAt: null,
  stats: { recipients: 0, sent: 0, opened: 0, clicked: 0, bounced: 0 }
});

const Automation = createModel('automations', {
  name: 'New Automation Workflow',
  description: '',
  trigger: {
    type: 'optin_submit', // optin_submit, order_completed, tag_added, contact_created
    config: {}
  },
  nodes: [],
  edges: [],
  status: 'active', // active, paused, draft
  executionCount: 0
});

const Domain = createModel('domains', {
  domainName: '',
  subdomain: '',
  status: 'verified', // pending_verification, verified, failed
  verificationToken: '',
  dnsRecords: [
    { type: 'CNAME', host: '@', value: 'funnelpro-router.net', status: 'valid' },
    { type: 'TXT', host: '_verify', value: 'fp-auth-token-9941', status: 'valid' }
  ],
  targetFunnelId: null,
  targetWebsiteId: null,
  sslStatus: 'active'
});

const Integration = createModel('integrations', {
  provider: '', // stripe, paypal, mailchimp, google_analytics, facebook_pixel, smtp, webhook
  name: '',
  credentials: {},
  status: 'connected', // connected, disconnected, error
  lastCheckedAt: null
});

const AnalyticsEvent = createModel('analyticsEvents', {
  funnelId: null,
  funnelStepId: null,
  pageId: null,
  eventType: 'page_view', // page_view, optin_submit, checkout_start, purchase_completed, upsell_accepted, upsell_declined
  visitorId: '',
  device: 'desktop', // desktop, mobile, tablet
  country: 'US',
  metadata: {}
});

const Notification = createModel('notifications', {
  userId: null,
  title: '',
  message: '',
  type: 'order', // order, lead, campaign, system
  isRead: false,
  link: ''
});

module.exports = {
  User,
  Funnel,
  FunnelStep,
  Page,
  Template,
  Contact,
  Product,
  Order,
  Coupon,
  EmailCampaign,
  Automation,
  Domain,
  Integration,
  AnalyticsEvent,
  Notification
};


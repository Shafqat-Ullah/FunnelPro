const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const {
  User,
  Funnel,
  FunnelStep,
  Page,
  Product,
  Order,
  Contact,
  Coupon,
  EmailCampaign,
  Automation,
  Domain,
  Integration,
  AnalyticsEvent,
  Notification
} = require('../models');

async function seedAll() {
  console.log('--- Starting FunnelPro Realistic Database Seed ---');

  // Clear existing collections
  await User.deleteMany({});
  await Funnel.deleteMany({});
  await FunnelStep.deleteMany({});
  await Page.deleteMany({});
  await Product.deleteMany({});
  await Order.deleteMany({});
  await Contact.deleteMany({});
  await Coupon.deleteMany({});
  await EmailCampaign.deleteMany({});
  await Automation.deleteMany({});
  await Domain.deleteMany({});
  await AnalyticsEvent.deleteMany({});
  await Notification.deleteMany({});

  // 1. Create Demo User
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('Password123!', salt);

  const demoUser = await User.create({
    name: 'Alex Vance',
    email: 'demo@funnelpro.io',
    password: hashedPassword,
    businessName: 'Vance Growth Ventures',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    bio: '7-Figure SaaS Architect & Direct-Response Funnel Strategist',
    role: 'admin',
    emailVerified: true,
    settings: {
      currency: 'USD',
      theme: 'light',
      brandColor: '#6366f1',
      notifications: { email: true, orders: true, leads: true }
    }
  });

  console.log(`Created Demo User: ${demoUser.email}`);

  // 2. Create Products
  const product1 = await Product.create({
    name: 'FunnelPro SaaS Growth Accelerator',
    description: 'The definitive blueprint and software templates to scale to 10k MRR.',
    price: 97,
    compareAtPrice: 297,
    currency: 'USD',
    type: 'digital',
    orderBump: {
      enabled: true,
      headline: 'Yes! Add The 50 High-Converting Copywriting Swipes',
      description: 'Get our battle-tested headline formulas and email follow-up sequence templates.',
      price: 27
    },
    upsell: {
      enabled: true,
      headline: 'One-Time Upgrade: VIP 1-on-1 Funnel Audit & Coaching Call',
      description: 'Get your entire funnel reviewed personally by senior conversion architects.',
      price: 197
    },
    inventory: 999,
    status: 'active'
  });

  const product2 = await Product.create({
    name: 'Apex Smart Fitness Tracker V3',
    description: 'Biometric heart rate, sleep recovery, and GPS tracking smart wearable.',
    price: 149,
    compareAtPrice: 249,
    currency: 'USD',
    type: 'physical',
    orderBump: {
      enabled: true,
      headline: 'Add Magnetic Milanese Stainless Steel Band',
      description: 'Upgrade your wristband styling with premium stainless steel for only $19.',
      price: 19
    },
    upsell: {
      enabled: true,
      headline: '2-Year No-Questions-Asked Replacement Protection Warranty',
      description: 'Zero deductible full accidental damage and water ingress protection.',
      price: 39
    },
    inventory: 150,
    status: 'active'
  });

  const product3 = await Product.create({
    name: 'High-Ticket Mastermind VIP Cohort',
    description: 'Quarterly in-person mastermind, weekly private advisory, and direct founder Slack access.',
    price: 997,
    compareAtPrice: 2497,
    currency: 'USD',
    type: 'service',
    orderBump: {
      enabled: false,
      headline: '',
      description: '',
      price: 0
    },
    upsell: {
      enabled: true,
      headline: 'Private 1-on-1 Dinner & Growth Strategy Session',
      description: 'Join the private executive dinner session on evening before mastermind.',
      price: 497
    },
    inventory: 20,
    status: 'active'
  });

  console.log('Created Products');

  // 3. Create Coupons
  await Coupon.create({ code: 'LAUNCH20', discountType: 'percentage', discountValue: 20, minPurchase: 50, maxUses: 500, usedCount: 38, isActive: true });
  await Coupon.create({ code: 'VIP50OFF', discountType: 'percentage', discountValue: 50, minPurchase: 100, maxUses: 50, usedCount: 12, isActive: true });
  await Coupon.create({ code: 'SAVE10', discountType: 'fixed', discountValue: 10, minPurchase: 30, maxUses: 1000, usedCount: 84, isActive: true });

  console.log('Created Coupons');

  // 4. Create CRM Contacts
  const sampleContacts = [
    { firstName: 'Marcus', lastName: 'Sterling', email: 'marcus.s@apexglobal.com', phone: '+1 (555) 234-8891', tags: ['customer', 'vip-buyer', 'saas'], totalOrders: 2, totalSpent: 321, status: 'customer', source: 'checkout' },
    { firstName: 'Elena', lastName: 'Rostova', email: 'elena@novatech.io', phone: '+1 (555) 345-9920', tags: ['lead', 'webinar-attendee'], totalOrders: 0, totalSpent: 0, status: 'lead', source: 'optin_form' },
    { firstName: 'David', lastName: 'Chen', email: 'david.chen@synergycapital.org', phone: '+1 (555) 872-4411', tags: ['customer', 'mastermind'], totalOrders: 1, totalSpent: 997, status: 'customer', source: 'checkout' },
    { firstName: 'Sarah', lastName: 'Jenkins', email: 'sarah.j@growthbrand.co', phone: '+1 (555) 910-3329', tags: ['customer', 'order-bump-buyer'], totalOrders: 1, totalSpent: 124, status: 'customer', source: 'checkout' },
    { firstName: 'Jonathan', lastName: 'Miller', email: 'jmiller@cloudscale.net', phone: '+1 (555) 123-7740', tags: ['lead', 'free-guide'], totalOrders: 0, totalSpent: 0, status: 'lead', source: 'optin_form' },
    { firstName: 'Rachel', lastName: 'Green', email: 'rachel@zenfitcollective.com', phone: '+1 (555) 654-2219', tags: ['customer', 'fitness'], totalOrders: 1, totalSpent: 168, status: 'customer', source: 'checkout' },
    { firstName: 'Carlos', lastName: 'Mendoza', email: 'carlos.m@horizonmedia.es', phone: '+34 612 345 678', tags: ['lead', 'optin'], totalOrders: 0, totalSpent: 0, status: 'lead', source: 'optin_form' },
    { firstName: 'Sophia', lastName: 'Alvarez', email: 'sophia@luxuryliving.com', phone: '+1 (555) 789-0123', tags: ['customer', 'upsell-buyer'], totalOrders: 1, totalSpent: 343, status: 'customer', source: 'checkout' }
  ];

  for (const c of sampleContacts) {
    await Contact.create({
      ...c,
      activityLog: [
        { action: c.status === 'customer' ? 'Order Processed' : 'Opt-in Registered', details: `Activity logged via FunnelPro CRM engine`, timestamp: new Date(Date.now() - Math.floor(Math.random() * 14 * 86400000)).toISOString() }
      ]
    });
  }

  console.log('Created CRM Contacts');

  // 5. Create Funnels & Pages
  // Funnel 1: SaaS Launch
  const funnel1 = await Funnel.create({
    name: 'SaaS 14-Day Growth Funnel',
    description: 'Flagship productized acquisition funnel with video landing page, feature highlights, and Stripe checkout.',
    slug: 'saas-growth-funnel',
    category: 'saas',
    status: 'published',
    customDomain: 'growth.funnelpro.io',
    stats: { visitors: 5820, leads: 1240, orders: 184, revenue: 19840, conversionRate: 3.16 }
  });

  // Step 1: Optin
  const page1 = await Page.create({
    funnelId: funnel1._id,
    title: 'SaaS Growth — Free Trial Opt-In',
    slug: 'optin',
    status: 'published',
    sections: [
      {
        id: uuidv4(),
        name: 'Hero Section',
        styles: { backgroundColor: '#0f172a', padding: '70px 24px', textAlign: 'center' },
        rows: [{
          id: uuidv4(),
          columns: [{
            id: uuidv4(),
            width: '100%',
            elements: [
              { id: uuidv4(), type: 'badge', content: { text: 'HIGH CONVERTING SALES FUNNEL', color: '#818cf8', bgColor: '#1e1b4b' }, styles: { margin: '0 auto 16px auto', display: 'inline-block' } },
              { id: uuidv4(), type: 'heading', content: { text: 'Turn Cold Traffic Into Loyal Customers On Autopilot', level: 'h1' }, styles: { fontSize: '42px', fontWeight: '800', color: '#ffffff', maxWidth: '780px', margin: '0 auto 16px auto' } },
              { id: uuidv4(), type: 'paragraph', content: { text: 'Experience the next-generation sales funnel software built for 7-figure creators, agencies, and SaaS founders.' }, styles: { fontSize: '18px', color: '#94a3b8', maxWidth: '620px', margin: '0 auto 30px auto' } },
              { id: uuidv4(), type: 'form', content: { buttonText: 'Claim Your 14-Day Free Access', fields: [{ name: 'name', type: 'text', placeholder: 'Your Name' }, { name: 'email', type: 'email', placeholder: 'Work Email Address' }] }, styles: { maxWidth: '440px', margin: '0 auto' } }
            ]
          }]
        }]
      }
    ]
  });

  const step1 = await FunnelStep.create({
    funnelId: funnel1._id,
    name: 'Opt-in Page',
    stepType: 'optin',
    slug: 'optin',
    order: 0,
    pageId: page1._id,
    stats: { views: 5820, conversions: 1240, conversionRate: 21.3 }
  });
  page1.funnelStepId = step1._id;
  await page1.save();

  // Step 2: Checkout
  const page2 = await Page.create({
    funnelId: funnel1._id,
    title: 'SaaS Growth — Secure Checkout',
    slug: 'checkout',
    status: 'published',
    sections: [
      {
        id: uuidv4(),
        name: 'Checkout Hero',
        styles: { backgroundColor: '#f8fafc', padding: '40px 20px', textAlign: 'center' },
        rows: [{
          id: uuidv4(),
          columns: [{
            id: uuidv4(),
            width: '100%',
            elements: [
              { id: uuidv4(), type: 'heading', content: { text: 'Complete Your Order & Instant Activation', level: 'h1' }, styles: { fontSize: '32px', fontWeight: '800', color: '#0f172a' } },
              { id: uuidv4(), type: 'paragraph', content: { text: '256-Bit SSL Encrypted Checkout with 30-Day Money Back Guarantee' }, styles: { fontSize: '15px', color: '#64748b', marginTop: '8px' } }
            ]
          }]
        }]
      }
    ]
  });

  const step2 = await FunnelStep.create({
    funnelId: funnel1._id,
    name: 'Order Checkout',
    stepType: 'checkout',
    slug: 'checkout',
    order: 1,
    pageId: page2._id,
    stats: { views: 1240, conversions: 184, conversionRate: 14.8 }
  });
  page2.funnelStepId = step2._id;
  await page2.save();

  // Step 3: Thank You
  const page3 = await Page.create({
    funnelId: funnel1._id,
    title: 'SaaS Growth — Order Confirmation',
    slug: 'thank-you',
    status: 'published',
    sections: [
      {
        id: uuidv4(),
        name: 'Success Section',
        styles: { backgroundColor: '#ffffff', padding: '60px 20px', textAlign: 'center' },
        rows: [{
          id: uuidv4(),
          columns: [{
            id: uuidv4(),
            width: '100%',
            elements: [
              { id: uuidv4(), type: 'badge', content: { text: 'ORDER CONFIRMED', color: '#10b981', bgColor: '#ecfdf5' } },
              { id: uuidv4(), type: 'heading', content: { text: 'Congratulations & Welcome Aboard!', level: 'h1' }, styles: { fontSize: '36px', fontWeight: '800', color: '#0f172a', margin: '16px auto' } },
              { id: uuidv4(), type: 'paragraph', content: { text: 'Your account is ready. Your download links and credentials have been dispatched.' }, styles: { fontSize: '16px', color: '#64748b' } }
            ]
          }]
        }]
      }
    ]
  });

  const step3 = await FunnelStep.create({
    funnelId: funnel1._id,
    name: 'Order Thank You',
    stepType: 'thankyou',
    slug: 'thank-you',
    order: 2,
    pageId: page3._id,
    stats: { views: 184, conversions: 184, conversionRate: 100 }
  });
  page3.funnelStepId = step3._id;
  await page3.save();

  // Connect steps
  step1.nextStepId = step2._id;
  await step1.save();
  step2.nextStepId = step3._id;
  await step2.save();

  console.log('Created Funnel 1 with 3 Connected Steps & Pages');

  // Funnel 2: Masterclass
  const funnel2 = await Funnel.create({
    name: 'High-Impact Masterclass Webinar',
    description: 'Automated on-demand masterclass webinar funnel with live chat simulator.',
    slug: 'masterclass-webinar',
    category: 'webinar',
    status: 'published',
    stats: { visitors: 3410, leads: 980, orders: 48, revenue: 14200, conversionRate: 4.8 }
  });

  console.log('Created Funnel 2');

  // 6. Realistic Orders
  const sampleOrders = [
    { orderNumber: 'ORD-984210', customerName: 'Marcus Sterling', customerEmail: 'marcus.s@apexglobal.com', items: [{ name: 'FunnelPro SaaS Growth Accelerator', price: 97, quantity: 1 }], orderBumpPurchased: true, orderBumpPrice: 27, total: 124, status: 'completed' },
    { orderNumber: 'ORD-984211', customerName: 'David Chen', customerEmail: 'david.chen@synergycapital.org', items: [{ name: 'High-Ticket Mastermind VIP Cohort', price: 997, quantity: 1 }], orderBumpPurchased: false, orderBumpPrice: 0, total: 997, status: 'completed' },
    { orderNumber: 'ORD-984212', customerName: 'Sarah Jenkins', customerEmail: 'sarah.j@growthbrand.co', items: [{ name: 'FunnelPro SaaS Growth Accelerator', price: 97, quantity: 1 }], orderBumpPurchased: true, orderBumpPrice: 27, total: 124, status: 'completed' },
    { orderNumber: 'ORD-984213', customerName: 'Rachel Green', customerEmail: 'rachel@zenfitcollective.com', items: [{ name: 'Apex Smart Fitness Tracker V3', price: 149, quantity: 1 }], orderBumpPurchased: true, orderBumpPrice: 19, total: 168, status: 'completed' },
    { orderNumber: 'ORD-984214', customerName: 'Sophia Alvarez', customerEmail: 'sophia@luxuryliving.com', items: [{ name: 'FunnelPro SaaS Growth Accelerator', price: 97, quantity: 1 }], orderBumpPurchased: true, orderBumpPrice: 27, total: 124, status: 'completed' }
  ];

  for (const o of sampleOrders) {
    await Order.create({
      ...o,
      subtotal: o.total,
      currency: 'USD',
      paymentProvider: 'stripe',
      paymentId: `pi_test_${uuidv4().substring(0, 16)}`,
      isDemo: true
    });
  }

  console.log('Created Sample Orders');

  // 7. Automation Workflows
  await Automation.create({
    name: 'New Lead Nurture Sequence',
    description: 'Delivers lead magnet PDF, tags contact, and initiates 3-day value sequence.',
    trigger: { type: 'optin_submit', config: { funnelId: 'all' } },
    nodes: [
      { id: 'n1', type: 'trigger', title: 'Contact Submits Opt-in Form', subtitle: 'Any active funnel', position: { x: 250, y: 40 } },
      { id: 'n2', type: 'action', title: 'Add Tag "lead-magnet-optin"', subtitle: 'CRM Tagging', position: { x: 250, y: 160 } },
      { id: 'n3', type: 'action', title: 'Send Welcome Email with PDF', subtitle: 'Immediate Dispatch', position: { x: 250, y: 280 } },
      { id: 'n4', type: 'delay', title: 'Wait 24 Hours', subtitle: 'Nurture Interval', position: { x: 250, y: 400 } },
      { id: 'n5', type: 'action', title: 'Send Case Study Email', subtitle: 'Social Proof', position: { x: 250, y: 520 } }
    ],
    edges: [
      { id: 'e1-2', source: 'n1', target: 'n2' },
      { id: 'e2-3', source: 'n2', target: 'n3' },
      { id: 'e3-4', source: 'n3', target: 'n4' },
      { id: 'e4-5', source: 'n4', target: 'n5' }
    ],
    status: 'active',
    executionCount: 142
  });

  console.log('Created Automations');

  // 8. Email Campaigns
  await EmailCampaign.create({
    title: 'Black Friday 50% Off Early Access Blast',
    subject: '🔥 [VIP Exclusive] Unlock 50% Off All Annual Plans Today',
    senderName: 'Alex Vance',
    senderEmail: 'alex@funnelpro.io',
    previewText: 'This exclusive discount expires in 48 hours...',
    content: 'Hi {{first_name}},\n\nBecause you are a valued member of our community, we are unlocking early Black Friday access for you.\n\nClick below to claim your 50% lifetime coupon:\nhttps://funnelpro.io/bf-deal\n\nTo your success,\nAlex Vance',
    status: 'sent',
    stats: { recipients: 1240, sent: 1240, opened: 682, clicked: 294, bounced: 6 }
  });

  console.log('Created Email Campaigns');

  // 9. Custom Domains
  await Domain.create({
    domainName: 'growthfunnels.com',
    subdomain: 'app',
    status: 'verified',
    verificationToken: 'fp-token-884102',
    dnsRecords: [
      { type: 'CNAME', host: '@', value: 'funnelpro-router.net', status: 'valid' },
      { type: 'TXT', host: '_verify', value: 'fp-token-884102', status: 'valid' }
    ],
    sslStatus: 'active'
  });

  // 10. Sample Notifications
  await Notification.create({
    title: '🚀 Funnel Published!',
    message: '"SaaS 14-Day Growth Funnel" is live and accepting visitors.',
    type: 'system',
    isRead: true,
    link: '/funnels'
  });

  await Notification.create({
    title: '💳 New Stripe Order ($124.00)',
    message: 'Marcus Sterling purchased "FunnelPro SaaS Growth Accelerator" with Order Bump.',
    type: 'order',
    isRead: false,
    link: '/orders'
  });

  console.log('--- FunnelPro Database Seed Completed Successfully ---');
}

// If run directly via command line
if (require.main === module) {
  seedAll().then(() => {
    console.log('Database seeding process finished.');
    process.exit(0);
  }).catch((err) => {
    console.error('Seed Error:', err);
    process.exit(1);
  });
}

module.exports = { seedAll };


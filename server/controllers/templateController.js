const { Template, Funnel, FunnelStep, Page } = require('../models');
const { v4: uuidv4 } = require('uuid');

const STARTER_TEMPLATES = [
  {
    name: 'SaaS Growth & Scale Funnel',
    category: 'SaaS',
    description: 'High-converting software landing page featuring interactive feature matrix, social proof, and trial sign-up CTA.',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80',
    type: 'funnel',
    tags: ['SaaS', 'B2B', 'Free Trial', 'High-Converting'],
    sections: [
      {
        id: uuidv4(),
        name: 'Hero Section',
        styles: { backgroundColor: '#0f172a', color: '#ffffff', padding: '80px 20px', textAlign: 'center' },
        rows: [{
          id: uuidv4(),
          columns: [{
            id: uuidv4(),
            width: '100%',
            elements: [
              { id: uuidv4(), type: 'badge', content: { text: '🚀 V2.0 LAUNCH SPECIAL', color: '#818cf8', bgColor: '#1e1b4b' } },
              { id: uuidv4(), type: 'heading', content: { text: 'Supercharge Your Customer Acquisition Pipeline', level: 'h1' }, styles: { fontSize: '44px', fontWeight: '800', color: '#ffffff', margin: '20px auto' } },
              { id: uuidv4(), type: 'paragraph', content: { text: 'Stop losing 70% of your visitors. FunnelPro empowers modern growth teams to build high-converting funnels in minutes.' }, styles: { fontSize: '18px', color: '#94a3b8', maxWidth: '640px', margin: '0 auto 30px auto' } },
              { id: uuidv4(), type: 'form', content: { buttonText: 'Start Your 14-Day Free Trial', fields: [{ name: 'name', type: 'text', placeholder: 'Work Email' }] }, styles: { maxWidth: '440px', margin: '0 auto' } }
            ]
          }]
        }]
      }
    ]
  },
  {
    name: 'High-Ticket Coaching & Mastermind',
    category: 'Coaching',
    description: 'Direct-response sales letter with video placeholder, testimonial grid, and qualifying application booking form.',
    thumbnail: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80',
    type: 'funnel',
    tags: ['Coaching', 'High-Ticket', 'Application', 'Mentorship'],
    sections: []
  },
  {
    name: 'E-commerce DTC Product Launch',
    category: 'E-commerce',
    description: 'Optimized product showcase with scarcity countdown timer, order bump box, and Stripe 1-page checkout.',
    thumbnail: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
    type: 'funnel',
    tags: ['E-commerce', 'Order Bump', 'Physical Product', 'Sales Page'],
    sections: []
  },
  {
    name: 'Live Webinar Registration Funnel',
    category: 'Webinar',
    description: '2-step webinar registration with urgency timer, speaker credentials, and automated calendar invite download.',
    thumbnail: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=600&auto=format&fit=crop&q=80',
    type: 'funnel',
    tags: ['Webinar', 'Lead Generation', 'Urgency Timer', 'Workshop'],
    sections: []
  },
  {
    name: 'Digital Course & E-Book Bundle',
    category: 'Digital Products',
    description: 'Course curriculum breakdown, 3D mockup cards, customer reviews, and post-purchase VIP upsell flow.',
    thumbnail: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80',
    type: 'funnel',
    tags: ['Course', 'E-Book', 'Digital Product', 'Upsell'],
    sections: []
  },
  {
    name: 'Fitness & Transformation Bootcamp',
    category: 'Fitness',
    description: 'Dynamic fitness challenge opt-in with before/after gallery, meal plan overview, and community sign-up.',
    thumbnail: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80',
    type: 'funnel',
    tags: ['Fitness', 'Challenge', 'Health', 'Subscription'],
    sections: []
  },
  {
    name: 'Luxury Real Estate Listing Showcase',
    category: 'Real Estate',
    description: 'Immersive property tour page, neighborhood highlights, virtual walk-through video, and private viewing scheduler.',
    thumbnail: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&auto=format&fit=crop&q=80',
    type: 'funnel',
    tags: ['Real Estate', 'Luxury', 'Lead Capture', 'Broker'],
    sections: []
  },
  {
    name: 'Gourmet Restaurant & Event Booking',
    category: 'Restaurant',
    description: 'Mouthwatering menu spotlight, chef accolades, VIP reservation table booking, and gift card upsell.',
    thumbnail: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80',
    type: 'funnel',
    tags: ['Restaurant', 'Dining', 'Hospitality', 'Catering'],
    sections: []
  },
  {
    name: 'Medical & Healthcare Practice Funnel',
    category: 'Healthcare',
    description: 'HIPAA-compliant consultation request, doctor credentials, patient success stories, and clinic locator.',
    thumbnail: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=600&auto=format&fit=crop&q=80',
    type: 'funnel',
    tags: ['Healthcare', 'Clinic', 'Consultation', 'Dental'],
    sections: []
  },
  {
    name: 'B2B Creative Agency Client Magnet',
    category: 'Agency',
    description: 'Portfolio case studies, metrics achieved, client logos, and high-ticket discovery call booking form.',
    thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80',
    type: 'funnel',
    tags: ['Agency', 'Portfolio', 'B2B', 'Design'],
    sections: []
  },
  {
    name: 'Ultimate Lead Magnet & Cheat Sheet',
    category: 'Lead Generation',
    description: 'Ultra-clean single column opt-in with bullet point benefits and instant PDF download delivery.',
    thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80',
    type: 'funnel',
    tags: ['Lead Magnet', 'Free Guide', 'Opt-in', 'List Building'],
    sections: []
  },
  {
    name: 'Corporate Business Advisory',
    category: 'Business',
    description: 'Executive strategy advisory page with ROI calculator preview, white paper download, and stakeholder deck.',
    thumbnail: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80',
    type: 'funnel',
    tags: ['Business', 'Corporate', 'Enterprise', 'Strategy'],
    sections: []
  }
];

// @desc Get all templates
exports.getTemplates = async (req, res) => {
  try {
    const { category, search } = req.query;
    let templates = await Template.find({});

    if (templates.length === 0) {
      templates = await Template.insertMany(STARTER_TEMPLATES);
    }

    let filtered = templates;
    if (category && category !== 'all') {
      filtered = filtered.filter(t => t.category.toLowerCase() === category.toLowerCase());
    }
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(s) ||
        t.description.toLowerCase().includes(s) ||
        (t.tags && t.tags.some(tag => tag.toLowerCase().includes(s)))
      );
    }

    res.status(200).json({ success: true, count: filtered.length, data: filtered });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Clone template into a new funnel
exports.useTemplate = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    const funnelSlug = `${template.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const funnel = await Funnel.create({
      name: `${template.name}`,
      description: template.description,
      slug: funnelSlug,
      category: template.category.toLowerCase(),
      status: 'draft',
      stats: { visitors: 0, leads: 0, orders: 0, revenue: 0, conversionRate: 0 }
    });

    // Create 3 standard steps: Opt-in, Sales/Checkout, Thank You
    const step1Page = await Page.create({
      funnelId: funnel._id,
      title: `${template.name} — Opt-in`,
      slug: 'optin',
      status: 'draft',
      sections: template.sections && template.sections.length > 0 ? template.sections : [
        {
          id: uuidv4(),
          name: 'Hero Section',
          styles: { backgroundColor: '#ffffff', padding: '60px 20px', textAlign: 'center' },
          rows: [{
            id: uuidv4(),
            columns: [{
              id: uuidv4(),
              width: '100%',
              elements: [
                { id: uuidv4(), type: 'badge', content: { text: template.category.toUpperCase() + ' TEMPLATE', color: '#6366f1', bgColor: '#eef2ff' } },
                { id: uuidv4(), type: 'heading', content: { text: template.name, level: 'h1' }, styles: { fontSize: '40px', fontWeight: '800', color: '#0f172a', margin: '16px auto' } },
                { id: uuidv4(), type: 'paragraph', content: { text: template.description }, styles: { fontSize: '18px', color: '#64748b', maxWidth: '640px', margin: '0 auto 24px auto' } },
                { id: uuidv4(), type: 'form', content: { buttonText: 'Claim Your Free Spot Now', fields: [{ name: 'name', type: 'text', placeholder: 'Your Name' }, { name: 'email', type: 'email', placeholder: 'Your Email' }] }, styles: { maxWidth: '420px', margin: '0 auto' } }
              ]
            }]
          }]
        }
      ]
    });

    const step1 = await FunnelStep.create({
      funnelId: funnel._id,
      name: 'Opt-in Step',
      stepType: 'optin',
      slug: 'optin',
      order: 0,
      pageId: step1Page._id,
      stats: { views: 0, conversions: 0, conversionRate: 0 }
    });
    step1Page.funnelStepId = step1._id;
    await step1Page.save();

    // Step 2: Checkout / Sales
    const step2Page = await Page.create({
      funnelId: funnel._id,
      title: `${template.name} — Checkout`,
      slug: 'checkout',
      status: 'draft',
      sections: [
        {
          id: uuidv4(),
          name: 'Checkout Hero',
          styles: { backgroundColor: '#f8fafc', padding: '50px 20px', textAlign: 'center' },
          rows: [{
            id: uuidv4(),
            columns: [{
              id: uuidv4(),
              width: '100%',
              elements: [
                { id: uuidv4(), type: 'heading', content: { text: 'Complete Your Order', level: 'h1' }, styles: { fontSize: '32px', fontWeight: '700', color: '#0f172a' } },
                { id: uuidv4(), type: 'paragraph', content: { text: 'Lock in your exclusive lifetime discount today.' }, styles: { fontSize: '16px', color: '#64748b', marginTop: '8px' } }
              ]
            }]
          }]
        }
      ]
    });

    const step2 = await FunnelStep.create({
      funnelId: funnel._id,
      name: 'Checkout Step',
      stepType: 'checkout',
      slug: 'checkout',
      order: 1,
      pageId: step2Page._id,
      stats: { views: 0, conversions: 0, conversionRate: 0 }
    });
    step2Page.funnelStepId = step2._id;
    await step2Page.save();

    // Step 3: Thank you
    const step3Page = await Page.create({
      funnelId: funnel._id,
      title: `${template.name} — Thank You`,
      slug: 'thank-you',
      status: 'draft',
      sections: [
        {
          id: uuidv4(),
          name: 'Thank You Hero',
          styles: { backgroundColor: '#ffffff', padding: '60px 20px', textAlign: 'center' },
          rows: [{
            id: uuidv4(),
            columns: [{
              id: uuidv4(),
              width: '100%',
              elements: [
                { id: uuidv4(), type: 'badge', content: { text: 'SUCCESS', color: '#10b981', bgColor: '#ecfdf5' } },
                { id: uuidv4(), type: 'heading', content: { text: 'Welcome to the Family!', level: 'h1' }, styles: { fontSize: '36px', fontWeight: '800', color: '#0f172a', margin: '16px auto' } },
                { id: uuidv4(), type: 'paragraph', content: { text: 'Check your email inbox for your login details and instructions.' }, styles: { fontSize: '16px', color: '#64748b', maxWidth: '500px', margin: '0 auto' } }
              ]
            }]
          }]
        }
      ]
    });

    const step3 = await FunnelStep.create({
      funnelId: funnel._id,
      name: 'Thank You Page',
      stepType: 'thankyou',
      slug: 'thank-you',
      order: 2,
      pageId: step3Page._id,
      stats: { views: 0, conversions: 0, conversionRate: 0 }
    });
    step3Page.funnelStepId = step3._id;
    await step3Page.save();

    res.status(201).json({
      success: true,
      data: funnel,
      message: `Funnel created from ${template.name} template!`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


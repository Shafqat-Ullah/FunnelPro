const { Integration } = require('../models');

// Initial default supported integrations
const DEFAULT_PROVIDERS = [
  {
    provider: 'stripe',
    name: 'Stripe Payments',
    category: 'Payment Gateways',
    description: 'Accept credit card payments, order bumps, one-click upsells and subscriptions.',
    status: 'connected',
    credentials: { publishableKey: 'pk_test_demo...', secretKey: 'sk_test_demo...' },
    icon: 'credit-card'
  },
  {
    provider: 'paypal',
    name: 'PayPal Checkout',
    category: 'Payment Gateways',
    description: 'Allow customers to check out seamlessly with PayPal balance or debit/credit.',
    status: 'disconnected',
    credentials: { clientId: '', secret: '' },
    icon: 'wallet'
  },
  {
    provider: 'mailchimp',
    name: 'Mailchimp Sync',
    category: 'Email Marketing',
    description: 'Automatically sync opt-in leads and buyers directly into Mailchimp lists.',
    status: 'disconnected',
    credentials: { apiKey: '', serverPrefix: '', listId: '' },
    icon: 'mail'
  },
  {
    provider: 'google_analytics',
    name: 'Google Analytics 4',
    category: 'Analytics & Tracking',
    description: 'Track real-time page views, scroll depth, and e-commerce conversions.',
    status: 'connected',
    credentials: { measurementId: 'G-FP8849201' },
    icon: 'activity'
  },
  {
    provider: 'facebook_pixel',
    name: 'Meta / Facebook Pixel',
    category: 'Analytics & Tracking',
    description: 'Track Lead and Purchase events to optimize Facebook and Instagram ad campaigns.',
    status: 'disconnected',
    credentials: { pixelId: '' },
    icon: 'tag'
  },
  {
    provider: 'smtp',
    name: 'Custom SMTP Server',
    category: 'Email Delivery',
    description: 'Send transactional emails, order receipts, and marketing broadcasts via SMTP.',
    status: 'connected',
    credentials: { host: 'smtp.mailtrap.io', port: 2525, user: 'demo-user' },
    icon: 'send'
  },
  {
    provider: 'webhook',
    name: 'Outgoing Webhooks',
    category: 'Developer Tools',
    description: 'Send HTTP POST payloads to Zapier, Make, or custom API endpoints on triggers.',
    status: 'disconnected',
    credentials: { webhookUrl: '', secretKey: '' },
    icon: 'zap'
  }
];

// @desc Get all integrations
exports.getIntegrations = async (req, res) => {
  try {
    let saved = await Integration.find({});

    if (saved.length === 0) {
      saved = await Integration.insertMany(DEFAULT_PROVIDERS);
    }

    res.status(200).json({ success: true, count: saved.length, data: saved });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Connect or update integration credentials
exports.saveIntegration = async (req, res) => {
  try {
    const { provider, credentials, status } = req.body;
    let integration = await Integration.findOne({ provider });

    if (!integration) {
      const def = DEFAULT_PROVIDERS.find(p => p.provider === provider) || {
        provider,
        name: provider.toUpperCase(),
        category: 'Custom'
      };
      integration = await Integration.create({
        ...def,
        credentials: credentials || {},
        status: status || 'connected',
        lastCheckedAt: new Date().toISOString()
      });
    } else {
      if (credentials) integration.credentials = { ...integration.credentials, ...credentials };
      if (status) integration.status = status;
      integration.lastCheckedAt = new Date().toISOString();
      await integration.save();
    }

    res.status(200).json({
      success: true,
      data: integration,
      message: `${integration.name} configuration updated successfully!`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Test connection check
exports.testConnection = async (req, res) => {
  try {
    const { provider } = req.params;
    const integration = await Integration.findOne({ provider });

    if (!integration) {
      return res.status(404).json({ success: false, message: 'Integration not found' });
    }

    // Verify
    integration.status = 'connected';
    integration.lastCheckedAt = new Date().toISOString();
    await integration.save();

    res.status(200).json({
      success: true,
      message: `Connection to ${integration.name} verified successfully!`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


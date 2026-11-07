const { Funnel, FunnelStep, Page, Contact, Product, AnalyticsEvent, Notification } = require('../models');

// @desc Get public funnel page by funnelSlug and stepSlug
exports.getPublicFunnelStep = async (req, res) => {
  try {
    const { funnelSlug, stepSlug } = req.params;

    const funnel = await Funnel.findOne({ slug: funnelSlug });
    if (!funnel) {
      return res.status(404).json({ success: false, message: 'Funnel not found' });
    }

    const steps = await FunnelStep.find({ funnelId: funnel._id }).sort({ order: 1 });
    if (steps.length === 0) {
      return res.status(404).json({ success: false, message: 'No steps configured for this funnel' });
    }

    let currentStep = null;
    let currentIndex = 0;

    if (!stepSlug) {
      currentStep = steps[0];
      currentIndex = 0;
    } else {
      currentIndex = steps.findIndex(s => s.slug === stepSlug);
      if (currentIndex !== -1) {
        currentStep = steps[currentIndex];
      } else {
        currentStep = steps[0];
        currentIndex = 0;
      }
    }

    let page = null;
    if (currentStep.pageId) {
      page = await Page.findById(currentStep.pageId);
    }

    const nextStep = steps[currentIndex + 1] || null;

    // Track page view event
    await AnalyticsEvent.create({
      funnelId: funnel._id,
      funnelStepId: currentStep._id,
      pageId: page ? page._id : null,
      eventType: 'page_view',
      visitorId: req.ip || 'anonymous-visitor',
      device: 'desktop'
    });

    // Update stats
    currentStep.stats.views = (currentStep.stats.views || 0) + 1;
    await currentStep.save();

    res.status(200).json({
      success: true,
      data: {
        funnel: {
          _id: funnel._id,
          name: funnel.name,
          slug: funnel.slug,
          customDomain: funnel.customDomain,
          trackingCodes: funnel.trackingCodes
        },
        step: currentStep,
        page,
        nextStepUrl: nextStep ? `/f/${funnel.slug}/${nextStep.slug}` : null,
        totalSteps: steps.length,
        currentStepIndex: currentIndex + 1
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Submit Opt-in form from public landing page
exports.submitPublicOptin = async (req, res) => {
  try {
    const { funnelId, stepId, name, email, phone, customFields } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required' });
    }

    const nameParts = (name || '').trim().split(' ');
    const firstName = nameParts[0] || 'Friend';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Check existing contact or create new
    let contact = await Contact.findOne({ email: email.toLowerCase() });
    if (!contact) {
      contact = await Contact.create({
        firstName,
        lastName,
        email: email.toLowerCase(),
        phone: phone || '',
        tags: ['lead', 'funnel-optin'],
        source: 'optin_form',
        sourceFunnelId: funnelId || null,
        sourceStepId: stepId || null,
        status: 'lead',
        activityLog: [
          {
            action: 'Lead Opt-in Submitted',
            details: `Opted in through funnel step`,
            timestamp: new Date().toISOString()
          }
        ]
      });
    } else {
      if (!contact.tags) contact.tags = [];
      if (!contact.tags.includes('funnel-optin')) contact.tags.push('funnel-optin');
      if (!contact.activityLog) contact.activityLog = [];
      contact.activityLog.unshift({
        action: 'Form Re-submitted',
        details: 'Opted in via public funnel form',
        timestamp: new Date().toISOString()
      });
      await contact.save();
    }

    // Update Step conversion stats
    if (stepId) {
      const step = await FunnelStep.findById(stepId);
      if (step) {
        step.stats.conversions = (step.stats.conversions || 0) + 1;
        const views = step.stats.views || 1;
        step.stats.conversionRate = Number(((step.stats.conversions / views) * 100).toFixed(1));
        await step.save();
      }
    }

    // In-app Notification
    await Notification.create({
      title: '🎯 New Lead Captured!',
      message: `${name || email} just subscribed through your funnel opt-in form!`,
      type: 'lead',
      link: '/contacts'
    });

    // Track analytics event
    await AnalyticsEvent.create({
      funnelId: funnelId || null,
      funnelStepId: stepId || null,
      eventType: 'optin_submit',
      visitorId: email,
      device: 'desktop'
    });

    // Determine next step
    let nextStepUrl = null;
    if (funnelId && stepId) {
      const funnel = await Funnel.findById(funnelId);
      const steps = await FunnelStep.find({ funnelId }).sort({ order: 1 });
      const currIdx = steps.findIndex(s => String(s._id) === String(stepId));
      if (currIdx !== -1 && steps[currIdx + 1]) {
        nextStepUrl = `/f/${funnel.slug}/${steps[currIdx + 1].slug}`;
      }
    }

    res.status(200).json({
      success: true,
      message: 'Thank you! You have been successfully registered.',
      contact,
      nextStepUrl
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Get public standalone page by slug
exports.getPublicPage = async (req, res) => {
  try {
    const { slug } = req.params;
    let page = await Page.findOne({ slug });
    if (!page) {
      page = await Page.findById(slug);
    }
    if (!page) {
      return res.status(404).json({ success: false, message: 'Landing page not found' });
    }

    res.status(200).json({
      success: true,
      data: {
        page,
        step: { name: page.title, stepType: 'sales' },
        funnel: { name: page.title, slug: page.slug }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



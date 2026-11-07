const { Funnel, FunnelStep, Page } = require('../models');
const { v4: uuidv4 } = require('uuid');

// Helper to generate clean slug
const toSlug = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

// @desc Get all funnels
exports.getFunnels = async (req, res) => {
  try {
    const { category, search, status } = req.query;
    let query = {};

    if (category && category !== 'all') {
      query.category = category;
    }
    if (status && status !== 'all') {
      query.status = status;
    }
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const funnels = await Funnel.find(query).sort({ createdAt: -1 });

    // Attach step counts to each funnel
    const funnelsWithSteps = await Promise.all(
      funnels.map(async (funnel) => {
        const steps = await FunnelStep.find({ funnelId: funnel._id }).sort({ order: 1 });
        return {
          ...funnel,
          stepCount: steps.length,
          steps
        };
      })
    );

    res.status(200).json({ success: true, count: funnelsWithSteps.length, data: funnelsWithSteps });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Get single funnel with steps and pages
exports.getFunnelById = async (req, res) => {
  try {
    const funnel = await Funnel.findById(req.params.id);
    if (!funnel) {
      return res.status(404).json({ success: false, message: 'Funnel not found' });
    }

    const steps = await FunnelStep.find({ funnelId: funnel._id }).sort({ order: 1 });

    // Fetch pages for each step
    const stepsWithPages = await Promise.all(
      steps.map(async (step) => {
        let page = null;
        if (step.pageId) {
          page = await Page.findById(step.pageId);
        }
        return {
          ...step,
          page
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        ...funnel,
        steps: stepsWithPages
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Create a new funnel
exports.createFunnel = async (req, res) => {
  try {
    const { name, description, category } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Please provide a funnel name' });
    }

    const slug = toSlug(name) + '-' + Math.floor(1000 + Math.random() * 9000);

    const funnel = await Funnel.create({
      name,
      description: description || '',
      slug,
      category: category || 'sales',
      status: 'draft',
      stats: { visitors: 0, leads: 0, orders: 0, revenue: 0, conversionRate: 0 }
    });

    // Create a starter opt-in step
    const page = await Page.create({
      funnelId: funnel._id,
      title: `${name} — Opt-in Page`,
      slug: 'optin',
      status: 'draft',
      sections: [
        {
          id: uuidv4(),
          name: 'Hero Section',
          styles: { backgroundColor: '#ffffff', padding: '60px 20px', textAlign: 'center' },
          rows: [
            {
              id: uuidv4(),
              columns: [
                {
                  id: uuidv4(),
                  width: '100%',
                  elements: [
                    {
                      id: uuidv4(),
                      type: 'badge',
                      content: { text: 'EXCLUSIVE FREE GUIDE', color: '#6366f1', bgColor: '#eef2ff' },
                      styles: { margin: '0 auto 16px auto', display: 'inline-block' }
                    },
                    {
                      id: uuidv4(),
                      type: 'heading',
                      content: { text: 'Scale Your Online Revenue to 7-Figures With FunnelPro', level: 'h1' },
                      styles: { fontSize: '42px', fontWeight: '800', color: '#0f172a', marginBottom: '16px' }
                    },
                    {
                      id: uuidv4(),
                      type: 'paragraph',
                      content: { text: 'Discover the exact battle-tested sales funnel architecture top creators and founders use to 5x their conversion rates.' },
                      styles: { fontSize: '18px', color: '#64748b', maxWidth: '680px', margin: '0 auto 32px auto' }
                    },
                    {
                      id: uuidv4(),
                      type: 'form',
                      content: {
                        buttonText: 'Get Instant Free Access Now',
                        fields: [
                          { name: 'name', type: 'text', placeholder: 'Your First Name', required: true },
                          { name: 'email', type: 'email', placeholder: 'Your Best Email Address', required: true }
                        ]
                      },
                      styles: { maxWidth: '440px', margin: '0 auto' }
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    });

    const step = await FunnelStep.create({
      funnelId: funnel._id,
      name: 'Opt-in Page',
      stepType: 'optin',
      slug: 'optin',
      order: 0,
      pageId: page._id,
      stats: { views: 0, conversions: 0, conversionRate: 0 }
    });

    page.funnelStepId = step._id;
    await page.save();

    res.status(201).json({
      success: true,
      data: {
        ...funnel,
        steps: [{ ...step, page }]
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Update funnel
exports.updateFunnel = async (req, res) => {
  try {
    const { name, description, slug, category, status, customDomain, trackingCodes } = req.body;
    const funnel = await Funnel.findById(req.params.id);

    if (!funnel) {
      return res.status(404).json({ success: false, message: 'Funnel not found' });
    }

    if (name) funnel.name = name;
    if (description !== undefined) funnel.description = description;
    if (slug) funnel.slug = toSlug(slug);
    if (category) funnel.category = category;
    if (status) funnel.status = status;
    if (customDomain !== undefined) funnel.customDomain = customDomain;
    if (trackingCodes) funnel.trackingCodes = trackingCodes;

    await funnel.save();

    res.status(200).json({ success: true, data: funnel });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Delete funnel and its steps
exports.deleteFunnel = async (req, res) => {
  try {
    const funnel = await Funnel.findById(req.params.id);
    if (!funnel) {
      return res.status(404).json({ success: false, message: 'Funnel not found' });
    }

    // Delete associated pages and steps
    const steps = await FunnelStep.find({ funnelId: funnel._id });
    for (const step of steps) {
      if (step.pageId) {
        await Page.findByIdAndDelete(step.pageId);
      }
      await FunnelStep.findByIdAndDelete(step._id);
    }

    await Funnel.findByIdAndDelete(funnel._id);

    res.status(200).json({ success: true, message: 'Funnel and all steps deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Duplicate funnel
exports.duplicateFunnel = async (req, res) => {
  try {
    const original = await Funnel.findById(req.params.id);
    if (!original) {
      return res.status(404).json({ success: false, message: 'Funnel not found' });
    }

    const newSlug = `${original.slug}-copy-${Math.floor(1000 + Math.random() * 9000)}`;
    const clonedFunnel = await Funnel.create({
      name: `${original.name} (Copy)`,
      description: original.description,
      slug: newSlug,
      category: original.category,
      status: 'draft',
      stats: { visitors: 0, leads: 0, orders: 0, revenue: 0, conversionRate: 0 }
    });

    const originalSteps = await FunnelStep.find({ funnelId: original._id }).sort({ order: 1 });
    const stepMapping = {};

    for (const step of originalSteps) {
      let newPageId = null;
      if (step.pageId) {
        const origPage = await Page.findById(step.pageId);
        if (origPage) {
          const clonedPage = await Page.create({
            funnelId: clonedFunnel._id,
            title: origPage.title,
            slug: origPage.slug,
            sections: origPage.sections,
            seo: origPage.seo,
            customCss: origPage.customCss,
            status: 'draft'
          });
          newPageId = clonedPage._id;
        }
      }

      const clonedStep = await FunnelStep.create({
        funnelId: clonedFunnel._id,
        name: step.name,
        stepType: step.stepType,
        slug: step.slug,
        order: step.order,
        pageId: newPageId,
        stats: { views: 0, conversions: 0, conversionRate: 0 }
      });

      stepMapping[step._id] = clonedStep._id;

      if (newPageId) {
        await Page.findByIdAndUpdate(newPageId, { funnelStepId: clonedStep._id });
      }
    }

    res.status(201).json({ success: true, data: clonedFunnel, message: 'Funnel duplicated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Add Step to funnel
exports.addStep = async (req, res) => {
  try {
    const { name, stepType, slug } = req.body;
    const funnel = await Funnel.findById(req.params.id);

    if (!funnel) {
      return res.status(404).json({ success: false, message: 'Funnel not found' });
    }

    const currentSteps = await FunnelStep.find({ funnelId: funnel._id });
    const order = currentSteps.length;
    const stepSlug = slug ? toSlug(slug) : `${toSlug(stepType || 'step')}-${order + 1}`;

    // Create page template based on step type
    const page = await Page.create({
      funnelId: funnel._id,
      title: `${name || 'New Step'}`,
      slug: stepSlug,
      status: 'draft',
      sections: [
        {
          id: uuidv4(),
          name: `${name || 'Step'} Hero`,
          styles: { backgroundColor: '#ffffff', padding: '50px 20px', textAlign: 'center' },
          rows: [
            {
              id: uuidv4(),
              columns: [
                {
                  id: uuidv4(),
                  width: '100%',
                  elements: [
                    {
                      id: uuidv4(),
                      type: 'heading',
                      content: { text: name || 'Step Headline', level: 'h1' },
                      styles: { fontSize: '36px', fontWeight: '700', color: '#0f172a' }
                    },
                    {
                      id: uuidv4(),
                      type: 'paragraph',
                      content: { text: 'Customize this page in the visual drag-and-drop editor.' },
                      styles: { fontSize: '16px', color: '#64748b', marginTop: '12px' }
                    },
                    {
                      id: uuidv4(),
                      type: 'button',
                      content: { text: 'Continue to Next Step', link: '#', styleType: 'primary' },
                      styles: { marginTop: '24px', padding: '12px 28px', backgroundColor: '#6366f1', color: '#ffffff', borderRadius: '8px' }
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    });

    const step = await FunnelStep.create({
      funnelId: funnel._id,
      name: name || `Step ${order + 1}`,
      stepType: stepType || 'optin',
      slug: stepSlug,
      order,
      pageId: page._id,
      stats: { views: 0, conversions: 0, conversionRate: 0 }
    });

    page.funnelStepId = step._id;
    await page.save();

    res.status(201).json({
      success: true,
      data: {
        ...step,
        page
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Update funnel step
exports.updateStep = async (req, res) => {
  try {
    const { name, stepType, slug, nextStepId, upsellStepId, downsellStepId } = req.body;
    const step = await FunnelStep.findById(req.params.stepId);

    if (!step) {
      return res.status(404).json({ success: false, message: 'Step not found' });
    }

    if (name) step.name = name;
    if (stepType) step.stepType = stepType;
    if (slug) step.slug = toSlug(slug);
    if (nextStepId !== undefined) step.nextStepId = nextStepId;
    if (upsellStepId !== undefined) step.upsellStepId = upsellStepId;
    if (downsellStepId !== undefined) step.downsellStepId = downsellStepId;

    await step.save();

    res.status(200).json({ success: true, data: step });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Delete funnel step
exports.deleteStep = async (req, res) => {
  try {
    const step = await FunnelStep.findById(req.params.stepId);
    if (!step) {
      return res.status(404).json({ success: false, message: 'Step not found' });
    }

    if (step.pageId) {
      await Page.findByIdAndDelete(step.pageId);
    }
    await FunnelStep.findByIdAndDelete(step._id);

    // Reorder remaining steps
    const remaining = await FunnelStep.find({ funnelId: step.funnelId }).sort({ order: 1 });
    for (let i = 0; i < remaining.length; i++) {
      remaining[i].order = i;
      await remaining[i].save();
    }

    res.status(200).json({ success: true, message: 'Step removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Reorder steps
exports.reorderSteps = async (req, res) => {
  try {
    const { stepIds } = req.body; // Array of step IDs in new order
    if (!Array.isArray(stepIds)) {
      return res.status(400).json({ success: false, message: 'stepIds must be an array' });
    }

    for (let index = 0; index < stepIds.length; index++) {
      const stepId = stepIds[index];
      await FunnelStep.findByIdAndUpdate(stepId, { order: index });
    }

    const updatedSteps = await FunnelStep.find({ funnelId: req.params.id }).sort({ order: 1 });
    res.status(200).json({ success: true, data: updatedSteps });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


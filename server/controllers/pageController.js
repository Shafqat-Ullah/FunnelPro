const { Page, Funnel, FunnelStep } = require('../models');

// @desc Get all standalone landing pages
exports.getPages = async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};

    if (status && status !== 'all') {
      query.status = status;
    }
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const pages = await Page.find(query).sort({ updatedAt: -1 });
    res.status(200).json({ success: true, count: pages.length, data: pages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Get single page by ID
exports.getPageById = async (req, res) => {
  try {
    const page = await Page.findById(req.params.id);
    if (!page) {
      return res.status(404).json({ success: false, message: 'Page not found' });
    }

    let funnel = null;
    let step = null;

    if (page.funnelId) {
      funnel = await Funnel.findById(page.funnelId);
    }
    if (page.funnelStepId) {
      step = await FunnelStep.findById(page.funnelStepId);
    }

    res.status(200).json({
      success: true,
      data: {
        ...page,
        funnel,
        step
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Create a new standalone page
exports.createPage = async (req, res) => {
  try {
    const { title, slug, sections, customCss, seo } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: 'Please provide a page title' });
    }

    const pageSlug = slug ? slug.toLowerCase().replace(/[^a-z0-9]+/g, '-') : `page-${Date.now()}`;

    const page = await Page.create({
      title,
      slug: pageSlug,
      sections: sections || [],
      customCss: customCss || '',
      seo: seo || { title, description: '', ogImage: '', keywords: '' },
      status: 'draft',
      version: 1
    });

    res.status(201).json({ success: true, data: page });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Save page contents (sections, styles, SEO, custom CSS)
exports.savePage = async (req, res) => {
  try {
    const { title, sections, customCss, seo, status } = req.body;
    const page = await Page.findById(req.params.id);

    if (!page) {
      return res.status(404).json({ success: false, message: 'Page not found' });
    }

    if (title) page.title = title;
    if (sections !== undefined) page.sections = sections;
    if (customCss !== undefined) page.customCss = customCss;
    if (seo) page.seo = seo;
    if (status) page.status = status;
    page.version = (page.version || 1) + 1;

    await page.save();

    res.status(200).json({
      success: true,
      data: page,
      message: 'Page saved successfully'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Toggle publish status
exports.togglePublish = async (req, res) => {
  try {
    const page = await Page.findById(req.params.id);
    if (!page) {
      return res.status(404).json({ success: false, message: 'Page not found' });
    }

    page.status = page.status === 'published' ? 'draft' : 'published';
    await page.save();

    res.status(200).json({
      success: true,
      data: page,
      message: `Page is now ${page.status}`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Delete page
exports.deletePage = async (req, res) => {
  try {
    const page = await Page.findById(req.params.id);
    if (!page) {
      return res.status(404).json({ success: false, message: 'Page not found' });
    }

    await Page.findByIdAndDelete(page._id);
    res.status(200).json({ success: true, message: 'Page deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


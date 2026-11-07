const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');
const auth = require('../controllers/authController');
const funnel = require('../controllers/funnelController');
const page = require('../controllers/pageController');
const contact = require('../controllers/contactController');
const product = require('../controllers/productController');
const order = require('../controllers/orderController');
const campaign = require('../controllers/campaignController');
const automation = require('../controllers/automationController');
const analytics = require('../controllers/analyticsController');
const domain = require('../controllers/domainController');
const integration = require('../controllers/integrationController');
const template = require('../controllers/templateController');
const publicCtrl = require('../controllers/publicController');
const { Notification } = require('../models');
const { seedAll } = require('../seed/seedData');

// 1. Auth routes
router.post('/auth/register', auth.register);
router.post('/auth/login', auth.login);
router.post('/auth/demo-login', auth.demoLogin);
router.get('/auth/me', protect, auth.getMe);
router.put('/auth/profile', protect, auth.updateProfile);
router.put('/auth/password', protect, auth.updatePassword);
router.post('/auth/forgot-password', auth.forgotPassword);
router.post('/auth/reset-password', auth.resetPassword);

// 2. Funnel routes
router.get('/funnels', protect, funnel.getFunnels);
router.get('/funnels/:id', protect, funnel.getFunnelById);
router.post('/funnels', protect, funnel.createFunnel);
router.put('/funnels/:id', protect, funnel.updateFunnel);
router.delete('/funnels/:id', protect, funnel.deleteFunnel);
router.post('/funnels/:id/duplicate', protect, funnel.duplicateFunnel);
router.post('/funnels/:id/steps', protect, funnel.addStep);
router.put('/funnels/:id/steps/:stepId', protect, funnel.updateStep);
router.delete('/funnels/:id/steps/:stepId', protect, funnel.deleteStep);
router.post('/funnels/:id/reorder-steps', protect, funnel.reorderSteps);

// 3. Page Builder routes
router.get('/pages', protect, page.getPages);
router.get('/pages/:id', protect, page.getPageById);
router.post('/pages', protect, page.createPage);
router.put('/pages/:id', protect, page.savePage);
router.post('/pages/:id/publish', protect, page.togglePublish);
router.delete('/pages/:id', protect, page.deletePage);

// 4. Contacts / CRM routes
router.get('/contacts', protect, contact.getContacts);
router.get('/contacts/export/csv', protect, contact.exportCSV);
router.get('/contacts/:id', protect, contact.getContactById);
router.post('/contacts', protect, contact.createContact);
router.put('/contacts/:id', protect, contact.updateContact);
router.delete('/contacts/:id', protect, contact.deleteContact);

// 5. Products routes
router.get('/products', protect, product.getProducts);
router.get('/products/:id', protect, product.getProductById);
router.post('/products', protect, product.createProduct);
router.put('/products/:id', protect, product.updateProduct);
router.delete('/products/:id', protect, product.deleteProduct);

// 6. Orders & Checkout routes
router.get('/orders', protect, order.getOrders);
router.get('/orders/:id', protect, order.getOrderById);
router.post('/orders/checkout-intent', order.createCheckoutIntent);
router.post('/orders/process', order.processOrder);
router.post('/orders/upsell', order.processUpsell);
router.post('/orders/validate-coupon', order.validateCoupon);

// Coupons
router.get('/coupons', protect, order.getCoupons);
router.post('/coupons', protect, order.createCoupon);
router.delete('/coupons/:id', protect, order.deleteCoupon);

// 7. Email Marketing & Campaigns
router.get('/campaigns', protect, campaign.getCampaigns);
router.get('/campaigns/:id', protect, campaign.getCampaignById);
router.post('/campaigns', protect, campaign.createCampaign);
router.put('/campaigns/:id', protect, campaign.updateCampaign);
router.post('/campaigns/test-email', protect, campaign.sendTestEmail);
router.post('/campaigns/:id/send', protect, campaign.launchCampaign);
router.delete('/campaigns/:id', protect, campaign.deleteCampaign);

// 8. Marketing Automations
router.get('/automations', protect, automation.getAutomations);
router.get('/automations/:id', protect, automation.getAutomationById);
router.post('/automations', protect, automation.createAutomation);
router.put('/automations/:id', protect, automation.updateAutomation);
router.post('/automations/:id/toggle', protect, automation.toggleAutomationStatus);
router.delete('/automations/:id', protect, automation.deleteAutomation);

// 9. Analytics & Reporting
router.get('/analytics/dashboard', protect, analytics.getDashboardStats);

// 10. Domains & DNS
router.get('/domains', protect, domain.getDomains);
router.post('/domains', protect, domain.addDomain);
router.post('/domains/:id/verify', protect, domain.verifyDomain);
router.delete('/domains/:id', protect, domain.deleteDomain);

// 11. Integrations
router.get('/integrations', protect, integration.getIntegrations);
router.post('/integrations', protect, integration.saveIntegration);
router.post('/integrations/:provider/test', protect, integration.testConnection);

// 12. Templates Library
router.get('/templates', template.getTemplates);
router.post('/templates/:id/use', protect, template.useTemplate);

// 13. Notifications
router.get('/notifications', protect, async (req, res) => {
  try {
    const list = await Notification.find({}).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: list.length, data: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
router.put('/notifications/:id/read', protect, async (req, res) => {
  try {
    const notif = await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.status(200).json({ success: true, data: notif });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 14. Demo Reset Utility
router.post('/system/reset-demo', async (req, res) => {
  try {
    await seedAll();
    res.status(200).json({
      success: true,
      message: 'Demo database has been successfully reset to initial production state.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 15. Public Landing Page & Funnel Viewer (No Auth Required)
router.get('/public/funnel/:funnelSlug', publicCtrl.getPublicFunnelStep);
router.get('/public/funnel/:funnelSlug/:stepSlug', publicCtrl.getPublicFunnelStep);
router.get('/public/page/:slug', publicCtrl.getPublicPage);
router.post('/public/optin', publicCtrl.submitPublicOptin);

module.exports = router;


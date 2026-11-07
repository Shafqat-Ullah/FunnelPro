import api from './client';

// Auth Services
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  demoLogin: () => api.post('/auth/demo-login'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  updatePassword: (passwordData) => api.put('/auth/password', passwordData),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data)
};

// Funnel Services
export const funnelService = {
  getAll: (params) => api.get('/funnels', { params }),
  getById: (id) => api.get(`/funnels/${id}`),
  create: (data) => api.post('/funnels', data),
  update: (id, data) => api.put(`/funnels/${id}`, data),
  delete: (id) => api.delete(`/funnels/${id}`),
  duplicate: (id) => api.post(`/funnels/${id}/duplicate`),
  addStep: (funnelId, data) => api.post(`/funnels/${funnelId}/steps`, data),
  updateStep: (funnelId, stepId, data) => api.put(`/funnels/${funnelId}/steps/${stepId}`, data),
  deleteStep: (funnelId, stepId) => api.delete(`/funnels/${funnelId}/steps/${stepId}`),
  reorderSteps: (funnelId, stepIds) => api.post(`/funnels/${funnelId}/reorder-steps`, { stepIds })
};

// Page Builder Services
export const pageService = {
  getAll: (params) => api.get('/pages', { params }),
  getById: (id) => api.get(`/pages/${id}`),
  create: (data) => api.post('/pages', data),
  save: (id, data) => api.put(`/pages/${id}`, data),
  togglePublish: (id) => api.post(`/pages/${id}/publish`),
  delete: (id) => api.delete(`/pages/${id}`)
};

// CRM / Contact Services
export const contactService = {
  getAll: (params) => api.get('/contacts', { params }),
  getById: (id) => api.get(`/contacts/${id}`),
  create: (data) => api.post('/contacts', data),
  update: (id, data) => api.put(`/contacts/${id}`, data),
  delete: (id) => api.delete(`/contacts/${id}`),
  exportCSV: () => '/api/contacts/export/csv'
};

// Product Services
export const productService = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`)
};

// Orders & Checkout Services
export const orderService = {
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  createCheckoutIntent: (data) => api.post('/orders/checkout-intent', data),
  processOrder: (data) => api.post('/orders/process', data),
  processUpsell: (data) => api.post('/orders/upsell', data),
  validateCoupon: (code, subtotal) => api.post('/orders/validate-coupon', { code, subtotal }),
  getCoupons: () => api.get('/coupons'),
  createCoupon: (data) => api.post('/coupons', data),
  deleteCoupon: (id) => api.delete(`/coupons/${id}`)
};

// Email Campaign Services
export const campaignService = {
  getAll: () => api.get('/campaigns'),
  getById: (id) => api.get(`/campaigns/${id}`),
  create: (data) => api.post('/campaigns', data),
  update: (id, data) => api.put(`/campaigns/${id}`, data),
  sendTest: (data) => api.post('/campaigns/test-email', data),
  send: (id) => api.post(`/campaigns/${id}/send`),
  delete: (id) => api.delete(`/campaigns/${id}`)
};

// Automation Services
export const automationService = {
  getAll: () => api.get('/automations'),
  getById: (id) => api.get(`/automations/${id}`),
  create: (data) => api.post('/automations', data),
  update: (id, data) => api.put(`/automations/${id}`, data),
  toggle: (id) => api.post(`/automations/${id}/toggle`),
  delete: (id) => api.delete(`/automations/${id}`)
};

// Analytics Services
export const analyticsService = {
  getDashboard: (params) => api.get('/analytics/dashboard', { params })
};

// Domain Services
export const domainService = {
  getAll: () => api.get('/domains'),
  add: (data) => api.post('/domains', data),
  verify: (id) => api.post(`/domains/${id}/verify`),
  delete: (id) => api.delete(`/domains/${id}`)
};

// Integration Services
export const integrationService = {
  getAll: () => api.get('/integrations'),
  save: (data) => api.post('/integrations', data),
  test: (provider) => api.post(`/integrations/${provider}/test`)
};

// Template Services
export const templateService = {
  getAll: (params) => api.get('/templates', { params }),
  useTemplate: (id) => api.post(`/templates/${id}/use`)
};

// Public Services
export const publicService = {
  getPublicFunnelStep: (funnelSlug, stepSlug) => api.get(`/public/funnel/${funnelSlug}${stepSlug ? `/${stepSlug}` : ''}`),
  getPublicPage: (slug) => api.get(`/public/page/${slug}`),
  submitOptin: (data) => api.post('/public/optin', data)
};

// System / Utility Services
export const systemService = {
  resetDemo: () => api.post('/system/reset-demo'),
  getNotifications: () => api.get('/notifications'),
  markNotificationRead: (id) => api.put(`/notifications/${id}/read`)
};


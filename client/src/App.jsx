import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Layout
import DashboardLayout from './components/layout/DashboardLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// SaaS Core Pages
import DashboardOverview from './pages/dashboard/DashboardOverview';
import FunnelsList from './pages/funnels/FunnelsList';
import FunnelDetail from './pages/funnels/FunnelDetail';
import PageEditorPage from './pages/editor/PageEditorPage';
import WebsitesPage from './pages/websites/WebsitesPage';
import LandingPagesPage from './pages/landingPages/LandingPagesPage';
import TemplatesPage from './pages/templates/TemplatesPage';
import ContactsPage from './pages/contacts/ContactsPage';
import EmailMarketingPage from './pages/emailMarketing/EmailMarketingPage';
import AutomationsPage from './pages/automations/AutomationsPage';
import ProductsPage from './pages/products/ProductsPage';
import OrdersPage from './pages/orders/OrdersPage';
import PaymentsPage from './pages/payments/PaymentsPage';
import AnalyticsPage from './pages/analytics/AnalyticsPage';
import DomainsPage from './pages/domains/DomainsPage';
import IntegrationsPage from './pages/integrations/IntegrationsPage';
import SettingsPage from './pages/settings/SettingsPage';
import HelpCenterPage from './pages/help/HelpCenterPage';

// Public Funnel Runner
import PublicFunnelPage from './pages/public/PublicFunnelPage';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-xs">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span>Restoring Session...</span>
        </div>
      </div>
    );
  }
  return user ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Public-Facing Funnel Run-time (No authentication required for leads/buyers) */}
            <Route path="/f/:funnelSlug" element={<PublicFunnelPage />} />
            <Route path="/f/:funnelSlug/:stepSlug" element={<PublicFunnelPage />} />
            <Route path="/p/:pageSlug" element={<PublicFunnelPage />} />

            {/* Fullscreen Page Builder Studio (Protected) */}
            <Route
              path="/editor/:id"
              element={
                <ProtectedRoute>
                  <PageEditorPage />
                </ProtectedRoute>
              }
            />

            {/* Main SaaS Dashboard & Protected Feature Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardOverview />} />
              <Route path="funnels" element={<FunnelsList />} />
              <Route path="funnels/:id" element={<FunnelDetail />} />
              <Route path="websites" element={<WebsitesPage />} />
              <Route path="landing-pages" element={<LandingPagesPage />} />
              <Route path="templates" element={<TemplatesPage />} />
              <Route path="contacts" element={<ContactsPage />} />
              <Route path="email-marketing" element={<EmailMarketingPage />} />
              <Route path="automations" element={<AutomationsPage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="payments" element={<PaymentsPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="domains" element={<DomainsPage />} />
              <Route path="integrations" element={<IntegrationsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="help" element={<HelpCenterPage />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;


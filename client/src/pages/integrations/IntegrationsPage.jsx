import React, { useState, useEffect } from 'react';
import { integrationService } from '../../api/services';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import {
  Puzzle,
  CreditCard,
  Wallet,
  Mail,
  Activity,
  Tag,
  Send,
  Zap,
  CheckCircle2,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

const ICON_MAP = {
  'credit-card': CreditCard,
  wallet: Wallet,
  mail: Mail,
  activity: Activity,
  tag: Tag,
  send: Send,
  zap: Zap
};

const IntegrationsPage = () => {
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Configure Modal
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [credentials, setCredentials] = useState({});
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchIntegrations = async () => {
    setLoading(true);
    try {
      const res = await integrationService.getAll();
      if (res.data?.success) {
        setIntegrations(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching integrations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const openConfigModal = (item) => {
    setSelectedIntegration(item);
    setCredentials(item.credentials || {});
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await integrationService.save({
        provider: selectedIntegration.provider,
        credentials,
        status: 'connected'
      });
      if (res.data?.success) {
        alert(res.data.message);
        setSelectedIntegration(null);
        fetchIntegrations();
      }
    } catch (err) {
      alert('Failed to save integration');
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const res = await integrationService.test(selectedIntegration.provider);
      alert(res.data?.message || 'Connection verified successfully!');
      fetchIntegrations();
    } catch (err) {
      alert('Connection check failed');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Integrations & API Connections
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Connect payment processors, email providers, analytics tags, and webhooks
          </p>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">Loading integrations...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrations.map((item) => {
            const Icon = ICON_MAP[item.icon] || Puzzle;
            const isConnected = item.status === 'connected';

            return (
              <div
                key={item._id || item.provider}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-800 dark:text-slate-200">
                      <Icon className="w-5 h-5" />
                    </div>
                    <Badge variant={isConnected ? 'emerald' : 'slate'} size="xs">
                      {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
                    </Badge>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {item.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {item.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    {item.category}
                  </span>
                  <Button
                    variant={isConnected ? 'outline' : 'primary'}
                    size="sm"
                    onClick={() => openConfigModal(item)}
                  >
                    {isConnected ? 'Configure' : 'Connect'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Configuration Modal */}
      {selectedIntegration && (
        <Modal
          isOpen={!!selectedIntegration}
          onClose={() => setSelectedIntegration(null)}
          title={`Configure ${selectedIntegration.name}`}
        >
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <p className="text-slate-500 dark:text-slate-400">
              {selectedIntegration.description}
            </p>

            {/* Provider specific credential fields */}
            {selectedIntegration.provider === 'stripe' && (
              <div className="space-y-3">
                <div>
                  <label className="block font-semibold mb-1">Stripe Publishable Key</label>
                  <input
                    type="text"
                    value={credentials.publishableKey || ''}
                    onChange={(e) => setCredentials({ ...credentials, publishableKey: e.target.value })}
                    placeholder="pk_test_..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Stripe Secret Key</label>
                  <input
                    type="password"
                    value={credentials.secretKey || ''}
                    onChange={(e) => setCredentials({ ...credentials, secretKey: e.target.value })}
                    placeholder="sk_test_..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono"
                  />
                </div>
              </div>
            )}

            {selectedIntegration.provider === 'paypal' && (
              <div className="space-y-3">
                <div>
                  <label className="block font-semibold mb-1">PayPal Client ID</label>
                  <input
                    type="text"
                    value={credentials.clientId || ''}
                    onChange={(e) => setCredentials({ ...credentials, clientId: e.target.value })}
                    placeholder="PayPal Client ID"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono"
                  />
                </div>
              </div>
            )}

            {selectedIntegration.provider === 'mailchimp' && (
              <div className="space-y-3">
                <div>
                  <label className="block font-semibold mb-1">Mailchimp API Key</label>
                  <input
                    type="text"
                    value={credentials.apiKey || ''}
                    onChange={(e) => setCredentials({ ...credentials, apiKey: e.target.value })}
                    placeholder="API Key"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono"
                  />
                </div>
              </div>
            )}

            {selectedIntegration.provider === 'google_analytics' && (
              <div>
                <label className="block font-semibold mb-1">GA4 Measurement ID</label>
                <input
                  type="text"
                  value={credentials.measurementId || ''}
                  onChange={(e) => setCredentials({ ...credentials, measurementId: e.target.value })}
                  placeholder="G-XXXXXXXXXX"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono"
                />
              </div>
            )}

            {selectedIntegration.provider === 'facebook_pixel' && (
              <div>
                <label className="block font-semibold mb-1">Meta Pixel ID</label>
                <input
                  type="text"
                  value={credentials.pixelId || ''}
                  onChange={(e) => setCredentials({ ...credentials, pixelId: e.target.value })}
                  placeholder="e.g. 1284920381023"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono"
                />
              </div>
            )}

            {selectedIntegration.provider === 'smtp' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">SMTP Host</label>
                    <input
                      type="text"
                      value={credentials.host || ''}
                      onChange={(e) => setCredentials({ ...credentials, host: e.target.value })}
                      placeholder="smtp.mailtrap.io"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Port</label>
                    <input
                      type="number"
                      value={credentials.port || 2525}
                      onChange={(e) => setCredentials({ ...credentials, port: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                    />
                  </div>
                </div>
              </div>
            )}

            {selectedIntegration.provider === 'webhook' && (
              <div>
                <label className="block font-semibold mb-1">Endpoint URL (POST payload)</label>
                <input
                  type="url"
                  value={credentials.webhookUrl || ''}
                  onChange={(e) => setCredentials({ ...credentials, webhookUrl: e.target.value })}
                  placeholder="https://hooks.zapier.com/hooks/catch/..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono"
                />
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestConnection}
                loading={testing}
              >
                Test Connection
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="secondary" onClick={() => setSelectedIntegration(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" loading={saving}>
                  Save & Connect
                </Button>
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default IntegrationsPage;


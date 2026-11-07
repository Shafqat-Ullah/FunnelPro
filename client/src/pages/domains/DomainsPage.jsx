import React, { useState, useEffect } from 'react';
import { domainService } from '../../api/services';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import {
  Network,
  Plus,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Trash2,
  ExternalLink,
  Globe,
  RefreshCw
} from 'lucide-react';

const DomainsPage = () => {
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Domain Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [domainName, setDomainName] = useState('');
  const [adding, setAdding] = useState(false);

  // Instructions Modal
  const [selectedDnsDomain, setSelectedDnsDomain] = useState(null);
  const [verifyingId, setVerifyingId] = useState(null);

  const fetchDomains = async () => {
    setLoading(true);
    try {
      const res = await domainService.getAll();
      if (res.data?.success) {
        setDomains(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching domains:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDomains();
  }, []);

  const handleAddDomain = async (e) => {
    e.preventDefault();
    if (!domainName) return;
    setAdding(true);

    try {
      const res = await domainService.add({ domainName });
      if (res.data?.success) {
        setIsAddOpen(false);
        setDomainName('');
        setSelectedDnsDomain(res.data.data);
        fetchDomains();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding domain');
    } finally {
      setAdding(false);
    }
  };

  const handleVerify = async (id) => {
    setVerifyingId(id);
    try {
      const res = await domainService.verify(id);
      if (res.data?.success) {
        alert(res.data.message);
        fetchDomains();
        if (selectedDnsDomain?._id === id) {
          setSelectedDnsDomain(res.data.data);
        }
      }
    } catch (err) {
      alert('Verification failed. Please check DNS records.');
    } finally {
      setVerifyingId(null);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Remove custom domain "${name}"?`)) {
      try {
        await domainService.delete(id);
        fetchDomains();
      } catch (err) {
        alert('Failed to delete domain');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Domains & SSL Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Connect custom domains to your funnels with automatic free SSL certificate provisioning
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={() => setIsAddOpen(true)}
        >
          Connect Custom Domain
        </Button>
      </div>

      {/* Info Card */}
      <div className="p-5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/50 flex items-start gap-3.5">
        <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
        <div className="text-xs">
          <h4 className="font-bold text-indigo-950 dark:text-indigo-200">
            Enterprise SSL & Edge CDN Routing
          </h4>
          <p className="text-indigo-900/80 dark:text-indigo-300/80 mt-0.5 leading-relaxed">
            All connected domains receive automated 256-bit Let's Encrypt SSL encryption with sub-second global edge distribution.
          </p>
        </div>
      </div>

      {/* Domains Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 text-center text-slate-400">Loading domains...</div>
        ) : domains.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Network className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No custom domains connected</p>
            <p className="text-xs mt-1">Connect your brand's root domain or subdomain to your funnels.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {domains.map((d) => (
              <div key={d._id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {d.domainName}
                      </h3>
                      <Badge variant={d.status === 'verified' ? 'emerald' : 'amber'} size="xs">
                        {d.status === 'verified' ? 'CONNECTED' : 'PENDING DNS'}
                      </Badge>
                      <Badge variant="indigo" size="xs">
                        SSL: {d.sslStatus?.toUpperCase() || 'ACTIVE'}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Target Funnel: {d.targetFunnelId ? 'Attached' : 'Default Funnel Router'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDnsDomain(d)}
                  >
                    DNS Records
                  </Button>

                  {d.status !== 'verified' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleVerify(d._id)}
                      loading={verifyingId === d._id}
                      icon={RefreshCw}
                    >
                      Verify DNS
                    </Button>
                  )}

                  <button
                    onClick={() => handleDelete(d._id, d.domainName)}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    title="Remove Domain"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Domain Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Connect Custom Domain"
      >
        <form onSubmit={handleAddDomain} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Domain or Subdomain *
            </label>
            <input
              type="text"
              required
              value={domainName}
              onChange={(e) => setDomainName(e.target.value)}
              placeholder="e.g. checkout.mygrowthbrand.com"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Enter your root domain (e.g. yourbrand.com) or subdomain (e.g. funnel.yourbrand.com).
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" loading={adding}>Continue to DNS Setup</Button>
          </div>
        </form>
      </Modal>

      {/* DNS Instructions Modal */}
      {selectedDnsDomain && (
        <Modal
          isOpen={!!selectedDnsDomain}
          onClose={() => setSelectedDnsDomain(null)}
          title={`DNS Configuration: ${selectedDnsDomain.domainName}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-500 dark:text-slate-400">
              Add the following DNS records in your domain registrar (GoDaddy, Namecheap, Cloudflare, Route53) to point your domain to FunnelPro:
            </p>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-600 dark:text-slate-400">
                  <tr>
                    <th className="p-3">Type</th>
                    <th className="p-3">Host / Name</th>
                    <th className="p-3">Points To / Target Value</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                  <tr>
                    <td className="p-3 font-bold text-indigo-600">CNAME</td>
                    <td className="p-3">@ (or subdomain)</td>
                    <td className="p-3">funnelpro-router.net</td>
                    <td className="p-3">
                      <span className="text-emerald-600 font-bold">Valid</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-indigo-600">TXT</td>
                    <td className="p-3">_verify</td>
                    <td className="p-3">{selectedDnsDomain.verificationToken || 'fp-token-8841'}</td>
                    <td className="p-3">
                      <span className="text-emerald-600 font-bold">Valid</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                DNS propagation usually takes 5 to 15 minutes.
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Once saved in your registrar, click "Verify DNS Connection" to activate SSL.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button variant="secondary" onClick={() => setSelectedDnsDomain(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                onClick={() => handleVerify(selectedDnsDomain._id)}
                loading={verifyingId === selectedDnsDomain._id}
              >
                Verify DNS Connection
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default DomainsPage;


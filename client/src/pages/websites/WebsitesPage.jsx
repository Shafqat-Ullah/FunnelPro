import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import {
  Globe,
  Plus,
  ExternalLink,
  Edit,
  Trash2,
  Layers,
  Sparkles
} from 'lucide-react';

const SAMPLE_WEBSITES = [
  {
    id: 'site-1',
    name: 'Vance Growth Ventures Corporate',
    domain: 'vanceventures.io',
    pagesCount: 5,
    status: 'published',
    visitors: 8420,
    updatedAt: '2 hours ago'
  },
  {
    id: 'site-2',
    name: 'Apex Smart Wearables Official Brand Site',
    domain: 'apexwatch.com',
    pagesCount: 8,
    status: 'published',
    visitors: 14290,
    updatedAt: 'Yesterday'
  }
];

const WebsitesPage = () => {
  const [websites, setWebsites] = useState(SAMPLE_WEBSITES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [siteName, setSiteName] = useState('');
  const [siteDomain, setSiteDomain] = useState('');

  const handleCreate = (e) => {
    e.preventDefault();
    if (!siteName) return;
    const newSite = {
      id: `site-${Date.now()}`,
      name: siteName,
      domain: siteDomain || `${siteName.toLowerCase().replace(/[^a-z0-9]/g, '')}.funnelpro.site`,
      pagesCount: 1,
      status: 'draft',
      visitors: 0,
      updatedAt: 'Just now'
    };
    setWebsites([newSite, ...websites]);
    setIsModalOpen(false);
    setSiteName('');
    setSiteDomain('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Websites & Multi-Page Portals
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Build full multi-page marketing websites, blogs, and customer membership portals
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={() => setIsModalOpen(true)}
        >
          Create New Website
        </Button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {websites.map((site) => (
          <div
            key={site.id}
            className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <Badge variant={site.status === 'published' ? 'emerald' : 'slate'} size="xs">
                  {site.status.toUpperCase()}
                </Badge>
                <span className="text-[11px] text-slate-400">
                  {site.pagesCount} Pages · Updated {site.updatedAt}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {site.name}
              </h3>
              <p className="text-xs font-mono text-indigo-600 dark:text-indigo-400 mt-0.5">
                https://{site.domain}
              </p>

              <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-xs flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">30-Day Total Visitors</span>
                <span className="font-extrabold text-slate-900 dark:text-white">{site.visitors.toLocaleString()} hits</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Link to="/templates">
                <Button variant="outline" size="sm" icon={Edit}>
                  Edit Website Pages
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Website"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold mb-1">Website Name *</label>
            <input
              type="text"
              required
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              placeholder="e.g. Apex Consulting Brand Site"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Primary Domain / Subdomain</label>
            <input
              type="text"
              value={siteDomain}
              onChange={(e) => setSiteDomain(e.target.value)}
              placeholder="e.g. apexconsulting.com"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Create Website</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default WebsitesPage;


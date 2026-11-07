import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { funnelService } from '../../api/services';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import {
  Plus,
  Search,
  Filter,
  Layers,
  Copy,
  Trash2,
  ExternalLink,
  Edit,
  Eye,
  ArrowRight,
  Sparkles,
  BarChart2
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All Categories' },
  { id: 'sales', label: 'Sales Funnels' },
  { id: 'leadgen', label: 'Lead Generation' },
  { id: 'webinar', label: 'Webinar Funnels' },
  { id: 'ecommerce', label: 'E-commerce DTC' },
  { id: 'coaching', label: 'High-Ticket Coaching' },
];

const FunnelsList = () => {
  const navigate = useNavigate();
  const [funnels, setFunnels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');

  // Create Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createCategory, setCreateCategory] = useState('sales');
  const [createDesc, setCreateDesc] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchFunnels = async () => {
    setLoading(true);
    try {
      const res = await funnelService.getAll({ category, search });
      if (res.data?.success) {
        setFunnels(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load funnels:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFunnels();
  }, [category, search]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!createName) return;
    setCreating(true);

    try {
      const res = await funnelService.create({
        name: createName,
        category: createCategory,
        description: createDesc
      });
      if (res.data?.success) {
        setIsCreateOpen(false);
        setCreateName('');
        setCreateDesc('');
        navigate(`/funnels/${res.data.data._id}`);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create funnel');
    } finally {
      setCreating(false);
    }
  };

  const handleDuplicate = async (id, e) => {
    e.stopPropagation();
    try {
      const res = await funnelService.duplicate(id);
      if (res.data?.success) {
        fetchFunnels();
      }
    } catch (err) {
      alert('Failed to duplicate funnel');
    }
  };

  const handleDelete = async (id, name, e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${name}" and all of its steps?`)) {
      try {
        await funnelService.delete(id);
        fetchFunnels();
      } catch (err) {
        alert('Failed to delete funnel');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Sales Funnels
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Build, test, and manage multi-step conversion journeys
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/templates">
            <Button variant="secondary" size="md">
              <Layers className="w-4 h-4 mr-2" />
              Template Library
            </Button>
          </Link>
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsCreateOpen(true)}
            icon={Plus}
          >
            Create New Funnel
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {CATEGORIES.map(c => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                category === c.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by funnel name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Funnels Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">
          Loading funnels...
        </div>
      ) : funnels.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-8">
          <Layers className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            No funnels found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
            Get started by launching your first conversion funnel from scratch or from our 12+ pre-made templates.
          </p>
          <Button variant="primary" size="md" onClick={() => setIsCreateOpen(true)} icon={Plus}>
            Create Your First Funnel
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {funnels.map((funnel) => (
            <div
              key={funnel._id}
              onClick={() => navigate(`/funnels/${funnel._id}`)}
              className="group cursor-pointer rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-900/60 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <Badge variant={funnel.status === 'published' ? 'emerald' : 'slate'} size="xs">
                    {funnel.status.toUpperCase()}
                  </Badge>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    {funnel.category}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                  {funnel.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 min-h-[32px]">
                  {funnel.description || 'Optimized customer acquisition journey with high-converting steps.'}
                </p>

                {/* Funnel Steps Indicator */}
                <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    <span>{funnel.stepCount || funnel.steps?.length || 0} Funnel Steps</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">{funnel.stats?.conversionRate || 3.2}% Conv.</span>
                  </div>
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    {(funnel.steps || []).slice(0, 4).map((s, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] text-slate-600 dark:text-slate-300 font-medium truncate">
                        {s.name || s.stepType}
                      </span>
                    ))}
                    {(funnel.stepCount || 0) > 4 && (
                      <span className="text-[10px] text-slate-400 font-semibold">+{funnel.stepCount - 4} more</span>
                    )}
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400">Visitors</span>
                    <p className="text-xs font-extrabold text-slate-900 dark:text-white">{funnel.stats?.visitors || 0}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400">Leads</span>
                    <p className="text-xs font-extrabold text-slate-900 dark:text-white">{funnel.stats?.leads || 0}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400">Revenue</span>
                    <p className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">${funnel.stats?.revenue || 0}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => handleDuplicate(funnel._id, e)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Duplicate Funnel"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(funnel._id, funnel.name, e)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    title="Delete Funnel"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
                  <span>Manage Steps</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Funnel Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Sales Funnel"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Funnel Name *
            </label>
            <input
              type="text"
              required
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              placeholder="e.g. 7-Figure SaaS Masterclass Funnel"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Funnel Goal / Category
            </label>
            <select
              value={createCategory}
              onChange={(e) => setCreateCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white"
            >
              <option value="sales">Sales Funnel (High-Converting)</option>
              <option value="leadgen">Lead Generation & Opt-in</option>
              <option value="webinar">Live / Automated Webinar</option>
              <option value="ecommerce">E-commerce Product Showcase</option>
              <option value="coaching">High-Ticket Application</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description (Optional)
            </label>
            <textarea
              rows="2"
              value={createDesc}
              onChange={(e) => setCreateDesc(e.target.value)}
              placeholder="Primary marketing angle, target audience, or campaign notes..."
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={creating}>
              Create & Launch Studio
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FunnelsList;


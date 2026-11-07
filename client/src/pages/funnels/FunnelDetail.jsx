import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { funnelService } from '../../api/services';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import FunnelVisualFlow from './FunnelVisualFlow';
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  Globe,
  Settings,
  Share2,
  Copy,
  Layers,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

const STEP_TYPES = [
  { id: 'optin', label: '1. Opt-in Page' },
  { id: 'sales', label: '2. Sales Landing Page' },
  { id: 'checkout', label: '3. Checkout Page' },
  { id: 'confirmation', label: '4. Order Confirmation' },
  { id: 'upsell', label: '5. Upsell Page' },
  { id: 'downsell', label: '6. Downsell Page' },
  { id: 'thankyou', label: '7. Thank You Page' },
  { id: 'webinar-reg', label: '8. Webinar Registration' },
  { id: 'webinar-sales', label: '9. Webinar Sales Page' },
  { id: 'leadgen', label: '10. Lead Generation Page' }
];

const FunnelDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [funnel, setFunnel] = useState(null);
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('steps'); // 'steps' | 'flow' | 'settings'

  // Add Step Modal
  const [isAddStepOpen, setIsAddStepOpen] = useState(false);
  const [stepName, setStepName] = useState('');
  const [stepType, setStepType] = useState('sales');
  const [stepSlug, setStepSlug] = useState('');
  const [addingStep, setAddingStep] = useState(false);

  // Settings state
  const [funnelName, setFunnelName] = useState('');
  const [funnelSlug, setFunnelSlug] = useState('');
  const [customDomain, setCustomDomain] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  const fetchFunnel = async () => {
    try {
      const res = await funnelService.getById(id);
      if (res.data?.success) {
        setFunnel(res.data.data);
        setSteps(res.data.data.steps || []);
        setFunnelName(res.data.data.name);
        setFunnelSlug(res.data.data.slug);
        setCustomDomain(res.data.data.customDomain || '');
      }
    } catch (err) {
      console.error('Error fetching funnel:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFunnel();
  }, [id]);

  const handleAddStep = async (e) => {
    e.preventDefault();
    if (!stepName) return;
    setAddingStep(true);

    try {
      const res = await funnelService.addStep(id, {
        name: stepName,
        stepType,
        slug: stepSlug || stepName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      });
      if (res.data?.success) {
        setIsAddStepOpen(false);
        setStepName('');
        setStepSlug('');
        fetchFunnel();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add step');
    } finally {
      setAddingStep(false);
    }
  };

  const handleDeleteStep = async (stepId, name) => {
    if (window.confirm(`Delete step "${name}"?`)) {
      try {
        await funnelService.deleteStep(id, stepId);
        fetchFunnel();
      } catch (err) {
        alert('Failed to delete step');
      }
    }
  };

  const handleMoveStep = async (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= steps.length) return;

    const newSteps = [...steps];
    const [moved] = newSteps.splice(index, 1);
    newSteps.splice(targetIndex, 0, moved);

    const stepIds = newSteps.map(s => s._id);
    setSteps(newSteps);

    try {
      await funnelService.reorderSteps(id, stepIds);
    } catch (err) {
      fetchFunnel();
    }
  };

  const handleTogglePublish = async () => {
    try {
      const newStatus = funnel.status === 'published' ? 'draft' : 'published';
      const res = await funnelService.update(id, { status: newStatus });
      if (res.data?.success) {
        setFunnel(res.data.data);
      }
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await funnelService.update(id, {
        name: funnelName,
        slug: funnelSlug,
        customDomain
      });
      if (res.data?.success) {
        setFunnel(res.data.data);
        alert('Funnel settings saved!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving settings');
    } finally {
      setSavingSettings(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-400">Loading funnel details...</div>;
  }

  if (!funnel) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Funnel not found</h2>
        <Link to="/funnels" className="mt-2 text-indigo-600 underline">Return to Funnels</Link>
      </div>
    );
  }

  const publicUrl = `/f/${funnel.slug}/${steps[0]?.slug || ''}`;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Link to="/funnels" className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {funnel.name}
              </h1>
              <Badge variant={funnel.status === 'published' ? 'emerald' : 'slate'} size="xs">
                {funnel.status.toUpperCase()}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Category: <span className="font-semibold capitalize text-slate-700 dark:text-slate-300">{funnel.category}</span> · {steps.length} Steps
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={funnel.status === 'published' ? 'secondary' : 'success'}
            size="sm"
            onClick={handleTogglePublish}
          >
            {funnel.status === 'published' ? 'Unpublish Funnel' : 'Publish Funnel Live'}
          </Button>

          <a href={publicUrl} target="_blank" rel="noreferrer">
            <Button variant="outline" size="sm" icon={ExternalLink}>
              Preview First Step
            </Button>
          </a>

          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setIsAddStepOpen(true)}
          >
            Add Step
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('steps')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'steps'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Funnel Steps ({steps.length})
        </button>
        <button
          onClick={() => setActiveTab('flow')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'flow'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Visual Journey Flow
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'settings'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Funnel Settings
        </button>
      </div>

      {/* TAB 1: STEPS LIST */}
      {activeTab === 'steps' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Drag or use arrows to rearrange the sequence in which visitors experience your funnel.
            </p>
            <Button
              variant="secondary"
              size="sm"
              icon={Plus}
              onClick={() => setIsAddStepOpen(true)}
            >
              Add Funnel Step
            </Button>
          </div>

          <div className="space-y-3">
            {steps.map((step, index) => {
              const pageId = step.pageId || step.page?._id;
              const stepPublicUrl = `/f/${funnel.slug}/${step.slug}`;

              return (
                <div
                  key={step._id}
                  className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-800 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {/* Reorder Arrows */}
                    <div className="flex flex-col gap-0.5">
                      <button
                        disabled={index === 0}
                        onClick={() => handleMoveStep(index, 'up')}
                        className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        disabled={index === steps.length - 1}
                        onClick={() => handleMoveStep(index, 'down')}
                        className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-xs font-black text-indigo-600 dark:text-indigo-400">
                      {index + 1}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {step.name}
                        </h4>
                        <Badge variant="indigo" size="xs">
                          {step.stepType}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">
                        {stepPublicUrl}
                      </p>
                    </div>
                  </div>

                  {/* Actions & Metrics */}
                  <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center gap-4 mr-4 text-right">
                      <div>
                        <span className="text-[10px] uppercase text-slate-400 font-semibold block">Views</span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{step.stats?.views || 0}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-slate-400 font-semibold block">Conv. Rate</span>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{step.stats?.conversionRate || 0}%</span>
                      </div>
                    </div>

                    {pageId ? (
                      <Link to={`/editor/${pageId}`}>
                        <Button variant="primary" size="sm" icon={Edit}>
                          Edit In Builder
                        </Button>
                      </Link>
                    ) : (
                      <Button variant="secondary" size="sm" disabled>
                        No Page Linked
                      </Button>
                    )}

                    <a href={stepPublicUrl} target="_blank" rel="noreferrer">
                      <Button variant="outline" size="sm" icon={ExternalLink}>
                        Preview
                      </Button>
                    </a>

                    <button
                      onClick={() => handleDeleteStep(step._id, step.name)}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      title="Delete step"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: VISUAL JOURNEY FLOW */}
      {activeTab === 'flow' && (
        <FunnelVisualFlow
          funnel={funnel}
          steps={steps}
          onAddStep={() => setIsAddStepOpen(true)}
        />
      )}

      {/* TAB 3: FUNNEL SETTINGS */}
      {activeTab === 'settings' && (
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-2xl">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
            Funnel Configuration
          </h3>
          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Funnel Title
              </label>
              <input
                type="text"
                value={funnelName}
                onChange={(e) => setFunnelName(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                URL Slug
              </label>
              <div className="flex items-center">
                <span className="px-3 py-2 text-xs bg-slate-100 dark:bg-slate-800 border border-r-0 border-slate-200 dark:border-slate-800 rounded-l-xl text-slate-500 font-mono">
                  /f/
                </span>
                <input
                  type="text"
                  value={funnelSlug}
                  onChange={(e) => setFunnelSlug(e.target.value)}
                  className="flex-1 px-3.5 py-2 text-sm rounded-r-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Connected Custom Domain (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. checkout.mygrowthfunnels.com"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Make sure DNS CNAME points to FunnelPro in Domains & SSL settings.
              </p>
            </div>

            <Button type="submit" variant="primary" loading={savingSettings}>
              Save Funnel Settings
            </Button>
          </form>
        </div>
      )}

      {/* Add Step Modal */}
      <Modal
        isOpen={isAddStepOpen}
        onClose={() => setIsAddStepOpen(false)}
        title="Add New Funnel Step"
      >
        <form onSubmit={handleAddStep} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Step Name *
            </label>
            <input
              type="text"
              required
              value={stepName}
              onChange={(e) => setStepName(e.target.value)}
              placeholder="e.g. Order Bump & Checkout"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Step Type *
            </label>
            <select
              value={stepType}
              onChange={(e) => setStepType(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
            >
              {STEP_TYPES.map(st => (
                <option key={st.id} value={st.id}>{st.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Step URL Slug (Optional)
            </label>
            <input
              type="text"
              value={stepSlug}
              onChange={(e) => setStepSlug(e.target.value)}
              placeholder="e.g. checkout-deal"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" onClick={() => setIsAddStepOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={addingStep}>
              Add Step to Journey
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FunnelDetail;


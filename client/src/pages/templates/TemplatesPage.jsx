import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { templateService } from '../../api/services';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import {
  Layers,
  Sparkles,
  Eye,
  ArrowRight,
  CheckCircle2,
  Filter,
  Search,
  ExternalLink
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'SaaS',
  'Business',
  'E-commerce',
  'Coaching',
  'Fitness',
  'Real Estate',
  'Restaurant',
  'Healthcare',
  'Webinar',
  'Digital Products',
  'Lead Generation',
  'Agency'
];

const TemplatesPage = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');

  // Preview Modal
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [cloning, setCloning] = useState(false);

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      try {
        const res = await templateService.getAll({
          category: category === 'All' ? undefined : category,
          search
        });
        if (res.data?.success) {
          setTemplates(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load templates:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, [category, search]);

  const handleUseTemplate = async (templateId) => {
    setCloning(true);
    try {
      const res = await templateService.useTemplate(templateId);
      if (res.data?.success) {
        navigate(`/funnels/${res.data.data._id}`);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error cloning template');
    } finally {
      setCloning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Turnkey Niche Funnels</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            High-Converting Funnel Template Library
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Choose from 12+ pre-designed, battle-tested funnel templates. Fully customizable in the drag-and-drop editor.
          </p>
        </div>
      </div>

      {/* Category Filter Pills & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                category === cat
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none"
          />
        </div>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">Loading templates...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((tpl) => (
            <div
              key={tpl._id}
              className="group rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-800 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Thumbnail */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={tpl.thumbnail || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600"}
                    alt={tpl.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge variant="indigo" size="xs">
                      {tpl.category}
                    </Badge>
                  </div>
                </div>

                {/* Details */}
                <div className="p-5">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 transition-colors">
                    {tpl.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {tpl.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {(tpl.tags || []).slice(0, 3).map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-600 dark:text-slate-400"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-5 pt-0 flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewTemplate(tpl)}
                  className="flex-1"
                  icon={Eye}
                >
                  Quick Preview
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleUseTemplate(tpl._id)}
                  loading={cloning}
                  className="flex-1"
                >
                  Use Template
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Template Preview Modal */}
      {previewTemplate && (
        <Modal
          isOpen={!!previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          title={`Preview: ${previewTemplate.name}`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-4">
            <div className="aspect-video w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100">
              <img
                src={previewTemplate.thumbnail}
                alt={previewTemplate.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="indigo" size="xs">
                  {previewTemplate.category}
                </Badge>
                <span className="text-xs text-slate-400">Includes 3 pre-connected funnel steps</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {previewTemplate.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {previewTemplate.description}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                Funnel Steps Included:
              </h4>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Step 1: High-Converting Opt-in Page (Headline, Bullet benefits, Lead form)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Step 2: Conversion Checkout Page (SSL Badge, Pricing, Order Bump box)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Step 3: Order Thank You & Next Steps Delivery Page</span>
                </li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button variant="secondary" onClick={() => setPreviewTemplate(null)}>
                Close Preview
              </Button>
              <Button
                variant="primary"
                loading={cloning}
                onClick={() => handleUseTemplate(previewTemplate._id)}
              >
                Use This Template & Open Editor
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default TemplatesPage;


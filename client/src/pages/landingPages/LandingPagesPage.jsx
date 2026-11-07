import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { pageService } from '../../api/services';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Search,
  Globe,
  Copy
} from 'lucide-react';

const LandingPagesPage = () => {
  const navigate = useNavigate();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Create Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const res = await pageService.getAll({ search });
      if (res.data?.success) {
        setPages(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching pages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, [search]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title) return;
    setCreating(true);

    try {
      const res = await pageService.create({
        title,
        slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      });
      if (res.data?.success) {
        setIsCreateOpen(false);
        setTitle('');
        setSlug('');
        navigate(`/editor/${res.data.data._id}`);
      }
    } catch (err) {
      alert('Error creating landing page');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id, pageTitle) => {
    if (window.confirm(`Delete page "${pageTitle}"?`)) {
      try {
        await pageService.delete(id);
        fetchPages();
      } catch (err) {
        alert('Failed to delete page');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Standalone Landing Pages
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Create independent single-page promo pages, lead magnets, and squeeze pages
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={() => setIsCreateOpen(true)}
        >
          Create Landing Page
        </Button>
      </div>

      {/* Pages List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 text-center text-slate-400">Loading landing pages...</div>
        ) : pages.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No landing pages found</p>
            <p className="text-xs mt-1 mb-4">Launch a new page in the visual builder.</p>
            <Button variant="primary" size="sm" onClick={() => setIsCreateOpen(true)}>Create Page</Button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {pages.map((p) => {
              const previewUrl = `/p/${p.slug}`;
              return (
                <div key={p._id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          {p.title}
                        </h3>
                        <Badge variant={p.status === 'published' ? 'emerald' : 'slate'} size="xs">
                          {p.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">
                        {previewUrl}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link to={`/editor/${p._id}`}>
                      <Button variant="primary" size="sm" icon={Edit}>
                        Open In Builder
                      </Button>
                    </Link>

                    <a href={previewUrl} target="_blank" rel="noreferrer">
                      <Button variant="outline" size="sm" icon={ExternalLink}>
                        Preview
                      </Button>
                    </a>

                    <button
                      onClick={() => handleDelete(p._id, p.title)}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      title="Delete Page"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Landing Page"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold mb-1">Page Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Black Friday Special Deal"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">URL Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g. black-friday-deal"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button variant="secondary" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" loading={creating}>Create & Open Builder</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LandingPagesPage;


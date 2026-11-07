import React, { useState, useEffect } from 'react';
import { productService } from '../../api/services';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  DollarSign,
  TrendingUp,
  Tag,
  CheckCircle2,
  Sparkles,
  ShoppingBag
} from 'lucide-react';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(97);
  const [compareAtPrice, setCompareAtPrice] = useState(197);
  const [type, setType] = useState('digital');

  // Order Bump configuration
  const [bumpEnabled, setBumpEnabled] = useState(true);
  const [bumpHeadline, setBumpHeadline] = useState('Yes! Add The Companion Swipe File');
  const [bumpDesc, setBumpDesc] = useState('Get 50 high-converting copywriting headline formulas for only $27.');
  const [bumpPrice, setBumpPrice] = useState(27);

  // 1-Click Upsell configuration
  const [upsellEnabled, setUpsellEnabled] = useState(true);
  const [upsellHeadline, setUpsellHeadline] = useState('Special One-Time Upgrade: VIP Mastermind Coaching');
  const [upsellPrice, setUpsellPrice] = useState(197);

  const [saving, setSaving] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await productService.getAll();
      if (res.data?.success) {
        setProducts(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setPrice(97);
    setCompareAtPrice(197);
    setType('digital');
    setBumpEnabled(true);
    setBumpHeadline('Yes! Add The Companion Swipe File');
    setBumpDesc('Get 50 high-converting headline templates for only $27.');
    setBumpPrice(27);
    setUpsellEnabled(true);
    setUpsellHeadline('Special Upgrade: VIP Mastermind Access');
    setUpsellPrice(197);
    setIsModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditingId(p._id);
    setName(p.name);
    setDescription(p.description || '');
    setPrice(p.price);
    setCompareAtPrice(p.compareAtPrice || 0);
    setType(p.type || 'digital');
    setBumpEnabled(p.orderBump?.enabled ?? false);
    setBumpHeadline(p.orderBump?.headline || '');
    setBumpDesc(p.orderBump?.description || '');
    setBumpPrice(p.orderBump?.price || 27);
    setUpsellEnabled(p.upsell?.enabled ?? false);
    setUpsellHeadline(p.upsell?.headline || '');
    setUpsellPrice(p.upsell?.price || 97);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || price === undefined) return;
    setSaving(true);

    const payload = {
      name,
      description,
      price: Number(price),
      compareAtPrice: Number(compareAtPrice),
      type,
      orderBump: {
        enabled: bumpEnabled,
        headline: bumpHeadline,
        description: bumpDesc,
        price: Number(bumpPrice)
      },
      upsell: {
        enabled: upsellEnabled,
        headline: upsellHeadline,
        description: 'Upgrade offer applied post-purchase with 1-click confirmation.',
        price: Number(upsellPrice)
      }
    };

    try {
      if (editingId) {
        await productService.update(editingId, payload);
      } else {
        await productService.create(payload);
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, prodName) => {
    if (window.confirm(`Delete product "${prodName}"?`)) {
      try {
        await productService.delete(id);
        fetchProducts();
      } catch (err) {
        alert('Failed to delete product');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Products & Order Bumps
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Manage checkout products, 1-click order bumps, and post-purchase upsell offers
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={openCreateModal}
        >
          Create Product
        </Button>
      </div>

      {/* Product Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="py-16 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
          <Package className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">No products created yet</h3>
          <p className="text-xs mt-1 mb-4">Add your core offer or digital product to enable checkout funnels.</p>
          <Button variant="primary" size="sm" onClick={openCreateModal} icon={Plus}>Add First Product</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <div
              key={p._id}
              className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="indigo" size="xs">
                    {p.type?.toUpperCase() || 'DIGITAL'}
                  </Badge>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                      ${p.price}
                    </span>
                    {p.compareAtPrice > p.price && (
                      <span className="text-xs text-slate-400 line-through">
                        ${p.compareAtPrice}
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                  {p.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {p.description || 'Core funnel product attached to checkout steps.'}
                </p>

                {/* Order Bump Pill */}
                {p.orderBump?.enabled && (
                  <div className="mt-4 p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs">
                    <div className="flex items-center justify-between font-bold text-amber-800 dark:text-amber-300">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        Order Bump Active
                      </span>
                      <span>+${p.orderBump.price}</span>
                    </div>
                    <p className="text-[11px] text-amber-700/80 dark:text-amber-400 mt-0.5 line-clamp-1">
                      {p.orderBump.headline}
                    </p>
                  </div>
                )}

                {/* Upsell Pill */}
                {p.upsell?.enabled && (
                  <div className="mt-2 p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-xs">
                    <div className="flex items-center justify-between font-bold text-emerald-800 dark:text-emerald-300">
                      <span className="flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                        1-Click Upsell Offer
                      </span>
                      <span>+${p.upsell.price}</span>
                    </div>
                    <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400 mt-0.5 line-clamp-1">
                      {p.upsell.headline}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditModal(p)}
                  icon={Edit}
                >
                  Edit
                </Button>
                <button
                  onClick={() => handleDelete(p._id, p.name)}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  title="Delete product"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Product & Offers' : 'Create Product with Order Bump'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Core Product Info */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Product Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. 7-Figure SaaS Blueprint Accelerator"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Price ($ USD) *</label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Compare-At Price ($)</label>
              <input
                type="number"
                value={compareAtPrice}
                onChange={(e) => setCompareAtPrice(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Product Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
              >
                <option value="digital">Digital Product</option>
                <option value="physical">Physical Product</option>
                <option value="service">Service / Coaching</option>
              </select>
            </div>
          </div>

          {/* ORDER BUMP SECTION */}
          <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Order Bump Offer Box (Shown on Checkout Form)
              </span>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bumpEnabled}
                  onChange={(e) => setBumpEnabled(e.target.checked)}
                  className="rounded text-amber-600"
                />
                <span className="text-xs font-semibold">Enable Bump</span>
              </label>
            </div>

            {bumpEnabled && (
              <div className="space-y-2 pt-2">
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block font-semibold mb-0.5">Bump Headline</label>
                    <input
                      type="text"
                      value={bumpHeadline}
                      onChange={(e) => setBumpHeadline(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border bg-white dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-0.5">Bump Price ($)</label>
                    <input
                      type="number"
                      value={bumpPrice}
                      onChange={(e) => setBumpPrice(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border bg-white dark:bg-slate-900"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold mb-0.5">Bump Pitch Description</label>
                  <input
                    type="text"
                    value={bumpDesc}
                    onChange={(e) => setBumpDesc(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border bg-white dark:bg-slate-900"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 1-CLICK UPSELL SECTION */}
          <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                Post-Purchase 1-Click Upsell Offer
              </span>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={upsellEnabled}
                  onChange={(e) => setUpsellEnabled(e.target.checked)}
                  className="rounded text-emerald-600"
                />
                <span className="text-xs font-semibold">Enable Upsell</span>
              </label>
            </div>

            {upsellEnabled && (
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="col-span-2">
                  <label className="block font-semibold mb-0.5">Upsell Title</label>
                  <input
                    type="text"
                    value={upsellHeadline}
                    onChange={(e) => setUpsellHeadline(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border bg-white dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-0.5">Upsell Price ($)</label>
                  <input
                    type="number"
                    value={upsellPrice}
                    onChange={(e) => setUpsellPrice(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border bg-white dark:bg-slate-900"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" loading={saving}>Save Product</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProductsPage;


import React, { useState, useEffect } from 'react';
import { orderService } from '../../api/services';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import {
  CreditCard,
  Plus,
  Tag,
  Trash2,
  Percent,
  DollarSign,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Calendar
} from 'lucide-react';

const PaymentsPage = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Coupon Modal
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState(20);
  const [minPurchase, setMinPurchase] = useState(0);
  const [maxUses, setMaxUses] = useState(100);
  const [creatingCoupon, setCreatingCoupon] = useState(false);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await orderService.getCoupons();
      if (res.data?.success) {
        setCoupons(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!code || discountValue === undefined) return;
    setCreatingCoupon(true);

    try {
      const res = await orderService.createCoupon({
        code,
        discountType,
        discountValue: Number(discountValue),
        minPurchase: Number(minPurchase),
        maxUses: Number(maxUses)
      });
      if (res.data?.success) {
        setIsCouponModalOpen(false);
        setCode('');
        setDiscountValue(20);
        fetchCoupons();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating coupon');
    } finally {
      setCreatingCoupon(false);
    }
  };

  const handleDeleteCoupon = async (id, couponCode) => {
    if (window.confirm(`Delete coupon "${couponCode}"?`)) {
      try {
        await orderService.deleteCoupon(id);
        fetchCoupons();
      } catch (err) {
        alert('Failed to delete coupon');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Payments & Coupon Discounts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Configure Stripe gateway credentials, create discount coupon codes, and manage order checkout settings
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={() => setIsCouponModalOpen(true)}
        >
          Create Coupon Code
        </Button>
      </div>

      {/* Stripe Test Mode Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-900/50 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold">Stripe Test Payment Gateway</h3>
              <Badge variant="emerald" size="xs">SIMULATION READY</Badge>
            </div>
            <p className="text-xs text-indigo-200 mt-1 max-w-xl">
              FunnelPro checkout pages accept standard test cards (4242 4242 4242 4242) with any future expiration date and CVC. Never stores raw card numbers.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Badge variant="indigo" size="md">
            Currency: USD ($)
          </Badge>
        </div>
      </div>

      {/* Coupons Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Active Coupon Codes</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Coupons redeemable by customers on public checkout steps</p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            icon={Plus}
            onClick={() => setIsCouponModalOpen(true)}
          >
            Add Coupon
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {coupons.map((c) => (
            <div
              key={c._id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 font-mono text-sm font-black text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 border border-indigo-100 dark:border-indigo-800">
                    <Tag className="w-3.5 h-3.5" />
                    <span>{c.code}</span>
                  </div>
                  <Badge variant={c.isActive ? 'emerald' : 'slate'} size="xs">
                    {c.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </Badge>
                </div>

                <div className="mt-3">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `$${c.discountValue} OFF`}
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {c.minPurchase > 0 ? `Min. spend $${c.minPurchase}` : 'No minimum spend required'}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
                <span>Redeemed {c.usedCount || 0} / {c.maxUses || 100} times</span>
                <button
                  onClick={() => handleDeleteCoupon(c._id, c.code)}
                  className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  title="Delete Coupon"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Coupon Modal */}
      <Modal
        isOpen={isCouponModalOpen}
        onClose={() => setIsCouponModalOpen(false)}
        title="Create Promotional Coupon Code"
      >
        <form onSubmit={handleCreateCoupon} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Coupon Code *</label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. BLACKFRIDAY50"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Discount Type</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Dollar ($)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Discount Value *</label>
              <input
                type="number"
                required
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Minimum Spend ($)</label>
              <input
                type="number"
                value={minPurchase}
                onChange={(e) => setMinPurchase(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Max Redemptions</label>
              <input
                type="number"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" onClick={() => setIsCouponModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" loading={creatingCoupon}>Save Coupon</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PaymentsPage;


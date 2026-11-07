import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { publicService, orderService, productService } from '../../api/services';
import CanvasRenderer from '../../components/builder/CanvasRenderer';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Lock,
  CheckCircle2,
  CreditCard,
  ArrowRight,
  ShieldCheck,
  Star,
  Tag
} from 'lucide-react';

const PublicFunnelPage = () => {
  const { funnelSlug, stepSlug, pageSlug } = useParams();
  const navigate = useNavigate();

  const [funnelData, setFunnelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Opt-in Form State
  const [optinName, setOptinName] = useState('');
  const [optinEmail, setOptinEmail] = useState('');
  const [optinPhone, setOptinPhone] = useState('');
  const [optinSubmitting, setOptinSubmitting] = useState(false);
  const [optinSuccess, setOptinSuccess] = useState(false);

  // Checkout State (If checkout step)
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [includeBump, setIncludeBump] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponMsg, setCouponMsg] = useState('');
  const [customerName, setCustomerName] = useState('Marcus Sterling');
  const [customerEmail, setCustomerEmail] = useState('marcus@example.com');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('842');
  const [checkingOut, setCheckingOut] = useState(false);
  const [orderComplete, setOrderComplete] = useState(null);

  // Upsell Step State
  const [acceptingUpsell, setAcceptingUpsell] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        let res;
        if (pageSlug) {
          res = await publicService.getPublicPage(pageSlug);
        } else {
          const slugToFetch = funnelSlug || 'saas-growth-funnel';
          res = await publicService.getPublicFunnelStep(slugToFetch, stepSlug);
        }

        if (res.data?.success) {
          setFunnelData(res.data.data);
        }

        // Fetch products for checkout demo
        const prodRes = await productService.getAll();
        if (prodRes.data?.success && prodRes.data.data.length > 0) {
          setProducts(prodRes.data.data);
          setSelectedProduct(prodRes.data.data[0]);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Page not found');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [funnelSlug, stepSlug, pageSlug]);

  // Opt-in submission
  const handleOptinSubmit = async (e) => {
    e.preventDefault();
    if (!optinEmail) return;
    setOptinSubmitting(true);

    try {
      const res = await publicService.submitOptin({
        funnelId: funnelData?.funnel?._id,
        stepId: funnelData?.step?._id,
        name: optinName,
        email: optinEmail,
        phone: optinPhone
      });

      if (res.data?.success) {
        setOptinSuccess(true);
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

        if (res.data.nextStepUrl) {
          setTimeout(() => {
            navigate(res.data.nextStepUrl);
          }, 1200);
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit form');
    } finally {
      setOptinSubmitting(false);
    }
  };

  // Coupon validation
  const handleApplyCoupon = async () => {
    if (!couponCode || !selectedProduct) return;
    try {
      const res = await orderService.validateCoupon(couponCode, selectedProduct.price);
      if (res.data?.success) {
        setAppliedCoupon(res.data.data);
        setCouponMsg(`Coupon ${couponCode.toUpperCase()} applied! Saved $${res.data.data.discountAmount}`);
      }
    } catch (err) {
      setCouponMsg(err.response?.data?.message || 'Invalid coupon code');
      setAppliedCoupon(null);
    }
  };

  // Checkout submission
  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!customerEmail || !selectedProduct) return;
    setCheckingOut(true);

    try {
      const res = await orderService.processOrder({
        customerName,
        customerEmail,
        productId: selectedProduct._id,
        includeOrderBump: includeBump,
        couponCode: appliedCoupon?.code || '',
        funnelId: funnelData?.funnel?._id,
        stepId: funnelData?.step?._id,
        paymentId: `pi_test_${Date.now()}`
      });

      if (res.data?.success) {
        setOrderComplete(res.data.data);
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.5 } });

        // If next step exists, navigate or prompt upsell
        if (funnelData?.nextStepUrl) {
          setTimeout(() => {
            navigate(funnelData.nextStepUrl);
          }, 1500);
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Checkout failed');
    } finally {
      setCheckingOut(false);
    }
  };

  // Accept 1-Click Upsell
  const handleAcceptUpsell = async () => {
    setAcceptingUpsell(true);
    try {
      if (orderComplete?._id) {
        await orderService.processUpsell({
          orderId: orderComplete._id,
          upsellPrice: selectedProduct?.upsell?.price || 197,
          upsellTitle: selectedProduct?.upsell?.headline || 'VIP Mastermind Upgrade'
        });
        confetti({ particleCount: 120, spread: 70 });
        alert('Upsell offer added to your order!');
      }
      if (funnelData?.nextStepUrl) {
        navigate(funnelData.nextStepUrl);
      }
    } catch (err) {
      alert('Error processing upsell');
    } finally {
      setAcceptingUpsell(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-semibold tracking-wider uppercase">Loading Funnel Experience...</p>
        </div>
      </div>
    );
  }

  if (error || !funnelData) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 text-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Page Not Available</h2>
          <p className="text-xs text-slate-500 mt-1 mb-4">{error || 'Funnel step not found'}</p>
          <button onClick={() => navigate('/dashboard')} className="text-indigo-600 font-bold text-xs underline">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const { funnel, step, page, nextStepUrl, currentStepIndex, totalSteps } = funnelData;
  const sections = page?.sections || [];
  const isCheckoutStep = step.stepType === 'checkout';
  const isUpsellStep = step.stepType === 'upsell';
  const isThankYouStep = step.stepType === 'thankyou' || step.stepType === 'confirmation';
  const isOptinStep = step.stepType === 'optin' || step.stepType === 'leadgen' || step.stepType === 'webinar-reg';

  // Calculate checkout totals
  let subtotal = selectedProduct ? selectedProduct.price : 97;
  let bumpPrice = (includeBump && selectedProduct?.orderBump?.enabled) ? (selectedProduct.orderBump.price || 27) : 0;
  let discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  let finalTotal = Math.max(0, subtotal + bumpPrice - discount);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between">
      
      {/* Top Visitor Progress Bar (ClickFunnels style) */}
      <div className="sticky top-0 z-40 bg-slate-900 text-white px-4 py-2 text-xs flex items-center justify-between border-b border-slate-800 shadow-md">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span className="font-bold tracking-tight">{funnel.name}</span>
          <span className="text-slate-400 hidden sm:inline">· Step {currentStepIndex} of {totalSteps}: {step.name}</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" /> 256-Bit SSL Encrypted
          </span>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 font-semibold"
          >
            Dashboard
          </button>
        </div>
      </div>

      {/* Main Page Canvas Content */}
      <div className="flex-1 w-full">
        {/* Render page builder sections */}
        <CanvasRenderer sections={sections} isPreview={true} />

        {/* INTERACTIVE OPT-IN FORM (If opt-in step) */}
        {isOptinStep && (
          <div className="max-w-md mx-auto my-8 p-6 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800">
            {optinSuccess ? (
              <div className="text-center py-6">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">You're All Set!</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Redirecting to the next step in the journey...
                </p>
              </div>
            ) : (
              <form onSubmit={handleOptinSubmit} className="space-y-3.5 text-xs">
                <div className="text-center mb-4">
                  <Badge variant="indigo" size="xs">FREE INSTANT ACCESS</Badge>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
                    Enter Your Details Below
                  </h3>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={optinName}
                    onChange={(e) => setOptinName(e.target.value)}
                    placeholder="Marcus Sterling"
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Your Best Email Address *</label>
                  <input
                    type="email"
                    required
                    value={optinEmail}
                    onChange={(e) => setOptinEmail(e.target.value)}
                    placeholder="marcus@example.com"
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  loading={optinSubmitting}
                  className="w-full py-3 text-sm font-bold shadow-lg bg-indigo-600 hover:bg-indigo-700"
                >
                  Get Instant Access Now <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </form>
            )}
          </div>
        )}

        {/* INTERACTIVE CHECKOUT & ORDER BUMP FORM (If checkout step) */}
        {isCheckoutStep && (
          <div className="max-w-2xl mx-auto my-10 p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800">
            {orderComplete ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-3" />
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                  Payment Processed Successfully!
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Order #{orderComplete.orderNumber} confirmed. Total charged: ${orderComplete.total?.toFixed(2)} USD
                </p>

                {nextStepUrl && (
                  <div className="mt-6">
                    <Button variant="primary" size="md" onClick={() => navigate(nextStepUrl)}>
                      Continue to Next Exclusive Offer <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleCheckout} className="space-y-6 text-xs">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      1. Select Your Plan / Product
                    </h3>
                    <Badge variant="indigo" size="xs">Stripe Test Checkout</Badge>
                  </div>

                  <div className="mt-3 space-y-2">
                    {products.slice(0, 2).map((p) => (
                      <div
                        key={p._id}
                        onClick={() => setSelectedProduct(p)}
                        className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                          selectedProduct?._id === p._id
                            ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 ring-1 ring-indigo-600'
                            : 'border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{p.name}</p>
                          <p className="text-[11px] text-slate-400">{p.description}</p>
                        </div>
                        <span className="text-base font-black text-slate-900 dark:text-white">${p.price}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ORDER BUMP OFFER BOX */}
                {selectedProduct?.orderBump?.enabled && (
                  <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border-2 border-dashed border-amber-300 dark:border-amber-700/80">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeBump}
                        onChange={(e) => setIncludeBump(e.target.checked)}
                        className="mt-1 w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-amber-900 dark:text-amber-200 text-xs">
                            ONE-TIME SPECIAL OFFER: {selectedProduct.orderBump.headline}
                          </span>
                          <span className="font-extrabold text-amber-700 dark:text-amber-400">
                            +${selectedProduct.orderBump.price}
                          </span>
                        </div>
                        <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 mt-1 leading-relaxed">
                          {selectedProduct.orderBump.description}
                        </p>
                      </div>
                    </label>
                  </div>
                )}

                {/* Coupon Code Section */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Coupon Code (e.g. LAUNCH20)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono"
                    />
                  </div>
                  <Button variant="secondary" size="sm" onClick={handleApplyCoupon}>
                    Apply Coupon
                  </Button>
                </div>
                {couponMsg && (
                  <p className="text-[11px] text-indigo-600 font-semibold">{couponMsg}</p>
                )}

                {/* Billing Info */}
                <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    2. Customer Information & Payment
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold mb-1">Your Full Name</label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                      />
                    </div>
                  </div>

                  {/* Card Details Simulated Elements */}
                  <div>
                    <label className="block font-semibold mb-1">Credit / Debit Card Number (Stripe Test)</label>
                    <div className="relative">
                      <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold mb-1">Expiration Date</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">CVC Code</label>
                      <input
                        type="text"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Total & Submit */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-base font-black text-slate-900 dark:text-white mb-4">
                    <span>Total Amount Charged:</span>
                    <span className="text-xl text-emerald-600">${finalTotal.toFixed(2)} USD</span>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    loading={checkingOut}
                    className="w-full py-4 text-base font-bold shadow-xl bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Lock className="w-4 h-4 mr-2" /> Complete Secure Order (${finalTotal.toFixed(2)})
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* 1-CLICK UPSELL INTERACTIVE HERO (If upsell step) */}
        {isUpsellStep && (
          <div className="max-w-2xl mx-auto my-10 p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border-2 border-indigo-600 text-center">
            <Badge variant="indigo" size="sm" className="mb-2">SPECIAL ONE-TIME UPGRADE</Badge>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
              Wait! Upgrade to VIP Mastermind Access
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Get private weekly coaching calls and our complete funnel swipe vault for only $197 today (normally $997).
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                variant="primary"
                size="lg"
                loading={acceptingUpsell}
                onClick={handleAcceptUpsell}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-sm font-bold shadow-xl"
              >
                Yes! Upgrade My Order (+ $197)
              </Button>
              {nextStepUrl && (
                <button
                  onClick={() => navigate(nextStepUrl)}
                  className="text-xs text-slate-400 hover:underline py-2"
                >
                  No thanks, take me to confirmation
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Public Footer */}
      <footer className="py-6 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-950">
        <p>© 2026 FunnelPro. High-Performance Sales Funnel Architecture.</p>
        <p className="text-[10px] text-slate-500 mt-1">SSL Encrypted Checkout · Stripe Verified Simulation Mode</p>
      </footer>
    </div>
  );
};

export default PublicFunnelPage;


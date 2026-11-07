const { Order, Product, Contact, Coupon, AnalyticsEvent, Notification } = require('../models');
const { v4: uuidv4 } = require('uuid');

let stripeInstance = null;
try {
  if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('MockStripe')) {
    const Stripe = require('stripe');
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
} catch (e) {
  console.log('[Stripe] Initializing in Test/Simulation Sandbox Mode');
}

// @desc Get all orders
exports.getOrders = async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });

    let filtered = orders;
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(o =>
        (o.orderNumber && o.orderNumber.toLowerCase().includes(s)) ||
        (o.customerName && o.customerName.toLowerCase().includes(s)) ||
        (o.customerEmail && o.customerEmail.toLowerCase().includes(s))
      );
    }

    res.status(200).json({ success: true, count: filtered.length, data: filtered });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Get single order
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.status(200).json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Validate coupon
exports.validateCoupon = async (req, res) => {
  try {
    const { code, subtotal } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Coupon code is required' });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid or inactive coupon code' });
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return res.status(400).json({ success: false, message: 'Coupon code has expired' });
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return res.status(400).json({ success: false, message: 'Coupon maximum uses reached' });
    }

    const currentSubtotal = Number(subtotal) || 0;
    if (coupon.minPurchase && currentSubtotal < coupon.minPurchase) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of $${coupon.minPurchase} required for this coupon`
      });
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (currentSubtotal * coupon.discountValue) / 100;
    } else {
      discountAmount = Math.min(coupon.discountValue, currentSubtotal);
    }

    res.status(200).json({
      success: true,
      data: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: Number(discountAmount.toFixed(2))
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Create payment intent & checkout calculation
exports.createCheckoutIntent = async (req, res) => {
  try {
    const { productId, includeOrderBump, couponCode, funnelId } = req.body;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    let subtotal = product.price;
    let bumpPrice = 0;

    if (includeOrderBump && product.orderBump && product.orderBump.enabled) {
      bumpPrice = product.orderBump.price || 0;
      subtotal += bumpPrice;
    }

    let discount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon) {
        if (coupon.discountType === 'percentage') {
          discount = (subtotal * coupon.discountValue) / 100;
        } else {
          discount = Math.min(coupon.discountValue, subtotal);
        }
      }
    }

    const total = Math.max(0, subtotal - discount);

    let clientSecret = `pi_test_${uuidv4().replace(/-/g, '')}_secret_${uuidv4().substring(0, 8)}`;

    // If live/real Stripe key is active, create Stripe payment intent
    if (stripeInstance && total > 0) {
      try {
        const paymentIntent = await stripeInstance.paymentIntents.create({
          amount: Math.round(total * 100),
          currency: 'usd',
          metadata: {
            productId: product._id,
            funnelId: funnelId || '',
            includeOrderBump: includeOrderBump ? 'true' : 'false'
          }
        });
        clientSecret = paymentIntent.client_secret;
      } catch (stripeErr) {
        console.log('[Stripe Intent Fallback]', stripeErr.message);
      }
    }

    res.status(200).json({
      success: true,
      data: {
        clientSecret,
        subtotal: Number(subtotal.toFixed(2)),
        bumpPrice: Number(bumpPrice.toFixed(2)),
        discount: Number(discount.toFixed(2)),
        total: Number(total.toFixed(2)),
        currency: 'USD',
        product: {
          id: product._id,
          name: product.name,
          price: product.price
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Process finalized order
exports.processOrder = async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      productId,
      includeOrderBump,
      couponCode,
      billingDetails,
      funnelId,
      stepId,
      paymentId
    } = req.body;

    if (!customerEmail || !productId) {
      return res.status(400).json({ success: false, message: 'Email and product are required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    let subtotal = product.price;
    let bumpPrice = 0;

    if (includeOrderBump && product.orderBump && product.orderBump.enabled) {
      bumpPrice = product.orderBump.price || 0;
      subtotal += bumpPrice;
    }

    let discount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon) {
        if (coupon.discountType === 'percentage') {
          discount = (subtotal * coupon.discountValue) / 100;
        } else {
          discount = Math.min(coupon.discountValue, subtotal);
        }
        coupon.usedCount = (coupon.usedCount || 0) + 1;
        await coupon.save();
      }
    }

    const total = Math.max(0, subtotal - discount);
    const orderNumber = 'ORD-' + Math.floor(100000 + Math.random() * 900000);

    // Upsert contact in CRM
    let contact = await Contact.findOne({ email: customerEmail.toLowerCase() });
    const nameParts = (customerName || '').split(' ');
    const firstName = nameParts[0] || 'Valued';
    const lastName = nameParts.slice(1).join(' ') || 'Customer';

    if (!contact) {
      contact = await Contact.create({
        firstName,
        lastName,
        email: customerEmail.toLowerCase(),
        phone: customerPhone || '',
        tags: ['customer', 'buyer', product.name.toLowerCase().replace(/[^a-z0-9]/g, '-')],
        source: 'checkout',
        sourceFunnelId: funnelId || null,
        sourceStepId: stepId || null,
        status: 'customer',
        totalOrders: 1,
        totalSpent: total,
        activityLog: [
          {
            action: 'First Purchase Completed',
            details: `Ordered "${product.name}" for $${total.toFixed(2)} (#${orderNumber})`,
            timestamp: new Date().toISOString()
          }
        ]
      });
    } else {
      contact.status = 'customer';
      contact.totalOrders = (contact.totalOrders || 0) + 1;
      contact.totalSpent = (contact.totalSpent || 0) + total;
      if (!contact.tags) contact.tags = [];
      if (!contact.tags.includes('customer')) contact.tags.push('customer');
      if (!contact.tags.includes('buyer')) contact.tags.push('buyer');

      if (!contact.activityLog) contact.activityLog = [];
      contact.activityLog.unshift({
        action: 'Purchase Completed',
        details: `Ordered "${product.name}" for $${total.toFixed(2)} (#${orderNumber})`,
        timestamp: new Date().toISOString()
      });

      await contact.save();
    }

    // Create Order record
    const order = await Order.create({
      orderNumber,
      contactId: contact._id,
      customerName: customerName || `${contact.firstName} ${contact.lastName}`,
      customerEmail: customerEmail.toLowerCase(),
      funnelId: funnelId || null,
      items: [
        {
          productId: product._id,
          name: product.name,
          price: product.price,
          quantity: 1
        }
      ],
      orderBumpPurchased: !!includeOrderBump,
      orderBumpPrice: bumpPrice,
      subtotal,
      discount,
      total,
      currency: 'USD',
      status: 'completed',
      paymentProvider: 'stripe',
      paymentId: paymentId || `pi_test_${uuidv4().substring(0, 16)}`,
      couponCode: couponCode || '',
      billingDetails: billingDetails || {},
      isDemo: true
    });

    // Create In-App Notification
    await Notification.create({
      title: '🎉 New Order Received!',
      message: `${customerName || customerEmail} purchased "${product.name}" for $${total.toFixed(2)}`,
      type: 'order',
      link: '/orders'
    });

    // Track analytics event
    await AnalyticsEvent.create({
      funnelId: funnelId || null,
      funnelStepId: stepId || null,
      eventType: 'purchase_completed',
      visitorId: customerEmail,
      device: 'desktop',
      metadata: { orderId: order._id, total }
    });

    res.status(201).json({
      success: true,
      data: order,
      message: 'Order completed successfully'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Process One-Click Upsell
exports.processUpsell = async (req, res) => {
  try {
    const { orderId, upsellPrice, upsellTitle } = req.body;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Original order not found' });
    }

    const price = Number(upsellPrice) || 97;
    const title = upsellTitle || 'VIP Upgrade';

    if (!order.upsellsPurchased) order.upsellsPurchased = [];
    order.upsellsPurchased.push({
      name: title,
      price
    });

    order.total = Number((order.total + price).toFixed(2));
    await order.save();

    // Update customer spend
    if (order.contactId) {
      const contact = await Contact.findById(order.contactId);
      if (contact) {
        contact.totalSpent = (contact.totalSpent || 0) + price;
        if (!contact.tags.includes('upsell-buyer')) contact.tags.push('upsell-buyer');
        contact.activityLog.unshift({
          action: 'One-Click Upsell Accepted',
          details: `Accepted "${title}" for +$${price.toFixed(2)}`,
          timestamp: new Date().toISOString()
        });
        await contact.save();
      }
    }

    res.status(200).json({
      success: true,
      data: order,
      message: 'Upsell successfully added to order'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Coupons CRUD
exports.getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: coupons.length, data: coupons });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, minPurchase, maxUses, expiresAt } = req.body;
    if (!code || discountValue === undefined) {
      return res.status(400).json({ success: false, message: 'Coupon code and discount value are required' });
    }

    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Coupon code already exists' });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discountType: discountType || 'percentage',
      discountValue: Number(discountValue),
      minPurchase: minPurchase ? Number(minPurchase) : 0,
      maxUses: maxUses ? Number(maxUses) : 100,
      usedCount: 0,
      expiresAt: expiresAt || null,
      isActive: true
    });

    res.status(201).json({ success: true, data: coupon });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    await Coupon.findByIdAndDelete(coupon._id);
    res.status(200).json({ success: true, message: 'Coupon deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


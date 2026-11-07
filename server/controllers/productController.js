const { Product } = require('../models');

// @desc Get all products
exports.getProducts = async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    const products = await Product.find(query).sort({ createdAt: -1 });

    let filtered = products;
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(p =>
        (p.name && p.name.toLowerCase().includes(s)) ||
        (p.description && p.description.toLowerCase().includes(s))
      );
    }

    res.status(200).json({ success: true, count: filtered.length, data: filtered });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Get single product
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Create product
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      compareAtPrice,
      currency,
      type,
      orderBump,
      upsell,
      digitalFileUrl,
      inventory,
      status
    } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ success: false, message: 'Product name and price are required' });
    }

    const product = await Product.create({
      name,
      description: description || '',
      price: Number(price),
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : 0,
      currency: currency || 'USD',
      type: type || 'digital',
      orderBump: orderBump || {
        enabled: false,
        headline: 'Yes! Add This Exclusive Offer',
        description: 'Get our companion workbook at 70% off',
        price: 27
      },
      upsell: upsell || {
        enabled: false,
        headline: 'Special One-Time Upgrade Offer',
        description: 'Upgrade to VIP Mastermind Access',
        price: 97
      },
      digitalFileUrl: digitalFileUrl || '',
      inventory: inventory ? Number(inventory) : 100,
      status: status || 'active'
    });

    res.status(201).json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Update product
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const fields = [
      'name', 'description', 'price', 'compareAtPrice', 'currency',
      'type', 'orderBump', 'upsell', 'digitalFileUrl', 'inventory', 'status'
    ];

    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'price' || field === 'compareAtPrice' || field === 'inventory') {
          product[field] = Number(req.body[field]);
        } else {
          product[field] = req.body[field];
        }
      }
    });

    await product.save();

    res.status(200).json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await Product.findByIdAndDelete(product._id);
    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


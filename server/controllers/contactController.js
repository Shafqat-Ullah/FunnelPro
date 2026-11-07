const { Contact } = require('../models');

// @desc Get all contacts with filters
exports.getContacts = async (req, res) => {
  try {
    const { search, tag, status } = req.query;
    let query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    const contacts = await Contact.find(query).sort({ createdAt: -1 });

    let filtered = contacts;
    if (tag && tag !== 'all') {
      filtered = filtered.filter(c => Array.isArray(c.tags) && c.tags.includes(tag));
    }
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(c =>
        (c.firstName && c.firstName.toLowerCase().includes(s)) ||
        (c.lastName && c.lastName.toLowerCase().includes(s)) ||
        (c.email && c.email.toLowerCase().includes(s)) ||
        (c.phone && c.phone.includes(s))
      );
    }

    // Get all unique tags
    const allTags = [...new Set(contacts.flatMap(c => c.tags || []))];

    res.status(200).json({
      success: true,
      count: filtered.length,
      data: filtered,
      tags: allTags
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Get single contact
exports.getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }

    res.status(200).json({ success: true, data: contact });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Create new contact
exports.createContact = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, tags, status, source } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required' });
    }

    const existing = await Contact.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Contact with this email already exists' });
    }

    const contact = await Contact.create({
      firstName: firstName || '',
      lastName: lastName || '',
      email: email.toLowerCase(),
      phone: phone || '',
      tags: Array.isArray(tags) ? tags : (tags ? [tags] : []),
      status: status || 'lead',
      source: source || 'manual',
      totalOrders: 0,
      totalSpent: 0,
      activityLog: [
        {
          action: 'Contact Created',
          details: `Added manually by admin via CRM dashboard`,
          timestamp: new Date().toISOString()
        }
      ]
    });

    res.status(201).json({ success: true, data: contact });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Update contact
exports.updateContact = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, tags, status } = req.body;
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }

    if (firstName !== undefined) contact.firstName = firstName;
    if (lastName !== undefined) contact.lastName = lastName;
    if (email) contact.email = email.toLowerCase();
    if (phone !== undefined) contact.phone = phone;
    if (tags !== undefined) contact.tags = tags;
    if (status) contact.status = status;

    if (!contact.activityLog) contact.activityLog = [];
    contact.activityLog.unshift({
      action: 'Contact Updated',
      details: 'Profile details updated',
      timestamp: new Date().toISOString()
    });

    await contact.save();

    res.status(200).json({ success: true, data: contact });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Delete contact
exports.deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }

    await Contact.findByIdAndDelete(contact._id);
    res.status(200).json({ success: true, message: 'Contact deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Export contacts to CSV
exports.exportCSV = async (req, res) => {
  try {
    const contacts = await Contact.find({}).sort({ createdAt: -1 });

    const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'Status', 'Tags', 'Source', 'Total Orders', 'Total Spent', 'Created At'];
    const rows = contacts.map(c => [
      `"${c.firstName || ''}"`,
      `"${c.lastName || ''}"`,
      `"${c.email || ''}"`,
      `"${c.phone || ''}"`,
      `"${c.status || 'lead'}"`,
      `"${(c.tags || []).join('; ')}"`,
      `"${c.source || ''}"`,
      c.totalOrders || 0,
      `$${(c.totalSpent || 0).toFixed(2)}`,
      `"${c.createdAt || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="funnelpro_contacts.csv"');
    res.status(200).send(csvContent);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


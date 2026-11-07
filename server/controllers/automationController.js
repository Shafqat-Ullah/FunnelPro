const { Automation } = require('../models');

// @desc Get all automations
exports.getAutomations = async (req, res) => {
  try {
    const automations = await Automation.find({}).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: automations.length, data: automations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Get single automation
exports.getAutomationById = async (req, res) => {
  try {
    const automation = await Automation.findById(req.params.id);
    if (!automation) {
      return res.status(404).json({ success: false, message: 'Automation not found' });
    }

    res.status(200).json({ success: true, data: automation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Create automation
exports.createAutomation = async (req, res) => {
  try {
    const { name, description, trigger, nodes, edges, status } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Automation name is required' });
    }

    const defaultNodes = [
      {
        id: 'node-trigger-1',
        type: 'trigger',
        title: 'Contact Submits Form',
        subtitle: 'Any Funnel Opt-in',
        position: { x: 280, y: 50 },
        config: { triggerType: 'optin_submit', funnelId: 'all' }
      },
      {
        id: 'node-action-1',
        type: 'action',
        title: 'Add Tag',
        subtitle: 'Tag: "lead-magnet-downloaded"',
        position: { x: 280, y: 190 },
        config: { actionType: 'add_tag', tag: 'lead-magnet-downloaded' }
      },
      {
        id: 'node-delay-1',
        type: 'delay',
        title: 'Wait 1 Day',
        subtitle: 'Delay subsequent steps',
        position: { x: 280, y: 320 },
        config: { duration: 1, unit: 'days' }
      },
      {
        id: 'node-action-2',
        type: 'action',
        title: 'Send Follow-up Email',
        subtitle: 'Subject: "How was your masterclass?"',
        position: { x: 280, y: 450 },
        config: { actionType: 'send_email', subject: 'How was your masterclass?' }
      }
    ];

    const defaultEdges = [
      { id: 'edge-1-2', source: 'node-trigger-1', target: 'node-action-1' },
      { id: 'edge-2-3', source: 'node-action-1', target: 'node-delay-1' },
      { id: 'edge-3-4', source: 'node-delay-1', target: 'node-action-2' }
    ];

    const automation = await Automation.create({
      name,
      description: description || '',
      trigger: trigger || { type: 'optin_submit', config: {} },
      nodes: nodes || defaultNodes,
      edges: edges || defaultEdges,
      status: status || 'active',
      executionCount: 0
    });

    res.status(201).json({ success: true, data: automation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Update automation workflow
exports.updateAutomation = async (req, res) => {
  try {
    const { name, description, trigger, nodes, edges, status } = req.body;
    const automation = await Automation.findById(req.params.id);

    if (!automation) {
      return res.status(404).json({ success: false, message: 'Automation not found' });
    }

    if (name) automation.name = name;
    if (description !== undefined) automation.description = description;
    if (trigger) automation.trigger = trigger;
    if (nodes) automation.nodes = nodes;
    if (edges) automation.edges = edges;
    if (status) automation.status = status;

    await automation.save();

    res.status(200).json({ success: true, data: automation, message: 'Automation updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Toggle active status
exports.toggleAutomationStatus = async (req, res) => {
  try {
    const automation = await Automation.findById(req.params.id);
    if (!automation) {
      return res.status(404).json({ success: false, message: 'Automation not found' });
    }

    automation.status = automation.status === 'active' ? 'paused' : 'active';
    await automation.save();

    res.status(200).json({
      success: true,
      data: automation,
      message: `Automation is now ${automation.status}`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Delete automation
exports.deleteAutomation = async (req, res) => {
  try {
    const automation = await Automation.findById(req.params.id);
    if (!automation) {
      return res.status(404).json({ success: false, message: 'Automation not found' });
    }

    await Automation.findByIdAndDelete(automation._id);
    res.status(200).json({ success: true, message: 'Automation deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


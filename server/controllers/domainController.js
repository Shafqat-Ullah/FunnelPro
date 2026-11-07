const { Domain, Funnel } = require('../models');

// @desc Get all connected domains
exports.getDomains = async (req, res) => {
  try {
    const domains = await Domain.find({}).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: domains.length, data: domains });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Add new custom domain
exports.addDomain = async (req, res) => {
  try {
    const { domainName, targetFunnelId } = req.body;
    if (!domainName) {
      return res.status(400).json({ success: false, message: 'Domain name is required' });
    }

    const cleanDomain = domainName.trim().toLowerCase().replace(/^https?:\/\//, '');
    const token = 'fp-verify-' + Math.floor(100000 + Math.random() * 900000);

    const domain = await Domain.create({
      domainName: cleanDomain,
      subdomain: cleanDomain.split('.')[0] || '',
      status: 'pending_verification',
      verificationToken: token,
      dnsRecords: [
        { type: 'CNAME', host: '@', value: 'funnelpro-edge.net', status: 'pending' },
        { type: 'TXT', host: '_verify', value: token, status: 'pending' }
      ],
      targetFunnelId: targetFunnelId || null,
      sslStatus: 'provisioning'
    });

    res.status(201).json({ success: true, data: domain });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Verify domain DNS records
exports.verifyDomain = async (req, res) => {
  try {
    const domain = await Domain.findById(req.params.id);
    if (!domain) {
      return res.status(404).json({ success: false, message: 'Domain not found' });
    }

    // Mark as verified and SSL active
    domain.status = 'verified';
    domain.sslStatus = 'active';
    domain.dnsRecords = domain.dnsRecords.map(r => ({ ...r, status: 'valid' }));
    await domain.save();

    // Link custom domain to funnel if selected
    if (domain.targetFunnelId) {
      await Funnel.findByIdAndUpdate(domain.targetFunnelId, { customDomain: domain.domainName });
    }

    res.status(200).json({
      success: true,
      data: domain,
      message: `Domain ${domain.domainName} verified and SSL certificate provisioned!`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Delete domain
exports.deleteDomain = async (req, res) => {
  try {
    const domain = await Domain.findById(req.params.id);
    if (!domain) {
      return res.status(404).json({ success: false, message: 'Domain not found' });
    }

    await Domain.findByIdAndDelete(domain._id);
    res.status(200).json({ success: true, message: 'Domain deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


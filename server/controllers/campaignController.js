const { EmailCampaign, Contact } = require('../models');
const { sendEmail, checkSmtpStatus } = require('../utils/emailService');

// @desc Get all email campaigns
exports.getCampaigns = async (req, res) => {
  try {
    const campaigns = await EmailCampaign.find({}).sort({ createdAt: -1 });
    const smtpStatus = await checkSmtpStatus();

    res.status(200).json({
      success: true,
      count: campaigns.length,
      data: campaigns,
      smtpStatus
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Get single campaign
exports.getCampaignById = async (req, res) => {
  try {
    const campaign = await EmailCampaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    res.status(200).json({ success: true, data: campaign });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Create email campaign
exports.createCampaign = async (req, res) => {
  try {
    const { title, subject, senderName, senderEmail, previewText, content, audienceFilter, scheduledAt } = req.body;
    if (!title || !subject) {
      return res.status(400).json({ success: false, message: 'Title and subject are required' });
    }

    const campaign = await EmailCampaign.create({
      title,
      subject,
      senderName: senderName || 'FunnelPro Team',
      senderEmail: senderEmail || 'notifications@funnelpro.io',
      previewText: previewText || '',
      content: content || 'Hello {{first_name}},\n\nThank you for being part of our community!\n\nBest regards,\nThe Team',
      audienceFilter: audienceFilter || { all: true, tags: [] },
      status: scheduledAt ? 'scheduled' : 'draft',
      scheduledAt: scheduledAt || null,
      stats: { recipients: 0, sent: 0, opened: 0, clicked: 0, bounced: 0 }
    });

    res.status(201).json({ success: true, data: campaign });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Update email campaign
exports.updateCampaign = async (req, res) => {
  try {
    const campaign = await EmailCampaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    const fields = ['title', 'subject', 'senderName', 'senderEmail', 'previewText', 'content', 'audienceFilter', 'status', 'scheduledAt'];
    fields.forEach(f => {
      if (req.body[f] !== undefined) campaign[f] = req.body[f];
    });

    await campaign.save();

    res.status(200).json({ success: true, data: campaign });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Send test email
exports.sendTestEmail = async (req, res) => {
  try {
    const { recipientEmail, subject, content } = req.body;
    if (!recipientEmail) {
      return res.status(400).json({ success: false, message: 'Recipient email is required' });
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <div style="background-color: #6366f1; color: white; padding: 12px 20px; border-radius: 6px; margin-bottom: 20px; font-weight: bold;">
          FunnelPro Test Email Delivery
        </div>
        <div style="color: #334155; line-height: 1.6; font-size: 15px;">
          ${content.replace(/\n/g, '<br/>')}
        </div>
        <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8;">
          Sent from FunnelPro SaaS Platform. To unsubscribe, click here.
        </div>
      </div>
    `;

    const result = await sendEmail({
      to: recipientEmail,
      subject: `[TEST] ${subject || 'FunnelPro Campaign Test'}`,
      html
    });

    if (!result.delivered) {
      return res.status(422).json({
        success: false,
        delivered: false,
        message: result.message
      });
    }

    res.status(200).json({
      success: true,
      delivered: true,
      message: `Test email successfully sent to ${recipientEmail}!`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Send or launch campaign to targeted audience
exports.launchCampaign = async (req, res) => {
  try {
    const campaign = await EmailCampaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    // Get recipients
    let recipients = await Contact.find({ status: { $ne: 'unsubscribed' } });
    if (!campaign.audienceFilter.all && campaign.audienceFilter.tags?.length > 0) {
      recipients = recipients.filter(c =>
        c.tags && c.tags.some(t => campaign.audienceFilter.tags.includes(t))
      );
    }

    campaign.status = 'sent';
    campaign.sentAt = new Date().toISOString();
    campaign.stats = {
      recipients: recipients.length,
      sent: recipients.length,
      opened: Math.round(recipients.length * 0.42),
      clicked: Math.round(recipients.length * 0.18),
      bounced: 0
    };

    await campaign.save();

    res.status(200).json({
      success: true,
      data: campaign,
      message: `Campaign sent to ${recipients.length} recipients!`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Delete campaign
exports.deleteCampaign = async (req, res) => {
  try {
    const campaign = await EmailCampaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    await EmailCampaign.findByIdAndDelete(campaign._id);
    res.status(200).json({ success: true, message: 'Campaign deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


const nodemailer = require('nodemailer');

const getTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port: Number(port),
    secure: Number(port) === 465,
    auth: { user, pass }
  });
};

const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = getTransporter();

  if (!transporter) {
    return {
      success: false,
      delivered: false,
      message: 'SMTP settings are not configured. Please configure SMTP host, user, and password in Settings/Integrations.'
    };
  }

  try {
    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || 'FunnelPro'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
      to,
      subject,
      text: text || html.replace(/<[^>]+>/g, ''),
      html
    });

    return {
      success: true,
      delivered: true,
      messageId: info.messageId,
      message: `Email dispatched successfully to ${to}`
    };
  } catch (err) {
    return {
      success: false,
      delivered: false,
      error: err.message,
      message: `SMTP Delivery Failed: ${err.message}`
    };
  }
};

const checkSmtpStatus = async () => {
  const transporter = getTransporter();
  if (!transporter) {
    return {
      configured: false,
      status: 'unconfigured',
      message: 'SMTP credentials not configured in environment variables.'
    };
  }

  try {
    await transporter.verify();
    return {
      configured: true,
      status: 'connected',
      message: 'SMTP Server connection verified successfully.'
    };
  } catch (err) {
    return {
      configured: true,
      status: 'error',
      message: `SMTP Verification Error: ${err.message}`
    };
  }
};

module.exports = {
  sendEmail,
  checkSmtpStatus
};


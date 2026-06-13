const nodemailer = require('nodemailer');
const logger = require('../config/logger');

// Setup SMTP transporter (falls back to Ethereal mailer for testing if env is empty)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || 'mock_user@ethereal.email',
    pass: process.env.SMTP_PASS || 'mock_password',
  },
});

const sendMail = async ({ to, subject, text, html }) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"CodeTrack Support" <support@codetrack.com>',
      to,
      subject,
      text,
      html,
    });
    logger.info('Email sent successfully: %s', info.messageId);
    return info;
  } catch (error) {
    logger.error('Failed to send email: %s', error.message);
    throw error;
  }
};

module.exports = {
  sendMail,
};

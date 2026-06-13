const AuditLogRepository = require('../repositories/AuditLogRepository');
const logger = require('../config/logger');

const auditLog = (action) => {
  return async (req, res, next) => {
    // Save details after request completes
    res.on('finish', async () => {
      try {
        const actorId = req.user ? req.user._id : null;
        const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const userAgent = req.headers['user-agent'];
        
        const details = {
          method: req.method,
          url: req.originalUrl,
          statusCode: res.statusCode,
        };

        // Don't log passwords or sensitive data
        if (req.body && Object.keys(req.body).length > 0) {
          const bodyCopy = { ...req.body };
          delete bodyCopy.password;
          delete bodyCopy.newPassword;
          delete bodyCopy.otp;
          details.body = bodyCopy;
        }

        await AuditLogRepository.logEvent(
          actorId,
          action,
          ipAddress,
          userAgent,
          details
        );
      } catch (err) {
        logger.error('Failed to save audit log: %s', err.message);
      }
    });
    next();
  };
};

module.exports = auditLog;

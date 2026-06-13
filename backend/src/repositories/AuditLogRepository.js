const BaseRepository = require('./BaseRepository');
const AuditLog = require('../models/AuditLog');

class AuditLogRepository extends BaseRepository {
  constructor() {
    super(AuditLog);
  }

  async logEvent(actorId, action, ipAddress, userAgent, details = {}) {
    return this.create({
      actor: actorId,
      action,
      ipAddress,
      userAgent,
      details,
    });
  }
}

module.exports = new AuditLogRepository();

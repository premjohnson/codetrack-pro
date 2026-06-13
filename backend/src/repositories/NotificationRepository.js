const BaseRepository = require('./BaseRepository');
const Notification = require('../models/Notification');

class NotificationRepository extends BaseRepository {
  constructor() {
    super(Notification);
  }

  async findUnreadByRecipient(recipientId) {
    return this.model.find({ recipient: recipientId, read: false }).sort({ createdAt: -1 });
  }

  async markAllAsRead(recipientId) {
    return this.model.updateMany({ recipient: recipientId, read: false }, { $set: { read: true } });
  }
}

module.exports = new NotificationRepository();

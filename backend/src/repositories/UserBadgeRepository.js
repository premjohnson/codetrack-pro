const BaseRepository = require('./BaseRepository');
const UserBadge = require('../models/UserBadge');

class UserBadgeRepository extends BaseRepository {
  constructor() {
    super(UserBadge);
  }

  async findByStudent(studentId) {
    return this.model.find({ student: studentId }).populate('badge');
  }

  async hasBadge(studentId, badgeId) {
    const count = await this.model.countDocuments({ student: studentId, badge: badgeId });
    return count > 0;
  }
}

module.exports = new UserBadgeRepository();

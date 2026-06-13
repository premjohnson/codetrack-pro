const BaseRepository = require('./BaseRepository');
const Announcement = require('../models/Announcement');

class AnnouncementRepository extends BaseRepository {
  constructor() {
    super(Announcement);
  }

  async findRecent(limit = 10) {
    return this.model.find({}).sort({ createdAt: -1 }).limit(limit).populate('author', 'name email');
  }
}

module.exports = new AnnouncementRepository();

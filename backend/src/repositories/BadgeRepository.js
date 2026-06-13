const BaseRepository = require('./BaseRepository');
const Badge = require('../models/Badge');

class BadgeRepository extends BaseRepository {
  constructor() {
    super(Badge);
  }

  async findByName(name) {
    return this.model.findOne({ name });
  }
}

module.exports = new BadgeRepository();

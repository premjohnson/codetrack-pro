const BaseRepository = require('./BaseRepository');
const Contest = require('../models/Contest');

class ContestRepository extends BaseRepository {
  constructor() {
    super(Contest);
  }

  async findActive() {
    const now = new Date();
    return this.model.find({
      startTime: { $lte: now },
      endTime: { $gte: now },
    }).populate('problems');
  }

  async findUpcoming() {
    const now = new Date();
    return this.model.find({
      startTime: { $gt: now },
    }).sort({ startTime: 1 });
  }

  async findPast() {
    const now = new Date();
    return this.model.find({
      endTime: { $lt: now },
    }).sort({ endTime: -1 });
  }
}

module.exports = new ContestRepository();

const BaseRepository = require('./BaseRepository');
const PlacementProfile = require('../models/PlacementProfile');

class PlacementProfileRepository extends BaseRepository {
  constructor() {
    super(PlacementProfile);
  }

  async getByStudent(studentId) {
    return this.model.findOne({ student: studentId }).populate('student', 'name email');
  }

  async updateSummary(studentId, scoreSummary) {
    return this.model.findOneAndUpdate(
      { student: studentId },
      { $set: { technicalScoreSummary: scoreSummary } },
      { new: true, upsert: true }
    );
  }
}

module.exports = new PlacementProfileRepository();

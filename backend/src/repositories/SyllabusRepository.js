const BaseRepository = require('./BaseRepository');
const Syllabus = require('../models/Syllabus');

class SyllabusRepository extends BaseRepository {
  constructor() {
    super(Syllabus);
  }

  async getAllDetailed() {
    return this.model.find({}).populate('uploadedBy', 'name email').sort({ createdAt: -1 });
  }
}

module.exports = new SyllabusRepository();

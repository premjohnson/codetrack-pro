const BaseRepository = require('./BaseRepository');
const Submission = require('../models/Submission');

class SubmissionRepository extends BaseRepository {
  constructor() {
    super(Submission);
  }

  async findByStudentAndTask(studentId, taskId) {
    return this.model.findOne({ student: studentId, task: taskId })
      .populate('rating')
      .populate('feedback');
  }

  async findDetailed(filter = {}, page = 1, limit = 10) {
    return this.paginate(
      filter,
      page,
      limit,
      { createdAt: -1 },
      'student task rating feedback'
    );
  }

  async getCompletionRate() {
    const total = await this.count();
    const approved = await this.count({ status: 'approved' });
    return total > 0 ? (approved / total) * 100 : 0;
  }
}

module.exports = new SubmissionRepository();

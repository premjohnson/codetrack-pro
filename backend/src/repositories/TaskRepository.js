const BaseRepository = require('./BaseRepository');
const Task = require('../models/Task');

class TaskRepository extends BaseRepository {
  constructor() {
    super(Task);
  }

  async searchAndFilter({ difficulty, technology, search, page = 1, limit = 10 }) {
    const filter = {};
    if (difficulty) filter.difficulty = difficulty;
    if (technology) filter.technology = { $regex: technology, $options: 'i' };
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    return this.paginate(filter, page, limit, { createdAt: -1 }, 'category');
  }
}

module.exports = new TaskRepository();

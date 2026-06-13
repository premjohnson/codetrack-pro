const BaseRepository = require('./BaseRepository');
const Leaderboard = require('../models/Leaderboard');

class LeaderboardRepository extends BaseRepository {
  constructor() {
    super(Leaderboard);
  }

  async getLeaderboard(type = 'all_time', limit = 20) {
    return this.model.find({ type })
      .sort({ score: -1 })
      .limit(limit)
      .populate('student', 'name email');
  }

  async updateStudentScore(studentId, { solvedCount, streakCount, averageRating, score, type = 'all_time' }) {
    return this.model.findOneAndUpdate(
      { student: studentId, type },
      {
        $set: {
          solvedCount,
          streakCount,
          averageRating,
          score,
        }
      },
      { new: true, upsert: true }
    );
  }
}

module.exports = new LeaderboardRepository();

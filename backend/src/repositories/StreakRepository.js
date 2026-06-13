const BaseRepository = require('./BaseRepository');
const Streak = require('../models/Streak');

class StreakRepository extends BaseRepository {
  constructor() {
    super(Streak);
  }

  async getByStudent(studentId) {
    return this.model.findOne({ student: studentId });
  }

  async incrementStreak(studentId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const streak = await this.model.findOne({ student: studentId });

    if (!streak) {
      return this.model.create({
        student: studentId,
        currentStreak: 1,
        longestStreak: 1,
        lastActivityDate: today,
      });
    }

    const lastActivity = streak.lastActivityDate ? new Date(streak.lastActivityDate) : null;
    if (lastActivity) {
      lastActivity.setHours(0, 0, 0, 0);
      const diffTime = Math.abs(today - lastActivity);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        // Already active today, do nothing
        return streak;
      } else if (diffDays === 1) {
        // Consecutive day
        streak.currentStreak += 1;
        if (streak.currentStreak > streak.longestStreak) {
          streak.longestStreak = streak.currentStreak;
        }
      } else {
        // Streak broken
        streak.currentStreak = 1;
      }
    } else {
      streak.currentStreak = 1;
      streak.longestStreak = Math.max(streak.longestStreak, 1);
    }

    streak.lastActivityDate = today;
    return streak.save();
  }

  async resetStreak(studentId) {
    return this.model.findOneAndUpdate(
      { student: studentId },
      { $set: { currentStreak: 0 } },
      { new: true }
    );
  }
}

module.exports = new StreakRepository();

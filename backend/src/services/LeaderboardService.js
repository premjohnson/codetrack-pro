const LeaderboardRepository = require('../repositories/LeaderboardRepository');
const Submission = require('../models/Submission');
const Streak = require('../models/Streak');
const User = require('../models/User');
const { redisClient } = require('../config/redis');
const logger = require('../config/logger');

class LeaderboardService {
  async getRankings(type = 'all_time') {
    const cacheKey = `leaderboard:${type}`;
    
    // Attempt to read from Redis Cache
    try {
      if (redisClient.isOpen) {
        const cached = await redisClient.get(cacheKey);
        if (cached) {
          logger.debug('Leaderboard cache hit for key: %s', cacheKey);
          return JSON.parse(cached);
        }
      }
    } catch (err) {
      logger.warn('Failed to read from Redis cache: %s', err.message);
    }

    // Fallback: Query MongoDB via Repository
    const rankings = await LeaderboardRepository.getLeaderboard(type, 50);

    // Save back to Redis Cache (expires in 5 minutes)
    try {
      if (redisClient.isOpen && rankings.length > 0) {
        await redisClient.setEx(cacheKey, 300, JSON.stringify(rankings));
      }
    } catch (err) {
      logger.warn('Failed to save to Redis cache: %s', err.message);
    }

    return rankings;
  }

  // Recalculates leaderboards for all students
  async computeLeaderboard() {
    logger.info('Recalculating CodeTrack Leaderboards...');
    
    try {
      const students = await User.find({ role: 'student' });

      for (const student of students) {
        // 1. Solved count (Approved submissions)
        const solvedCount = await Submission.countDocuments({ student: student._id, status: 'approved' });

        // 2. Streak count
        const streak = await Streak.findOne({ student: student._id });
        const streakCount = streak ? streak.currentStreak : 0;

        // 3. Average Rating
        const submissions = await Submission.find({ student: student._id, rating: { $exists: true } }).populate('rating');
        let totalScore = 0;
        let ratingCount = 0;
        
        for (const sub of submissions) {
          if (sub.rating) {
            totalScore += sub.rating.score || 0;
            ratingCount++;
          }
        }
        
        const averageRating = ratingCount > 0 ? totalScore / ratingCount : 0;

        // Compound score calculation
        // Score = (Solved * 10) + (Streak * 5) + (AverageRating * 20)
        const score = (solvedCount * 10) + (streakCount * 5) + (averageRating * 20);

        // Update database record
        await LeaderboardRepository.updateStudentScore(student._id, {
          solvedCount,
          streakCount,
          averageRating,
          score,
          type: 'all_time'
        });
      }

      // Flush cache
      if (redisClient.isOpen) {
        await redisClient.del('leaderboard:all_time');
      }

      logger.info('Leaderboards successfully computed.');
    } catch (error) {
      logger.error('Failed to compute leaderboard: %s', error.message);
    }
  }
}

module.exports = new LeaderboardService();

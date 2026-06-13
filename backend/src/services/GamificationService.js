const StreakRepository = require('../repositories/StreakRepository');
const UserBadgeRepository = require('../repositories/UserBadgeRepository');
const SubmissionRepository = require('../repositories/SubmissionRepository');
const CodingActivity = require('../models/CodingActivity');
const Badge = require('../models/Badge');
const logger = require('../config/logger');

class GamificationService {
  async getStudentStats(studentId) {
    // 1. Problems solved count (Approved submissions)
    const solvedCount = await SubmissionRepository.count({ student: studentId, status: 'approved' });

    // 2. Streaks
    const streak = await StreakRepository.getByStudent(studentId);
    const currentStreak = streak ? streak.currentStreak : 0;
    const longestStreak = streak ? streak.longestStreak : 0;

    // 3. Badges earned
    const badgesEarned = await UserBadgeRepository.findByStudent(studentId);

    // 4. Average rating
    const ratedSubmissions = await SubmissionRepository.find(
      { student: studentId, rating: { $exists: true } },
      {},
      'rating'
    );
    
    let totalRating = 0;
    let ratingCount = 0;
    for (const sub of ratedSubmissions) {
      if (sub.rating) {
        totalRating += sub.rating.score || 0;
        ratingCount++;
      }
    }
    const averageRating = ratingCount > 0 ? (totalRating / ratingCount) : 0;

    // 5. Submission Success Rate
    const totalSubmissions = await SubmissionRepository.count({ student: studentId });
    const submissionSuccessRate = totalSubmissions > 0 ? (solvedCount / totalSubmissions) * 100 : 0;

    // 6. Coding hours & language usage (aggregating playground runs)
    const activities = await CodingActivity.find({ student: studentId });
    
    let totalTimeMs = 0;
    const langUsageMap = {};

    for (const act of activities) {
      totalTimeMs += act.executionTime || 0;
      langUsageMap[act.language] = (langUsageMap[act.language] || 0) + 1;
    }

    // Convert executionTime to hours (mock scaling: 1 execution represents 0.25 hrs of active work for visual purposes, or sum actual milliseconds)
    const codingHours = Number((totalTimeMs / 3600000).toFixed(2));

    const languageUsage = Object.entries(langUsageMap).map(([name, value]) => ({
      name,
      value,
    }));

    return {
      solvedCount,
      currentStreak,
      longestStreak,
      badgesCount: badgesEarned.length,
      badges: badgesEarned.map(ub => ({
        name: ub.badge.name,
        description: ub.badge.description,
        awardedAt: ub.awardedAt,
      })),
      averageRating: Number(averageRating.toFixed(1)),
      submissionSuccessRate: Number(submissionSuccessRate.toFixed(1)),
      codingHours,
      languageUsage,
    };
  }

  async getAllBadges() {
    return Badge.find({});
  }
}

module.exports = new GamificationService();

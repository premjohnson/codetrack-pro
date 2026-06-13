const BaseController = require('./BaseController');
const GamificationService = require('../services/GamificationService');
const User = require('../models/User');
const Submission = require('../models/Submission');
const Rating = require('../models/Rating');
const LeaderboardService = require('../services/LeaderboardService');
const { redisClient } = require('../config/redis');
const logger = require('../config/logger');

class DashboardController extends BaseController {
  async getStudentDashboard(req, res, next) {
    try {
      const stats = await GamificationService.getStudentStats(req.user._id);
      return this.sendSuccess(res, stats, 'Student dashboard stats retrieved successfully');
    } catch (error) {
      return this.sendError(res, error.message, 400);
    }
  }

  async getAdminDashboard(req, res, next) {
    try {
      const cacheKey = 'dashboard:admin';
      
      // Attempt cache hit
      if (redisClient.isOpen) {
        try {
          const cached = await redisClient.get(cacheKey);
          if (cached) {
            logger.debug('Admin dashboard cache hit');
            return this.sendSuccess(res, JSON.parse(cached), 'Admin dashboard stats retrieved successfully');
          }
        } catch (cErr) {
          logger.warn('Redis read error: %s', cErr.message);
        }
      }

      // Compute Stats
      const totalStudents = await User.countDocuments({ role: 'student' });
      const activeStudents = await User.countDocuments({ role: 'student', status: 'active' });
      const inactiveStudents = await User.countDocuments({ role: 'student', status: 'inactive' });

      // Submissions today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const submissionsToday = await Submission.countDocuments({ createdAt: { $gte: today } });

      // Average rating
      const ratings = await Rating.find({});
      const totalRating = ratings.reduce((sum, r) => sum + r.score, 0);
      const averageRating = ratings.length > 0 ? Number((totalRating / ratings.length).toFixed(1)) : 0;

      // Task Completion Rate
      const submissions = await Submission.find({});
      const approvedCount = submissions.filter(s => s.status === 'approved').length;
      const taskCompletionRate = submissions.length > 0 ? Number(((approvedCount / submissions.length) * 100).toFixed(1)) : 0;

      // Fetch top rankings
      const leaderboards = await LeaderboardService.getRankings('all_time');
      const topPerformers = leaderboards.slice(0, 5).map(l => ({
        name: l.student?.name || 'Anonymous',
        score: l.score,
        solvedCount: l.solvedCount,
      }));

      const stats = {
        totalStudents,
        activeStudents,
        inactiveStudents,
        submissionsToday,
        averageRating,
        taskCompletionRate,
        topPerformers,
        // Monthly Growth (mock statistics matching typical MERN dashboards)
        monthlyGrowth: 15.4,
        codingActivity: {
          days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          submissions: [12, 19, 3, 5, 2, 3, 10],
          playgroundRuns: [34, 56, 12, 43, 22, 10, 45],
        }
      };

      // Set to Redis Cache (expires in 10 minutes)
      if (redisClient.isOpen) {
        try {
          await redisClient.setEx(cacheKey, 600, JSON.stringify(stats));
        } catch (cErr) {
          logger.warn('Redis write error: %s', cErr.message);
        }
      }

      return this.sendSuccess(res, stats, 'Admin dashboard stats retrieved successfully');
    } catch (error) {
      return this.sendError(res, error.message, 400);
    }
  }

  // Admin updates student status (active/inactive) or views student details
  async manageStudentStatus(req, res, next) {
    try {
      const { status } = req.body;
      const student = await User.findByIdAndUpdate(req.params.id, { status }, { new: true });
      if (!student) {
        return this.sendError(res, 'Student not found', 404);
      }
      
      // Flush caches
      if (redisClient.isOpen) {
        await redisClient.del('dashboard:admin');
      }

      return this.sendSuccess(res, { student }, `Student status updated to ${status}`);
    } catch (error) {
      return this.sendError(res, error.message, 400);
    }
  }

  async getStudentsList(req, res, next) {
    try {
      const students = await User.find({ role: 'student' }).select('-password');
      
      // Map students list with performance statistics
      const list = [];
      for (const s of students) {
        const stats = await GamificationService.getStudentStats(s._id);
        list.push({
          id: s._id,
          name: s.name,
          email: s.email,
          status: s.status,
          currentStreak: stats.currentStreak,
          badgesCount: stats.badgesCount,
          averageRating: stats.averageRating,
          solvedCount: stats.solvedCount,
        });
      }

      return this.sendSuccess(res, { students: list }, 'Students list retrieved successfully');
    } catch (error) {
      return this.sendError(res, error.message, 400);
    }
  }
}

module.exports = new DashboardController();

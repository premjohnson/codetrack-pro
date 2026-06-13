const BaseController = require('./BaseController');
const ContestService = require('../services/ContestService');

class ContestController extends BaseController {
  async createContest(req, res, next) {
    try {
      const contest = await ContestService.createContest(req.body, req.user._id);
      return this.sendSuccess(res, { contest }, 'Contest created successfully', 201);
    } catch (error) {
      return this.sendError(res, error.message, 400);
    }
  }

  async getContests(req, res, next) {
    try {
      const list = await ContestService.getContests();
      return this.sendSuccess(res, list, 'Contests list retrieved successfully');
    } catch (error) {
      return this.sendError(res, error.message, 400);
    }
  }

  async getContestById(req, res, next) {
    try {
      const contest = await ContestService.getContestById(req.params.id);
      return this.sendSuccess(res, { contest }, 'Contest details retrieved successfully');
    } catch (error) {
      return this.sendError(res, error.message, 400);
    }
  }

  async submitSolution(req, res, next) {
    try {
      const { problemId, code, language } = req.body;
      const submission = await ContestService.submitContestSolution(
        req.user._id,
        req.params.id,
        problemId,
        code,
        language
      );
      return this.sendSuccess(res, { submission }, 'Contest solution submitted successfully', 201);
    } catch (error) {
      return this.sendError(res, error.message, 400);
    }
  }

  async getLeaderboard(req, res, next) {
    try {
      const leaderboard = await ContestService.getContestLeaderboard(req.params.id);
      return this.sendSuccess(res, { leaderboard }, 'Contest ranking retrieved successfully');
    } catch (error) {
      return this.sendError(res, error.message, 400);
    }
  }
}

module.exports = new ContestController();

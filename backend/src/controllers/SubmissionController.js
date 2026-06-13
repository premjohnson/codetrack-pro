const BaseController = require('./BaseController');
const SubmissionService = require('../services/SubmissionService');
const logger = require('../config/logger');

class SubmissionController extends BaseController {
  async submitAssignment(req, res, next) {
    try {
      const { taskId, githubUrl, submittedCode, language } = req.body;
      let fileUrl = '';
      
      // If file uploaded via multer (e.g. to local or Cloudinary)
      if (req.file) {
        fileUrl = req.file.path; // Cloudinary upload returns path/url
      }

      const submission = await SubmissionService.submitAssignment(req.user._id, taskId, {
        fileUrl,
        githubUrl,
        submittedCode,
        language,
      });

      return this.sendSuccess(res, { submission }, 'Assignment submitted successfully', 201);
    } catch (error) {
      return this.sendError(res, error.message, 400);
    }
  }

  // Student compiles/runs code in the playground
  async runPlaygroundCode(req, res, next) {
    try {
      const { taskId, code, language, customInput } = req.body;
      const result = await SubmissionService.executePlaygroundTest(
        req.user._id,
        taskId,
        code,
        language,
        customInput
      );
      return this.sendSuccess(res, result, 'Code executed successfully');
    } catch (error) {
      logger.error('Playground code run error: %s', error.message);
      return this.sendError(res, error.message, 400);
    }
  }

  async rateSubmission(req, res, next) {
    try {
      const { score, comment } = req.body;
      const submission = await SubmissionService.rateSubmission(
        req.params.id,
        score,
        comment,
        req.user._id
      );
      return this.sendSuccess(res, { submission }, 'Submission rated and reviewed successfully');
    } catch (error) {
      return this.sendError(res, error.message, 400);
    }
  }

  async getSubmissions(req, res, next) {
    try {
      const { status, studentId, taskId, page, limit } = req.query;
      const filters = {};
      if (status) filters.status = status;
      if (studentId) filters.student = studentId;
      if (taskId) filters.task = taskId;

      // Students can only query their own submissions
      if (req.user.role === 'student') {
        filters.student = req.user._id;
      }

      const result = await SubmissionService.getSubmissions(
        filters,
        parseInt(page || '1'),
        parseInt(limit || '10')
      );

      return this.sendSuccess(
        res,
        { submissions: result.items },
        'Submissions retrieved successfully',
        200,
        { total: result.total, page: result.page, totalPages: result.totalPages }
      );
    } catch (error) {
      return this.sendError(res, error.message, 400);
    }
  }
}

module.exports = new SubmissionController();

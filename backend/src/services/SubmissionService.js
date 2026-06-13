const SubmissionRepository = require('../repositories/SubmissionRepository');
const Rating = require('../models/Rating');
const Feedback = require('../models/Feedback');
const TaskRepository = require('../repositories/TaskRepository');
const StreakRepository = require('../repositories/StreakRepository');
const CodingActivity = require('../models/CodingActivity');
const { executeCode } = require('../helpers/codeRunner');
const { badgeQueue } = require('../config/bullmq');
const { getIO } = require('../config/socket');
const logger = require('../config/logger');

class SubmissionService {
  async submitAssignment(studentId, taskId, { fileUrl, githubUrl, submittedCode, language }) {
    const task = await TaskRepository.findById(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    // Check if deadline passed
    if (new Date() > new Date(task.deadline)) {
      throw new Error('Deadline has already passed for this assignment');
    }

    // Check if already submitted
    let submission = await SubmissionRepository.findOne({ student: studentId, task: taskId });

    const data = {
      student: studentId,
      task: taskId,
      fileUrl,
      githubUrl,
      submittedCode,
      language,
      status: 'pending',
    };

    if (submission) {
      submission = await SubmissionRepository.update(submission._id, data);
    } else {
      submission = await SubmissionRepository.create(data);
    }

    // Increment streak on active coding submission
    await StreakRepository.incrementStreak(studentId);

    // Queue badge check in background
    await badgeQueue.add('checkBadges', { studentId });

    // Notify admins via Socket.io
    try {
      const io = getIO();
      io.to('admin-room').emit('student:submission-created', {
        submissionId: submission._id,
        taskId,
        studentId,
      });
      io.to('admin-room').emit('notification:new', {
        title: 'New Assignment Submission! 📝',
        message: `A student submitted work for: "${task.title}".`,
        type: 'info',
      });
    } catch (err) {
      logger.warn('Socket notification failed: %s', err.message);
    }

    return submission;
  }

  // Live execution and compilation test runner for student
  async executePlaygroundTest(studentId, taskId, code, language, customInput) {
    const task = await TaskRepository.findById(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    logger.info(`Running playground compilation for user ${studentId} on task ${taskId} in ${language}`);

    let testCasesToRun = [];
    if (customInput) {
      // If user supplies custom input, run that single input
      testCasesToRun = [{ input: customInput, output: '', isHidden: false }];
    } else {
      // Otherwise run against task test cases (limit to first 3 to prevent execution bloat)
      testCasesToRun = task.testCases || [];
    }

    const testResults = [];
    let passedCount = 0;
    let totalTime = 0;
    let totalMemory = 0;
    let executionStatus = 'success';

    for (let i = 0; i < testCasesToRun.length; i++) {
      const tc = testCasesToRun[i];
      try {
        const runRes = await executeCode(code, language, tc.input);
        
        totalTime += runRes.executionTime || 0;
        totalMemory = Math.max(totalMemory, runRes.memoryUsage || 0);

        if (runRes.status === 'error') {
          executionStatus = runRes.error.includes('Time Limit') ? 'runtime_error' : 'compile_error';
          testResults.push({
            index: i,
            input: tc.input,
            expected: tc.output,
            actual: '',
            error: runRes.error,
            passed: false,
          });
        } else {
          // Compare outputs (trim trailing whitespace)
          const actualClean = runRes.output.trim();
          const expectedClean = tc.output.trim();
          const passed = customInput ? true : actualClean === expectedClean;
          
          if (passed) passedCount++;

          testResults.push({
            index: i,
            input: tc.input,
            expected: tc.output,
            actual: runRes.output,
            passed,
            analysis: runRes.analysis, // Static complexity analysis details
          });
        }
      } catch (runErr) {
        executionStatus = 'runtime_error';
        testResults.push({
          index: i,
          input: tc.input,
          expected: tc.output,
          actual: '',
          error: runErr.message,
          passed: false,
        });
      }
    }

    const successRate = testCasesToRun.length > 0 ? (passedCount / testCasesToRun.length) * 100 : 100;

    // Log this activity
    const activity = await CodingActivity.create({
      student: studentId,
      language,
      executionTime: totalTime,
      memoryUsage: totalMemory,
      status: executionStatus,
      code,
    });

    // Extract AST hints from last run analysis
    const lastAnalysis = testResults[testResults.length - 1]?.analysis || {
      complexityHint: 'Estimated Time Complexity: O(1)',
      optimizationSuggestions: ['Keep code clean.'],
      codingWeakness: [],
    };

    // Auto-update student streak for coding actively
    await StreakRepository.incrementStreak(studentId);

    // Queue badge check in background
    await badgeQueue.add('checkBadges', { studentId });

    return {
      success: executionStatus === 'success',
      successRate,
      testResults,
      activityId: activity._id,
      ...lastAnalysis,
    };
  }

  async rateSubmission(submissionId, score, comment, evaluatorId) {
    const submission = await SubmissionRepository.findById(submissionId);
    if (!submission) {
      throw new Error('Submission not found');
    }

    // Create Rating and Feedback
    const rating = await Rating.create({
      score,
      submission: submissionId,
      evaluator: evaluatorId,
    });

    const feedback = await Feedback.create({
      comment,
      submission: submissionId,
      evaluator: evaluatorId,
    });

    // Update submission references
    submission.status = 'reviewed';
    submission.rating = rating._id;
    submission.feedback = feedback._id;
    await submission.save();

    // Notify student via Socket
    try {
      const io = getIO();
      io.to(`student:${submission.student}`).emit('notification:new', {
        title: 'Assignment Reviewed! ⭐',
        message: `Your submission for task has been reviewed with a rating of ${score}/5.`,
        type: 'success',
      });
    } catch (err) {
      logger.warn('Socket notification failed for reviewed rating: %s', err.message);
    }

    return submission;
  }

  async getSubmissions(filters, page, limit) {
    return SubmissionRepository.findDetailed(filters, page, limit);
  }
}

module.exports = new SubmissionService();

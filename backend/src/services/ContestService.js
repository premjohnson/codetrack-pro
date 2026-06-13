const ContestRepository = require('../repositories/ContestRepository');
const ContestSubmission = require('../models/ContestSubmission');
const TaskRepository = require('../repositories/TaskRepository');
const { executeCode } = require('../helpers/codeRunner');
const { getIO } = require('../config/socket');
const logger = require('../config/logger');

class ContestService {
  async createContest(data, adminId) {
    const contest = await ContestRepository.create({
      ...data,
      createdBy: adminId,
    });

    // Notify students via Socket
    try {
      const io = getIO();
      io.to('students-room').emit('notification:new', {
        title: 'New Coding Contest! 🏆',
        message: `Join the contest "${contest.title}" starting at ${new Date(contest.startTime).toLocaleString()}`,
        type: 'contest',
        link: `/student/contests/${contest._id}`,
      });
    } catch (err) {
      logger.warn('Socket emit failed for contest: %s', err.message);
    }

    return contest;
  }

  async getContests() {
    const active = await ContestRepository.findActive();
    const upcoming = await ContestRepository.findUpcoming();
    const past = await ContestRepository.findPast();
    return { active, upcoming, past };
  }

  async getContestById(id) {
    const contest = await ContestRepository.findById(id, 'problems');
    if (!contest) {
      throw new Error('Contest not found');
    }
    return contest;
  }

  async submitContestSolution(studentId, contestId, problemId, code, language) {
    const contest = await ContestRepository.findById(contestId);
    if (!contest) throw new Error('Contest not found');

    const now = new Date();
    if (now < new Date(contest.startTime) || now > new Date(contest.endTime)) {
      throw new Error('Contest is not active');
    }

    const problem = await TaskRepository.findById(problemId);
    if (!problem) throw new Error('Problem not found');

    // Run code against test cases
    let passedCount = 0;
    let totalTime = 0;
    let totalMemory = 0;
    let executionStatus = 'accepted';
    const testCases = problem.testCases || [];

    for (const tc of testCases) {
      try {
        const runRes = await executeCode(code, language, tc.input);
        totalTime += runRes.executionTime || 0;
        totalMemory = Math.max(totalMemory, runRes.memoryUsage || 0);

        if (runRes.status === 'error') {
          if (runRes.error.includes('Time Limit')) {
            executionStatus = 'time_limit_exceeded';
          } else {
            executionStatus = 'compile_error';
          }
          break;
        } else {
          if (runRes.output.trim() === tc.output.trim()) {
            passedCount++;
          } else {
            executionStatus = 'rejected';
            break;
          }
        }
      } catch (err) {
        executionStatus = 'runtime_error';
        break;
      }
    }

    const maxScore = 100;
    const score = testCases.length > 0 ? Math.round((passedCount / testCases.length) * maxScore) : maxScore;

    const submission = await ContestSubmission.create({
      contest: contestId,
      problem: problemId,
      student: studentId,
      submittedCode: code,
      language,
      status: executionStatus,
      executionTime: totalTime,
      memoryUsage: totalMemory,
      score,
    });

    // Notify contest channels via Socket
    try {
      const io = getIO();
      io.to(`contest:${contestId}`).emit('contest:rank-updated', {
        studentId,
        contestId,
      });
    } catch (err) {
      logger.warn('Socket ranking notification failed: %s', err.message);
    }

    return submission;
  }

  async getContestLeaderboard(contestId) {
    const submissions = await ContestSubmission.find({ contest: contestId })
      .populate('student', 'name email')
      .populate('problem', 'title');

    // Compute compound scoring: Group by student, sum scores, minimum execution time
    const leaderboardMap = {};

    for (const sub of submissions) {
      const sId = sub.student._id.toString();
      if (!leaderboardMap[sId]) {
        leaderboardMap[sId] = {
          student: sub.student,
          totalScore: 0,
          totalTime: 0,
          problemsSolved: new Set(),
        };
      }

      // Add to unique solved problems if accepted
      if (sub.status === 'accepted') {
        leaderboardMap[sId].problemsSolved.add(sub.problem._id.toString());
      }
      
      // Update max score for this problem
      const pId = sub.problem._id.toString();
      const currentStudentScore = leaderboardMap[sId];
      
      // Let's track problems scores
      if (!currentStudentScore[pId] || sub.score > currentStudentScore[pId]) {
        const diff = sub.score - (currentStudentScore[pId] || 0);
        currentStudentScore.totalScore += diff;
        currentStudentScore[pId] = sub.score;
      }

      currentStudentScore.totalTime += sub.executionTime || 0;
    }

    const leaderboard = Object.values(leaderboardMap).map(item => ({
      student: item.student,
      totalScore: item.totalScore,
      totalTime: item.totalTime,
      solvedCount: item.problemsSolved.size,
    }));

    // Sort by totalScore desc, solvedCount desc, totalTime asc
    return leaderboard.sort((a, b) => {
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
      if (b.solvedCount !== a.solvedCount) return b.solvedCount - a.solvedCount;
      return a.totalTime - b.totalTime;
    });
  }
}

module.exports = new ContestService();

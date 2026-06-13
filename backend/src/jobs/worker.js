const { Worker } = require('bullmq');
const { connection } = require('../config/bullmq');
const { sendMail } = require('../utils/mailer');
const logger = require('../config/logger');
const UserBadge = require('../models/UserBadge');
const Badge = require('../models/Badge');
const Streak = require('../models/Streak');
const Submission = require('../models/Submission');
const { getIO } = require('../config/socket');

// Initialize the workers
const startWorkers = () => {
  logger.info('Starting BullMQ background workers...');

  // 1. OTP Queue Worker
  new Worker('otpQueue', async (job) => {
    const { email, otp, type } = job.data;
    logger.info(`Processing OTP email job for ${email}`);
    
    const subject = type === 'verification' ? 'Verify your CodeTrack Account' : 'Reset your CodeTrack Password';
    const html = `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
        <h2>CodeTrack Platform</h2>
        <p>You requested a code for <strong>${type}</strong>.</p>
        <div style="font-size: 24px; font-weight: bold; background: #f4f4f4; padding: 10px; text-align: center; width: 150px; border-radius: 4px; letter-spacing: 2px;">
          ${otp}
        </div>
        <p>This code is valid for 10 minutes. If you did not make this request, please ignore this email.</p>
      </div>
    `;

    await sendMail({ to: email, subject, html });
  }, { connection });

  // 2. Notification Queue Worker
  new Worker('notificationQueue', async (job) => {
    const { toEmail, subject, content } = job.data;
    logger.info(`Processing Notification email job for ${toEmail}`);
    await sendMail({ to: toEmail, subject, text: content });
  }, { connection });

  // 3. Badge Queue Worker (checks and awards badges)
  new Worker('badgeQueue', async (job) => {
    const { studentId } = job.data;
    logger.info(`Processing Badge verification job for student ${studentId}`);

    try {
      // Fetch user streak and submission statistics
      const streak = await Streak.findOne({ student: studentId });
      const solvedCount = await Submission.countDocuments({ student: studentId, status: 'approved' });
      const currentStreak = streak ? streak.currentStreak : 0;

      // Fetch all badges
      const badges = await Badge.find({});

      for (const badge of badges) {
        const hasBadge = await UserBadge.findOne({ student: studentId, badge: badge._id });
        if (hasBadge) continue;

        // Check criteria
        const streakReq = badge.criteria.streakRequired || 0;
        const tasksReq = badge.criteria.tasksRequired || 0;

        if (currentStreak >= streakReq && solvedCount >= tasksReq) {
          // Award badge
          await UserBadge.create({ student: studentId, badge: badge._id });
          logger.info(`Student ${studentId} awarded badge: ${badge.name}`);

          // Emit Socket.io real-time event
          try {
            const io = getIO();
            io.to(`student:${studentId}`).emit('student:badge-earned', {
              badgeName: badge.name,
              description: badge.description,
            });
            io.to(`student:${studentId}`).emit('notification:new', {
              title: 'New Badge Earned! 🏆',
              message: `Congratulations! You've earned the ${badge.name} badge.`,
              type: 'badge',
            });
          } catch (sockErr) {
            logger.warn('Socket emit failed for badge: %s', sockErr.message);
          }
        }
      }
    } catch (err) {
      logger.error('Failed to process badge job: %s', err.message);
    }
  }, { connection });

  // 4. Reports Queue Worker (dummy monthly aggregator)
  new Worker('reportsQueue', async (job) => {
    logger.info('Processing Monthly report aggregation...');
    // We could compile all submissions/activities and email them to Admin
  }, { connection });

  // 5. Cleanup Queue Worker (stale sessions or old OTP cleanups)
  new Worker('cleanupQueue', async (job) => {
    logger.info('Running database cleanups...');
    // e.g. delete expired sessions from collection
  }, { connection });
};

module.exports = {
  startWorkers,
};

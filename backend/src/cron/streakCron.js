const cron = require('node-cron');
const Streak = require('../models/Streak');
const logger = require('../config/logger');

const initStreakCron = () => {
  // Run every night at midnight: 0 0 * * *
  cron.schedule('0 0 * * *', async () => {
    logger.info('Running Daily Streak Evaluation Cron...');
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      // Fetch all streaks where lastActivityDate is older than yesterday
      // representing a missed consecutive day
      const streaks = await Streak.find({
        lastActivityDate: { $lt: yesterday }
      });

      let resetCount = 0;
      for (const streak of streaks) {
        if (streak.currentStreak > 0) {
          streak.currentStreak = 0;
          await streak.save();
          resetCount++;
        }
      }

      logger.info(`Daily Streak Evaluation completed. Reset ${resetCount} broken streaks.`);
    } catch (error) {
      logger.error('Error occurred during daily streak cron execution: %s', error.message);
    }
  });
};

module.exports = initStreakCron;

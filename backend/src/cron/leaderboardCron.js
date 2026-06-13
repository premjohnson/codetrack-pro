const cron = require('node-cron');
const LeaderboardService = require('../services/LeaderboardService');
const logger = require('../config/logger');

const initLeaderboardCron = () => {
  // Run every hour: 0 * * * *
  cron.schedule('0 * * * *', async () => {
    logger.info('Running Hourly Leaderboard Computation Cron...');
    try {
      await LeaderboardService.computeLeaderboard();
      logger.info('Hourly Leaderboard computation successfully completed.');
    } catch (error) {
      logger.error('Error occurred during hourly leaderboard cron execution: %s', error.message);
    }
  });
};

module.exports = initLeaderboardCron;

require('dotenv').config();
const validateEnvironment = require('./utils/startupValidator');

// 1. Run Startup Environment Validation first
validateEnvironment();

const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const { connectRedis } = require('./config/redis');
const seedData = require('./config/seeder');
const { initSocket } = require('./config/socket');
const { startWorkers } = require('./jobs/worker');
const initStreakCron = require('./cron/streakCron');
const initLeaderboardCron = require('./cron/leaderboardCron');
const { findAvailablePort } = require('./utils/port');
const logger = require('./config/logger');

const startServer = async () => {
  try {
    const requestedPort = process.env.PORT || 5000;
    
    // 2. Port Collision Protection
    const availablePort = await findAvailablePort(requestedPort);
    if (availablePort !== parseInt(requestedPort, 10)) {
      logger.warn(`Port ${requestedPort} busy. Using ${availablePort} instead.`);
    }

    // 3. Database and Redis Connections
    await connectDB();
    await connectRedis();

    // 4. Database seeding
    await seedData();

    // 5. Create HTTP Server
    const server = http.createServer(app);

    // 6. Initialize Socket.io
    initSocket(server);

    // 7. Initialize Background Queue Workers
    startWorkers();

    // 8. Initialize Cron Schedules
    initStreakCron();
    initLeaderboardCron();

    // 9. Start listening on available port
    server.listen(availablePort, () => {
      // Print beautiful Winston startup summary
      logger.info('\n' + [
        '====================================',
        'CodeTrack Backend Started',
        '====================================',
        `Environment: ${process.env.NODE_ENV || 'development'}`,
        `Port: ${availablePort}`,
        'MongoDB: Connected',
        'Redis: Connected',
        'Socket.io: Running',
        'BullMQ: Running',
        '===================================='
      ].join('\n'));
    });

    // Handle process termination gracefully
    process.on('SIGTERM', () => {
      logger.warn('SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
      });
    });

  } catch (error) {
    logger.error('Fatal Server Boot Error: %s', error.message);
    process.exit(1);
  }
};

startServer();

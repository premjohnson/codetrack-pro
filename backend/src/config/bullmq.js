const { Queue } = require('bullmq');
const { redis } = require('./redis');

// Instantiate BullMQ Queues utilizing the shared Redis singleton connection
const otpQueue = new Queue('otpQueue', { connection: redis });
const notificationQueue = new Queue('notificationQueue', { connection: redis });
const badgeQueue = new Queue('badgeQueue', { connection: redis });
const reportsQueue = new Queue('reportsQueue', { connection: redis });
const cleanupQueue = new Queue('cleanupQueue', { connection: redis });

module.exports = {
  connection: redis,
  otpQueue,
  notificationQueue,
  badgeQueue,
  reportsQueue,
  cleanupQueue,
};

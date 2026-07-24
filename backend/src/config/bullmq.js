const { Queue } = require('bullmq');
const { redis } = require('./redis');

//bullMq otp
const otpQueue = new Queue('otpQueue', { connection: redis });
//notif
const notificationQueue = new Queue('notificationQueue', { connection: redis });
//badge
const badgeQueue = new Queue('badgeQueue', { connection: redis });
//report
const reportsQueue = new Queue('reportsQueue', { connection: redis });
//cleanq
const cleanupQueue = new Queue('cleanupQueue', { connection: redis });

module.exports = {
  connection: redis,
  otpQueue,
  notificationQueue,
  badgeQueue,
  reportsQueue,
  cleanupQueue,
};

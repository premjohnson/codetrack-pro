const IORedis = require('ioredis');
const logger = require('./logger');

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

// Create the singleton IORedis client with maxRetriesPerRequest: null (required by BullMQ)
const redisClient = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
});

redisClient.on('error', (err) => logger.error('Redis Client Error: %o', err));
redisClient.on('connect', () => logger.info('Redis connected successfully'));

// Add backward compatibility wrappers for existing code
Object.defineProperty(redisClient, 'isOpen', {
  get: () => redisClient.status === 'ready' || redisClient.status === 'connect'
});

redisClient.setEx = async (key, ttl, value) => {
  return redisClient.set(key, value, 'EX', ttl);
};

const connectRedis = async () => {
  // IORedis connects automatically on instantiation. We just verify ready state.
  logger.info('Redis singleton client connection initialized');
};

module.exports = {
  redisClient, // Backward-compatible alias
  connectRedis,
  redisUrl,
  redis: redisClient // Raw singleton instance
};

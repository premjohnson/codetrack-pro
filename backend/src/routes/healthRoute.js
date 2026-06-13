const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { redisClient } = require('../config/redis');

router.get('/', async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED';
  const redisStatus = redisClient.isOpen ? 'CONNECTED' : 'DISCONNECTED';

  res.status(200).json({
    success: true,
    status: 'UP',
    database: dbStatus,
    redis: redisStatus,
    uptime: Math.round(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
  });
});

module.exports = router;

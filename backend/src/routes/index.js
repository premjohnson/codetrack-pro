const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const taskRoutes = require('./taskRoutes');
const submissionRoutes = require('./submissionRoutes');
const contestRoutes = require('./contestRoutes');
const syllabusRoutes = require('./syllabusRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const healthRoute = require('./healthRoute');

// Mount routes
router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes);
router.use('/submissions', submissionRoutes);
router.use('/contests', contestRoutes);
router.use('/syllabi', syllabusRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/health', healthRoute);

module.exports = router;

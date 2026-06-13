const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/DashboardController');
const { authenticate } = require('../middleware/auth');
const authorize = require('../middleware/rbac');
const auditLog = require('../middleware/audit');

router.get('/student', authenticate, DashboardController.getStudentDashboard);

router.get('/admin', authenticate, authorize('admin'), DashboardController.getAdminDashboard);
router.get('/admin/students', authenticate, authorize('admin'), DashboardController.getStudentsList);
router.put('/admin/students/:id/status', authenticate, authorize('admin'), auditLog('MANAGE_STUDENT_STATUS'), DashboardController.manageStudentStatus);

module.exports = router;

const express = require('express');
const router = express.Router();
const SubmissionController = require('../controllers/SubmissionController');
const { rateSubmissionRules, submitCodeRules } = require('../validators/submissionValidator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const authorize = require('../middleware/rbac');
const upload = require('../middleware/upload');
const auditLog = require('../middleware/audit');
const { playgroundLimiter } = require('../middleware/rateLimiter');

// Submit assignment zip/pdf/source code
router.post('/', authenticate, upload.single('file'), auditLog('SUBMIT_ASSIGNMENT'), SubmissionController.submitAssignment);

// Run code inside Monaco editor playground (throttled)
router.post('/run', authenticate, playgroundLimiter, submitCodeRules, validate, SubmissionController.runPlaygroundCode);

// Grade and write feedback (Admin only)
router.post('/:id/rate', authenticate, authorize('admin'), rateSubmissionRules, validate, auditLog('RATE_SUBMISSION'), SubmissionController.rateSubmission);

// List submissions
router.get('/', authenticate, SubmissionController.getSubmissions);

module.exports = router;

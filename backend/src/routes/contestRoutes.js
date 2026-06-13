const express = require('express');
const router = express.Router();
const ContestController = require('../controllers/ContestController');
const { createContestRules } = require('../validators/contestValidator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const authorize = require('../middleware/rbac');
const auditLog = require('../middleware/audit');

router.get('/', authenticate, ContestController.getContests);
router.get('/:id', authenticate, ContestController.getContestById);

router.post('/', authenticate, authorize('admin'), createContestRules, validate, auditLog('CREATE_CONTEST'), ContestController.createContest);
router.post('/:id/submit', authenticate, auditLog('SUBMIT_CONTEST_SOLUTION'), ContestController.submitSolution);
router.get('/:id/leaderboard', authenticate, ContestController.getLeaderboard);

module.exports = router;

const express = require('express');
const router = express.Router();
const TaskController = require('../controllers/TaskController');
const { createTaskRules, updateTaskRules } = require('../validators/taskValidator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const authorize = require('../middleware/rbac');
const auditLog = require('../middleware/audit');

// Public categories
router.get('/categories', authenticate, TaskController.getCategories);
router.post('/categories', authenticate, authorize('admin'), auditLog('CREATE_CATEGORY'), TaskController.createCategory);

// Tasks CRUD
router.get('/', authenticate, TaskController.getTasks);
router.get('/:id', authenticate, TaskController.getTaskById);

router.post('/', authenticate, authorize('admin'), createTaskRules, validate, auditLog('CREATE_TASK'), TaskController.createTask);
router.put('/:id', authenticate, authorize('admin'), updateTaskRules, validate, auditLog('UPDATE_TASK'), TaskController.updateTask);
router.delete('/:id', authenticate, authorize('admin'), auditLog('DELETE_TASK'), TaskController.deleteTask);

module.exports = router;

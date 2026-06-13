const express = require('express');
const router = express.Router();
const SyllabusController = require('../controllers/SyllabusController');
const { authenticate } = require('../middleware/auth');
const authorize = require('../middleware/rbac');
const auditLog = require('../middleware/audit');
const multer = require('multer');

// Memory storage for small PDF streaming
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

router.get('/', authenticate, SyllabusController.getSyllabi);

router.post('/', authenticate, authorize('admin'), upload.single('file'), auditLog('UPLOAD_SYLLABUS'), SyllabusController.uploadSyllabus);
router.delete('/:id', authenticate, authorize('admin'), auditLog('DELETE_SYLLABUS'), SyllabusController.deleteSyllabus);

module.exports = router;

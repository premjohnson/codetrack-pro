const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const { signupRules, loginRules, requestOTPRules, verifyOTPRules, resetPasswordRules } = require('../validators/authValidator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const auditLog = require('../middleware/audit');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/signup', authLimiter, signupRules, validate, AuthController.register);
router.post('/login', authLimiter, loginRules, validate, auditLog('LOGIN'), AuthController.login);
router.post('/logout', authenticate, auditLog('LOGOUT'), AuthController.logout);
router.get('/me', authenticate, AuthController.me);

router.post('/otp/request', authLimiter, requestOTPRules, validate, AuthController.requestOTP);
router.post('/otp/verify', authLimiter, verifyOTPRules, validate, AuthController.verifyOTP);
router.post('/password-reset', authLimiter, resetPasswordRules, validate, auditLog('PASSWORD_RESET'), AuthController.resetPassword);

module.exports = router;

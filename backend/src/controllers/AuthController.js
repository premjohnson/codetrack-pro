const BaseController = require('./BaseController');
const AuthService = require('../services/AuthService');
const { setTokenCookies, clearTokenCookies } = require('../middleware/auth');

class AuthController extends BaseController {
  async register(req, res, next) {
    try {
      const { name, email, password } = req.body;
      const { user, accessToken, refreshToken } = await AuthService.register(name, email, password);
      
      setTokenCookies(res, accessToken, refreshToken);

      return this.sendSuccess(res, { user }, 'Registered and logged in successfully.', 201);
    } catch (error) {
      return this.sendError(res, error.message, 400);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];

      const { user, accessToken, refreshToken } = await AuthService.login(email, password, ipAddress, userAgent);

      setTokenCookies(res, accessToken, refreshToken);

      return this.sendSuccess(res, { user }, 'Logged in successfully');
    } catch (error) {
      return this.sendError(res, error.message, 400);
    }
  }

  async requestOTP(req, res, next) {
    try {
      const { email, type } = req.body;
      const result = await AuthService.requestOTP(email, type);
      return this.sendSuccess(res, result, 'OTP sent successfully');
    } catch (error) {
      return this.sendError(res, error.message, 400);
    }
  }

  async verifyOTP(req, res, next) {
    try {
      const { email, otp, type } = req.body;
      const result = await AuthService.verifyOTP(email, otp, type);
      return this.sendSuccess(res, result, 'OTP verified successfully');
    } catch (error) {
      return this.sendError(res, error.message, 400);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { email, otp, newPassword } = req.body;
      const result = await AuthService.resetPassword(email, otp, newPassword);
      return this.sendSuccess(res, result, 'Password reset successfully');
    } catch (error) {
      return this.sendError(res, error.message, 400);
    }
  }

  async logout(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      if (refreshToken) {
        await AuthService.logout(refreshToken);
      }
      clearTokenCookies(res);
      return this.sendSuccess(res, {}, 'Logged out successfully');
    } catch (error) {
      return this.sendError(res, error.message, 400);
    }
  }

  async me(req, res, next) {
    try {
      const user = req.user;
      return this.sendSuccess(res, {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
        }
      }, 'Authenticated user profile retrieved');
    } catch (error) {
      return this.sendError(res, error.message, 401);
    }
  }
}

module.exports = new AuthController();

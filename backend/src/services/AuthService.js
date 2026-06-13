const UserRepository = require('../repositories/UserRepository');
const OTPRepository = require('../repositories/OTPRepository');
const Session = require('../models/Session');
const { generateAccessToken, generateRefreshToken } = require('../middleware/auth');
const { otpQueue } = require('../config/bullmq');
const logger = require('../config/logger');

class AuthService {
  async register(name, email, password) {
    const existing = await UserRepository.findByEmail(email);
    if (existing) {
      throw new Error('User with this email already exists');
    }

    const user = await UserRepository.create({ name, email, password, isVerified: true });
    
    // Generate verification OTP and push to BullMQ queue
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await OTPRepository.create({
      email: user.email,
      otp: otpCode,
      type: 'verification',
      expiresAt,
    });

    try {
      await otpQueue.add('sendOtpEmail', {
        email: user.email,
        otp: otpCode,
        type: 'verification',
      });
      logger.info(`Verification OTP job queued for new user ${email}`);
    } catch (err) {
      logger.warn(`Failed to queue OTP email for new user: ${err.message}`);
    }

    // Create session tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Persist refresh token to Session collection
    const sessionExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await Session.create({
      userId: user._id,
      token: refreshToken,
      expiresAt: sessionExpiresAt,
    });

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
      accessToken,
      refreshToken,
      message: 'Registration successful.',
    };
  }

  async login(email, password, ipAddress, userAgent) {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check lock status
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const waitMins = Math.ceil((user.lockUntil - Date.now()) / 60000);
      throw new Error(`Account locked. Try again in ${waitMins} minutes.`);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const updatedUser = await UserRepository.incrementLoginAttempts(user);
      if (updatedUser.lockUntil && updatedUser.lockUntil > Date.now()) {
        throw new Error('Account locked due to 5 failed login attempts. Try again in 1 hour.');
      }
      throw new Error('Invalid email or password');
    }

    // Reset attempts on successful login
    await UserRepository.resetLoginAttempts(user._id);

    // Create session tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Persist refresh token to Session collection
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await Session.create({
      userId: user._id,
      token: refreshToken,
      ipAddress,
      userAgent,
      expiresAt,
    });

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
      accessToken,
      refreshToken,
    };
  }

  async requestOTP(email, type) {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    // Generate code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Clear old codes
    await OTPRepository.deleteOTP(email, type);

    await OTPRepository.create({
      email: user.email,
      otp: otpCode,
      type,
      expiresAt,
    });

    await otpQueue.add('sendOtpEmail', {
      email: user.email,
      otp: otpCode,
      type,
    });

    logger.info(`Requested ${type} OTP queued for ${email}`);
    return { message: 'OTP sent successfully.' };
  }

  async verifyOTP(email, otp, type) {
    const validOTP = await OTPRepository.findLatestValidOTP(email, type);
    if (!validOTP || validOTP.otp !== otp) {
      throw new Error('Invalid or expired OTP');
    }

    // Consume OTP
    await OTPRepository.deleteOTP(email, type);

    if (type === 'verification') {
      const user = await UserRepository.findByEmail(email);
      user.isVerified = true;
      await user.save();
    }

    return { message: 'OTP verified successfully.' };
  }

  async resetPassword(email, otp, newPassword) {
    // Check OTP
    const validOTP = await OTPRepository.findLatestValidOTP(email, 'reset');
    if (!validOTP || validOTP.otp !== otp) {
      throw new Error('Invalid or expired OTP');
    }

    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    user.password = newPassword; // Will be hashed pre-save
    await user.save();

    await OTPRepository.deleteOTP(email, 'reset');
    logger.info(`Password successfully reset for user ${email}`);

    return { message: 'Password reset successfully.' };
  }

  async logout(refreshToken) {
    await Session.deleteOne({ token: refreshToken });
    return { message: 'Logged out successfully.' };
  }
}

module.exports = new AuthService();

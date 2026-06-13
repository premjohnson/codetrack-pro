const jwt = require('jsonwebtoken');
const UserRepository = require('../repositories/UserRepository');
const Session = require('../models/Session'); // We'll query DB for active session check
const logger = require('../config/logger');

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access_secret_key_123456';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh_secret_key_654321';

// Token helpers
const generateAccessToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
};

const generateRefreshToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
};

const setTokenCookies = (res, accessToken, refreshToken) => {
  const isProd = process.env.NODE_ENV === 'production';
  
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 15 * 60 * 1000, // 15 mins
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

const clearTokenCookies = (res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
};

const authenticate = async (req, res, next) => {
  const { accessToken, refreshToken } = req.cookies;

  if (!accessToken) {
    // If no access token but refresh token exists, attempt rotation
    if (refreshToken) {
      return attemptTokenRotation(req, res, next, refreshToken);
    }
    return res.status(401).json({
      success: false,
      message: 'Authentication required. No tokens provided.',
      data: {},
      meta: {}
    });
  }

  try {
    const decoded = jwt.verify(accessToken, ACCESS_TOKEN_SECRET);
    const user = await UserRepository.findById(decoded.id);

    if (!user || user.status === 'inactive') {
      clearTokenCookies(res);
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive',
        data: {},
        meta: {}
      });
    }

    req.user = user;
    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError' && refreshToken) {
      logger.info('Access token expired, attempting rotation');
      return attemptTokenRotation(req, res, next, refreshToken);
    }
    clearTokenCookies(res);
    return res.status(401).json({
      success: false,
      message: 'Invalid access token',
      data: {},
      meta: {}
    });
  }
};

const attemptTokenRotation = async (req, res, next, refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    
    // Check if session exists in DB (revocation check)
    const activeSession = await Session.findOne({ userId: decoded.id, token: refreshToken });
    if (!activeSession || activeSession.expiresAt < new Date()) {
      clearTokenCookies(res);
      if (activeSession) await Session.deleteOne({ _id: activeSession._id });
      return res.status(401).json({
        success: false,
        message: 'Session revoked or expired',
        data: {},
        meta: {}
      });
    }

    const user = await UserRepository.findById(decoded.id);
    if (!user || user.status === 'inactive') {
      clearTokenCookies(res);
      await Session.deleteOne({ _id: activeSession._id });
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive',
        data: {},
        meta: {}
      });
    }

    // Rotate tokens (Refresh Token Rotation!)
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Update session store
    activeSession.token = newRefreshToken;
    activeSession.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await activeSession.save();

    setTokenCookies(res, newAccessToken, newRefreshToken);

    req.user = user;
    return next();
  } catch (err) {
    clearTokenCookies(res);
    return res.status(401).json({
      success: false,
      message: 'Session expired or invalid refresh token',
      data: {},
      meta: {}
    });
  }
};

module.exports = {
  authenticate,
  generateAccessToken,
  generateRefreshToken,
  setTokenCookies,
  clearTokenCookies,
};

const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');
const { JWT_SECRET } = require('../config/env');

/**
 * Protect routes - verifies JWT bearer token and attaches user to req.user
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    throw ApiError.unauthorized('No authentication token provided.');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Session expired. Please login again.');
    }
    throw ApiError.unauthorized('Invalid authentication token.');
  }

  const user = await User.findById(decoded.id).select('-password');
  if (!user) {
    throw ApiError.unauthorized('User account no longer exists.');
  }

  req.user = user;
  next();
});

module.exports = { protect };

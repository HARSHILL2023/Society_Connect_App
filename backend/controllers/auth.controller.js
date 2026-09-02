const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const User = require('../models/User');
const { generateTokens, verifyRefreshToken } = require('../utils/generateToken');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

/**
 * POST /api/auth/register
 * Public — register a new Member
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password, flatNumber, phone } = req.body;

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw ApiError.conflict('An account with this email already exists.');
  }

  // Generate email verification token
  const emailVerificationToken = crypto.randomBytes(32).toString('hex');
  const emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    flatNumber,
    phone: phone || '',
    role: 'Member',
    emailVerificationToken,
    emailVerificationExpires,
  });

  const { accessToken, refreshToken } = generateTokens(user);

  // Store refresh token in DB
  user.refreshToken = refreshToken;
  user.refreshTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  await user.save();

  const userPayload = user.toJSON();

  return ApiResponse.created(res, 'Registration successful. Please verify your email.', {
    token: accessToken,
    accessToken,
    refreshToken,
    user: userPayload,
  });
});

/**
 * POST /api/auth/login
 * Public — login user & return JWT tokens
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password.');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw ApiError.unauthorized('Invalid email or password.');
  }

  const { accessToken, refreshToken } = generateTokens(user);

  // Store refresh token in DB
  user.refreshToken = refreshToken;
  user.refreshTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  await user.save();

  const userPayload = user.toJSON();

  return ApiResponse.ok(res, 'Login successful.', {
    token: accessToken,
    accessToken,
    refreshToken,
    user: userPayload,
  });
});

/**
 * POST /api/auth/refresh
 * Public — refresh access token using refresh token
 */
const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw ApiError.badRequest('Refresh token is required.');
  }

  // Verify refresh token
  const decoded = verifyRefreshToken(refreshToken);
  if (!decoded) {
    throw ApiError.unauthorized('Invalid or expired refresh token.');
  }

  // Find user and verify stored refresh token matches
  const user = await User.findById(decoded.id).select('+refreshToken +refreshTokenExpires');
  if (!user || user.refreshToken !== refreshToken) {
    throw ApiError.unauthorized('Invalid refresh token.');
  }

  if (user.refreshTokenExpires && user.refreshTokenExpires < new Date()) {
    throw ApiError.unauthorized('Refresh token has expired. Please login again.');
  }

  // Generate new tokens
  const { accessToken: newAccessToken, refreshToken: newRefreshToken } = generateTokens(user);

  // Update stored refresh token
  user.refreshToken = newRefreshToken;
  user.refreshTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await user.save();

  return ApiResponse.ok(res, 'Token refreshed successfully.', {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  });
});

/**
 * POST /api/auth/logout
 * Protected — logout user (invalidate refresh token)
 */
const logout = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    user.refreshToken = null;
    user.refreshTokenExpires = null;
    await user.save();
  }

  return ApiResponse.ok(res, 'Logged out successfully.');
});

/**
 * GET /api/auth/me
 * Protected — get current authenticated user profile
 */
const getMe = asyncHandler(async (req, res) => {
  return ApiResponse.ok(res, 'Profile retrieved.', req.user);
});

/**
 * PUT /api/auth/profile
 * Protected — update own profile (name, phone)
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) {
    throw ApiError.notFound('User not found.');
  }

  if (name) user.name = name;
  if (phone !== undefined) user.phone = phone;

  await user.save();

  return ApiResponse.ok(res, 'Profile updated successfully.', user);
});

/**
 * POST /api/auth/forgot-password
 * Public — request password reset
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    // Don't reveal if email exists
    return ApiResponse.ok(res, 'If the email exists, a password reset link has been sent.');
  }

  // Generate reset token
  const passwordResetToken = crypto.randomBytes(32).toString('hex');
  const passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour

  user.passwordResetToken = passwordResetToken;
  user.passwordResetExpires = passwordResetExpires;
  await user.save();

  // In production, send email with reset link
  // For now, return token in response (dev only)
  console.log(`Password reset token for ${email}: ${passwordResetToken}`);

  return ApiResponse.ok(res, 'If the email exists, a password reset link has been sent.', {
    // Only in development
    ...(process.env.NODE_ENV === 'development' && { resetToken: passwordResetToken }),
  });
});

/**
 * POST /api/auth/reset-password
 * Public — reset password with token
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    throw ApiError.badRequest('Token and new password are required.');
  }

  if (password.length < 6) {
    throw ApiError.badRequest('Password must be at least 6 characters.');
  }

  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: Date.now() },
  }).select('+password');

  if (!user) {
    throw ApiError.badRequest('Invalid or expired reset token.');
  }

  user.password = password;
  user.passwordResetToken = null;
  user.passwordResetExpires = null;
  // Invalidate all refresh tokens on password reset
  user.refreshToken = null;
  user.refreshTokenExpires = null;
  await user.save();

  return ApiResponse.ok(res, 'Password reset successful. Please login with your new password.');
});

/**
 * GET /api/auth/verify-email
 * Public — verify email with token
 */
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.query;

  if (!token) {
    throw ApiError.badRequest('Verification token is required.');
  }

  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw ApiError.badRequest('Invalid or expired verification token.');
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = null;
  user.emailVerificationExpires = null;
  await user.save();

  return ApiResponse.ok(res, 'Email verified successfully. You can now login.');
});

module.exports = {
  register,
  login,
  refresh,
  logout,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
  verifyEmail,
};
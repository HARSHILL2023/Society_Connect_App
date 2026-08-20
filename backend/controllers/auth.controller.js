const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
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

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    flatNumber,
    phone: phone || '',
    role: 'Member',
  });

  const token = generateToken(user);
  const userPayload = user.toJSON();

  return ApiResponse.created(res, 'Registration successful. Welcome to Society Connect!', {
    token,
    user: userPayload,
  });
});

/**
 * POST /api/auth/login
 * Public — login user & return JWT token
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

  const token = generateToken(user);
  const userPayload = user.toJSON();

  return ApiResponse.ok(res, 'Login successful.', {
    token,
    user: userPayload,
  });
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

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
};

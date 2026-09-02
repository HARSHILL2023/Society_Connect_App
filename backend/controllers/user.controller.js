const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Ticket = require('../models/Ticket');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

/**
 * GET /api/users
 * Admin only — get all registered users
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const { role, search, page = 1, limit = 10 } = req.query;
  const filter = {};

  if (role && role !== 'All') {
    filter.role = role;
  }
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { flatNumber: { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
    User.countDocuments(filter),
  ]);

  return ApiResponse.ok(res, 'Users retrieved successfully.', {
    users,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  });
});

/**
 * GET /api/users/:id
 * Admin only — get user details by id with stats
 */
const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) {
    throw ApiError.notFound('User not found.');
  }

  const ticketCount = await Ticket.countDocuments({ raisedBy: id });

  return ApiResponse.ok(res, 'User retrieved successfully.', {
    user,
    ticketCount,
  });
});

/**
 * POST /api/users
 * Admin only — create user (Admin, Manager, or Member)
 */
const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, flatNumber, phone } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw ApiError.conflict(`An account with email '${email}' already exists.`);
  }

  const userData = {
    name,
    email: email.toLowerCase(),
    password,
    role: role || 'Member',
    phone: phone || '',
  };

  if (role === 'Member') {
    if (!flatNumber) {
      throw ApiError.badRequest('Flat number is required for Member accounts.');
    }
    userData.flatNumber = flatNumber;
  }

  const user = await User.create(userData);

  return ApiResponse.created(res, 'User created successfully.', user);
});

/**
 * PUT /api/users/:id
 * Admin only — update user (without password)
 */
const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, role, flatNumber, phone } = req.body;

  const user = await User.findById(id);
  if (!user) {
    throw ApiError.notFound('User not found.');
  }

  // Check email conflict
  if (email && email.toLowerCase() !== user.email) {
    const conflict = await User.findOne({ email: email.toLowerCase() });
    if (conflict) {
      throw ApiError.conflict(`Email '${email}' is already in use.`);
    }
    user.email = email.toLowerCase();
  }

  if (name) user.name = name;
  if (role) user.role = role;
  if (phone !== undefined) user.phone = phone;

  if (role === 'Member') {
    if (!flatNumber && !user.flatNumber) {
      throw ApiError.badRequest('Flat number is required for Member accounts.');
    }
    if (flatNumber) user.flatNumber = flatNumber;
  } else if (role && role !== 'Member') {
    user.flatNumber = '';
  }

  await user.save();

  const updated = await User.findById(user._id);
  return ApiResponse.ok(res, 'User updated successfully.', updated);
});

/**
 * PUT /api/users/:id/password
 * Admin only — change user password (requires current password verification)
 */
const changeUserPassword = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw ApiError.badRequest('Current password and new password are required.');
  }

  if (newPassword.length < 6) {
    throw ApiError.badRequest('New password must be at least 6 characters.');
  }

  const user = await User.findById(id).select('+password');
  if (!user) {
    throw ApiError.notFound('User not found.');
  }

  // Verify current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw ApiError.unauthorized('Current password is incorrect.');
  }

  // Prevent admin from changing their own password via this endpoint
  if (req.user._id.toString() === id && req.user.role === 'Admin') {
    throw ApiError.badRequest('Admins should use the profile password change endpoint.');
  }

  user.password = newPassword;
  // Invalidate all refresh tokens on password change
  user.refreshToken = null;
  user.refreshTokenExpires = null;
  await user.save();

  return ApiResponse.ok(res, 'Password changed successfully. All sessions invalidated.');
});

/**
 * DELETE /api/users/:id
 * Admin only — delete user
 */
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (req.user._id.toString() === id) {
    throw ApiError.badRequest('You cannot delete your own admin account.');
  }

  const user = await User.findById(id);
  if (!user) {
    throw ApiError.notFound('User not found.');
  }

  if (user.role === 'Admin') {
    throw ApiError.forbidden('Admin accounts cannot be deleted directly.');
  }

  // Also clean up associated tickets if Member
  await Ticket.deleteMany({ raisedBy: id });
  await User.findByIdAndDelete(id);

  return ApiResponse.ok(res, 'User and associated data deleted successfully.', { id });
});

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  changeUserPassword,
  deleteUser,
};

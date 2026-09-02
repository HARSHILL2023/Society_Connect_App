const { body, param, validationResult } = require('express-validator');
const { isValidObjectId } = require('mongoose');
const ApiError = require('../utils/ApiError');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    return next(ApiError.badRequest(messages[0] || 'Validation failed.', messages));
  }
  next();
};

/**
 * Custom validator for MongoDB ObjectId
 */
const validateObjectId = (field = 'id') => [
  param(field)
    .custom((value) => isValidObjectId(value))
    .withMessage(`Invalid ${field} format.`),
  handleValidationErrors,
];

/* ─── Auth Validators ─── */
const validateRegister = [
  body('name')
    .notEmpty().withMessage('Name is required.')
    .isLength({ min: 2, max: 80 }).withMessage('Name must be between 2 and 80 characters.')
    .trim(),
  body('email')
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail(),
  body('flatNumber')
    .notEmpty().withMessage('Flat number is required.')
    .trim(),
  body('password')
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
  handleValidationErrors,
];

const validateLogin = [
  body('email')
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required.'),
  handleValidationErrors,
];

const validateRefresh = [
  body('refreshToken')
    .notEmpty().withMessage('Refresh token is required.'),
  handleValidationErrors,
];

const validateForgotPassword = [
  body('email')
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail(),
  handleValidationErrors,
];

const validateResetPassword = [
  body('token')
    .notEmpty().withMessage('Reset token is required.'),
  body('password')
    .notEmpty().withMessage('New password is required.')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
  handleValidationErrors,
];

/* ─── Ticket Validators ─── */
const validateCreateTicket = [
  body('title')
    .notEmpty().withMessage('Title is required.')
    .isLength({ min: 3, max: 120 }).withMessage('Title must be between 3 and 120 characters.')
    .trim(),
  body('description')
    .notEmpty().withMessage('Description is required.')
    .isLength({ min: 5, max: 2000 }).withMessage('Description must be between 5 and 2000 characters.')
    .trim(),
  body('category')
    .notEmpty().withMessage('Category is required.')
    .isIn(['Plumbing', 'Electrical', 'Security', 'Cleaning', 'Carpentry', 'Elevator', 'Gardening', 'Others'])
    .withMessage('Invalid category selected.'),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High', 'Urgent'])
    .withMessage('Invalid priority.'),
  body('evidenceImage')
    .optional()
    .isString().withMessage('Evidence image must be a string.'),
  body('location')
    .optional()
    .isObject().withMessage('Location must be an object.'),
  body('location.latitude')
    .optional()
    .isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude.'),
  body('location.longitude')
    .optional()
    .isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude.'),
  body('location.address')
    .optional()
    .isString().withMessage('Address must be a string.')
    .isLength({ max: 300 }).withMessage('Address too long.'),
  handleValidationErrors,
];

const validateUpdateStatus = [
  body('status')
    .notEmpty().withMessage('Status is required.')
    .isIn(['Pending', 'In Progress', 'Resolved'])
    .withMessage('Status must be Pending, In Progress, or Resolved.'),
  body('statusNote')
    .optional()
    .trim(),
  handleValidationErrors,
];

const validateAssignTicket = [
  body('assignedTo')
    .notEmpty().withMessage('Assigned manager ID is required.')
    .isMongoId().withMessage('Invalid manager ID format.'),
  handleValidationErrors,
];

/* ─── User Validators ─── */
const validateCreateUser = [
  body('name')
    .notEmpty().withMessage('Name is required.')
    .isLength({ min: 2, max: 80 }).withMessage('Name must be between 2 and 80 characters.')
    .trim(),
  body('email')
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
  body('role')
    .notEmpty().withMessage('Role is required.')
    .isIn(['Admin', 'Manager', 'Member']).withMessage('Role must be Admin, Manager, or Member.'),
  body('flatNumber')
    .if(body('role').equals('Member'))
    .notEmpty().withMessage('Flat number is required for Member accounts.')
    .trim(),
  handleValidationErrors,
];

const validateUpdateUser = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 80 }).withMessage('Name must be between 2 and 80 characters.')
    .trim(),
  body('email')
    .optional()
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail(),
  body('role')
    .optional()
    .isIn(['Admin', 'Manager', 'Member']).withMessage('Role must be Admin, Manager, or Member.'),
  body('flatNumber')
    .if(body('role').equals('Member'))
    .notEmpty().withMessage('Flat number is required for Member accounts.')
    .trim(),
  handleValidationErrors,
];

const validateChangePassword = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required.'),
  body('newPassword')
    .notEmpty().withMessage('New password is required.')
    .isLength({ min: 6 }).withMessage('New password must be at least 6 characters.'),
  handleValidationErrors,
];

module.exports = {
  validateRegister,
  validateLogin,
  validateRefresh,
  validateForgotPassword,
  validateResetPassword,
  validateCreateTicket,
  validateUpdateStatus,
  validateAssignTicket,
  validateCreateUser,
  validateUpdateUser,
  validateChangePassword,
  validateObjectId,
};

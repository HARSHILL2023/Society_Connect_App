const express = require('express');
const {
  register,
  login,
  getMe,
  updateProfile,
} = require('../controllers/auth.controller');
const {
  validateRegister,
  validateLogin,
} = require('../middleware/validation.middleware');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Public
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

// Protected
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;

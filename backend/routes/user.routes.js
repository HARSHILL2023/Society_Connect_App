const express = require('express');
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  changeUserPassword,
  deleteUser,
} = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const {
  validateCreateUser,
  validateUpdateUser,
  validateChangePassword,
  validateObjectId,
} = require('../middleware/validation.middleware');

const router = express.Router();

// All user management routes require Admin role
router.use(protect, requireRole('Admin'));

router.get('/', getAllUsers);
router.get('/:id', validateObjectId('id'), getUserById);
router.post('/', validateCreateUser, createUser);
router.put('/:id', validateObjectId('id'), validateUpdateUser, updateUser);
router.put('/:id/password', validateObjectId('id'), validateChangePassword, changeUserPassword);
router.delete('/:id', validateObjectId('id'), deleteUser);

module.exports = router;

const express = require('express');
const {
  createTicket,
  getMyTickets,
  getAllTickets,
  getTicketById,
  updateTicketStatus,
  deleteTicket,
} = require('../controllers/ticket.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const {
  validateCreateTicket,
  validateUpdateStatus,
} = require('../middleware/validation.middleware');

const router = express.Router();

router.use(protect);

// Member routes
router.post('/', requireRole('Member'), validateCreateTicket, createTicket);
router.get('/my', requireRole('Member'), getMyTickets);

// Manager & Admin routes
router.get('/', requireRole('Manager', 'Admin'), getAllTickets);
router.patch('/:id/status', requireRole('Manager', 'Admin'), validateUpdateStatus, updateTicketStatus);

// Common route (with ownership check in controller)
router.get('/:id', getTicketById);

// Admin only
router.delete('/:id', requireRole('Admin'), deleteTicket);

module.exports = router;

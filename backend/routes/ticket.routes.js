const express = require('express');
const {
  createTicket,
  getMyTickets,
  getAllTickets,
  getTicketById,
  updateTicketStatus,
  assignTicket,
  deleteTicket,
} = require('../controllers/ticket.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const {
  validateCreateTicket,
  validateUpdateStatus,
  validateAssignTicket,
  validateObjectId,
} = require('../middleware/validation.middleware');

const router = express.Router();

router.use(protect);

// Member routes
router.post('/', requireRole('Member'), validateCreateTicket, createTicket);
router.get('/my', requireRole('Member'), getMyTickets);

// Manager & Admin routes
router.get('/', requireRole('Manager', 'Admin'), getAllTickets);
router.patch('/:id/status', requireRole('Manager', 'Admin'), validateObjectId('id'), validateUpdateStatus, updateTicketStatus);
router.patch('/:id/assign', requireRole('Manager', 'Admin'), validateObjectId('id'), validateAssignTicket, assignTicket);

// Common route (with ownership check in controller)
router.get('/:id', validateObjectId('id'), getTicketById);

// Admin only
router.delete('/:id', requireRole('Admin'), validateObjectId('id'), deleteTicket);

module.exports = router;

const asyncHandler = require('express-async-handler');
const Ticket = require('../models/Ticket');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

/**
 * POST /api/tickets
 * Member only — raise a new ticket
 */
const createTicket = asyncHandler(async (req, res) => {
  const { title, description, category, priority } = req.body;

  if (!req.user.flatNumber) {
    throw ApiError.badRequest('Your account does not have a flat number assigned.');
  }

  const ticket = await Ticket.create({
    title,
    description,
    category,
    priority: priority || 'Medium',
    flatNumber: req.user.flatNumber,
    raisedBy: req.user._id,
  });

  const populated = await ticket.populate('raisedBy', 'name email flatNumber phone');

  return ApiResponse.created(res, 'Ticket raised successfully.', populated);
});

/**
 * GET /api/tickets/my
 * Member only — get own tickets
 */
const getMyTickets = asyncHandler(async (req, res) => {
  const { status, category, search } = req.query;
  const filter = { raisedBy: req.user._id };

  if (status && status !== 'All') {
    filter.status = status;
  }
  if (category && category !== 'All') {
    filter.category = category;
  }
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const tickets = await Ticket.find(filter)
    .populate('raisedBy', 'name email flatNumber phone')
    .sort({ createdAt: -1 });

  return ApiResponse.ok(res, 'Tickets retrieved successfully.', tickets);
});

/**
 * GET /api/tickets
 * Manager & Admin — get all tickets in society
 */
const getAllTickets = asyncHandler(async (req, res) => {
  const { status, category, search } = req.query;
  const filter = {};

  if (status && status !== 'All') {
    filter.status = status;
  }
  if (category && category !== 'All') {
    filter.category = category;
  }
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { flatNumber: { $regex: search, $options: 'i' } },
    ];
  }

  const tickets = await Ticket.find(filter)
    .populate('raisedBy', 'name email flatNumber phone')
    .sort({ createdAt: -1 });

  return ApiResponse.ok(res, 'All tickets retrieved successfully.', tickets);
});

/**
 * GET /api/tickets/:id
 * Protected — get single ticket details
 */
const getTicketById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const ticket = await Ticket.findById(id).populate('raisedBy', 'name email flatNumber phone');
  if (!ticket) {
    throw ApiError.notFound('Ticket not found.');
  }

  // If Member, ensure it belongs to them
  if (req.user.role === 'Member' && ticket.raisedBy._id.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('You can only view your own tickets.');
  }

  return ApiResponse.ok(res, 'Ticket details retrieved.', ticket);
});

/**
 * PATCH /api/tickets/:id/status
 * Manager & Admin — update ticket status & note
 */
const updateTicketStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, statusNote } = req.body;

  const ticket = await Ticket.findById(id);
  if (!ticket) {
    throw ApiError.notFound('Ticket not found.');
  }

  ticket.status = status;
  if (statusNote !== undefined) {
    ticket.statusNote = statusNote;
  }
  if (status === 'Resolved') {
    ticket.resolvedAt = new Date();
  } else {
    ticket.resolvedAt = null;
  }

  await ticket.save();

  const updated = await ticket.populate('raisedBy', 'name email flatNumber phone');

  return ApiResponse.ok(res, `Ticket status updated to '${status}'.`, updated);
});

/**
 * DELETE /api/tickets/:id
 * Admin only — delete ticket
 */
const deleteTicket = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const ticket = await Ticket.findById(id);
  if (!ticket) {
    throw ApiError.notFound('Ticket not found.');
  }

  await Ticket.findByIdAndDelete(id);

  return ApiResponse.ok(res, 'Ticket deleted successfully.', { id });
});

module.exports = {
  createTicket,
  getMyTickets,
  getAllTickets,
  getTicketById,
  updateTicketStatus,
  deleteTicket,
};

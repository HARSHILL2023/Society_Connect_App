const asyncHandler = require('express-async-handler');
const Ticket = require('../models/Ticket');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

/**
 * POST /api/tickets
 * Member only — raise a new ticket
 */
const createTicket = asyncHandler(async (req, res) => {
  const { title, description, category, priority, evidenceImage, location } = req.body;

  if (!req.user.flatNumber) {
    throw ApiError.badRequest('Your account does not have a flat number assigned.');
  }

  // Optional evidence: limit base64 size ~2MB string to protect DB
  let safeEvidence = '';
  if (evidenceImage && typeof evidenceImage === 'string') {
    if (evidenceImage.length > 2_500_000) {
      throw ApiError.badRequest('Evidence image is too large. Please use a smaller image.');
    }
    safeEvidence = evidenceImage;
  }

  // Optional location
  let safeLocation = undefined;
  if (location && typeof location === 'object') {
    safeLocation = {
      latitude: typeof location.latitude === 'number' ? location.latitude : null,
      longitude: typeof location.longitude === 'number' ? location.longitude : null,
      address: typeof location.address === 'string' ? location.address.slice(0, 300) : '',
    };
  }

  const ticket = await Ticket.create({
    title,
    description,
    category,
    priority: priority || 'Medium',
    flatNumber: req.user.flatNumber,
    raisedBy: req.user._id,
    evidenceImage: safeEvidence,
    ...(safeLocation ? { location: safeLocation } : {}),
  });

  const populated = await ticket.populate('raisedBy', 'name email flatNumber phone');

  return ApiResponse.created(res, 'Ticket raised successfully.', populated);
});

/**
 * GET /api/tickets/my
 * Member only — get own tickets
 */
const getMyTickets = asyncHandler(async (req, res) => {
  const { status, category, search, page = 1, limit = 10 } = req.query;
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

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [tickets, total] = await Promise.all([
    Ticket.find(filter)
      .populate('raisedBy', 'name email flatNumber phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Ticket.countDocuments(filter),
  ]);

  return ApiResponse.ok(res, 'Tickets retrieved successfully.', {
    tickets,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  });
});

/**
 * GET /api/tickets
 * Manager & Admin — get all tickets in society
 */
const getAllTickets = asyncHandler(async (req, res) => {
  const { status, category, search, page = 1, limit = 10 } = req.query;
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

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [tickets, total] = await Promise.all([
    Ticket.find(filter)
      .populate('raisedBy', 'name email flatNumber phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Ticket.countDocuments(filter),
  ]);

  return ApiResponse.ok(res, 'All tickets retrieved successfully.', {
    tickets,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  });
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
 * PATCH /api/tickets/:id/assign
 * Manager & Admin — assign ticket to a manager
 */
const assignTicket = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { assignedTo } = req.body;

  const ticket = await Ticket.findById(id);
  if (!ticket) {
    throw ApiError.notFound('Ticket not found.');
  }

  // Verify the assigned user exists and is a Manager
  const User = require('../models/User');
  const manager = await User.findById(assignedTo);
  if (!manager) {
    throw ApiError.notFound('Manager not found.');
  }
  if (manager.role !== 'Manager') {
    throw ApiError.badRequest('Can only assign tickets to users with Manager role.');
  }

  ticket.assignedTo = assignedTo;
  // If ticket was Pending, move to In Progress when assigned
  if (ticket.status === 'Pending') {
    ticket.status = 'In Progress';
  }

  await ticket.save();

  const updated = await ticket.populate('raisedBy', 'name email flatNumber phone')
    .populate('assignedTo', 'name email');

  return ApiResponse.ok(res, `Ticket assigned to ${manager.name}.`, updated);
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
  assignTicket,
  deleteTicket,
};

const asyncHandler = require('express-async-handler');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const ApiResponse = require('../utils/ApiResponse');

/**
 * GET /api/admin/metrics
 * Admin only — system summary metrics & analytics
 */
const getMetrics = asyncHandler(async (req, res) => {
  const [
    totalTickets,
    resolvedTickets,
    inProgressTickets,
    pendingTickets,
    activeMembers,
    totalManagers,
    totalAdmins,
    recentTickets,
  ] = await Promise.all([
    Ticket.countDocuments({}),
    Ticket.countDocuments({ status: 'Resolved' }),
    Ticket.countDocuments({ status: 'In Progress' }),
    Ticket.countDocuments({ status: 'Pending' }),
    User.countDocuments({ role: 'Member' }),
    User.countDocuments({ role: 'Manager' }),
    User.countDocuments({ role: 'Admin' }),
    Ticket.find({})
      .populate('raisedBy', 'name email flatNumber')
      .sort({ createdAt: -1 })
      .limit(5),
  ]);

  // Category breakdown
  const categoryStats = await Ticket.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  return ApiResponse.ok(res, 'System metrics retrieved.', {
    totalTickets,
    resolvedTickets,
    unresolvedTickets: inProgressTickets + pendingTickets,
    inProgressTickets,
    pendingTickets,
    activeMembers,
    totalManagers,
    totalAdmins,
    recentTickets,
    categoryStats,
  });
});

module.exports = { getMetrics };

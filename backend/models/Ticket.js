const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Ticket title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [120, 'Title must not exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Ticket description is required'],
      trim: true,
      minlength: [5, 'Description must be at least 5 characters'],
      maxlength: [2000, 'Description must not exceed 2000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['Plumbing', 'Electrical', 'Security', 'Cleaning', 'Carpentry', 'Elevator', 'Gardening', 'Others'],
        message: 'Invalid ticket category selected',
      },
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
    },
    flatNumber: {
      type: String,
      required: [true, 'Flat number is required'],
      trim: true,
    },
    raisedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Ticket must be associated with a user'],
    },
    status: {
      type: String,
      enum: {
        values: ['Pending', 'In Progress', 'Resolved'],
        message: 'Status must be Pending, In Progress, or Resolved',
      },
      default: 'Pending',
    },
    statusNote: {
      type: String,
      trim: true,
      default: '',
    },
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
ticketSchema.index({ raisedBy: 1, status: 1 });
ticketSchema.index({ status: 1 });
ticketSchema.index({ createdAt: -1 });

// Transform output: format id, clean internals
ticketSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const Ticket = mongoose.model('Ticket', ticketSchema);
module.exports = Ticket;

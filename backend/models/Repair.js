const mongoose = require('mongoose');

const repairSchema = new mongoose.Schema({
  ticketNumber: {
    type: String,
    unique: true,
    sparse: true,
  },
  printerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Printer',
    required: [true, 'Printer is required'],
  },
  printerName: {
    type: String,
    required: [true, 'Printer name is required'],
    trim: true,
  },
  printerNumber: {
    type: String,
    required: [true, 'Printer number is required'],
    trim: true,
  },
  repairDate: {
    type: Date,
    required: [true, 'Repair date is required'],
    default: Date.now,
  },
  technicianName: {
    type: String,
    required: [true, 'Technician name is required'],
    trim: true,
  },
  technicianEmail: {
    type: String,
    trim: true,
    lowercase: true,
  },
  technicianId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Technician',
  },
  problemDescription: {
    type: String,
    required: [true, 'Problem description is required'],
    trim: true,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
  },
  dueDate: {
    type: Date,
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  estimatedRepairTime: {
    type: Number,
    default: 0,
  },
  assignedAt: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'cancelled'],
    default: 'pending',
  },
  startTime: {
    type: Date,
    default: null,
  },
  endTime: {
    type: Date,
    default: null,
  },
  totalHours: {
    type: Number,
    default: 0,
  },
  completionReport: {
    actionsPerformed: { type: String, trim: true },
    rootCause: { type: String, trim: true },
    sparePartsUsed: [{ partName: String, quantity: Number, partNumber: String }],
    timeTaken: { type: Number, default: 0 },
    images: [{ type: String }],
    additionalNotes: { type: String, trim: true },
    submittedAt: { type: Date },
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending',
  },
  verifiedAt: { type: Date },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  emailSent: { type: Boolean, default: false },
  notifiedDueSoon: { type: Boolean, default: false },
  notifiedOverdue: { type: Boolean, default: false },
}, { timestamps: true });

repairSchema.index({ status: 1, dueDate: 1 });
repairSchema.index({ technicianEmail: 1, status: 1 });

module.exports = mongoose.model('Repair', repairSchema);

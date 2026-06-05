const mongoose = require('mongoose');

const repairSchema = new mongoose.Schema({
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
  problemDescription: {
    type: String,
    required: [true, 'Problem description is required'],
    trim: true,
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
}, { timestamps: true });

module.exports = mongoose.model('Repair', repairSchema);

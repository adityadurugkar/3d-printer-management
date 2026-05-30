const mongoose = require('mongoose');

const sparePartSchema = new mongoose.Schema({
  partName: {
    type: String,
    required: [true, 'Part name is required'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Nozzle', 'Hotend', 'Extruder', 'Belt', 'Build Plate', 'Fan', 'PTFE Tube', 'Sensor', 'Motor', 'Other'],
    default: 'Other',
  },
  compatiblePrinterType: {
    type: String,
    enum: ['A1', 'P1S', 'Anycubic', 'All'],
    default: 'All',
  },
  partNumber: {
    type: String,
    trim: true,
  },
  supplierName: {
    type: String,
    trim: true,
  },
  supplierLink: {
    type: String,
    trim: true,
  },
  currentStock: {
    type: Number,
    required: [true, 'Current stock is required'],
    min: 0,
    default: 0,
  },
  minimumStock: {
    type: Number,
    required: [true, 'Minimum stock level is required'],
    min: 0,
    default: 5,
  },
  unit: {
    type: String,
    trim: true,
    default: 'pcs',
  },
  description: {
    type: String,
    trim: true,
  },
  dateAdded: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

sparePartSchema.virtual('stockStatus').get(function () {
  if (this.currentStock <= 0) return 'out-of-stock';
  if (this.currentStock <= this.minimumStock) return 'low-stock';
  return 'in-stock';
});

sparePartSchema.set('toJSON', { virtuals: true });
sparePartSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('SparePart', sparePartSchema);

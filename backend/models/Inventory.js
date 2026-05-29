const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  partName: {
    type: String,
    required: [true, 'Part name is required'],
    trim: true,
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: 0,
    default: 0,
  },
  compatiblePrinters: [{
    type: String,
    trim: true,
  }],
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0,
  },
  supplier: {
    type: String,
    trim: true,
    required: [true, 'Supplier is required'],
  },
}, { timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema);

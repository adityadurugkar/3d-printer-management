const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      'printer_added',
      'printer_updated',
      'repair_created',
      'repair_completed',
      'low_inventory',
      'technician_assigned',
    ],
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  resourceId: { type: String },
  resourceModel: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);

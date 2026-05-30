const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  companyName: {
    type: String,
    default: 'PHN 3D Printer Management System',
  },
  address: {
    type: String,
    default: '',
  },
  phone: {
    type: String,
    default: '',
  },
  email: {
    type: String,
    default: '',
  },
  website: {
    type: String,
    default: '',
  },
  taxId: {
    type: String,
    default: '',
  },
  logo: {
    type: String,
    default: '',
  },
  accentColor: {
    type: String,
    default: '#6366f1',
  },
  dateFormat: {
    type: String,
    default: 'MM/DD/YYYY',
  },
  timezone: {
    type: String,
    default: 'UTC',
  },
  backupRetentionDays: {
    type: Number,
    default: 30,
  },
}, { timestamps: true });

module.exports = mongoose.model('Setting', settingSchema);

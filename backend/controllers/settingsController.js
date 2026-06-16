const bcrypt = require('bcryptjs');
const Setting = require('../models/Setting');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

exports.getSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({});
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = new Setting();
    }
    const allowed = ['companyName', 'address', 'phone', 'email', 'website', 'taxId', 'accentColor', 'dateFormat', 'timezone'];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        settings[field] = req.body[field];
      }
    });
    if (req.file) {
      settings.logo = '/uploads/' + req.file.filename;
    }
    await settings.save();
    await AuditLog.create({
      user: req.user._id,
      action: 'update',
      resource: 'settings',
      details: { companyName: settings.companyName },
    });
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteLogo = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (settings) {
      settings.logo = '';
      await settings.save();
    }
    await AuditLog.create({
      user: req.user._id,
      action: 'delete_logo',
      resource: 'settings',
    });
    res.json({ message: 'Logo removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    await AuditLog.create({
      user: req.user._id,
      action: 'change_password',
      resource: 'auth',
      details: {},
    });
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const update = {};
    if (name) update.name = name;
    if (email) update.email = email;
    if (req.file) update.avatar = '/uploads/' + req.file.filename;
    const user = await User.findByIdAndUpdate(req.user.id, update, { new: true }).select('-password');
    await AuditLog.create({
      user: req.user._id,
      action: 'update_profile',
      resource: 'auth',
      details: { name: user.name, email: user.email },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.backupData = async (req, res) => {
  try {
    const Printer = require('../models/Printer');
    const Repair = require('../models/Repair');
    const Inventory = require('../models/Inventory');
    const Technician = require('../models/Technician');
    const SparePart = require('../models/SparePart');

    const backup = {
      date: new Date().toISOString(),
      printers: await Printer.find(),
      repairs: await Repair.find(),
      inventoryItems: await Inventory.find(),
      technicians: await Technician.find(),
      spareParts: await SparePart.find(),
      settings: await Setting.findOne(),
    };
    await AuditLog.create({
      user: req.user._id,
      action: 'backup',
      resource: 'settings',
      details: { recordCount: { printers: backup.printers.length, repairs: backup.repairs.length, inventory: backup.inventoryItems.length } },
    });
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=backup-${Date.now()}.json`);
    res.json(backup);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.restoreData = async (req, res) => {
  try {
    const Printer = require('../models/Printer');
    const Repair = require('../models/Repair');
    const Inventory = require('../models/Inventory');
    const Technician = require('../models/Technician');
    const SparePart = require('../models/SparePart');
    const data = req.body;
    if (data.printers) await Printer.deleteMany({});
    if (data.repairs) await Repair.deleteMany({});
    if (data.inventoryItems) await Inventory.deleteMany({});
    if (data.technicians) await Technician.deleteMany({});
    if (data.spareParts) await SparePart.deleteMany({});
    if (data.printers) await Printer.insertMany(data.printers);
    if (data.repairs) await Repair.insertMany(data.repairs);
    if (data.inventoryItems) await Inventory.insertMany(data.inventoryItems);
    if (data.technicians) await Technician.insertMany(data.technicians);
    if (data.spareParts) await SparePart.insertMany(data.spareParts);
    await AuditLog.create({
      user: req.user._id,
      action: 'restore',
      resource: 'settings',
      details: { recordCount: { printers: data.printers?.length || 0, repairs: data.repairs?.length || 0 } },
    });
    res.json({ message: 'Data restored successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const Inventory = require('../models/Inventory');
const AuditLog = require('../models/AuditLog');
const { createAndEmitNotification } = require('./notificationController');

exports.getItems = async (req, res) => {
  try {
    const items = await Inventory.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getItem = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createItem = async (req, res) => {
  try {
    const item = await Inventory.create(req.body);
    await AuditLog.create({
      user: req.user._id,
      action: 'create',
      resource: 'inventory',
      resourceId: item._id,
      details: { partName: item.partName, quantity: item.quantity },
    });
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.quantity <= 5) {
      createAndEmitNotification({
        type: 'low_inventory',
        title: 'Low Stock Alert',
        message: `${item.partName} — only ${item.quantity} left (supplier: ${item.supplier})`,
        resourceId: item._id.toString(),
        resourceModel: 'Inventory',
      });
    }
    await AuditLog.create({
      user: req.user._id,
      action: 'update',
      resource: 'inventory',
      resourceId: item._id,
      details: { partName: item.partName, quantity: item.quantity },
    });
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const item = await Inventory.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    await AuditLog.create({
      user: req.user._id,
      action: 'delete',
      resource: 'inventory',
      resourceId: req.params.id,
      details: { partName: item.partName },
    });
    res.json({ message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

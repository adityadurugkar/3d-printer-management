const SparePart = require('../models/SparePart');
const { createAndEmitNotification } = require('./notificationController');

exports.getSpareParts = async (req, res) => {
  try {
    const { printerType, category, stockStatus } = req.query;
    let filter = {};

    if (printerType && printerType !== 'all') {
      filter.compatiblePrinterType = { $in: [printerType, 'All'] };
    }
    if (category && category !== 'all') {
      filter.category = category;
    }
    if (stockStatus === 'low') {
      filter.$expr = { $and: [{ $gt: ['$currentStock', 0] }, { $lte: ['$currentStock', '$minimumStock'] }] };
    } else if (stockStatus === 'out') {
      filter.currentStock = 0;
    } else if (stockStatus === 'in') {
      filter.$expr = { $gt: ['$currentStock', '$minimumStock'] };
    }

    const parts = await SparePart.find(filter).sort({ createdAt: -1 });
    res.json(parts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSparePart = async (req, res) => {
  try {
    const part = await SparePart.findById(req.params.id);
    if (!part) return res.status(404).json({ message: 'Spare part not found' });
    res.json(part);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createSparePart = async (req, res) => {
  try {
    const part = await SparePart.create(req.body);

    if (part.currentStock <= part.minimumStock) {
      createAndEmitNotification({
        type: 'low_inventory',
        title: 'Low Stock Alert',
        message: `${part.partName} — only ${part.currentStock} ${part.unit} left (min: ${part.minimumStock})`,
        resourceId: part._id.toString(),
        resourceModel: 'SparePart',
      });
    }

    res.status(201).json(part);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateSparePart = async (req, res) => {
  try {
    const part = await SparePart.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!part) return res.status(404).json({ message: 'Spare part not found' });

    if (part.currentStock <= part.minimumStock) {
      createAndEmitNotification({
        type: 'low_inventory',
        title: 'Low Stock Alert',
        message: `${part.partName} — only ${part.currentStock} ${part.unit} left (min: ${part.minimumStock})`,
        resourceId: part._id.toString(),
        resourceModel: 'SparePart',
      });
    }

    res.json(part);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteSparePart = async (req, res) => {
  try {
    const part = await SparePart.findByIdAndDelete(req.params.id);
    if (!part) return res.status(404).json({ message: 'Spare part not found' });
    res.json({ message: 'Spare part deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

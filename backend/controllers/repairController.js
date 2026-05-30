const Repair = require('../models/Repair');
const { createAndEmitNotification } = require('./notificationController');

exports.getRepairs = async (req, res) => {
  try {
    const repairs = await Repair.find().populate('printerId').sort({ repairDate: -1 });
    res.json(repairs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRepair = async (req, res) => {
  try {
    const repair = await Repair.findById(req.params.id).populate('printerId');
    if (!repair) return res.status(404).json({ message: 'Repair not found' });
    res.json(repair);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createRepair = async (req, res) => {
  try {
    const repair = await Repair.create(req.body);
    createAndEmitNotification({
      type: 'repair_created',
      title: 'New Repair Created',
      message: `${repair.printerName} — ${repair.problemDescription.substring(0, 60)}`,
      resourceId: repair._id.toString(),
      resourceModel: 'Repair',
    });
    res.status(201).json(repair);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateRepair = async (req, res) => {
  try {
    const repair = await Repair.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!repair) return res.status(404).json({ message: 'Repair not found' });
    if (repair.status === 'completed') {
      createAndEmitNotification({
        type: 'repair_completed',
        title: 'Repair Completed',
        message: `${repair.printerName} — completed by ${repair.technicianName}`,
        resourceId: repair._id.toString(),
        resourceModel: 'Repair',
      });
    }
    res.json(repair);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteRepair = async (req, res) => {
  try {
    const repair = await Repair.findByIdAndDelete(req.params.id);
    if (!repair) return res.status(404).json({ message: 'Repair not found' });
    res.json({ message: 'Repair deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

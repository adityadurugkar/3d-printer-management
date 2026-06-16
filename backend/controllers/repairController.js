const Repair = require('../models/Repair');
const AuditLog = require('../models/AuditLog');
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
    await AuditLog.create({
      user: req.user._id,
      action: 'create',
      resource: 'repair',
      resourceId: repair._id,
      details: { printerName: repair.printerName, status: repair.status },
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
    await AuditLog.create({
      user: req.user._id,
      action: 'update',
      resource: 'repair',
      resourceId: repair._id,
      details: { printerName: repair.printerName, status: repair.status },
    });
    res.json(repair);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.startRepair = async (req, res) => {
  try {
    const repair = await Repair.findById(req.params.id);
    if (!repair) return res.status(404).json({ message: 'Repair not found' });
    if (repair.status !== 'pending') return res.status(400).json({ message: 'Only pending repairs can be started' });

    repair.startTime = new Date();
    repair.status = 'in-progress';
    await repair.save();

    createAndEmitNotification({
      type: 'repair_started',
      title: 'Repair Started',
      message: `${repair.printerName} — started by ${repair.technicianName}`,
      resourceId: repair._id.toString(),
      resourceModel: 'Repair',
    });

    await AuditLog.create({
      user: req.user._id,
      action: 'start',
      resource: 'repair',
      resourceId: repair._id,
      details: { printerName: repair.printerName, technicianName: repair.technicianName },
    });

    res.json(repair);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.completeRepair = async (req, res) => {
  try {
    const repair = await Repair.findById(req.params.id);
    if (!repair) return res.status(404).json({ message: 'Repair not found' });
    if (repair.status !== 'in-progress') return res.status(400).json({ message: 'Only in-progress repairs can be completed' });

    repair.endTime = new Date();
    repair.totalHours = (repair.endTime - repair.startTime) / 3600000;
    repair.status = 'completed';
    await repair.save();

    createAndEmitNotification({
      type: 'repair_completed',
      title: 'Repair Completed',
      message: `${repair.printerName} — completed in ${repair.totalHours.toFixed(1)}h by ${repair.technicianName}`,
      resourceId: repair._id.toString(),
      resourceModel: 'Repair',
    });

    await AuditLog.create({
      user: req.user._id,
      action: 'complete',
      resource: 'repair',
      resourceId: repair._id,
      details: { printerName: repair.printerName, totalHours: repair.totalHours, technicianName: repair.technicianName },
    });

    res.json(repair);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteRepair = async (req, res) => {
  try {
    const repair = await Repair.findByIdAndDelete(req.params.id);
    if (!repair) return res.status(404).json({ message: 'Repair not found' });
    await AuditLog.create({
      user: req.user._id,
      action: 'delete',
      resource: 'repair',
      resourceId: req.params.id,
      details: { printerName: repair.printerName },
    });
    res.json({ message: 'Repair deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

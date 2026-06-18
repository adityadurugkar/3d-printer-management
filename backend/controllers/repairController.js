const Repair = require('../models/Repair');
const Counter = require('../models/Counter');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { createAndEmitNotification } = require('./notificationController');
const { taskAssignedEmail, taskCompletedEmail, taskVerifiedEmail } = require('../services/emailService');

async function generateTicketNumber() {
  const counter = await Counter.findOneAndUpdate(
    { name: 'repairTicket' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  const year = new Date().getFullYear();
  return `PHN-REP-${year}-${String(counter.seq).padStart(4, '0')}`;
}

exports.getRepairs = async (req, res) => {
  try {
    const repairs = await Repair.find().populate('printerId').populate('assignedBy', 'name').populate('verifiedBy', 'name').sort({ createdAt: -1 });
    res.json(repairs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRepair = async (req, res) => {
  try {
    const repair = await Repair.findById(req.params.id).populate('printerId').populate('assignedBy', 'name').populate('verifiedBy', 'name');
    if (!repair) return res.status(404).json({ message: 'Repair not found' });
    res.json(repair);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRepairByTicket = async (req, res) => {
  try {
    const repair = await Repair.findOne({ ticketNumber: req.params.ticket }).populate('printerId');
    if (!repair) return res.status(404).json({ message: 'Repair not found' });
    res.json(repair);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createRepair = async (req, res) => {
  try {
    const repair = await Repair.create({ ...req.body, assignedBy: req.user._id });
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

exports.assignRepair = async (req, res) => {
  try {
    const { technicianName, technicianEmail, priority, dueDate, estimatedRepairTime } = req.body;
    const repair = await Repair.findById(req.params.id);
    if (!repair) return res.status(404).json({ message: 'Repair not found' });

    if (!repair.ticketNumber) {
      repair.ticketNumber = await generateTicketNumber();
    }

    repair.technicianName = technicianName || repair.technicianName;
    repair.technicianEmail = technicianEmail || repair.technicianEmail;
    repair.priority = priority || repair.priority;
    repair.dueDate = dueDate || repair.dueDate;
    repair.estimatedRepairTime = estimatedRepairTime != null ? estimatedRepairTime : repair.estimatedRepairTime;
    repair.assignedBy = req.user._id;
    repair.assignedAt = new Date();
    repair.status = 'pending';

    await repair.save();

    await AuditLog.create({
      user: req.user._id,
      action: 'assign',
      resource: 'repair',
      resourceId: repair._id,
      details: { ticketNumber: repair.ticketNumber, technicianName, technicianEmail, priority, dueDate },
    });

    createAndEmitNotification({
      type: 'repair_assigned',
      title: 'Repair Task Assigned',
      message: `${repair.ticketNumber} — assigned to ${technicianName} for ${repair.printerName}`,
      resourceId: repair._id.toString(),
      resourceModel: 'Repair',
    });

    if (technicianEmail) {
      const emailSent = await taskAssignedEmail({
        to: technicianEmail,
        technicianName,
        ticketNumber: repair.ticketNumber,
        printerName: repair.printerName,
        printerNumber: repair.printerNumber,
        problemDescription: repair.problemDescription,
        priority: repair.priority,
        dueDate: repair.dueDate,
        repairId: repair._id,
      });
      repair.emailSent = emailSent;
      await repair.save();
    }

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

exports.submitCompletion = async (req, res) => {
  try {
    const repair = await Repair.findById(req.params.id);
    if (!repair) return res.status(404).json({ message: 'Repair not found' });
    if (repair.status !== 'in-progress' && repair.status !== 'pending') {
      return res.status(400).json({ message: 'Only active repairs can be completed' });
    }

    const { actionsPerformed, rootCause, sparePartsUsed, timeTaken, images, additionalNotes } = req.body;

    repair.endTime = new Date();
    repair.totalHours = timeTaken || ((repair.endTime - (repair.startTime || repair.endTime)) / 3600000);
    repair.status = 'completed';
    repair.completionReport = {
      actionsPerformed,
      rootCause,
      sparePartsUsed: sparePartsUsed || [],
      timeTaken: timeTaken || repair.totalHours,
      images: images || [],
      additionalNotes,
      submittedAt: new Date(),
    };

    await repair.save();

    createAndEmitNotification({
      type: 'repair_completed',
      title: 'Repair Completed',
      message: `${repair.ticketNumber} — ${repair.printerName} completed by ${repair.technicianName}`,
      resourceId: repair._id.toString(),
      resourceModel: 'Repair',
    });

    await AuditLog.create({
      user: req.user._id,
      action: 'complete',
      resource: 'repair',
      resourceId: repair._id,
      details: { ticketNumber: repair.ticketNumber, printerName: repair.printerName, technicianName: repair.technicianName, timeTaken },
    });

    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await taskCompletedEmail({
        adminEmail: admin.email,
        adminName: admin.name,
        ticketNumber: repair.ticketNumber,
        printerName: repair.printerName,
        technicianName: repair.technicianName,
        completionReport: repair.completionReport,
      });
    }

    res.json(repair);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.verifyRepair = async (req, res) => {
  try {
    const { verificationStatus } = req.body;
    const repair = await Repair.findById(req.params.id);
    if (!repair) return res.status(404).json({ message: 'Repair not found' });
    if (repair.status !== 'completed') return res.status(400).json({ message: 'Only completed repairs can be verified' });

    repair.verificationStatus = verificationStatus || 'verified';
    repair.verifiedAt = new Date();
    repair.verifiedBy = req.user._id;
    await repair.save();

    createAndEmitNotification({
      type: 'repair_verified',
      title: 'Repair Verified',
      message: `${repair.ticketNumber} — ${repair.printerName} verified by ${req.user.name || 'Admin'}`,
      resourceId: repair._id.toString(),
      resourceModel: 'Repair',
    });

    await AuditLog.create({
      user: req.user._id,
      action: 'verify',
      resource: 'repair',
      resourceId: repair._id,
      details: { ticketNumber: repair.ticketNumber, verificationStatus, printerName: repair.printerName },
    });

    if (repair.technicianEmail && verificationStatus === 'verified') {
      await taskVerifiedEmail({
        to: repair.technicianEmail,
        technicianName: repair.technicianName,
        ticketNumber: repair.ticketNumber,
        printerName: repair.printerName,
      });
    }

    res.json(repair);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getTechnicianRepairs = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: 'Technician email is required' });
    const repairs = await Repair.find({ technicianEmail: email.toLowerCase() })
      .populate('printerId')
      .sort({ createdAt: -1 });
    res.json(repairs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRepairStats = async (req, res) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    const [
      totalRepairs,
      pendingCount,
      inProgressCount,
      completedCount,
      overdueCount,
      todayCompleted,
      repairs,
    ] = await Promise.all([
      Repair.countDocuments(),
      Repair.countDocuments({ status: 'pending' }),
      Repair.countDocuments({ status: 'in-progress' }),
      Repair.countDocuments({ status: 'completed' }),
      Repair.countDocuments({ status: { $in: ['pending', 'in-progress'] }, dueDate: { $lt: now } }),
      Repair.countDocuments({ status: 'completed', endTime: { $gte: todayStart, $lt: todayEnd } }),
      Repair.find({ status: { $in: ['pending', 'in-progress'] }, dueDate: { $ne: null } }).select('technicianName dueDate status ticketNumber printerName').sort({ dueDate: 1 }),
    ]);

    const workloadMap = {};
    for (const r of repairs) {
      if (!workloadMap[r.technicianName]) workloadMap[r.technicianName] = { name: r.technicianName, pending: 0, inProgress: 0, overdue: 0, total: 0 };
      workloadMap[r.technicianName].total++;
      workloadMap[r.technicianName][r.status === 'pending' ? 'pending' : 'inProgress']++;
      if (r.dueDate && new Date(r.dueDate) < now) workloadMap[r.technicianName].overdue++;
    }

    res.json({
      totalRepairs,
      pending: pendingCount,
      inProgress: inProgressCount,
      completed: completedCount,
      overdue: overdueCount,
      todayCompleted,
      technicianWorkload: Object.values(workloadMap),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
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

    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await taskCompletedEmail({
        adminEmail: admin.email,
        adminName: admin.name,
        ticketNumber: repair.ticketNumber,
        printerName: repair.printerName,
        technicianName: repair.technicianName,
        completionReport: repair.completionReport,
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

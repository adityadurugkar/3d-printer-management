const Technician = require('../models/Technician');
const { createAndEmitNotification } = require('./notificationController');

exports.getTechnicians = async (req, res) => {
  try {
    const technicians = await Technician.find().sort({ createdAt: -1 });
    res.json(technicians);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTechnician = async (req, res) => {
  try {
    const technician = await Technician.findById(req.params.id);
    if (!technician) return res.status(404).json({ message: 'Technician not found' });
    res.json(technician);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createTechnician = async (req, res) => {
  try {
    const technician = await Technician.create(req.body);
    res.status(201).json(technician);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateTechnician = async (req, res) => {
  try {
    const technician = await Technician.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!technician) return res.status(404).json({ message: 'Technician not found' });
    createAndEmitNotification({
      type: 'technician_assigned',
      title: 'Technician Updated',
      message: `${technician.name} — status: ${technician.status}, specialization: ${technician.specialization || 'general'}`,
      resourceId: technician._id.toString(),
      resourceModel: 'Technician',
    });
    res.json(technician);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteTechnician = async (req, res) => {
  try {
    const technician = await Technician.findByIdAndDelete(req.params.id);
    if (!technician) return res.status(404).json({ message: 'Technician not found' });
    res.json({ message: 'Technician deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

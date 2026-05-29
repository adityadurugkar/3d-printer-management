const Printer = require('../models/Printer');

exports.getPrinters = async (req, res) => {
  try {
    const printers = await Printer.find().sort({ createdAt: -1 });
    res.json(printers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPrinter = async (req, res) => {
  try {
    const printer = await Printer.findById(req.params.id);
    if (!printer) return res.status(404).json({ message: 'Printer not found' });
    res.json(printer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createPrinter = async (req, res) => {
  try {
    const printer = await Printer.create(req.body);
    res.status(201).json(printer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updatePrinter = async (req, res) => {
  try {
    const printer = await Printer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!printer) return res.status(404).json({ message: 'Printer not found' });
    res.json(printer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deletePrinter = async (req, res) => {
  try {
    const printer = await Printer.findByIdAndDelete(req.params.id);
    if (!printer) return res.status(404).json({ message: 'Printer not found' });
    res.json({ message: 'Printer deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

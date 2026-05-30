const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const Printer = require('../models/Printer');
const Repair = require('../models/Repair');
const Inventory = require('../models/Inventory');
const Technician = require('../models/Technician');

exports.exportPDF = async (req, res) => {
  try {
    const { resource } = req.params;
    let data;
    let title;

    switch (resource) {
      case 'printers':
        data = await Printer.find();
        title = 'Printers Report';
        break;
      case 'repairs':
        data = await Repair.find().populate('printerId');
        title = 'Repairs Report';
        break;
      case 'inventory':
        data = await Inventory.find();
        title = 'Inventory Report';
        break;
      case 'technicians':
        data = await Technician.find();
        title = 'Technicians Report';
        break;
      default:
        return res.status(400).json({ message: 'Invalid resource' });
    }

    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${resource}-report.pdf`);
    doc.pipe(res);

    doc.fontSize(20).font('Helvetica-Bold').text(title, { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).font('Helvetica').text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(2);

    if (data.length === 0) {
      doc.fontSize(14).text('No data available.', { align: 'center' });
    } else {
      const headers = Object.keys(data[0].toObject()).filter(k => !['__v', '_id'].includes(k));
      doc.font('Helvetica-Bold').fontSize(9);

      let y = doc.y;
      headers.forEach((h, i) => {
        doc.text(h.replace(/([A-Z])/g, ' $1').trim(), 30 + i * 70, y, { width: 65 });
      });
      doc.moveDown(0.5);

      doc.font('Helvetica').fontSize(8);
      data.forEach((item) => {
        const obj = item.toObject();
        let x = 30;
        headers.forEach((h) => {
          const val = obj[h];
          const display = val instanceof Date ? val.toLocaleDateString() : String(val ?? '');
          doc.text(display.substring(0, 20), x, doc.y, { width: 65 });
          x += 70;
        });
        doc.moveDown(0.5);
      });
    }

    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.exportExcel = async (req, res) => {
  try {
    const { resource } = req.params;
    let data;
    let title;

    switch (resource) {
      case 'printers':
        data = await Printer.find();
        title = 'Printers';
        break;
      case 'repairs':
        data = await Repair.find().populate('printerId');
        title = 'Repairs';
        break;
      case 'inventory':
        data = await Inventory.find();
        title = 'Inventory';
        break;
      case 'technicians':
        data = await Technician.find();
        title = 'Technicians';
        break;
      default:
        return res.status(400).json({ message: 'Invalid resource' });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(title);

    if (data.length > 0) {
      const headers = Object.keys(data[0].toObject()).filter(k => !['__v', '_id'].includes(k));
      const headerRow = worksheet.addRow(headers.map(h => h.replace(/([A-Z])/g, ' $1').trim()));
      headerRow.font = { bold: true };

      data.forEach((item) => {
        const obj = item.toObject();
        const row = headers.map(h => {
          const val = obj[h];
          return val instanceof Date ? val.toLocaleDateString() : val ?? '';
        });
        worksheet.addRow(row);
      });

      worksheet.columns.forEach((column) => {
        column.width = 25;
      });
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${resource}-export.xlsx`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const totalPrinters = await Printer.countDocuments();
    const activePrinters = await Printer.countDocuments({ status: 'active' });
    const totalRepairs = await Repair.countDocuments();
    const pendingRepairs = await Repair.countDocuments({ status: { $ne: 'completed' } });
    const completedRepairs = await Repair.countDocuments({ status: 'completed' });
    const totalInventory = await Inventory.countDocuments();
    const lowStockItems = await Inventory.countDocuments({ quantity: { $lte: 5 } });
    const totalTechnicians = await Technician.countDocuments();

    const repairsByStatus = await Repair.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const printersByBrand = await Printer.aggregate([
      { $group: { _id: '$brand', count: { $sum: 1 } } },
    ]);

    const printersByModel = await Printer.aggregate([
      { $group: { _id: '$model', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);

    const monthlyRepairs = await Repair.aggregate([
      { $match: { repairDate: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$repairDate' }, month: { $month: '$repairDate' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const inventoryItems = await Inventory.find({}, 'partName quantity price').sort({ quantity: 1 }).limit(10);

    const technicianWorkload = await Repair.aggregate([
      { $group: { _id: '$technicianName', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const recentRepairs = await Repair.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('printerName printerNumber repairDate status createdAt');

    const recentPrinters = await Printer.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name brand model status createdAt');

    const recentActivity = [
      ...recentRepairs.map(r => ({
        type: 'repair',
        id: r._id,
        title: `Repair: ${r.printerName}`,
        description: `${r.printerNumber} — ${r.status}`,
        date: r.createdAt || r.repairDate,
        status: r.status,
      })),
      ...recentPrinters.map(p => ({
        type: 'printer',
        id: p._id,
        title: `Printer: ${p.name}`,
        description: `${p.brand} ${p.model} — ${p.status}`,
        date: p.createdAt,
        status: p.status,
      })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

    res.json({
      totalPrinters,
      activePrinters,
      totalRepairs,
      pendingRepairs,
      completedRepairs,
      totalInventory,
      lowStockItems,
      totalTechnicians,
      repairsByStatus,
      printersByBrand,
      printersByModel,
      monthlyRepairs,
      inventoryItems,
      technicianWorkload,
      recentActivity,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

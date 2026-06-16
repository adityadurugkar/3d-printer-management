const AuditLog = require('../models/AuditLog');

const getAuditLogs = async (req, res) => {
  const { page = 1, limit = 50, action, resource } = req.query;
  const filter = {};
  if (action) filter.action = action;
  if (resource) filter.resource = resource;
  const logs = await AuditLog.find(filter)
    .populate('user', 'name email role')
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(Number(limit));
  const total = await AuditLog.countDocuments(filter);
  res.json({ logs, total, page: Number(page), pages: Math.ceil(total / limit) });
};

const getAuditLog = async (req, res) => {
  const log = await AuditLog.findById(req.params.id).populate('user', 'name email role');
  if (!log) {
    return res.status(404).json({ message: 'Audit log not found' });
  }
  res.json(log);
};

module.exports = { getAuditLogs, getAuditLog };

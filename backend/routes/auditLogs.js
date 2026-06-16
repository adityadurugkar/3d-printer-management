const express = require('express');
const router = express.Router();
const { getAuditLogs, getAuditLog } = require('../controllers/auditLogController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.get('/', getAuditLogs);
router.get('/:id', getAuditLog);

module.exports = router;

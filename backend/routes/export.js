const express = require('express');
const router = express.Router();
const { exportPDF, exportExcel, getDashboardStats } = require('../controllers/exportController');
const { protect, authorize } = require('../middleware/auth');

router.get('/dashboard', protect, getDashboardStats);
router.get('/pdf/:resource', protect, authorize('admin'), exportPDF);
router.get('/excel/:resource', protect, authorize('admin'), exportExcel);

module.exports = router;

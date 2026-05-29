const express = require('express');
const router = express.Router();
const { exportPDF, exportExcel, getDashboardStats } = require('../controllers/exportController');
const { protect } = require('../middleware/auth');

router.get('/dashboard', protect, getDashboardStats);
router.get('/pdf/:resource', protect, exportPDF);
router.get('/excel/:resource', protect, exportExcel);

module.exports = router;

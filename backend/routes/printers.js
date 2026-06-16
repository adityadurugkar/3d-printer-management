const express = require('express');
const router = express.Router();
const {
  getPrinters, getPrinter, createPrinter, updatePrinter, deletePrinter,
} = require('../controllers/printerController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getPrinters)
  .post(protect, authorize('admin'), createPrinter);

router.route('/:id')
  .get(protect, getPrinter)
  .put(protect, authorize('admin'), updatePrinter)
  .delete(protect, authorize('admin'), deletePrinter);

module.exports = router;

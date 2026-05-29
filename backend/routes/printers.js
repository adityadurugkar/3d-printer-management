const express = require('express');
const router = express.Router();
const {
  getPrinters, getPrinter, createPrinter, updatePrinter, deletePrinter,
} = require('../controllers/printerController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getPrinters)
  .post(protect, createPrinter);

router.route('/:id')
  .get(protect, getPrinter)
  .put(protect, updatePrinter)
  .delete(protect, deletePrinter);

module.exports = router;

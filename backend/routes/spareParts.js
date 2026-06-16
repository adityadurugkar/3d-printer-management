const express = require('express');
const router = express.Router();
const {
  getSpareParts, getSparePart, createSparePart, updateSparePart, deleteSparePart,
} = require('../controllers/sparePartController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getSpareParts)
  .post(protect, authorize('admin'), createSparePart);

router.route('/:id')
  .get(protect, getSparePart)
  .put(protect, authorize('admin'), updateSparePart)
  .delete(protect, authorize('admin'), deleteSparePart);

module.exports = router;

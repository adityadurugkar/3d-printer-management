const express = require('express');
const router = express.Router();
const {
  getSpareParts, getSparePart, createSparePart, updateSparePart, deleteSparePart,
} = require('../controllers/sparePartController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getSpareParts)
  .post(protect, createSparePart);

router.route('/:id')
  .get(protect, getSparePart)
  .put(protect, updateSparePart)
  .delete(protect, deleteSparePart);

module.exports = router;

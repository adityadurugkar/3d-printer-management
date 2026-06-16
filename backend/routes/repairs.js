const express = require('express');
const router = express.Router();
const {
  getRepairs, getRepair, createRepair, updateRepair, deleteRepair,
  startRepair, completeRepair,
} = require('../controllers/repairController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getRepairs)
  .post(protect, authorize('admin'), createRepair);

router.put('/:id/start', protect, startRepair);
router.put('/:id/complete', protect, completeRepair);

router.route('/:id')
  .get(protect, getRepair)
  .put(protect, authorize('admin'), updateRepair)
  .delete(protect, authorize('admin'), deleteRepair);

module.exports = router;

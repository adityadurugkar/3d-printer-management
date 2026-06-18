const express = require('express');
const router = express.Router();
const {
  getRepairs, getRepair, getRepairByTicket, createRepair, updateRepair, deleteRepair,
  startRepair, completeRepair, assignRepair, submitCompletion, verifyRepair,
  getTechnicianRepairs, getRepairStats,
} = require('../controllers/repairController');
const { protect, authorize } = require('../middleware/auth');

router.get('/stats', protect, authorize('admin'), getRepairStats);
router.get('/technician', getTechnicianRepairs);
router.get('/ticket/:ticket', getRepairByTicket);

router.route('/')
  .get(protect, getRepairs)
  .post(protect, authorize('admin'), createRepair);

router.put('/:id/start', protect, startRepair);
router.put('/:id/complete', protect, completeRepair);
router.put('/:id/assign', protect, authorize('admin'), assignRepair);
router.post('/:id/complete-form', submitCompletion);
router.put('/:id/verify', protect, authorize('admin'), verifyRepair);

router.route('/:id')
  .get(protect, getRepair)
  .put(protect, authorize('admin'), updateRepair)
  .delete(protect, authorize('admin'), deleteRepair);

module.exports = router;

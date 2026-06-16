const express = require('express');
const router = express.Router();
const {
  getTechnicians, getTechnician, createTechnician, updateTechnician, deleteTechnician,
} = require('../controllers/technicianController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getTechnicians)
  .post(protect, authorize('admin'), createTechnician);

router.route('/:id')
  .get(protect, getTechnician)
  .put(protect, authorize('admin'), updateTechnician)
  .delete(protect, authorize('admin'), deleteTechnician);

module.exports = router;

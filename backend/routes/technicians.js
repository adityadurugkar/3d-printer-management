const express = require('express');
const router = express.Router();
const {
  getTechnicians, getTechnician, createTechnician, updateTechnician, deleteTechnician,
} = require('../controllers/technicianController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getTechnicians)
  .post(protect, createTechnician);

router.route('/:id')
  .get(protect, getTechnician)
  .put(protect, updateTechnician)
  .delete(protect, deleteTechnician);

module.exports = router;

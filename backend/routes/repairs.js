const express = require('express');
const router = express.Router();
const {
  getRepairs, getRepair, createRepair, updateRepair, deleteRepair,
} = require('../controllers/repairController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getRepairs)
  .post(protect, createRepair);

router.route('/:id')
  .get(protect, getRepair)
  .put(protect, updateRepair)
  .delete(protect, deleteRepair);

module.exports = router;

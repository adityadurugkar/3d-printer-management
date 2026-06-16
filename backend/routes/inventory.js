const express = require('express');
const router = express.Router();
const {
  getItems, getItem, createItem, updateItem, deleteItem,
} = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getItems)
  .post(protect, authorize('admin'), createItem);

router.route('/:id')
  .get(protect, getItem)
  .put(protect, authorize('admin'), updateItem)
  .delete(protect, authorize('admin'), deleteItem);

module.exports = router;

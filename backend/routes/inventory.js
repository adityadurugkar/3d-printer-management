const express = require('express');
const router = express.Router();
const {
  getItems, getItem, createItem, updateItem, deleteItem,
} = require('../controllers/inventoryController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getItems)
  .post(protect, createItem);

router.route('/:id')
  .get(protect, getItem)
  .put(protect, updateItem)
  .delete(protect, deleteItem);

module.exports = router;

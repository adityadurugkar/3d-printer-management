const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../config/upload');
const {
  getSettings,
  updateSettings,
  deleteLogo,
  changePassword,
  updateProfile,
  backupData,
  restoreData,
} = require('../controllers/settingsController');

router.get('/', protect, getSettings);
router.put('/', protect, upload.single('logo'), updateSettings);
router.delete('/logo', protect, deleteLogo);
router.put('/password', protect, changePassword);
router.put('/profile', protect, upload.single('avatar'), updateProfile);
router.get('/backup', protect, backupData);
router.post('/restore', protect, restoreData);

module.exports = router;

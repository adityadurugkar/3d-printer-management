const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
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

router.get('/', protect, authorize('admin'), getSettings);
router.put('/', protect, authorize('admin'), upload.single('logo'), updateSettings);
router.delete('/logo', protect, authorize('admin'), deleteLogo);
router.put('/password', protect, changePassword);
router.put('/profile', protect, upload.single('avatar'), updateProfile);
router.get('/backup', protect, authorize('admin'), backupData);
router.post('/restore', protect, authorize('admin'), restoreData);

module.exports = router;

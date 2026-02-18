const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, settingController.getSettings);
router.post('/', protect, admin, settingController.updateSetting);

module.exports = router;

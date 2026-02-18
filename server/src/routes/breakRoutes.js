const express = require('express');
const router = express.Router();
const { startBreak, endBreak, getMyStatus } = require('../controllers/breakController');
const { protect } = require('../middleware/authMiddleware');

router.post('/start', protect, startBreak);
router.post('/end', protect, endBreak);
router.get('/status', protect, getMyStatus);

module.exports = router;

const express = require('express');
const { getAttendanceReport } = require('../controllers/reportController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/attendance', protect, admin, getAttendanceReport);

module.exports = router;

const express = require('express');
const {
    getMyAttendance,
    getMyAttendanceHistory,
    markMyAttendance,
    getAttendanceByDate,
    overrideAttendance,
} = require('../controllers/attendanceController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/me', protect, getMyAttendance);
router.get('/me/history', protect, getMyAttendanceHistory);
router.post('/mark', protect, markMyAttendance);
router.get('/', protect, admin, getAttendanceByDate);
router.patch('/:id', protect, admin, overrideAttendance);

module.exports = router;

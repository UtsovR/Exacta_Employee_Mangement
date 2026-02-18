const express = require('express');
const {
    createLeave,
    getMyLeaves,
    getPendingLeaves,
    reviewLeave,
} = require('../controllers/leaveController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, createLeave);
router.get('/me', protect, getMyLeaves);
router.get('/pending', protect, admin, getPendingLeaves);
router.patch('/:id/review', protect, admin, reviewLeave);

module.exports = router;

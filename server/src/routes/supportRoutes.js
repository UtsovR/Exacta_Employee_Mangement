const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, supportController.createTicket);
router.get('/my-tickets', protect, supportController.getMyTickets);

module.exports = router;

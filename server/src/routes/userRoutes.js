const express = require('express');
const router = express.Router();
const { createEmployee, getEmployees, updateEmployee } = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, admin, createEmployee)
    .get(protect, admin, getEmployees);

router.route('/:id')
    .put(protect, admin, updateEmployee);

module.exports = router;

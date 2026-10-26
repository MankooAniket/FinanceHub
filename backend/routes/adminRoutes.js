const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { getUsers, deleteUser, getUserStats, getOverallStats } = require('../controllers/adminController');

router.get('/users', protect, admin, getUsers);
router.delete('/users/:id', protect, admin, deleteUser);
router.get('/user-stats', protect, admin, getUserStats);
router.get('/overall-stats', protect, admin, getOverallStats);

module.exports = router;


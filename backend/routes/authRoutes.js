const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

router.get('/profile', protect, authController.getProfile);
router.put('/profile', protect, authController.updateProfile);
router.delete('/delete-account', protect, authController.deleteAccount);

module.exports = router;
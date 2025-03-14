const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// Public routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

// Protected routes (require authentication)
router.use(authController.protect);

router.get('/me', authController.getMe);
router.patch('/update-password', authController.updatePassword);

module.exports = router; 
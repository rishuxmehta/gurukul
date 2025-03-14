const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protect all routes after this middleware - user must be logged in
router.use(authController.protect);

// Routes accessible to all authenticated users
router.patch('/update-me', userController.updateMe);

// Restrict routes to admin only
router.use(authController.restrictTo('admin'));

// Admin-only routes
router.route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router.route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router; 
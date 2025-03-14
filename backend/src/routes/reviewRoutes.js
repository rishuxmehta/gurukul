const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

// GET all reviews for a course
router.get('/', reviewController.getAllReviews);

// Protected routes
router.use(authController.protect);

// GET user's own reviews
router.get('/my-reviews', reviewController.getMyReviews);

// POST new review (for enrolled students)
router.post('/', authController.restrictTo('student'), reviewController.createReview);

// Routes for specific reviews
router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(reviewController.updateReview)
  .delete(reviewController.deleteReview);

module.exports = router; 
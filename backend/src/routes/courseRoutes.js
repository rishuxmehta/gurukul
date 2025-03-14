const express = require('express');
const courseController = require('../controllers/courseController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

// Nested route for reviews
router.use('/:courseId/reviews', reviewRouter);

// Public routes
router.get('/', courseController.getAllCourses);
router.get('/featured', courseController.getFeaturedCourses);
router.get('/category/:category', courseController.getCoursesByCategory);
router.get('/:id', courseController.getCourse);
router.get('/slug/:slug', courseController.getCourseBySlug);

// Protected routes (require authentication)
router.use(authController.protect);

// Routes for educator-created courses
router.get('/my-courses', courseController.getMyCourses);

// Routes for course creation/editing (restricted to educators and admins)
router.use(authController.restrictTo('educator', 'admin'));

router.post('/', courseController.createCourse);
router.patch('/:id', courseController.updateCourse);
router.delete('/:id', courseController.deleteCourse);

module.exports = router; 
const express = require('express');
const enrollmentController = require('../controllers/enrollmentController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

// Protect all routes - user must be logged in
router.use(authController.protect);

// Student enrollment routes
router.post('/courses/:courseId/enroll', enrollmentController.enrollInCourse);
router.get('/my-enrollments', enrollmentController.getMyEnrollments);
router.get('/enrollments/:id', enrollmentController.getEnrollment);

// Mark lesson completed
router.post(
  '/courses/:courseId/sections/:sectionId/lessons/:lessonId/complete',
  enrollmentController.markLessonCompleted
);

// Save quiz results
router.post(
  '/courses/:courseId/quizzes/:quizId/results',
  enrollmentController.saveQuizResults
);

// Certificate routes
router.post('/enrollments/:enrollmentId/certificate', enrollmentController.issueCertificate);
router.get('/enrollments/:enrollmentId/certificate', enrollmentController.getCertificate);

// Routes for educators to see course enrollments
router.use(authController.restrictTo('educator', 'admin'));
router.get('/courses/:courseId/enrollments', enrollmentController.getCourseEnrollments);

module.exports = router; 
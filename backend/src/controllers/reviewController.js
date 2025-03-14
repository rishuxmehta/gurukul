const Review = require('../models/Review');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const { AppError } = require('../utils/errorHandler');

// Get all reviews
exports.getAllReviews = async (req, res, next) => {
  try {
    let filter = {};
    if (req.params.courseId) filter = { course: req.params.courseId };

    const reviews = await Review.find(filter);

    res.status(200).json({
      status: 'success',
      results: reviews.length,
      data: {
        reviews
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get a specific review
exports.getReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return next(new AppError('No review found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        review
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create a new review
exports.createReview = async (req, res, next) => {
  try {
    // If courseId is in the URL params, add it to the body
    if (req.params.courseId) req.body.course = req.params.courseId;
    
    // Add student ID from authenticated user
    req.body.student = req.user.id;

    // Check if course exists
    const course = await Course.findById(req.body.course);
    if (!course) {
      return next(new AppError('No course found with that ID', 404));
    }

    // Check if student is enrolled in the course
    const enrollment = await Enrollment.findOne({
      student: req.user.id,
      course: req.body.course
    });

    if (!enrollment) {
      return next(
        new AppError('You must be enrolled in the course to review it', 403)
      );
    }

    // Check if student has already reviewed this course
    const existingReview = await Review.findOne({
      student: req.user.id,
      course: req.body.course
    });

    if (existingReview) {
      return next(
        new AppError('You have already reviewed this course. Please update your review instead.', 400)
      );
    }

    // Create the review
    const newReview = await Review.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        review: newReview
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update a review
exports.updateReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    // Check if review exists
    if (!review) {
      return next(new AppError('No review found with that ID', 404));
    }

    // Check if user is the review owner
    if (review.student.id !== req.user.id && req.user.role !== 'admin') {
      return next(
        new AppError('You are not allowed to update this review', 403)
      );
    }

    // Perform the update
    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      status: 'success',
      data: {
        review: updatedReview
      }
    });
  } catch (error) {
    next(error);
  }
};

// Delete a review
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    // Check if review exists
    if (!review) {
      return next(new AppError('No review found with that ID', 404));
    }

    // Check if user is the review owner or admin
    if (review.student.id !== req.user.id && req.user.role !== 'admin') {
      return next(
        new AppError('You are not allowed to delete this review', 403)
      );
    }

    await Review.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

// Get reviews for a specific course
exports.getCourseReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ course: req.params.courseId });

    res.status(200).json({
      status: 'success',
      results: reviews.length,
      data: {
        reviews
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get reviews by student (for student dashboard)
exports.getMyReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ student: req.user.id });

    res.status(200).json({
      status: 'success',
      results: reviews.length,
      data: {
        reviews
      }
    });
  } catch (error) {
    next(error);
  }
}; 
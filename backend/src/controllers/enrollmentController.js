const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const { AppError } = require('../utils/errorHandler');

// Enroll a student in a course
exports.enrollInCourse = async (req, res, next) => {
  try {
    // Check if course exists
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return next(new AppError('No course found with that ID', 404));
    }

    // Check if student is already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: req.user.id,
      course: req.params.courseId
    });

    if (existingEnrollment) {
      return next(new AppError('You are already enrolled in this course', 400));
    }

    // Create new enrollment
    const enrollment = await Enrollment.create({
      student: req.user.id,
      course: req.params.courseId
    });

    // Increment enrollment count on course
    course.enrollmentCount += 1;
    await course.save();

    res.status(201).json({
      status: 'success',
      data: {
        enrollment
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get all enrollments for a student
exports.getMyEnrollments = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user.id });

    res.status(200).json({
      status: 'success',
      results: enrollments.length,
      data: {
        enrollments
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get a specific enrollment for a student
exports.getEnrollment = async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id);

    if (!enrollment) {
      return next(new AppError('No enrollment found with that ID', 404));
    }

    // Check if enrollment belongs to the logged-in student or if user is admin/educator
    if (
      enrollment.student.id !== req.user.id &&
      req.user.role !== 'admin' &&
      req.user.role !== 'educator'
    ) {
      return next(
        new AppError('You do not have permission to view this enrollment', 403)
      );
    }

    res.status(200).json({
      status: 'success',
      data: {
        enrollment
      }
    });
  } catch (error) {
    next(error);
  }
};

// Mark a lesson as completed
exports.markLessonCompleted = async (req, res, next) => {
  try {
    const { courseId, sectionId, lessonId } = req.params;

    // Find the enrollment
    const enrollment = await Enrollment.findOne({
      student: req.user.id,
      course: courseId
    });

    if (!enrollment) {
      return next(new AppError('You are not enrolled in this course', 404));
    }

    // Check if lesson is already completed
    const lessonAlreadyCompleted = enrollment.completedLessons.some(
      lesson => lesson.lessonId.toString() === lessonId
    );

    if (lessonAlreadyCompleted) {
      return next(new AppError('Lesson already marked as completed', 400));
    }

    // Add the completed lesson
    enrollment.completedLessons.push({
      sectionId,
      lessonId,
      completedAt: Date.now()
    });

    // Update last accessed timestamp
    enrollment.lastAccessedAt = Date.now();

    // Fetch course data to calculate progress
    const course = await Course.findById(courseId);

    // Update progress percentage
    await enrollment.updateProgress(course);

    res.status(200).json({
      status: 'success',
      data: {
        enrollment
      }
    });
  } catch (error) {
    next(error);
  }
};

// Save quiz results
exports.saveQuizResults = async (req, res, next) => {
  try {
    const { courseId, quizId } = req.params;
    const { score, correctAnswers, totalQuestions } = req.body;

    // Find the enrollment
    const enrollment = await Enrollment.findOne({
      student: req.user.id,
      course: courseId
    });

    if (!enrollment) {
      return next(new AppError('You are not enrolled in this course', 404));
    }

    // Add the quiz result
    enrollment.quizResults.push({
      quizId,
      score,
      correctAnswers,
      totalQuestions,
      attemptedAt: Date.now()
    });

    // Update last accessed timestamp
    enrollment.lastAccessedAt = Date.now();

    await enrollment.save();

    res.status(200).json({
      status: 'success',
      data: {
        enrollment
      }
    });
  } catch (error) {
    next(error);
  }
};

// Issue a certificate
exports.issueCertificate = async (req, res, next) => {
  try {
    const { enrollmentId } = req.params;

    // Find the enrollment
    const enrollment = await Enrollment.findById(enrollmentId);

    if (!enrollment) {
      return next(new AppError('No enrollment found with that ID', 404));
    }

    // Check if enrollment belongs to the logged-in student
    if (enrollment.student.id !== req.user.id) {
      return next(
        new AppError('You do not have permission to access this enrollment', 403)
      );
    }

    // Check if course is completed
    if (enrollment.progress < 100) {
      return next(
        new AppError('Cannot issue certificate for incomplete course', 400)
      );
    }

    // Issue certificate
    const certificate = await enrollment.issueCertificate();

    res.status(200).json({
      status: 'success',
      data: {
        certificate
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get certificate
exports.getCertificate = async (req, res, next) => {
  try {
    const { enrollmentId } = req.params;

    // Find the enrollment
    const enrollment = await Enrollment.findById(enrollmentId);

    if (!enrollment) {
      return next(new AppError('No enrollment found with that ID', 404));
    }

    // Check if enrollment belongs to the logged-in student
    if (enrollment.student.id !== req.user.id) {
      return next(
        new AppError('You do not have permission to access this enrollment', 403)
      );
    }

    // Check if certificate is issued
    if (!enrollment.certificate.issued) {
      return next(new AppError('No certificate has been issued yet', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        certificate: enrollment.certificate
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get enrollments for a course (for educator dashboard)
exports.getCourseEnrollments = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    // Check if course exists and belongs to educator
    const course = await Course.findById(courseId);
    
    if (!course) {
      return next(new AppError('No course found with that ID', 404));
    }

    if (course.educator.id !== req.user.id && req.user.role !== 'admin') {
      return next(
        new AppError('You do not have permission to access this course', 403)
      );
    }

    // Get enrollments
    const enrollments = await Enrollment.find({ course: courseId });

    res.status(200).json({
      status: 'success',
      results: enrollments.length,
      data: {
        enrollments
      }
    });
  } catch (error) {
    next(error);
  }
}; 
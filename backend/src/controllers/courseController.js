const Course = require('../models/Course');
const { AppError } = require('../utils/errorHandler');

// Get all courses
exports.getAllCourses = async (req, res, next) => {
  try {
    // Build query
    // 1) Basic filtering
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    // 2) Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    
    let query = Course.find(JSON.parse(queryStr));

    // 3) Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // 4) Field limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }

    // 5) Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    // Execute query
    const courses = await query;

    // Send response
    res.status(200).json({
      status: 'success',
      results: courses.length,
      data: {
        courses
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get a specific course
exports.getCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id).populate('reviews');

    if (!course) {
      return next(new AppError('No course found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        course
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create a new course
exports.createCourse = async (req, res, next) => {
  try {
    // Add educator ID from authenticated user
    req.body.educator = req.user.id;

    const newCourse = await Course.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        course: newCourse
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update a course
exports.updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    // Check if course exists
    if (!course) {
      return next(new AppError('No course found with that ID', 404));
    }

    // Check if user is the course owner or an admin
    if (course.educator.id !== req.user.id && req.user.role !== 'admin') {
      return next(
        new AppError('You are not allowed to update this course', 403)
      );
    }

    // Perform the update
    const updatedCourse = await Course.findByIdAndUpdate(
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
        course: updatedCourse
      }
    });
  } catch (error) {
    next(error);
  }
};

// Delete a course
exports.deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    // Check if course exists
    if (!course) {
      return next(new AppError('No course found with that ID', 404));
    }

    // Check if user is the course owner or an admin
    if (course.educator.id !== req.user.id && req.user.role !== 'admin') {
      return next(
        new AppError('You are not allowed to delete this course', 403)
      );
    }

    // Instead of deleting, mark as inactive
    course.active = false;
    await course.save();

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

// Get courses by educator (for educator dashboard)
exports.getMyCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({ educator: req.user.id });

    res.status(200).json({
      status: 'success',
      results: courses.length,
      data: {
        courses
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get featured courses for homepage
exports.getFeaturedCourses = async (req, res, next) => {
  try {
    const limit = req.query.limit || 6;
    const courses = await Course.find({ featured: true })
      .sort('-ratingsAverage')
      .limit(parseInt(limit));

    res.status(200).json({
      status: 'success',
      results: courses.length,
      data: {
        courses
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get course by slug (for SEO-friendly URLs)
exports.getCourseBySlug = async (req, res, next) => {
  try {
    const course = await Course.findOne({ slug: req.params.slug }).populate('reviews');

    if (!course) {
      return next(new AppError('No course found with that slug', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        course
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get courses by category
exports.getCoursesByCategory = async (req, res, next) => {
  try {
    const courses = await Course.find({ category: req.params.category });

    res.status(200).json({
      status: 'success',
      results: courses.length,
      data: {
        courses
      }
    });
  } catch (error) {
    next(error);
  }
}; 
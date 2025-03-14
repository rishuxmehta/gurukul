const mongoose = require('mongoose');
const Course = require('./Course');

const reviewSchema = new mongoose.Schema({
  review: {
    type: String,
    required: [true, 'Review cannot be empty']
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: [true, 'Review must have a rating']
  },
  course: {
    type: mongoose.Schema.ObjectId,
    ref: 'Course',
    required: [true, 'Review must belong to a course']
  },
  student: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Review must belong to a student']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Prevent duplicate reviews (one review per student per course)
reviewSchema.index({ course: 1, student: 1 }, { unique: true });

// Populate student info when querying reviews
reviewSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'student',
    select: 'name avatar'
  });
  
  next();
});

// Static method to calculate average ratings on a course
reviewSchema.statics.calcAverageRatings = async function(courseId) {
  const stats = await this.aggregate([
    {
      $match: { course: courseId }
    },
    {
      $group: {
        _id: '$course',
        nRatings: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);
  
  if (stats.length > 0) {
    await Course.findByIdAndUpdate(courseId, {
      ratingsQuantity: stats[0].nRatings,
      ratingsAverage: stats[0].avgRating
    });
  } else {
    await Course.findByIdAndUpdate(courseId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    });
  }
};

// Call calcAverageRatings after save
reviewSchema.post('save', function() {
  // this points to current review
  this.constructor.calcAverageRatings(this.course);
});

// Call calcAverageRatings before findOneAndUpdate or findOneAndDelete
reviewSchema.pre(/^findOneAnd/, async function(next) {
  this.r = await this.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function() {
  // await this.findOne(); does NOT work here, query has already executed
  await this.r.constructor.calcAverageRatings(this.r.course);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review; 
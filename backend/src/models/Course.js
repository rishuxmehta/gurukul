const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'A course must have a title'],
    trim: true,
    maxlength: [100, 'A course title cannot be more than 100 characters']
  },
  slug: {
    type: String,
    unique: true
  },
  description: {
    type: String,
    required: [true, 'A course must have a description'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'A course must have a category'],
    enum: {
      values: ['Coding', 'Farming', 'Cooking', 'Carpentry', 'Business', 'Arts', 'Science', 'Mathematics', 'Languages', 'Other'],
      message: 'Category is either: Coding, Farming, Cooking, Carpentry, Business, Arts, Science, Mathematics, Languages, or Other'
    }
  },
  level: {
    type: String,
    required: [true, 'A course must have a difficulty level'],
    enum: {
      values: ['Beginner', 'Intermediate', 'Advanced'],
      message: 'Level is either: Beginner, Intermediate, or Advanced'
    }
  },
  price: {
    type: Number,
    default: 0
  },
  priceDiscount: {
    type: Number,
    validate: {
      validator: function(val) {
        // this only points to current doc on NEW document creation
        return val < this.price;
      },
      message: 'Discount price ({VALUE}) should be below regular price'
    }
  },
  duration: {
    type: Number,
    required: [true, 'A course must have a duration']
  },
  durationUnit: {
    type: String,
    enum: ['hours', 'days', 'weeks', 'months'],
    default: 'hours'
  },
  imageCover: {
    type: String,
    default: 'default-course.jpg'
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false
  },
  startDates: [Date],
  featured: {
    type: Boolean,
    default: false
  },
  active: {
    type: Boolean,
    default: true
  },
  // Creator of the course
  educator: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'A course must have an educator']
  },
  enrollmentCount: {
    type: Number,
    default: 0
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
    min: [1, 'Rating must be above 1.0'],
    max: [5, 'Rating must be below 5.0'],
    set: val => Math.round(val * 10) / 10 // 4.666666 -> 4.7
  },
  ratingsQuantity: {
    type: Number,
    default: 0
  },
  // Course Content
  sections: [
    {
      title: {
        type: String,
        required: [true, 'A section must have a title']
      },
      description: String,
      lessons: [
        {
          title: {
            type: String,
            required: [true, 'A lesson must have a title']
          },
          description: String,
          content: {
            type: String,
            required: [true, 'A lesson must have content']
          },
          duration: Number, // in minutes
          videoUrl: String,
          resources: [
            {
              name: String,
              fileUrl: String,
              fileType: String
            }
          ],
          quizzes: [
            {
              question: String,
              options: [String],
              correctAnswer: Number, // index of the correct option
              explanation: String
            }
          ],
          isCompleted: {
            type: Boolean,
            default: false
          }
        }
      ]
    }
  ]
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual populate for reviews
courseSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'course',
  localField: '_id'
});

// Index for fast queries
courseSchema.index({ price: 1, ratingsAverage: -1 });
courseSchema.index({ slug: 1 });
courseSchema.index({ category: 1 });

// Document middleware: runs before .save() and .create()
courseSchema.pre('save', function(next) {
  // Generate slug from the title
  this.slug = this.title.toLowerCase().split(' ').join('-');
  next();
});

// Query middleware
courseSchema.pre(/^find/, function(next) {
  // Only find active courses
  this.find({ active: { $ne: false } });
  next();
});

// Populate educator when querying courses
courseSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'educator',
    select: 'name email avatar'
  });
  next();
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course; 
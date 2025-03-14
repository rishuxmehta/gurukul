const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Enrollment must belong to a student']
  },
  course: {
    type: mongoose.Schema.ObjectId,
    ref: 'Course',
    required: [true, 'Enrollment must belong to a course']
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  completedAt: Date,
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  certificate: {
    issued: {
      type: Boolean,
      default: false
    },
    issuedAt: Date,
    certificateUrl: String,
    certificateId: String
  },
  // Tracking completed lessons
  completedLessons: [
    {
      sectionId: {
        type: mongoose.Schema.ObjectId
      },
      lessonId: {
        type: mongoose.Schema.ObjectId
      },
      completedAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  // Tracking quiz results
  quizResults: [
    {
      quizId: {
        type: mongoose.Schema.ObjectId
      },
      score: Number,
      correctAnswers: Number,
      totalQuestions: Number,
      attemptedAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  lastAccessedAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes to make queries faster
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });
enrollmentSchema.index({ course: 1, status: 1 });
enrollmentSchema.index({ student: 1, status: 1 });

// Populate both student and course info when querying enrollments
enrollmentSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'student',
    select: 'name email avatar'
  }).populate({
    path: 'course',
    select: 'title slug category level imageCover'
  });
  
  next();
});

// Update progress when a lesson is completed
enrollmentSchema.methods.updateProgress = async function(courseData) {
  const totalLessons = courseData.sections.reduce(
    (total, section) => total + section.lessons.length, 
    0
  );
  
  if (totalLessons === 0) return 0;
  
  const completedCount = this.completedLessons.length;
  const progressPercentage = Math.round((completedCount / totalLessons) * 100);
  
  this.progress = progressPercentage;
  
  // Mark as completed if progress is 100%
  if (this.progress === 100 && this.status !== 'completed') {
    this.status = 'completed';
    this.completedAt = Date.now();
  }
  
  await this.save();
  return this.progress;
};

// Issue certificate
enrollmentSchema.methods.issueCertificate = async function() {
  if (this.progress < 100) {
    throw new Error('Cannot issue certificate for incomplete course');
  }
  
  if (!this.certificate.issued) {
    const certificateId = `CERT-${this.student._id.toString().slice(-6)}-${this.course._id.toString().slice(-6)}`;
    
    this.certificate = {
      issued: true,
      issuedAt: Date.now(),
      certificateId,
      certificateUrl: `/certificates/${certificateId}.pdf`
    };
    
    await this.save();
  }
  
  return this.certificate;
};

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

module.exports = Enrollment; 
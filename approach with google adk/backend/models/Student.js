import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema({
  student_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    sparse: true,
    lowercase: true
  },
  grade: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes for better query performance
StudentSchema.index({ student_id: 1 });
StudentSchema.index({ email: 1 });

// Virtual for total sessions
StudentSchema.virtual('totalSessions', {
  ref: 'AssessmentSession',
  localField: 'student_id',
  foreignField: 'student_id',
  count: true
});

// Method to get student profile
StudentSchema.methods.getProfile = async function() {
  const AssessmentSession = mongoose.model('AssessmentSession');
  const QuestionAttempt = mongoose.model('QuestionAttempt');
  
  const sessions = await AssessmentSession.find({ student_id: this.student_id }).lean();
  const attempts = await QuestionAttempt.find({ student_id: this.student_id }).lean();
  
  const totalQuestions = attempts.length;
  const correctAnswers = attempts.filter(a => a.is_correct).length;
  const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions * 100) : 0;
  
  return {
    student: this,
    totalSessions: sessions.length,
    totalQuestions,
    correctAnswers,
    accuracy,
    avgStress: sessions.reduce((sum, s) => sum + (s.average_stress || 0), 0) / sessions.length || 0
  };
};

export default mongoose.model('Student', StudentSchema);

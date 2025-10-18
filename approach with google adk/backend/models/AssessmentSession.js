import mongoose from 'mongoose';

const AssessmentSessionSchema = new mongoose.Schema({
  session_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  student_id: {
    type: String,
    required: true,
    index: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    index: true
  },
  topic: {
    type: String,
    required: true,
    index: true
  },
  subject: {
    type: String,
    required: true,
    index: true
  },
  grade: {
    type: Number,
    required: true
  },
  total_questions: {
    type: Number,
    required: true
  },
  questions_answered: {
    type: Number,
    default: 0
  },
  correct_answers: {
    type: Number,
    default: 0
  },
  average_stress: {
    type: Number,
    min: 0,
    max: 5
  },
  dominant_emotion: {
    type: String,
    enum: ['happy', 'sad', 'angry', 'fear', 'surprise', 'disgust', 'neutral']
  },
  completion_status: {
    type: String,
    enum: ['in_progress', 'completed', 'abandoned'],
    default: 'in_progress'
  },
  start_time: {
    type: Date,
    default: Date.now
  },
  end_time: {
    type: Date
  },
  duration_minutes: {
    type: Number
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'abandoned'],
    default: 'active'
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for complex queries
AssessmentSessionSchema.index({ student_id: 1, topic: 1 });
AssessmentSessionSchema.index({ start_time: -1 });
AssessmentSessionSchema.index({ completion_status: 1 });

// Pre-save middleware to calculate duration
AssessmentSessionSchema.pre('save', function(next) {
  if (this.end_time && this.start_time) {
    this.duration_minutes = Math.round((this.end_time - this.start_time) / 60000);
  }
  next();
});

// Method to complete session
AssessmentSessionSchema.methods.complete = async function(averageStress, dominantEmotion) {
  this.end_time = new Date();
  this.average_stress = averageStress;
  this.dominant_emotion = dominantEmotion;
  this.completion_status = 'completed';
  await this.save();
};

export default mongoose.model('AssessmentSession', AssessmentSessionSchema);

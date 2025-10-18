import mongoose from 'mongoose';

const QuestionAttemptSchema = new mongoose.Schema({
  session_id: {
    type: String,
    required: true,
    index: true
  },
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AssessmentSession',
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
  question_number: {
    type: Number,
    required: false,  // Make optional for flexibility
    default: 0
  },
  question_text: {
    type: String,
    required: true
  },
  question_type: {
    type: String,
    enum: ['multiple-choice', 'multiple_choice', 'true-false', 'short-answer', 'essay', 'mcq', 'MCQ'],
    required: false,  // Make optional
    default: 'multiple-choice'
  },
  options: [{
    type: String
  }],
  difficulty_level: {
    type: Number,
    min: 1,
    max: 5,
    required: false,  // Make optional
    default: 3
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  bloom_level: {
    type: String,
    enum: ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create', 'unknown'],
    required: false,  // Make optional
    default: 'Understand'
  },
  student_answer: {
    type: String,
    required: true
  },
  correct_answer: {
    type: String,
    required: true
  },
  is_correct: {
    type: Boolean,
    required: true
  },
  isCorrect: {
    type: Boolean
  },
  emotion_during_answer: {
    type: String,
    enum: ['happy', 'sad', 'angry', 'fear', 'surprise', 'disgust', 'neutral']
  },
  stress_level: {
    type: Number,
    min: 0,  // Changed from 1 to 0 (supports 0-1 scale from emotion tracker)
    max: 5,
    default: 3
  },
  time_taken_seconds: {
    type: Number,
    min: 0
  },
  timeSpent: {
    type: Number,
    min: 0
  },
  ai_feedback: {
    feedback: String,
    encouragement: String,
    explanation: String,
    misconception: String,
    nextStep: String
  },
  ai_reasoning: {
    type: String
  },
  attemptedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound indexes for analytics
QuestionAttemptSchema.index({ student_id: 1, topic: 1 });
QuestionAttemptSchema.index({ session_id: 1, question_number: 1 });
QuestionAttemptSchema.index({ is_correct: 1 });
QuestionAttemptSchema.index({ difficulty_level: 1 });

// Static method to get topic performance
QuestionAttemptSchema.statics.getTopicPerformance = async function(studentId, topic) {
  const attempts = await this.find({ student_id: studentId, topic: topic });
  
  if (attempts.length === 0) return null;
  
  const correct = attempts.filter(a => a.is_correct).length;
  const total = attempts.length;
  const accuracy = (correct / total) * 100;
  const avgDifficulty = attempts.reduce((sum, a) => sum + a.difficulty_level, 0) / total;
  const avgStress = attempts.reduce((sum, a) => sum + (a.stress_level || 0), 0) / total;
  
  return {
    topic,
    totalAttempts: total,
    correctAnswers: correct,
    accuracy,
    avgDifficulty,
    avgStress
  };
};

export default mongoose.model('QuestionAttempt', QuestionAttemptSchema);

import mongoose from 'mongoose';

const emotionTrackingSchema = new mongoose.Schema({
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  attemptId: { 
    type: String,  // Changed from ObjectId to String to match Attempt model
    required: true,
    index: true 
  },
  timestamp: { 
    type: Date, 
    default: Date.now,
    index: true 
  },
  emotions: {
    happy: { type: Number, default: 0, min: 0, max: 100 },
    sad: { type: Number, default: 0, min: 0, max: 100 },
    angry: { type: Number, default: 0, min: 0, max: 100 },
    fear: { type: Number, default: 0, min: 0, max: 100 },
    neutral: { type: Number, default: 0, min: 0, max: 100 },
    surprise: { type: Number, default: 0, min: 0, max: 100 },
    disgust: { type: Number, default: 0, min: 0, max: 100 }
  },
  dominantEmotion: { 
    type: String, 
    enum: ['happy', 'sad', 'angry', 'fear', 'neutral', 'surprise', 'disgust'],
    required: true 
  },
  stressLevel: { 
    type: Number, 
    required: true,
    min: 0,
    max: 1 
  },
  questionNumber: { 
    type: Number, 
    required: true,
    min: 1 
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
emotionTrackingSchema.index({ studentId: 1, timestamp: -1 });
emotionTrackingSchema.index({ attemptId: 1, questionNumber: 1 });

// Named export to match other models (User, Attempt, etc.)
export const EmotionTracking = mongoose.model('EmotionTracking', emotionTrackingSchema);

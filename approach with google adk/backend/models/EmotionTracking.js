import mongoose from 'mongoose';

const EmotionTrackingSchema = new mongoose.Schema({
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
  question_number: {
    type: Number,
    required: true
  },
  emotion: {
    type: String,
    enum: ['happy', 'sad', 'angry', 'fear', 'surprise', 'disgust', 'neutral'],
    required: true
  },
  dominantEmotion: {
    type: String,
    enum: ['happy', 'sad', 'angry', 'fear', 'surprise', 'disgust', 'neutral']
  },
  stress_level: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  stressLevel: {
    type: Number,
    min: 1,
    max: 5
  },
  emotion_scores: {
    type: Map,
    of: Number
  },
  frame_count: {
    type: Number,
    default: 0
  },
  analysis_duration: {
    type: Number
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
EmotionTrackingSchema.index({ session_id: 1, question_number: 1 });
EmotionTrackingSchema.index({ student_id: 1, createdAt: -1 });

// Static method to get emotion patterns
EmotionTrackingSchema.statics.getEmotionPatterns = async function(studentId, limit = 10) {
  const emotions = await this.find({ student_id: studentId })
    .sort({ createdAt: -1 })
    .limit(limit);
  
  if (emotions.length === 0) return null;
  
  const emotionCounts = {};
  let totalStress = 0;
  
  emotions.forEach(e => {
    emotionCounts[e.emotion] = (emotionCounts[e.emotion] || 0) + 1;
    totalStress += e.stress_level;
  });
  
  const dominantEmotion = Object.keys(emotionCounts).reduce((a, b) => 
    emotionCounts[a] > emotionCounts[b] ? a : b
  );
  
  return {
    dominantEmotion,
    emotionDistribution: emotionCounts,
    avgStress: totalStress / emotions.length,
    totalRecords: emotions.length
  };
};

export default mongoose.model('EmotionTracking', EmotionTrackingSchema);

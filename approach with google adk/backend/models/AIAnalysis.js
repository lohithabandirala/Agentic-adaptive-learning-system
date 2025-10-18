import mongoose from 'mongoose';

const AIAnalysisSchema = new mongoose.Schema({
  student_id: {
    type: String,
    required: true,
    index: true
  },
  session_id: {
    type: String,
    index: true
  },
  analysis_type: {
    type: String,
    enum: ['performance', 'emotion', 'session_summary', 'recommendation', 'progress'],
    required: true
  },
  insights: {
    overallSummary: String,
    strengths: [String],
    weaknesses: [String],
    emotionalInsights: {
      patterns: String,
      triggers: [String],
      recommendations: [String]
    },
    topicInsights: [{
      topic: String,
      performance: String,
      recommendation: String
    }],
    performanceSummary: String,
    emotionalJourney: String,
    keyAchievements: [String],
    areasForImprovement: [String],
    personalizedEncouragement: String
  },
  recommendations: {
    immediate: [String],
    shortTerm: [String],
    longTerm: [String]
  },
  suggested_difficulty: {
    type: Number,
    min: 1,
    max: 5
  },
  focus_areas: [String],
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes
AIAnalysisSchema.index({ student_id: 1, createdAt: -1 });
AIAnalysisSchema.index({ session_id: 1 });
AIAnalysisSchema.index({ analysis_type: 1 });

// Static method to get latest analysis
AIAnalysisSchema.statics.getLatestAnalysis = async function(studentId, analysisType = null) {
  const query = { student_id: studentId };
  if (analysisType) query.analysis_type = analysisType;
  
  return await this.findOne(query).sort({ createdAt: -1 });
};

export default mongoose.model('AIAnalysis', AIAnalysisSchema);

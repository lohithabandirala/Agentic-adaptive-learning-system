import mongoose, { Schema, Document } from 'mongoose';

export interface ITopicPerformance {
  topic: string;
  accuracy: number;
  testsCount: number;
  averageStress: number;
  lastAttempted: Date;
}

export interface IDifficultyProgression {
  timestamp: Date;
  difficulty: 'easy' | 'medium' | 'hard';
  testId: string;
  accuracy: number;
}

export interface IStudentAnalytics extends Document {
  studentId: mongoose.Types.ObjectId;
  overallAccuracy: number;
  testsCompleted: number;
  totalQuestions: number;
  averageStress: number;
  averageEmotionStress: number;
  topicPerformance: ITopicPerformance[];
  difficultyProgression: IDifficultyProgression[];
  strengths: string[]; // Topics with >80% accuracy
  weaknesses: string[]; // Topics with <50% accuracy
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  updateFromAttempt(attempt: any, test: any): Promise<void>;
}

const TopicPerformanceSchema = new Schema({
  topic: { type: String, required: true },
  accuracy: { type: Number, required: true, min: 0, max: 1 },
  testsCount: { type: Number, required: true, default: 1 },
  averageStress: { type: Number, default: 0 },
  lastAttempted: { type: Date, default: Date.now }
});

const DifficultyProgressionSchema = new Schema({
  timestamp: { type: Date, default: Date.now },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  testId: { type: String, required: true },
  accuracy: { type: Number, required: true, min: 0, max: 1 }
});

const StudentAnalyticsSchema = new Schema<IStudentAnalytics>({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  overallAccuracy: {
    type: Number, 
    default: 0, 
    min: 0, 
    max: 1 
  },
  testsCompleted: { 
    type: Number, 
    default: 0,
    min: 0
  },
  totalQuestions: { 
    type: Number, 
    default: 0,
    min: 0
  },
  averageStress: { 
    type: Number, 
    default: 0,
    min: 0,
    max: 10
  },
  averageEmotionStress: { 
    type: Number, 
    default: 0,
    min: 0,
    max: 1
  },
  topicPerformance: [TopicPerformanceSchema],
  difficultyProgression: [DifficultyProgressionSchema],
  strengths: [{ type: String }],
  weaknesses: [{ type: String }],
  lastUpdated: { 
    type: Date, 
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
StudentAnalyticsSchema.index({ overallAccuracy: -1 }); // For leaderboards
StudentAnalyticsSchema.index({ testsCompleted: -1 }); // For active students
StudentAnalyticsSchema.index({ lastUpdated: -1 }); // For recent activity

// Methods to update analytics
StudentAnalyticsSchema.methods.updateFromAttempt = async function(attempt: any, test: any) {
  const totalCorrect = attempt.results.filter((r: any) => r.isCorrect).length;
  const accuracy = totalCorrect / attempt.results.length;
  const avgStress = attempt.results.reduce((sum: number, r: any) => sum + (r.stress || 0), 0) / attempt.results.length;
  const avgEmotionStress = attempt.results.reduce((sum: number, r: any) => sum + (r.stressLevel || 0), 0) / attempt.results.length;
  
  // Update overall metrics
  const totalTests = this.testsCompleted + 1;
  const totalQs = this.totalQuestions + attempt.results.length;
  
  this.overallAccuracy = (this.overallAccuracy * this.testsCompleted + accuracy) / totalTests;
  this.testsCompleted = totalTests;
  this.totalQuestions = totalQs;
  this.averageStress = (this.averageStress * this.testsCompleted + avgStress) / totalTests;
  this.averageEmotionStress = (this.averageEmotionStress * this.testsCompleted + avgEmotionStress) / totalTests;
  
  // Update topic performance
  const topicIndex = this.topicPerformance.findIndex((tp: ITopicPerformance) => tp.topic === test.topic);
  if (topicIndex >= 0) {
    const tp = this.topicPerformance[topicIndex];
    tp.accuracy = (tp.accuracy * tp.testsCount + accuracy) / (tp.testsCount + 1);
    tp.testsCount += 1;
    tp.averageStress = (tp.averageStress * (tp.testsCount - 1) + avgStress) / tp.testsCount;
    tp.lastAttempted = new Date();
  } else {
    this.topicPerformance.push({
      topic: test.topic,
      accuracy: accuracy,
      testsCount: 1,
      averageStress: avgStress,
      lastAttempted: new Date()
    });
  }
  
  // Add to difficulty progression
  this.difficultyProgression.push({
    timestamp: new Date(),
    difficulty: attempt.currentDifficulty,
    testId: attempt.testId,
    accuracy: accuracy
  });
  
  // Keep only last 20 progression entries
  if (this.difficultyProgression.length > 20) {
    this.difficultyProgression = this.difficultyProgression.slice(-20);
  }
  
  // Update strengths and weaknesses
  this.strengths = this.topicPerformance
    .filter((tp: ITopicPerformance) => tp.accuracy >= 0.8)
    .map((tp: ITopicPerformance) => tp.topic);
  
  this.weaknesses = this.topicPerformance
    .filter((tp: ITopicPerformance) => tp.accuracy < 0.5)
    .map((tp: ITopicPerformance) => tp.topic);
  
  this.lastUpdated = new Date();
  
  return this.save();
};

export const StudentAnalytics = mongoose.model<IStudentAnalytics>('StudentAnalytics', StudentAnalyticsSchema);

import mongoose, { Schema, Document } from 'mongoose';

export interface IAttemptResult {
  questionId: string;
  questionText: string; // Store the actual question
  selectedAnswer: string; // What student selected
  correctAnswer: string; // Correct answer
  isCorrect: boolean;
  stress: number;
  timeTaken: number;
  difficulty: 'easy' | 'medium' | 'hard';
  stressLevel?: number; // Emotion tracking: 0-1 stress level
  dominantEmotion?: string; // Emotion tracking: happy, sad, angry, fear, neutral, surprise, disgust
}

export interface IAttempt extends Document {
  attemptId: string;
  testId: string;
  studentId: string;
  results: IAttemptResult[];
  currentDifficulty: 'easy' | 'medium' | 'hard';
  index: number; // Number of questions answered
  currentSession: number; // Current session number (0-indexed)
  currentSessionQuestions: any[]; // Store current batch of questions
  sessionAnalytics: any[]; // Store analytics from each completed session
  completed: boolean;
  startedAt: Date;
  completedAt?: Date;
}

const AttemptResultSchema = new Schema({
  questionId: { type: String, required: true },
  questionText: { type: String, required: true },
  selectedAnswer: { type: String, required: true },
  correctAnswer: { type: String, required: true },
  isCorrect: { type: Boolean, required: true },
  stress: { type: Number, required: true },
  timeTaken: { type: Number, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  stressLevel: { type: Number, min: 0, max: 1 },
  dominantEmotion: { type: String },
});

const AttemptSchema = new Schema<IAttempt>({
  attemptId: { type: String, required: true, unique: true },
  testId: { type: String, required: true },
  studentId: { type: String, required: true },
  results: [AttemptResultSchema],
  currentDifficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
  index: { type: Number, default: 0 },
  currentSession: { type: Number, default: 0 },
  currentSessionQuestions: [Schema.Types.Mixed],
  sessionAnalytics: [Schema.Types.Mixed],
  completed: { type: Boolean, default: false },
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
});

export const Attempt = mongoose.model<IAttempt>('Attempt', AttemptSchema);

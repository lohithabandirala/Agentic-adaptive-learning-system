import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface ITest extends Document {
  testId: string;
  testName: string;
  classId: string;
  // Changed: Store topic/material instead of pre-generated questions
  topic: string; // The text topic or material content
  numQuestions: number; // How many questions to generate
  materialId?: string; // Optional material file reference
  createdBy: string;
  createdAt: Date;
}

const TestSchema = new Schema<ITest>({
  testId: { type: String, required: true, unique: true },
  testName: { type: String, required: true },
  classId: { type: String, required: true },
  topic: { type: String, required: true }, // Topic for AI generation
  numQuestions: { type: Number, required: true, default: 10 },
  materialId: { type: String },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Test = mongoose.model<ITest>('Test', TestSchema);

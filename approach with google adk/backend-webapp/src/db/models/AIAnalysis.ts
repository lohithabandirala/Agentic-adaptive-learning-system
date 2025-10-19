import mongoose, { Schema, Document } from 'mongoose';

export interface IToolCall {
  toolName: string;
  arguments: any;
  result: any;
  success: boolean;
  executionTimeMs: number;
}

export interface IAIAnalysis extends Document {
  attemptId: string;
  studentId: mongoose.Types.ObjectId;
  session: number;
  timestamp: Date;
  analysisType: 'question_generation' | 'session_analysis' | 'final_analysis';
  
  // Input data
  prompt: string;
  inputData: {
    topic?: string;
    difficulty?: string;
    numQuestions?: number;
    sessionAnswers?: any[];
    emotions?: any;
  };
  
  // ADK Agent data
  aiModel: string; // e.g., "gemini-2.0-flash-exp"
  toolCallsUsed: IToolCall[];
  iterations: number;
  
  // Output data
  response: string; // Full ADK response
  recommendation?: string;
  nextDifficulty?: string;
  questionsGenerated?: number;
  
  // Performance metrics
  processingTimeMs: number;
  tokensUsed?: number;
  
  // Status
  success: boolean;
  error?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const ToolCallSchema = new Schema({
  toolName: { type: String, required: true },
  arguments: { type: Schema.Types.Mixed },
  result: { type: Schema.Types.Mixed },
  success: { type: Boolean, required: true },
  executionTimeMs: { type: Number }
});

const AIAnalysisSchema = new Schema<IAIAnalysis>({
  attemptId: {
    type: String,
    required: true,
    index: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  session: {
    type: Number, 
    required: true 
  },
  timestamp: { 
    type: Date, 
    default: Date.now,
    index: true 
  },
  analysisType: { 
    type: String, 
    enum: ['question_generation', 'session_analysis', 'final_analysis'],
    required: true,
    index: true
  },
  
  // Input
  prompt: { 
    type: String, 
    required: true 
  },
  inputData: {
    topic: { type: String },
    difficulty: { type: String },
    numQuestions: { type: Number },
    sessionAnswers: [{ type: Schema.Types.Mixed }],
    emotions: { type: Schema.Types.Mixed }
  },
  
  // ADK Agent
  aiModel: { 
    type: String, 
    default: 'gemini-2.0-flash-exp' 
  },
  toolCallsUsed: [ToolCallSchema],
  iterations: { 
    type: Number, 
    default: 1 
  },
  
  // Output
  response: { 
    type: String, 
    required: true 
  },
  recommendation: { type: String },
  nextDifficulty: { type: String },
  questionsGenerated: { type: Number },
  
  // Performance
  processingTimeMs: { 
    type: Number, 
    required: true 
  },
  tokensUsed: { type: Number },
  
  // Status
  success: { 
    type: Boolean, 
    required: true,
    index: true
  },
  error: { type: String }
}, {
  timestamps: true
});

// Compound indexes for complex queries
AIAnalysisSchema.index({ studentId: 1, timestamp: -1 }); // Student's AI history
AIAnalysisSchema.index({ attemptId: 1, session: 1 }); // Session-specific AI calls
AIAnalysisSchema.index({ analysisType: 1, success: 1 }); // Analysis by type and status
AIAnalysisSchema.index({ processingTimeMs: -1 }); // Performance analysis

// Static method to create from ADK result
AIAnalysisSchema.statics.createFromADKResult = async function(data: {
  attemptId: string;
  studentId: string;
  session: number;
  analysisType: 'question_generation' | 'session_analysis' | 'final_analysis';
  prompt: string;
  inputData: any;
  model: string;
  toolCallsUsed: IToolCall[];
  iterations: number;
  response: string;
  recommendation?: string;
  nextDifficulty?: string;
  questionsGenerated?: number;
  processingTimeMs: number;
  success: boolean;
  error?: string;
}) {
  return this.create({
    attemptId: data.attemptId,
    studentId: data.studentId,
    session: data.session,
    timestamp: new Date(),
    analysisType: data.analysisType,
    prompt: data.prompt,
    inputData: data.inputData,
    model: data.model,
    toolCallsUsed: data.toolCallsUsed,
    iterations: data.iterations,
    response: data.response,
    recommendation: data.recommendation,
    nextDifficulty: data.nextDifficulty,
    questionsGenerated: data.questionsGenerated,
    processingTimeMs: data.processingTimeMs,
    success: data.success,
    error: data.error
  });
};

// Method to get summary
AIAnalysisSchema.methods.getSummary = function() {
  return {
    id: this._id,
    timestamp: this.timestamp,
    analysisType: this.analysisType,
    success: this.success,
    processingTimeMs: this.processingTimeMs,
    toolCallsUsed: this.toolCallsUsed.map((tc: IToolCall) => tc.toolName),
    iterations: this.iterations,
    recommendation: this.recommendation,
    error: this.error
  };
};

export const AIAnalysis = mongoose.model<IAIAnalysis>('AIAnalysis', AIAnalysisSchema);

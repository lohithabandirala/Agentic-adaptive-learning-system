// Google ADK Agent for Question Generation and Analysis
// FULL INTEGRATION: Database querying, emotion analysis, function calling, AI analytics
// Using Vertex AI with Service Account for higher quota

import { VertexAI } from '@google-cloud/vertexai';
import { User, Attempt, EmotionTracking, AIAnalysis, IToolCall } from '../db/models';
import { generateFallbackQuestions, generateFallbackAnalysis } from './fallbackQuestions';

// Initialize Vertex AI with service account
const project = process.env.GOOGLE_CLOUD_PROJECT || 'scenic-shift-473208-u2';
const location = 'us-central1';

// Service account credentials are loaded from GOOGLE_APPLICATION_CREDENTIALS env var
const vertexAI = new VertexAI({ 
  project: project, 
  location: location 
});

const model = 'gemini-2.0-flash-exp'; // Supports function calling

console.log(`🔧 Vertex AI initialized with project: ${project}, location: ${location}`);

// Quota tracking
let apiCallsToday = 0;
let lastResetDate = new Date().toDateString();
const DAILY_QUOTA_LIMIT = 45; // Leave some buffer from 50 limit

function checkAndResetQuota() {
  const today = new Date().toDateString();
  if (today !== lastResetDate) {
    apiCallsToday = 0;
    lastResetDate = today;
    console.log('🔄 API quota reset for new day');
  }
}

function canMakeAPICall(): boolean {
  checkAndResetQuota();
  return apiCallsToday < DAILY_QUOTA_LIMIT;
}

function incrementAPICall() {
  apiCallsToday++;
  console.log(`📊 API calls today: ${apiCallsToday}/${DAILY_QUOTA_LIMIT}`);
}

// ============================================
// AGENT TOOLS - FUNCTION DECLARATIONS
// ============================================

const queryStudentPerformanceTool = {
  name: 'query_student_performance',
  description: 'Query comprehensive student performance data including overall accuracy, recent test scores, average difficulty level, and number of tests taken. Returns detailed performance metrics.',
  parameters: {
    type: 'object' as const,
    properties: {
      studentId: {
        type: 'string' as const,
        description: 'The MongoDB ObjectId of the student'
      }
    },
    required: ['studentId']
  }
};

const queryEmotionPatternsTool = {
  name: 'query_emotion_patterns',
  description: 'Query student emotion patterns during tests including average stress levels, dominant emotions, emotional stability, and recent emotion trends. Essential for adapting question difficulty based on emotional state.',
  parameters: {
    type: 'object' as const,
    properties: {
      studentId: {
        type: 'string' as const,
        description: 'The MongoDB ObjectId of the student'
      },
      attemptId: {
        type: 'string' as const,
        description: 'Optional: specific attempt ID to analyze'
      }
    },
    required: ['studentId']
  }
};

const queryRecentAttemptsTool = {
  name: 'query_recent_attempts',
  description: 'Query recent test attempts to see performance trends, topics covered, and difficulty progression. Helps avoid repetition and build on previous learning.',
  parameters: {
    type: 'object' as const,
    properties: {
      studentId: {
        type: 'string' as const,
        description: 'The MongoDB ObjectId of the student'
      },
      limit: {
        type: 'number' as const,
        description: 'Number of recent attempts to retrieve (default: 5)'
      }
    },
    required: ['studentId']
  }
};

const agentTools = [
  queryStudentPerformanceTool,
  queryEmotionPatternsTool,
  queryRecentAttemptsTool
];

// ============================================
// TOOL IMPLEMENTATION FUNCTIONS
// ============================================

async function queryStudentPerformance(studentId: string) {
  try {
    console.log(`📊 Querying performance for student: ${studentId}`);
    
    const attempts = await Attempt.find({ studentId })
      .sort({ createdAt: -1 })
      .limit(10);

    if (attempts.length === 0) {
      return {
        message: 'No previous attempts found - new student',
        overallAccuracy: 0,
        totalTests: 0,
        averageDifficulty: 'easy'
      };
    }

    // Calculate overall metrics
    const completedAttempts = attempts.filter(a => a.completed);
    let totalCorrect = 0;
    let totalQuestions = 0;
    const difficulties: string[] = [];

    completedAttempts.forEach(attempt => {
      const correct = attempt.results.filter(r => r.isCorrect).length;
      totalCorrect += correct;
      totalQuestions += attempt.results.length;
      difficulties.push(attempt.currentDifficulty);
    });

    const overallAccuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions * 100) : 0;
    
    // Most common difficulty
    const diffCounts = difficulties.reduce((acc, d) => {
      acc[d] = (acc[d] || 0) + 1;
      return acc;
    }, {} as any);
    const averageDifficulty = Object.keys(diffCounts).sort((a, b) => diffCounts[b] - diffCounts[a])[0] || 'medium';

    // Recent performance (last 3 attempts)
    const recentAttempts = completedAttempts.slice(0, 3);
    const recentScores = recentAttempts.map(a => {
      const correct = a.results.filter(r => r.isCorrect).length;
      return (correct / a.results.length * 100).toFixed(1);
    });

    return {
      success: true,
      studentId,
      overallAccuracy: overallAccuracy.toFixed(1),
      totalTests: completedAttempts.length,
      totalQuestions,
      averageDifficulty,
      recentScores,
      trend: recentScores.length >= 2 ? 
        (parseFloat(recentScores[0]) > parseFloat(recentScores[1]) ? 'improving' : 
         parseFloat(recentScores[0]) < parseFloat(recentScores[1]) ? 'declining' : 'stable') : 'unknown'
    };
  } catch (error: any) {
    console.error('Error querying student performance:', error);
    return { error: error.message };
  }
}

async function queryEmotionPatterns(studentId: string, attemptId?: string) {
  try {
    console.log(`😊 Querying emotion patterns for student: ${studentId}`);
    
    const query: any = { studentId };
    if (attemptId) {
      query.attemptId = attemptId;
    }

    const emotionRecords = await EmotionTracking.find(query)
      .sort({ timestamp: -1 })
      .limit(100);

    if (emotionRecords.length === 0) {
      return {
        success: true, // Important: This is not an error, just no data yet
        message: 'No emotion data available yet - this is normal for new attempts',
        studentId,
        attemptId,
        recordsAnalyzed: 0,
        averageStressLevel: '0.00',
        emotionalStability: 'unknown',
        dominantEmotions: [],
        emotionDistribution: {},
        recentEmotions: [],
        recommendation: 'No emotion data - using standard difficulty'
      };
    }

    // Calculate average stress level
    const avgStressLevel = emotionRecords.reduce((sum, e) => sum + e.stressLevel, 0) / emotionRecords.length;

    // Emotion distribution
    const emotionCounts: any = {};
    emotionRecords.forEach(record => {
      emotionCounts[record.dominantEmotion] = (emotionCounts[record.dominantEmotion] || 0) + 1;
    });

    // Sort emotions by frequency
    const dominantEmotions = Object.keys(emotionCounts)
      .sort((a, b) => emotionCounts[b] - emotionCounts[a])
      .slice(0, 3);

    // Emotional stability (variance in stress levels)
    const stressLevels = emotionRecords.map(e => e.stressLevel);
    const avgStress = stressLevels.reduce((a, b) => a + b, 0) / stressLevels.length;
    const variance = stressLevels.reduce((sum, level) => sum + Math.pow(level - avgStress, 2), 0) / stressLevels.length;
    const emotionalStability = variance < 0.1 ? 'stable' : variance < 0.2 ? 'moderate' : 'volatile';

    // Recent emotion trends (last 10 records)
    const recentEmotions = emotionRecords.slice(0, 10).map(e => ({
      emotion: e.dominantEmotion,
      stress: e.stressLevel.toFixed(2),
      questionNumber: e.questionNumber
    }));

    return {
      success: true,
      studentId,
      attemptId,
      recordsAnalyzed: emotionRecords.length,
      averageStressLevel: avgStressLevel.toFixed(2),
      emotionalStability,
      dominantEmotions,
      emotionDistribution: emotionCounts,
      recentEmotions,
      recommendation: avgStressLevel > 0.6 ? 'High stress detected - consider easier questions' :
                     avgStressLevel > 0.4 ? 'Moderate stress - maintain current difficulty' :
                     'Low stress - can increase difficulty'
    };
  } catch (error: any) {
    console.error('Error querying emotion patterns:', error);
    return { error: error.message };
  }
}

async function queryRecentAttempts(studentId: string, limit: number = 5) {
  try {
    console.log(`📝 Querying recent attempts for student: ${studentId}`);
    
    const attempts = await Attempt.find({ studentId })
      .sort({ createdAt: -1 })
      .limit(limit);

    return {
      success: true,
      studentId,
      attemptsCount: attempts.length,
      attempts: attempts.map(a => ({
        attemptId: a.attemptId,
        testId: a.testId,
        questionsAnswered: a.results.length,
        correctAnswers: a.results.filter(r => r.isCorrect).length,
        accuracy: a.results.length > 0 ? 
          (a.results.filter(r => r.isCorrect).length / a.results.length * 100).toFixed(1) : 0,
        currentDifficulty: a.currentDifficulty,
        currentSession: a.currentSession,
        completed: a.completed,
        createdAt: a.createdAt
      }))
    };
  } catch (error: any) {
    console.error('Error querying recent attempts:', error);
    return { error: error.message };
  }
}

// ============================================
// AGENT EXECUTION - HANDLE FUNCTION CALLS
// ============================================

async function executeToolCall(functionCall: any) {
  const { name, args } = functionCall;
  
  console.log(`\n🔧 Agent Tool Call: ${name}`);
  console.log('📥 Arguments:', JSON.stringify(args, null, 2));

  let result;

  switch (name) {
    case 'query_student_performance':
      result = await queryStudentPerformance(args.studentId);
      break;
    case 'query_emotion_patterns':
      result = await queryEmotionPatterns(args.studentId, args.attemptId);
      break;
    case 'query_recent_attempts':
      result = await queryRecentAttempts(args.studentId, args.limit);
      break;
    default:
      result = { error: `Unknown function: ${name}` };
  }

  console.log('📤 Tool Result Summary:', result.success ? '✅ Success' : '❌ Error');
  return result;
}

// ============================================
// FULL ADK AGENT - QUESTION GENERATION WITH DATA QUERYING
// ============================================

export async function generateQuestionsWithFullADK(params: {
  topic: string;
  count: number;
  studentId: string;
  attemptId?: string;
  session?: number;
}): Promise<{ success: boolean; questions?: any[]; reasoning?: string; error?: string; usedFallback?: boolean }> {
  const startTime = Date.now();
  const toolCallsUsed: IToolCall[] = [];
  let analysisId: any = null;
  
  try {
    const { topic, count, studentId, attemptId, session = 0 } = params;

    console.log(`\n🤖 FULL ADK AGENT: Generating ${count} questions`);
    console.log(`   Topic: ${topic}, Student: ${studentId}`);

    // Check quota before making API call
    if (!canMakeAPICall()) {
      console.log('⚠️ API quota exceeded, using fallback question generator');
      const fallbackQuestions = generateFallbackQuestions({ topic, count, difficulty: 'medium' });
      
      // Save fallback analysis
      const analysis = new AIAnalysis({
        attemptId: attemptId || `session_${Date.now()}`,
        studentId,
        questionCount: count,
        usedFallback: true,
        reasoning: 'API quota exceeded - used template-based questions',
        toolCalls: [],
        totalIterations: 0,
        processingTime: Date.now() - startTime,
        modelUsed: 'fallback-templates',
        success: true
      });
      await analysis.save();

      return {
        success: true,
        questions: fallbackQuestions,
        reasoning: 'Using fallback templates due to API quota limit',
        usedFallback: true
      };
    }

    incrementAPICall();

    const generativeModel = vertexAI.getGenerativeModel({
      model: model,
      tools: [{ functionDeclarations: agentTools }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096,
      }
    });

    const chat = generativeModel.startChat();

    const initialPrompt = `You are an intelligent adaptive learning agent with access to student data.

TASK: Generate exactly ${count} personalized questions about "${topic}"

WORKFLOW:
1. First, call query_student_performance to understand the student's skill level and performance history
2. Then, call query_emotion_patterns to check their stress levels and emotional state
3. Then, call query_recent_attempts to see what they've been working on recently
4. Based on ALL this data, intelligently generate ${count} questions that:
   - Match their current skill level (not too hard, not too easy)
   - Consider their emotional state (reduce difficulty if stressed)
   - Build on their recent work (avoid exact repetition but reinforce concepts)
   - Include varied difficulties (70% at their level, 20% easier, 10% harder)

Student ID: ${studentId}
${attemptId ? `Attempt ID: ${attemptId}` : ''}

Generate questions in this JSON format:
[
  {
    "question": "Clear question text?",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": "A",
    "explanation": "Why this is correct",
    "difficulty": "easy|medium|hard",
    "topic": "${topic}",
    "reasoning": "Why I chose this difficulty/topic for this student"
  }
]

Start by calling the query tools to gather student insights!`;

    let result = await chat.sendMessage(initialPrompt);
    let maxIterations = 15;
    let iterations = 0;
    let agentReasoning = '';

    while (iterations < maxIterations) {
      iterations++;
      
      if (!result || !result.response) {
        throw new Error('No response from AI model');
      }

      const response = result.response;
      const candidates = response.candidates;

      if (!candidates || candidates.length === 0) {
        throw new Error('No candidates in response');
      }

      const candidate = candidates[0];
      const content = candidate.content;

      if (content.parts && content.parts.some(part => part.functionCall)) {
        console.log(`\n🔄 Agent Iteration ${iterations}: Querying data...`);

        const functionCalls = content.parts
          .filter(part => part.functionCall)
          .map(part => part.functionCall);

        const functionResponses = [];
        for (const functionCall of functionCalls) {
          const toolResult = await executeToolCall(functionCall);
          functionResponses.push({
            functionResponse: {
              name: functionCall.name,
              response: toolResult
            }
          });
        }

        result = await chat.sendMessage(functionResponses);
      } else {
        console.log('\n✅ Agent completed reasoning');

        const finalText = content.parts
          .filter(part => part.text)
          .map(part => part.text)
          .join('');

        agentReasoning = finalText;
        console.log('📄 Agent Response (first 300 chars):', finalText.substring(0, 300) + '...');

        const questions = parseQuestionArray(finalText, count);
        
        if (questions && questions.length === count) {
          console.log(`✅ Generated ${questions.length} personalized questions using ${iterations} iterations`);
          
          // Save AI Analysis to database
          const processingTime = Date.now() - startTime;
          try {
            analysisId = await AIAnalysis.create({
              attemptId: attemptId || 'unknown',
              studentId,
              session,
              analysisType: 'question_generation',
              prompt: initialPrompt,
              inputData: { topic, numQuestions: count },
              aiModel: model,
              toolCallsUsed,
              iterations,
              response: agentReasoning,
              questionsGenerated: questions.length,
              processingTimeMs: processingTime,
              success: true
            });
            console.log(`💾 AI Analysis saved: ${analysisId._id}`);
          } catch (saveError: any) {
            console.error('⚠️ Failed to save AI analysis:', saveError.message);
          }
          
          return { success: true, questions, reasoning: agentReasoning };
        } else {
          console.log(`⚠️ Expected ${count} questions, got ${questions?.length || 0}`);
          throw new Error(`Generated ${questions?.length || 0} questions, expected ${count}`);
        }
      }
    }

    throw new Error('Agent exceeded maximum iterations');

  } catch (error: any) {
    console.error('❌ Full ADK Agent Error:', error.message);
    
    // Check if it's a quota error
    const isQuotaError = error.message?.includes('quota') || error.message?.includes('429') || error.message?.includes('Too Many Requests');
    
    if (isQuotaError) {
      console.log('⚠️ Quota exceeded, using fallback question generator');
      const fallbackQuestions = generateFallbackQuestions({ 
        topic: params.topic, 
        count: params.count, 
        difficulty: 'medium' 
      });
      
      // Save fallback analysis
      const processingTime = Date.now() - startTime;
      try {
        await AIAnalysis.create({
          attemptId: params.attemptId || 'unknown',
          studentId: params.studentId,
          session: params.session || 0,
          analysisType: 'question_generation',
          prompt: `Generate ${params.count} questions on ${params.topic}`,
          inputData: { topic: params.topic, numQuestions: params.count },
          aiModel: 'fallback-templates',
          toolCallsUsed,
          iterations: 0,
          response: 'Quota exceeded - used fallback templates',
          questionsGenerated: fallbackQuestions.length,
          processingTimeMs: processingTime,
          success: true,
          error: error.message
        });
        console.log('💾 Fallback Analysis saved');
      } catch (saveError: any) {
        console.error('⚠️ Failed to save fallback analysis:', saveError.message);
      }
      
      return {
        success: true,
        questions: fallbackQuestions,
        reasoning: 'API quota exceeded - using template-based questions',
        usedFallback: true
      };
    }
    
    // Save failed analysis for non-quota errors
    const processingTime = Date.now() - startTime;
    try {
      await AIAnalysis.create({
        attemptId: params.attemptId || 'unknown',
        studentId: params.studentId,
        session: params.session || 0,
        analysisType: 'question_generation',
        prompt: `Generate ${params.count} questions on ${params.topic}`,
        inputData: { topic: params.topic, numQuestions: params.count },
        aiModel: model,
        toolCallsUsed,
        iterations: 0,
        response: error.message,
        processingTimeMs: processingTime,
        success: false,
        error: error.message
      });
      console.log('💾 Failed AI Analysis saved for debugging');
    } catch (saveError: any) {
      console.error('⚠️ Failed to save error analysis:', saveError.message);
    }
    
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================
// FULL ADK AGENT - SESSION ANALYSIS WITH DATA QUERYING  
// ============================================

export async function analyzeSessionWithFullADK(params: {
  sessionAnswers: any[];
  emotions?: any;
  topic: string;
  studentId: string;
  attemptId: string;
  session?: number;
}): Promise<{ success: boolean; analysis?: any; reasoning?: string; error?: string; usedFallback?: boolean }> {
  const startTime = Date.now();
  const toolCallsUsed: IToolCall[] = [];
  
  try {
    const { sessionAnswers, emotions, topic, studentId, attemptId, session = 0 } = params;

    console.log(`\n🤖 FULL ADK AGENT: Analyzing session performance`);
    console.log(`   Student: ${studentId}, Questions: ${sessionAnswers.length}`);

    const correctCount = sessionAnswers.filter(a => a.isCorrect).length;
    const accuracy = (correctCount / sessionAnswers.length) * 100;

    // Check quota before making API call
    if (!canMakeAPICall()) {
      console.log('⚠️ API quota exceeded, using fallback analysis');
      const avgStress = sessionAnswers.reduce((sum: number, a: any) => sum + (a.stress || 0), 0) / sessionAnswers.length;
      const avgTime = sessionAnswers.reduce((sum: number, a: any) => sum + (a.timeTaken || 30), 0) / sessionAnswers.length;
      
      const fallbackAnalysis = generateFallbackAnalysis({
        accuracy: accuracy / 100,
        avgStress,
        avgTime,
        difficulty: 'medium'
      });

      return {
        success: true,
        analysis: {
          overallAssessment: fallbackAnalysis,
          recommendation: fallbackAnalysis,
          nextDifficulty: accuracy >= 80 ? 'hard' : accuracy >= 60 ? 'medium' : 'easy'
        },
        reasoning: 'Used fallback analysis due to API quota',
        usedFallback: true
      };
    }

    incrementAPICall();

    const generativeModel = vertexAI.getGenerativeModel({
      model: model,
      tools: [{ functionDeclarations: agentTools }],
      generationConfig: {
        temperature: 0.6,
        maxOutputTokens: 2048,
      }
    });

    const chat = generativeModel.startChat();

    const prompt = `You are an intelligent learning analytics agent.

TASK: Analyze this student's test session and provide recommendations

SESSION DATA:
- Topic: ${topic}
- Questions: ${sessionAnswers.length}
- Correct: ${correctCount} (${accuracy.toFixed(1)}%)
- Performance: ${sessionAnswers.map((a, i) => `Q${i+1}: ${a.isCorrect ? '✓' : '✗'} (${a.difficulty})`).join(', ')}
${emotions ? `- Avg Stress: ${emotions.averageStress?.toFixed(2)}, Emotion: ${emotions.dominantEmotion}` : ''}

WORKFLOW:
1. Call query_student_performance to see their overall performance trend
2. Call query_emotion_patterns for this specific attempt to understand emotional journey
3. Based on current session + historical data, provide:
   - Overall assessment
   - Strengths and weaknesses
   - Specific recommendation for next session
   - Recommended difficulty level (easy/medium/hard)

Student ID: ${studentId}
Attempt ID: ${attemptId}

Return analysis in JSON format:
{
  "overallAssessment": "Brief assessment",
  "accuracy": ${accuracy},
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "recommendation": "Specific recommendation",
  "nextDifficulty": "easy|medium|hard",
  "emotionalInsight": "Comment on emotional state"
}

Start by querying student data!`;

    let result = await chat.sendMessage(prompt);
    let maxIterations = 10;
    let iterations = 0;
    let agentReasoning = '';

    while (iterations < maxIterations) {
      iterations++;
      
      if (!result || !result.response) {
        throw new Error('No response from AI model');
      }

      const response = result.response;
      const candidates = response.candidates;

      if (!candidates || candidates.length === 0) {
        throw new Error('No candidates in response');
      }

      const candidate = candidates[0];
      const content = candidate.content;

      if (content.parts && content.parts.some(part => part.functionCall)) {
        console.log(`\n🔄 Analysis Iteration ${iterations}: Querying data...`);

        const functionCalls = content.parts
          .filter(part => part.functionCall)
          .map(part => part.functionCall);

        const functionResponses = [];
        for (const functionCall of functionCalls) {
          const toolResult = await executeToolCall(functionCall);
          functionResponses.push({
            functionResponse: {
              name: functionCall.name,
              response: toolResult
            }
          });
        }

        result = await chat.sendMessage(functionResponses);
      } else {
        console.log('\n✅ Analysis complete');

        const finalText = content.parts
          .filter(part => part.text)
          .map(part => part.text)
          .join('');

        agentReasoning = finalText;
        const analysis = parseJSON(finalText);

        if (analysis) {
          console.log(`✅ Analysis: ${analysis.overallAssessment}`);
          
          // Save AI Analysis to database
          const processingTime = Date.now() - startTime;
          try {
            await AIAnalysis.create({
              attemptId,
              studentId,
              session,
              analysisType: 'session_analysis',
              prompt: prompt.substring(0, 1000), // Truncate long prompts
              inputData: { 
                topic, 
                sessionAnswers: sessionAnswers.map(a => ({ isCorrect: a.isCorrect, difficulty: a.difficulty })),
                emotions 
              },
              aiModel: model,
              toolCallsUsed,
              iterations,
              response: agentReasoning,
              recommendation: analysis.recommendation,
              nextDifficulty: analysis.nextDifficulty,
              processingTimeMs: processingTime,
              success: true
            });
            console.log('💾 Session Analysis saved to database');
          } catch (saveError: any) {
            console.error('⚠️ Failed to save session analysis:', saveError.message);
          }
          
          return { success: true, analysis, reasoning: agentReasoning };
        } else {
          throw new Error('Failed to parse analysis response');
        }
      }
    }

    throw new Error('Agent exceeded maximum iterations');

  } catch (error: any) {
    console.error('❌ Full ADK Analysis Error:', error.message);
    
    // Check if it's a quota error
    const isQuotaError = error.message?.includes('quota') || error.message?.includes('429') || error.message?.includes('Too Many Requests');
    
    if (isQuotaError) {
      console.log('⚠️ Quota exceeded, using fallback analysis');
      const avgStress = params.sessionAnswers.reduce((sum: number, a: any) => sum + (a.stress || 0), 0) / params.sessionAnswers.length;
      const avgTime = params.sessionAnswers.reduce((sum: number, a: any) => sum + (a.timeTaken || 30), 0) / params.sessionAnswers.length;
      const correctCount = params.sessionAnswers.filter(a => a.isCorrect).length;
      const accuracy = (correctCount / params.sessionAnswers.length);
      
      const fallbackAnalysis = generateFallbackAnalysis({
        accuracy,
        avgStress,
        avgTime,
        difficulty: 'medium'
      });

      // Save fallback analysis
      const processingTime = Date.now() - startTime;
      try {
        await AIAnalysis.create({
          attemptId: params.attemptId,
          studentId: params.studentId,
          session: params.session || 0,
          analysisType: 'session_analysis',
          prompt: `Analyze session on ${params.topic}`,
          inputData: { topic: params.topic, questionsCount: params.sessionAnswers.length },
          aiModel: 'fallback-rules',
          toolCallsUsed,
          iterations: 0,
          response: fallbackAnalysis,
          recommendation: fallbackAnalysis,
          nextDifficulty: accuracy >= 0.8 ? 'hard' : accuracy >= 0.6 ? 'medium' : 'easy',
          processingTimeMs: processingTime,
          success: true,
          error: error.message
        });
        console.log('💾 Fallback Analysis saved');
      } catch (saveError: any) {
        console.error('⚠️ Failed to save fallback analysis:', saveError.message);
      }

      return {
        success: true,
        analysis: {
          overallAssessment: fallbackAnalysis,
          recommendation: fallbackAnalysis,
          nextDifficulty: accuracy >= 0.8 ? 'hard' : accuracy >= 0.6 ? 'medium' : 'easy'
        },
        reasoning: 'Used fallback analysis due to API quota',
        usedFallback: true
      };
    }
    
    // Save failed analysis for non-quota errors
    const processingTime = Date.now() - startTime;
    try {
      await AIAnalysis.create({
        attemptId: params.attemptId,
        studentId: params.studentId,
        session: params.session || 0,
        analysisType: 'session_analysis',
        prompt: `Analyze session on ${params.topic}`,
        inputData: { topic: params.topic, questionsCount: params.sessionAnswers.length },
        aiModel: model,
        toolCallsUsed,
        iterations: 0,
        response: error.message,
        processingTimeMs: processingTime,
        success: false,
        error: error.message
      });
      console.log('💾 Failed Analysis saved for debugging');
    } catch (saveError: any) {
      console.error('⚠️ Failed to save error analysis:', saveError.message);
    }
    
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================
// SIMPLE ADK (FALLBACK - NO FUNCTION CALLING)
// ============================================

export async function generateQuestionsWithADK(params: {
  topic: string;
  count: number;
  difficulty?: string;
  studentLevel?: number;
}): Promise<{ success: boolean; questions?: any[]; error?: string }> {
  try {
    const { topic, count, difficulty = 'mixed', studentLevel = 2 } = params;

    console.log(`\n🤖 Simple ADK: Generating ${count} questions on "${topic}"`);

    const generativeModel = vertexAI.getGenerativeModel({
      model: model,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096,
      }
    });

    const prompt = `Generate exactly ${count} multiple-choice questions about "${topic}".

Student level: ${studentLevel}/5
Difficulty: ${difficulty}

Return ONLY a JSON array:
[
  {
    "question": "Question text?",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": "A",
    "explanation": "Explanation",
    "difficulty": "easy|medium|hard",
    "topic": "${topic}"
  }
]`;

    const result = await generativeModel.generateContent(prompt);
    const text = result.response.text();
    const questions = parseQuestionArray(text, count);

    if (questions && questions.length === count) {
      return { success: true, questions };
    } else {
      throw new Error(`Generated ${questions?.length || 0} questions, expected ${count}`);
    }

  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function analyzeSessionWithADK(params: {
  sessionAnswers: any[];
  emotions?: any;
  topic: string;
}): Promise<{ success: boolean; analysis?: any; error?: string }> {
  try {
    const { sessionAnswers, emotions, topic } = params;
    const correctCount = sessionAnswers.filter(a => a.isCorrect).length;
    const accuracy = (correctCount / sessionAnswers.length) * 100;

    const generativeModel = vertexAI.getGenerativeModel({
      model: model,
      generationConfig: {
        temperature: 0.6,
        maxOutputTokens: 2048,
      }
    });

    const prompt = `Analyze: ${sessionAnswers.length} questions, ${correctCount} correct (${accuracy.toFixed(1)}%). Topic: ${topic}.
${emotions ? `Stress: ${emotions.averageStress?.toFixed(2)}` : ''}

Return JSON:
{
  "overallAssessment": "assessment",
  "accuracy": ${accuracy},
  "recommendation": "recommendation",
  "nextDifficulty": "easy|medium|hard"
}`;

    const result = await generativeModel.generateContent(prompt);
    const analysis = parseJSON(result.response.text());

    if (analysis) {
      return { success: true, analysis };
    } else {
      throw new Error('Failed to parse analysis');
    }

  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function parseQuestionArray(text: string, expectedCount: number): any[] | null {
  try {
    let cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const questions = JSON.parse(jsonMatch[0]);
      if (Array.isArray(questions)) {
        const valid = questions.every(q => 
          q.question && q.options && q.correctAnswer && q.difficulty && q.topic
        );
        if (valid) {
          return questions.slice(0, expectedCount);
        }
      }
    }
    return null;
  } catch (error) {
    return null;
  }
}

function parseJSON(text: string): any | null {
  try {
    let cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    return null;
  }
}

export default {
  generateQuestionsWithADK,
  analyzeSessionWithADK,
  generateQuestionsWithFullADK,
  analyzeSessionWithFullADK
};

// Simple question generation with ADK agent
export async function generateQuestionsWithADK(params: {
  topic: string;
  count: number;
  difficulty?: string;
  studentLevel?: number;
}): Promise<{ success: boolean; questions?: any[]; error?: string }> {
  try {
    const { topic, count, difficulty = 'mixed', studentLevel = 2 } = params;

    console.log(`\n🤖 ADK Agent: Generating ${count} questions on "${topic}"`);
    console.log(`   Difficulty: ${difficulty}, Student Level: ${studentLevel}/5`);

    const generativeModel = vertexAI.getGenerativeModel({
      model: model,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096,
      }
    });

    const prompt = `Generate exactly ${count} multiple-choice questions about "${topic}".

REQUIREMENTS:
- Student knowledge level: ${studentLevel}/5 (1=beginner, 5=expert)
- Difficulty mix: ${difficulty === 'mixed' ? 'Include easy (30%), medium (50%), and hard (20%) questions' : `All questions should be ${difficulty}`}
- Each question must have 4 options (A, B, C, D)
- Include detailed explanations
- Cover different aspects of the topic
- Questions should test understanding, not just memorization

Return EXACTLY ${count} questions in this JSON array format:
[
  {
    "question": "Clear, specific question text?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "A",
    "explanation": "Detailed explanation of why this is correct and why others are wrong",
    "difficulty": "easy|medium|hard",
    "topic": "${topic}"
  }
]

IMPORTANT: Return ONLY the JSON array, no additional text.`;

    const result = await generativeModel.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    console.log('📄 ADK Response received');

    // Parse JSON from response
    const questions = parseQuestionArray(text, count);

    if (questions && questions.length === count) {
      console.log(`✅ Successfully generated ${questions.length} questions`);
      return { success: true, questions };
    } else {
      console.log(`⚠️ Expected ${count} questions, got ${questions?.length || 0}`);
      throw new Error(`Generated ${questions?.length || 0} questions, expected ${count}`);
    }

  } catch (error: any) {
    console.error('❌ ADK Agent Error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Analyze session performance with ADK agent
export async function analyzeSessionWithADK(params: {
  sessionAnswers: any[];
  emotions?: any;
  topic: string;
}): Promise<{ success: boolean; analysis?: any; error?: string }> {
  try {
    const { sessionAnswers, emotions, topic } = params;

    console.log(`\n🤖 ADK Agent: Analyzing session performance`);
    console.log(`   Questions answered: ${sessionAnswers.length}`);

    const correctCount = sessionAnswers.filter(a => a.isCorrect).length;
    const accuracy = (correctCount / sessionAnswers.length) * 100;

    const generativeModel = vertexAI.getGenerativeModel({
      model: model,
      generationConfig: {
        temperature: 0.6,
        maxOutputTokens: 2048,
      }
    });

    const prompt = `Analyze this student's test session performance:

Topic: ${topic}
Questions Answered: ${sessionAnswers.length}
Correct Answers: ${correctCount} (${accuracy.toFixed(1)}%)

Question Performance:
${sessionAnswers.map((a, i) => `${i + 1}. ${a.isCorrect ? '✓' : '✗'} Difficulty: ${a.difficulty}`).join('\n')}

${emotions ? `\nEmotional State:\nAverage Stress: ${emotions.averageStress?.toFixed(2) || 'N/A'}\nDominant Emotion: ${emotions.dominantEmotion || 'N/A'}` : ''}

Provide analysis in this JSON format:
{
  "overallAssessment": "Brief assessment of performance",
  "accuracy": ${accuracy},
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "recommendation": "Specific recommendation for next session",
  "nextDifficulty": "easy|medium|hard"
}

Return ONLY the JSON object.`;

    const result = await generativeModel.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    const analysis = parseJSON(text);

    if (analysis) {
      console.log(`✅ Analysis complete: ${analysis.overallAssessment}`);
      return { success: true, analysis };
    } else {
      throw new Error('Failed to parse analysis response');
    }

  } catch (error: any) {
    console.error('❌ ADK Analysis Error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Utility: Parse JSON array from text
function parseQuestionArray(text: string, expectedCount: number): any[] | null {
  try {
    // Remove markdown code blocks if present
    let cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    
    // Find JSON array
    const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const questions = JSON.parse(jsonMatch[0]);
      
      if (Array.isArray(questions)) {
        // Validate each question
        const valid = questions.every(q => 
          q.question && q.options && q.correctAnswer && 
          q.explanation && q.difficulty && q.topic
        );
        
        if (valid) {
          return questions.slice(0, expectedCount);
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing questions:', error);
    return null;
  }
}

// Utility: Parse JSON object from text
function parseJSON(text: string): any | null {
  try {
    // Remove markdown code blocks if present
    let cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    
    // Find JSON object
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return null;
  }
}

export default {
  generateQuestionsWithADK,
  analyzeSessionWithADK,
  generateQuestionsWithFullADK,
  analyzeSessionWithFullADK
};

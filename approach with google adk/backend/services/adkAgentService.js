// adkAgentService.js - Google ADK Agent Development Kit Implementation
// TRUE agent-based architecture with function calling and reasoning
// Using Gemini API with Function Calling (not Vertex AI)

import { GoogleGenerativeAI } from '@google/generative-ai';
import Student from '../models/Student.js';
import AssessmentSession from '../models/AssessmentSession.js';
import QuestionAttempt from '../models/QuestionAttempt.js';
import EmotionTracking from '../models/EmotionTracking.js';
import AIAnalysis from '../models/AIAnalysis.js';
import { generateStudentMetrics } from './studentMetricsService.js';

// ============================================
// GOOGLE GEMINI API INITIALIZATION
// ============================================

const apiKey = process.env.GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const model = 'gemini-2.0-flash-exp'; // Supports function calling

// ============================================
// AGENT TOOLS - FUNCTION DECLARATIONS
// ============================================

const queryStudentPerformanceTool = {
  name: 'query_student_performance',
  description: 'Query COMPREHENSIVE student performance metrics including: overall accuracy, topic-wise performance with recent errors, emotion tracking, learning preferences, performance trends, study patterns, and recommended focus areas. Returns detailed analytics similar to a complete student profile.',
  parameters: {
    type: 'object',
    properties: {
      studentId: {
        type: 'string',
        description: 'The student_id (not MongoDB ObjectId) of the student'
      }
    },
    required: ['studentId']
  }
};

const queryEmotionPatternsTool = {
  name: 'query_emotion_patterns',
  description: 'Query student emotion patterns during recent sessions including stress levels, emotional stability, and emotional states over time. Use this to adapt question difficulty and pacing.',
  parameters: {
    type: 'object',
    properties: {
      studentId: {
        type: 'string',
        description: 'The MongoDB ObjectId of the student'
      },
      sessionId: {
        type: 'string',
        description: 'Optional: specific session ID to analyze'
      }
    },
    required: ['studentId']
  }
};

const queryTopicMasteryTool = {
  name: 'query_topic_mastery',
  description: 'Query detailed topic mastery data for a student including success rates per topic, weak areas, strong areas, and recommended next topics.',
  parameters: {
    type: 'object',
    properties: {
      studentId: {
        type: 'string',
        description: 'The MongoDB ObjectId of the student'
      },
      subject: {
        type: 'string',
        description: 'Subject to analyze (mathematics, science, history, etc.)'
      }
    },
    required: ['studentId', 'subject']
  }
};

const queryRecentAttemptsTool = {
  name: 'query_recent_attempts',
  description: 'Query the most recent question attempts to see what questions the student answered recently, their performance, and time taken. Use this to avoid repetition and build on previous questions.',
  parameters: {
    type: 'object',
    properties: {
      sessionId: {
        type: 'string',
        description: 'The MongoDB ObjectId of the current session'
      },
      limit: {
        type: 'number',
        description: 'Number of recent attempts to retrieve (default: 5)'
      }
    },
    required: ['sessionId']
  }
};

const saveQuestionAnalyticsTool = {
  name: 'save_question_analytics',
  description: 'Save analytics data for the generated question including reasoning, adaptations made, and insights used. Call this after generating each question.',
  parameters: {
    type: 'object',
    properties: {
      sessionId: {
        type: 'string',
        description: 'The MongoDB ObjectId of the current session'
      },
      questionData: {
        type: 'object',
        description: 'Question object with text, options, correct answer, explanation, difficulty, topic',
        properties: {
          question: { type: 'string' },
          options: { 
            type: 'array',
            items: { type: 'string' }
          },
          correctAnswer: { type: 'string' },
          explanation: { type: 'string' },
          difficulty: { type: 'string' },
          topic: { type: 'string' }
        }
      },
      reasoning: {
        type: 'string',
        description: 'Agent reasoning for why this question was generated'
      },
      insights: {
        type: 'object',
        description: 'Insights used from student data (performance, emotions, mastery)'
      }
    },
    required: ['sessionId', 'questionData', 'reasoning']
  }
};

const saveSessionAnalyticsTool = {
  name: 'save_session_analytics',
  description: 'Save comprehensive session analytics after test completion including overall performance summary, learning insights, recommendations, and emotion analysis.',
  parameters: {
    type: 'object',
    properties: {
      sessionId: {
        type: 'string',
        description: 'The MongoDB ObjectId of the completed session'
      },
      analytics: {
        type: 'object',
        description: 'Complete analytics object with performance, insights, recommendations',
        properties: {
          overallScore: { type: 'number' },
          topicsAnalyzed: { 
            type: 'array',
            items: { type: 'string' }
          },
          strengths: { 
            type: 'array',
            items: { type: 'string' }
          },
          weaknesses: { 
            type: 'array',
            items: { type: 'string' }
          },
          recommendations: { 
            type: 'array',
            items: { type: 'string' }
          },
          emotionalSummary: { type: 'string' }
        }
      }
    },
    required: ['sessionId', 'analytics']
  }
};

// All agent tools
const agentTools = [
  queryStudentPerformanceTool,
  queryEmotionPatternsTool,
  queryTopicMasteryTool,
  queryRecentAttemptsTool,
  saveQuestionAnalyticsTool,
  saveSessionAnalyticsTool
];

// ============================================
// TOOL IMPLEMENTATION FUNCTIONS
// ============================================

async function queryStudentPerformance(studentId) {
  try {
    // First try to find by student_id string (new format)
    let student = await Student.findOne({ student_id: studentId });
    
    // Fallback to MongoDB ObjectId if student_id not found
    if (!student) {
      student = await Student.findById(studentId);
    }
    
    if (!student) {
      return { error: 'Student not found' };
    }

    // ✨ USE COMPREHENSIVE METRICS SERVICE
    console.log(`📊 Fetching comprehensive metrics for student: ${student.student_id || student._id}`);
    const comprehensiveMetrics = await generateStudentMetrics(student.student_id);

    // Return rich, detailed metrics for agent decision-making
    return {
      success: true,
      studentId: student.student_id || student._id.toString(),
      studentName: student.name,
      grade: student.grade,
      
      // Comprehensive performance data
      ...comprehensiveMetrics,
      
      // Add timestamp
      queriedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error querying student performance:', error);
    return { error: error.message };
  }
}

async function queryEmotionPatterns(studentId, sessionId = null) {
  try {
    const query = { student: studentId };
    if (sessionId) {
      query.session = sessionId;
    }

    const emotionRecords = await EmotionTracking.find(query).sort({ timestamp: -1 }).limit(100);

    if (emotionRecords.length === 0) {
      return { message: 'No emotion data available', emotionRecords: [] };
    }

    // Calculate average stress level
    const avgStressLevel = (emotionRecords.reduce((sum, e) => sum + e.stressLevel, 0) / emotionRecords.length).toFixed(2);

    // Emotion distribution
    const emotionCounts = {};
    emotionRecords.forEach(record => {
      emotionCounts[record.dominantEmotion] = (emotionCounts[record.dominantEmotion] || 0) + 1;
    });

    // Emotional stability (variance in stress levels)
    const stressLevels = emotionRecords.map(e => e.stressLevel);
    const avgStress = stressLevels.reduce((a, b) => a + b, 0) / stressLevels.length;
    const variance = stressLevels.reduce((sum, level) => sum + Math.pow(level - avgStress, 2), 0) / stressLevels.length;
    const emotionalStability = variance < 1 ? 'stable' : variance < 2 ? 'moderate' : 'volatile';

    return {
      studentId,
      sessionId,
      recordsAnalyzed: emotionRecords.length,
      averageStressLevel: parseFloat(avgStressLevel),
      emotionalStability,
      emotionDistribution: emotionCounts,
      recentEmotions: emotionRecords.slice(0, 5).map(e => ({
        emotion: e.dominantEmotion,
        stress: e.stressLevel,
        timestamp: e.timestamp
      }))
    };
  } catch (error) {
    console.error('Error querying emotion patterns:', error);
    return { error: error.message };
  }
}

async function queryTopicMastery(studentId, subject) {
  try {
    const attempts = await QuestionAttempt.find({ 
      student: studentId,
      subject: subject 
    }).sort({ attemptedAt: -1 }).limit(100);

    if (attempts.length === 0) {
      return { message: 'No attempts found for this subject', mastery: {} };
    }

    const topicMastery = {};
    attempts.forEach(attempt => {
      if (!topicMastery[attempt.topic]) {
        topicMastery[attempt.topic] = { 
          total: 0, 
          correct: 0, 
          avgTimeSpent: 0,
          difficulties: { easy: 0, medium: 0, hard: 0 }
        };
      }
      topicMastery[attempt.topic].total++;
      if (attempt.isCorrect) topicMastery[attempt.topic].correct++;
      topicMastery[attempt.topic].avgTimeSpent += attempt.timeSpent || 0;
      topicMastery[attempt.topic].difficulties[attempt.difficulty]++;
    });

    // Calculate mastery percentages and identify weak/strong areas
    const masteryData = {};
    const weakAreas = [];
    const strongAreas = [];

    Object.keys(topicMastery).forEach(topic => {
      const data = topicMastery[topic];
      const masteryPercent = (data.correct / data.total * 100).toFixed(2);
      data.avgTimeSpent = (data.avgTimeSpent / data.total).toFixed(2);
      data.masteryPercent = parseFloat(masteryPercent);

      masteryData[topic] = data;

      if (masteryPercent < 50) weakAreas.push(topic);
      if (masteryPercent >= 80) strongAreas.push(topic);
    });

    return {
      studentId,
      subject,
      totalAttempts: attempts.length,
      topicMastery: masteryData,
      weakAreas,
      strongAreas,
      recommendedTopic: weakAreas.length > 0 ? weakAreas[0] : Object.keys(masteryData)[0]
    };
  } catch (error) {
    console.error('Error querying topic mastery:', error);
    return { error: error.message };
  }
}

async function queryRecentAttempts(sessionId, limit = 5) {
  try {
    const attempts = await QuestionAttempt.find({ session: sessionId })
      .sort({ attemptedAt: -1 })
      .limit(limit);

    return {
      sessionId,
      attemptsCount: attempts.length,
      attempts: attempts.map(a => ({
        questionId: a._id,
        topic: a.topic,
        difficulty: a.difficulty,
        isCorrect: a.isCorrect,
        timeSpent: a.timeSpent,
        attemptedAt: a.attemptedAt
      }))
    };
  } catch (error) {
    console.error('Error querying recent attempts:', error);
    return { error: error.message };
  }
}

async function saveQuestionAnalytics(sessionId, questionData, reasoning, insights = {}) {
  try {
    const session = await AssessmentSession.findById(sessionId);
    if (!session) {
      return { error: 'Session not found' };
    }

    // Get student_id string
    const student = await Student.findById(session.student);
    if (!student) {
      return { error: 'Student not found' };
    }

    const analysis = new AIAnalysis({
      student_id: student.student_id,  // String field
      session_id: session.session_id,   // String field
      analysis_type: 'recommendation',   // One of the enum values
      insights: {
        overallSummary: reasoning,
        performanceSummary: JSON.stringify({
          generatedQuestion: questionData,
          studentInsights: insights,
          timestamp: new Date()
        })
      },
      recommendations: {
        immediate: [`Practice ${questionData.topic}`],
        shortTerm: [],
        longTerm: []
      },
      focus_areas: [questionData.topic],
      metadata: {
        questionDifficulty: questionData.difficulty,
        topicCovered: questionData.topic,
        generationType: 'adk_agent'
      }
    });

    await analysis.save();

    return {
      success: true,
      analysisId: analysis._id,
      message: 'Question analytics saved successfully'
    };
  } catch (error) {
    console.error('Error saving question analytics:', error);
    return { error: error.message };
  }
}

async function saveSessionAnalytics(sessionId, analytics) {
  try {
    const session = await AssessmentSession.findById(sessionId);
    if (!session) {
      return { error: 'Session not found' };
    }

    // Get student_id string
    const student = await Student.findById(session.student);
    if (!student) {
      return { error: 'Student not found' };
    }

    const analysis = new AIAnalysis({
      student_id: student.student_id,  // String field
      session_id: session.session_id,   // String field
      analysis_type: 'session_summary',  // One of the enum values
      insights: {
        overallSummary: analytics.emotionalSummary || 'Session completed',
        strengths: analytics.strengths || [],
        weaknesses: analytics.weaknesses || [],
        performanceSummary: JSON.stringify({
          overallScore: analytics.overallScore,
          topicsAnalyzed: analytics.topicsAnalyzed
        }),
        keyAchievements: analytics.strengths || []
      },
      recommendations: {
        immediate: analytics.recommendations || [],
        shortTerm: [],
        longTerm: []
      },
      focus_areas: analytics.weaknesses || [],
      metadata: {
        sessionCompleted: new Date(),
        overallScore: analytics.overallScore,
        analyticsType: 'adk_agent_session'
      }
    });

    await analysis.save();

    // Update session status
    session.status = 'completed';
    session.completedAt = new Date();
    await session.save();

    return {
      success: true,
      analysisId: analysis._id,
      message: 'Session analytics saved successfully'
    };
  } catch (error) {
    console.error('Error saving session analytics:', error);
    return { error: error.message };
  }
}

// ============================================
// AGENT EXECUTION - HANDLE FUNCTION CALLS
// ============================================

async function executeToolCall(functionCall) {
  const { name, args } = functionCall;
  
  console.log(`\n🔧 Agent Tool Call: ${name}`);
  console.log('📥 Arguments:', JSON.stringify(args, null, 2));

  let result;

  switch (name) {
    case 'query_student_performance':
      result = await queryStudentPerformance(args.studentId);
      break;
    case 'query_emotion_patterns':
      result = await queryEmotionPatterns(args.studentId, args.sessionId);
      break;
    case 'query_topic_mastery':
      result = await queryTopicMastery(args.studentId, args.subject);
      break;
    case 'query_recent_attempts':
      result = await queryRecentAttempts(args.sessionId, args.limit);
      break;
    case 'save_question_analytics':
      result = await saveQuestionAnalytics(args.sessionId, args.questionData, args.reasoning, args.insights);
      break;
    case 'save_session_analytics':
      result = await saveSessionAnalytics(args.sessionId, args.analytics);
      break;
    default:
      result = { error: `Unknown function: ${name}` };
  }

  console.log('📤 Tool Result:', JSON.stringify(result, null, 2));
  return result;
}

// ============================================
// AGENT REASONING WORKFLOW - QUESTION SET GENERATION
// ============================================

export async function generateQuestionSetWithAgent(studentId, sessionId, subject, count = 5) {
  try {
    console.log(`\n🤖 Starting ADK Agent - Question Set Generation (${count} questions)`);
    console.log(`Student: ${studentId}, Session: ${sessionId}, Subject: ${subject}`);

    // Initialize generative model with function calling
    const generativeModel = genAI.getGenerativeModel({
      model: model,
      tools: [{ functionDeclarations: agentTools }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096,
      }
    });

    const chat = generativeModel.startChat();

    // System instruction for generating question set
    const initialPrompt = `You are an intelligent adaptive learning agent. Your goal is to generate a SET of ${count} diverse questions for a student.

WORKFLOW:
1. First, call query_student_performance to understand the student's skill level
2. Then, call query_emotion_patterns to check their stress patterns from previous questions
3. Then, call query_topic_mastery for the subject "${subject}" to identify weak/strong areas
4. Then, call query_recent_attempts to see what they've answered recently

5. Based on ALL these insights, generate ${count} questions with VARIED difficulty levels:
   - Include a MIX: easy, medium, and hard questions
   - Focus MORE on weak areas but include some strong areas for confidence
   - Consider emotional patterns (if high stress detected, include more easy questions)
   - Create logical progression (gradually increase difficulty)
   - Avoid repetition of recent question topics
   - Each question should test different concepts

Generate EXACTLY ${count} questions in this JSON array format:
[
  {
    "question": "Question 1 text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "A",
    "explanation": "Detailed explanation of why this is correct",
    "difficulty": "easy",
    "topic": "specific topic name"
  },
  {
    "question": "Question 2 text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "B",
    "explanation": "Detailed explanation",
    "difficulty": "medium",
    "topic": "another topic"
  }
  ... (${count} questions total)
]

IMPORTANT: Generate ALL ${count} questions in ONE response as a JSON array.

Student ID: ${studentId}
Session ID: ${sessionId}
Subject: ${subject}

Start by calling the query tools to gather insights!`;

    let result = await chat.sendMessage(initialPrompt);
    let maxIterations = 15;
    let iterations = 0;

    // Iterative agent reasoning loop
    while (iterations < maxIterations) {
      iterations++;
      
      // Check if response exists
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

      // Check if agent wants to call functions
      if (content.parts && content.parts.some(part => part.functionCall)) {
        console.log(`\n🔄 Agent Iteration ${iterations}: Function calling...`);

        const functionCalls = content.parts
          .filter(part => part.functionCall)
          .map(part => part.functionCall);

        // Execute all function calls
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

        // Send function results back to agent
        result = await chat.sendMessage(functionResponses);
      } else {
        // Agent has finished reasoning and provided final answer
        console.log('\n✅ Agent completed reasoning');

        const finalText = content.parts
          .filter(part => part.text)
          .map(part => part.text)
          .join('');

        console.log('📄 Agent Response:', finalText.substring(0, 300) + '...');

        // Parse the generated question set
        const questionSet = parseQuestionSetFromResponse(finalText, count);
        
        if (questionSet && questionSet.length === count) {
          console.log(`✅ Successfully generated ${questionSet.length} questions`);
          return {
            success: true,
            questions: questionSet,
            agentReasoning: finalText,
            iterations: iterations
          };
        } else {
          console.log(`⚠️ Expected ${count} questions, got ${questionSet?.length || 0}`);
          throw new Error(`Agent generated ${questionSet?.length || 0} questions, expected ${count}`);
        }
      }
    }

    throw new Error('Agent exceeded maximum iterations without generating question set');

  } catch (error) {
    console.error('❌ Agent Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================
// AGENT REASONING WORKFLOW - QUESTION GENERATION
// ============================================

export async function generateQuestionWithAgent(studentId, sessionId, subject) {
  try {
    console.log('\n🤖 Starting ADK Agent - Question Generation');
    console.log(`Student: ${studentId}, Session: ${sessionId}, Subject: ${subject}`);

    // Initialize generative model with function calling
    const generativeModel = genAI.getGenerativeModel({
      model: model,
      tools: [{ functionDeclarations: agentTools }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      }
    });

    const chat = generativeModel.startChat();

    // System instruction
    const initialPrompt = `You are an intelligent adaptive learning agent. Your goal is to generate ONE personalized question for a student.

WORKFLOW:
1. First, call query_student_performance to understand the student's skill level
2. Then, call query_emotion_patterns to check their current stress and emotional state
3. Then, call query_topic_mastery for the subject "${subject}" to identify weak/strong areas
4. Then, call query_recent_attempts to see what they've answered recently
5. Based on ALL these insights, generate ONE adaptive question that:
   - Matches their skill level (not too hard, not too easy)
   - Covers a topic they need practice in (weak areas get priority)
   - Considers their emotional state (reduce difficulty if stressed)
   - Avoids repetition of recent questions
6. Finally, call save_question_analytics to record your reasoning and the question

Generate the question in this EXACT JSON format:
{
  "question": "Question text here?",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": "A",
  "explanation": "Why this is the correct answer",
  "difficulty": "easy|medium|hard",
  "topic": "specific topic name"
}

Student ID: ${studentId}
Session ID: ${sessionId}
Subject: ${subject}

Start by calling the query tools to gather insights!`;

    let result = await chat.sendMessage(initialPrompt);
    let maxIterations = 10;
    let iterations = 0;

    // Iterative agent reasoning loop
    while (iterations < maxIterations) {
      iterations++;
      
      // Check if response exists
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

      // Check if agent wants to call functions
      if (content.parts && content.parts.some(part => part.functionCall)) {
        console.log(`\n🔄 Agent Iteration ${iterations}: Function calling...`);

        const functionCalls = content.parts
          .filter(part => part.functionCall)
          .map(part => part.functionCall);

        // Execute all function calls
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

        // Send function results back to agent
        result = await chat.sendMessage(functionResponses);
      } else {
        // Agent has finished reasoning and provided final answer
        console.log('\n✅ Agent completed reasoning');

        const finalText = content.parts
          .filter(part => part.text)
          .map(part => part.text)
          .join('');

        console.log('📄 Agent Response:', finalText);

        // Parse the generated question
        const questionData = parseQuestionFromResponse(finalText);
        
        if (questionData) {
          return {
            success: true,
            question: questionData,
            agentReasoning: finalText,
            iterations: iterations
          };
        } else {
          throw new Error('Agent did not generate a valid question format');
        }
      }
    }

    throw new Error('Agent exceeded maximum iterations without generating a question');

  } catch (error) {
    console.error('❌ Agent Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================
// AGENT REASONING WORKFLOW - SESSION COMPLETION
// ============================================

export async function completeSessionWithAgent(sessionId) {
  try {
    console.log('\n🤖 Starting ADK Agent - Session Completion Analytics');
    console.log(`Session: ${sessionId}`);

    const session = await AssessmentSession.findById(sessionId).populate('student');
    if (!session) {
      throw new Error('Session not found');
    }

    // Initialize generative model with function calling
    const generativeModel = genAI.getGenerativeModel({
      model: model,
      tools: [{ functionDeclarations: agentTools }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 3072,
      }
    });

    const chat = generativeModel.startChat();

    const completionPrompt = `You are an intelligent learning analytics agent. A student has just completed an assessment session.

WORKFLOW:
1. Call query_student_performance to get overall performance metrics
2. Call query_emotion_patterns for this session to understand emotional journey
3. Call query_recent_attempts for this session to see all questions attempted
4. Analyze the data and create comprehensive session analytics with:
   - Overall score/performance
   - Topics analyzed and performance per topic
   - Strengths (topics with >80% accuracy)
   - Weaknesses (topics with <50% accuracy)
   - Specific recommendations for improvement
   - Emotional summary (stress levels, stability during session)
5. Call save_session_analytics to save your analysis

Student ID: ${session.student._id}
Session ID: ${sessionId}
Subject: ${session.subject}

Start by gathering the session data!`;

    let result = await chat.sendMessage(completionPrompt);
    let maxIterations = 10;
    let iterations = 0;

    while (iterations < maxIterations) {
      iterations++;
      
      // Check if response exists
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
        console.log(`\n🔄 Agent Iteration ${iterations}: Analyzing session...`);

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
        console.log('\n✅ Session analytics completed');

        const finalText = content.parts
          .filter(part => part.text)
          .map(part => part.text)
          .join('');

        console.log('📄 Analytics Summary:', finalText);

        return {
          success: true,
          summary: finalText,
          iterations: iterations
        };
      }
    }

    throw new Error('Agent exceeded maximum iterations');

  } catch (error) {
    console.error('❌ Session Completion Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function parseQuestionSetFromResponse(text, expectedCount) {
  try {
    // Try to find JSON array in the response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const questions = JSON.parse(jsonMatch[0]);
      
      // Validate it's an array with expected count
      if (Array.isArray(questions) && questions.length === expectedCount) {
        // Validate each question has required fields
        const allValid = questions.every(q => 
          q.question && q.options && q.correctAnswer && 
          q.explanation && q.difficulty && q.topic
        );
        
        if (allValid) {
          return questions;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing question set:', error);
    return null;
  }
}

function parseQuestionFromResponse(text) {
  try {
    // Try to find JSON in the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const questionData = JSON.parse(jsonMatch[0]);
      
      // Validate required fields
      if (questionData.question && questionData.options && questionData.correctAnswer && 
          questionData.explanation && questionData.difficulty && questionData.topic) {
        return questionData;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing question:', error);
    return null;
  }
}

export default {
  generateQuestionWithAgent,
  generateQuestionSetWithAgent,
  completeSessionWithAgent
};

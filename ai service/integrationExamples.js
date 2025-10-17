/**
 * INTEGRATION EXAMPLE
 * 
 * This file shows how to integrate the question generator
 * into your existing application/module
 */

import { generateQuestions, generateQuestionsStream } from './questionGenerator.js';
import { readPdfAsBase64 } from './pdfUtils.js';

// ===== Example 1: Simple Integration =====
export async function createQuizForStudent(topic, studentData) {
  const result = await generateQuestions({
    topic,
    studentData,
    questionCount: 5
  });

  if (result.success) {
    return result.data.questions;
  } else {
    throw new Error(result.error);
  }
}

// ===== Example 2: Integration with Database =====
export async function generateAdaptiveAssessment(studentId, subject, db) {
  // 1. Fetch student data from your database
  const student = await db.students.findOne({ id: studentId });
  
  // 2. Get student's performance history
  const performance = await db.performance.findByStudent(studentId);
  
  // 3. Build student data object
  const studentData = {
    studentId: student.id,
    name: student.name,
    grade: student.grade,
    performanceSummary: {
      overallAccuracy: performance.avgAccuracy,
      averageDifficultyLevel: performance.avgDifficulty,
      trend: performance.trend
    },
    learningPreferences: {
      preferredDifficulty: student.preferences.difficulty,
      preferredQuestionType: student.preferences.questionType
    }
  };

  // 4. Generate questions
  const result = await generateQuestions({
    topic: subject,
    studentData,
    questionCount: 10
  });

  // 5. Save to database
  if (result.success) {
    await db.assessments.create({
      studentId,
      subject,
      questions: result.data.questions,
      createdAt: new Date()
    });
    
    return result.data;
  }
  
  return null;
}

// ===== Example 3: Batch Question Generation =====
export async function generateQuestionsForMultipleTopics(topics, studentData) {
  const allQuestions = [];
  
  for (const topic of topics) {
    const result = await generateQuestions({
      topic,
      studentData,
      questionCount: 3
    });
    
    if (result.success) {
      allQuestions.push(...result.data.questions);
    }
  }
  
  return allQuestions;
}

// ===== Example 4: PDF-Based Quiz Generation =====
export async function generateQuizFromDocument(pdfPath, studentId, db) {
  // 1. Get student data
  const student = await db.students.findById(studentId);
  
  // 2. Read PDF file
  const pdfContent = await readPdfAsBase64(pdfPath);
  
  // 3. Generate questions from PDF
  const result = await generateQuestions({
    pdfContent,
    studentData: {
      studentId: student.id,
      grade: student.grade,
      learningPreferences: student.preferences
    },
    questionCount: 10
  });
  
  return result.data;
}

// ===== Example 5: Real-time Streaming for Frontend =====
export async function streamQuestionsToClient(socket, topic, studentData) {
  let fullResponse = '';
  
  const result = await generateQuestionsStream({
    topic,
    studentData,
    questionCount: 5,
    onChunk: (text) => {
      fullResponse += text;
      // Send chunk to WebSocket client
      socket.emit('question-chunk', text);
    }
  });
  
  // Send final result
  if (result.success) {
    socket.emit('questions-complete', result.data);
  } else {
    socket.emit('questions-error', result.error);
  }
  
  return result;
}

// ===== Example 6: Difficulty-Based Question Generation =====
export async function generateByDifficulty(topic, difficulty, count = 5) {
  const studentData = {
    studentId: "ADAPTIVE",
    performanceSummary: {
      averageDifficultyLevel: difficulty
    },
    learningPreferences: {
      preferredDifficulty: difficulty
    }
  };
  
  const result = await generateQuestions({
    topic,
    studentData,
    questionCount: count
  });
  
  return result.data;
}

// ===== Example 7: Progressive Difficulty Quiz =====
export async function generateProgressiveQuiz(topic, studentData) {
  const difficulties = [2, 3, 4]; // Easy, Medium, Hard
  const allQuestions = [];
  
  for (const difficulty of difficulties) {
    const customData = {
      ...studentData,
      learningPreferences: {
        ...studentData.learningPreferences,
        preferredDifficulty: difficulty
      }
    };
    
    const result = await generateQuestions({
      topic,
      studentData: customData,
      questionCount: 3
    });
    
    if (result.success) {
      allQuestions.push(...result.data.questions);
    }
  }
  
  return allQuestions;
}

// ===== Example 8: Integration with Caching =====
const questionCache = new Map();

export async function generateWithCache(topic, studentId) {
  const cacheKey = `${topic}-${studentId}`;
  
  // Check cache first
  if (questionCache.has(cacheKey)) {
    const cached = questionCache.get(cacheKey);
    const age = Date.now() - cached.timestamp;
    
    // Use cache if less than 1 hour old
    if (age < 3600000) {
      console.log('Returning cached questions');
      return cached.questions;
    }
  }
  
  // Generate new questions
  const result = await generateQuestions({
    topic,
    studentData: { studentId },
    questionCount: 5
  });
  
  if (result.success) {
    // Cache the result
    questionCache.set(cacheKey, {
      questions: result.data,
      timestamp: Date.now()
    });
    
    return result.data;
  }
  
  return null;
}

// ===== Example 9: Error Handling Wrapper =====
export async function safeGenerateQuestions(params) {
  try {
    const result = await generateQuestions(params);
    
    if (!result.success) {
      console.error('Generation failed:', result.error);
      // Return default questions or retry
      return generateDefaultQuestions(params.topic);
    }
    
    return result.data;
  } catch (error) {
    console.error('Unexpected error:', error);
    // Log to monitoring service
    // await logger.error('Question generation error', { error, params });
    
    // Return fallback
    return generateDefaultQuestions(params.topic);
  }
}

function generateDefaultQuestions(topic) {
  // Return some default questions as fallback
  return {
    totalQuestions: 0,
    questions: [],
    error: 'Using default questions due to generation failure'
  };
}

// ===== Example 10: Scheduled Question Generation =====
export async function scheduleQuestionGeneration(schedule, db) {
  // This could be called by a cron job
  const upcomingAssessments = await db.assessments.findScheduled();
  
  for (const assessment of upcomingAssessments) {
    const student = await db.students.findById(assessment.studentId);
    
    const result = await generateQuestions({
      topic: assessment.topic,
      studentData: student,
      questionCount: assessment.questionCount
    });
    
    if (result.success) {
      await db.assessments.update(assessment.id, {
        questions: result.data.questions,
        status: 'ready',
        generatedAt: new Date()
      });
    }
  }
}

export default {
  createQuizForStudent,
  generateAdaptiveAssessment,
  generateQuestionsForMultipleTopics,
  generateQuizFromDocument,
  streamQuestionsToClient,
  generateByDifficulty,
  generateProgressiveQuiz,
  generateWithCache,
  safeGenerateQuestions,
  scheduleQuestionGeneration
};

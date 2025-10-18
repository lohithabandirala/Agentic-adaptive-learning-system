import express from 'express';
import Student from '../models/Student.js';
import AssessmentSession from '../models/AssessmentSession.js';
import QuestionAttempt from '../models/QuestionAttempt.js';
import EmotionTracking from '../models/EmotionTracking.js';
import { generateAdaptiveQuestion, generateAnswerFeedback, generateBaselineQuestion } from '../services/questionService.js';
import { analyzeStudentPerformance, generateSessionSummary, getTopicRecommendations } from '../services/analysisService.js';
import { generateQuestionWithAgent, generateQuestionSetWithAgent, completeSessionWithAgent } from '../services/adkAgentService.js';
import { generateStudentMetrics } from '../services/studentMetricsService.js';

const router = express.Router();

/**
 * Health check
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Adaptive AI Learning System - MongoDB + Google Gemini',
    database: 'MongoDB',
    ai: 'Google Gemini',
    timestamp: new Date().toISOString()
  });
});

/**
 * Register or get student
 */
router.post('/students/register', async (req, res) => {
  try {
    const { student_id, name, email, grade } = req.body;

    // Generate student_id if not provided
    const finalStudentId = student_id || `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Check if student exists
    let student = await Student.findOne({ student_id: finalStudentId });

    if (student) {
      return res.json({
        success: true,
        message: 'Student already registered',
        student,
        student_id: student.student_id,
        isNew: false
      });
    }

    // Create new student
    student = new Student({
      student_id: finalStudentId,
      name,
      email: email || `${finalStudentId}@example.com`,
      grade
    });

    await student.save();

    res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      student_id: student.student_id,
      student,
      isNew: true
    });
  } catch (error) {
    console.error('Error registering student:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get student profile
 */
router.get('/students/:studentId/profile', async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const student = await Student.findOne({ student_id: studentId });
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    const profile = await student.getProfile();

    res.json({
      success: true,
      profile
    });
  } catch (error) {
    console.error('Error getting student profile:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get comprehensive student metrics (NEW)
 * Returns detailed analytics like sample data format
 */
router.get('/students/:studentId/metrics', async (req, res) => {
  try {
    const { studentId } = req.params;
    
    console.log(`📊 Generating comprehensive metrics for student: ${studentId}`);
    const metrics = await generateStudentMetrics(studentId);

    res.json({
      success: true,
      metrics
    });
  } catch (error) {
    console.error('Error generating student metrics:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Start assessment session
 */
router.post('/sessions/start', async (req, res) => {
  try {
    const { student_id, name, grade, topic, subject, total_questions } = req.body;

    // Use either topic or subject
    const sessionTopic = topic || subject || 'General';
    const questionsCount = total_questions || 20;

    // Ensure student exists
    let student = await Student.findOne({ student_id });
    if (!student) {
      student = new Student({
        student_id,
        name: name || `Student ${student_id}`,
        grade: grade || 10
      });
      await student.save();
    }

    // Create session
    const session_id = `SESSION_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const session = new AssessmentSession({
      session_id,
      student_id,
      student: student._id,  // MongoDB ObjectId reference
      topic: sessionTopic,
      subject: sessionTopic,
      grade: grade || student.grade,
      total_questions: questionsCount
    });

    await session.save();

    // Get student profile for context
    const profile = await student.getProfile();

    res.json({
      success: true,
      session_id,
      student_id,
      topic,
      profile,
      message: 'Session started successfully'
    });
  } catch (error) {
    console.error('Error starting session:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Generate question set (5 questions) - GOOGLE ADK AGENT
 */
router.post('/sessions/questionset/generate', async (req, res) => {
  try {
    const { session_id, student_id, topic, count = 5 } = req.body;

    // Get MongoDB ObjectIDs
    const student = await Student.findOne({ student_id });
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    const session = await AssessmentSession.findOne({ session_id });
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    // 🤖 USE GOOGLE ADK AGENT - GENERATE QUESTION SET
    console.log(`\n🚀 Calling ADK Agent for question set generation (${count} questions)...`);
    const agentResult = await generateQuestionSetWithAgent(
      student._id.toString(),
      session._id.toString(),
      topic,
      count
    );

    if (!agentResult.success) {
      throw new Error(agentResult.error || 'Agent failed to generate question set');
    }

    // Calculate set number based on questions answered
    const setNumber = Math.floor(session.questions_answered / count) + 1;

    res.json({
      success: true,
      questionSet: agentResult.questions,
      setNumber: setNumber,
      totalQuestions: agentResult.questions.length,
      reasoning: agentResult.agentReasoning,
      adk_agent: true,
      iterations: agentResult.iterations
    });
  } catch (error) {
    console.error('Error generating question set with ADK Agent:', error);
    
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Generate next question - GOOGLE ADK AGENT
 */
router.post('/sessions/question/next', async (req, res) => {
  try {
    const { session_id, student_id, topic, emotion_data, question_number } = req.body;

    // Get MongoDB ObjectIDs
    const student = await Student.findOne({ student_id });
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    const session = await AssessmentSession.findOne({ session_id });
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    // Record emotion data if provided
    if (emotion_data) {
      const emotionTracking = new EmotionTracking({
        session_id,
        student_id,
        question_number: question_number || 0,
        emotion: emotion_data.emotion || 'neutral',
        stress_level: emotion_data.stressLevel || 3,
        emotion_scores: emotion_data.emotionScores,
        frame_count: emotion_data.frameCount,
        analysis_duration: emotion_data.analysisDuration
      });
      await emotionTracking.save();
    }

    // 🤖 USE GOOGLE ADK AGENT - TRUE AGENT-BASED ARCHITECTURE
    console.log('\n🚀 Calling ADK Agent for question generation...');
    const agentResult = await generateQuestionWithAgent(
      student._id.toString(),
      session._id.toString(),
      topic
    );

    if (!agentResult.success) {
      throw new Error(agentResult.error || 'Agent failed to generate question');
    }

    res.json({
      success: true,
      question: agentResult.question,
      reasoning: agentResult.agentReasoning,
      adk_agent: true,
      iterations: agentResult.iterations
    });
  } catch (error) {
    console.error('Error generating question with ADK Agent:', error);
    
    // Fallback to direct API if agent fails
    console.log('⚠️ Falling back to direct API...');
    try {
      const { session_id, student_id, topic, emotion_data, question_number } = req.body;
      
      const hasHistory = await QuestionAttempt.countDocuments({ student_id, topic }) > 0;
      let question;
      
      if (hasHistory) {
        question = await generateAdaptiveQuestion(student_id, topic, emotion_data, question_number);
      } else {
        const student = await Student.findOne({ student_id });
        const grade = student ? student.grade : 10;
        question = await generateBaselineQuestion(topic, grade, question_number);
      }
      
      res.json({
        success: true,
        question,
        reasoning: question.reasoning,
        adk_agent: false,
        fallback: true
      });
    } catch (fallbackError) {
      res.status(500).json({
        success: false,
        error: error.message,
        fallbackError: fallbackError.message
      });
    }
  }
});

/**
 * Submit answer and get feedback
 */
router.post('/sessions/answer/submit', async (req, res) => {
  try {
    const {
      session_id,
      student_id,
      topic,
      question_number,
      question_text,
      question,  // Alternative field name
      question_type,
      options,
      difficulty_level,
      difficulty,  // Can be string or number
      bloom_level,
      student_answer,
      user_answer,  // Alternative field name
      correct_answer,
      correctAnswer,  // Alternative field name
      emotion_data,
      time_taken_seconds,
      time_spent,  // Alternative field name
      ai_reasoning
    } = req.body;

    // Use flexible field names
    const finalQuestion = question_text || question;
    const finalAnswer = student_answer || user_answer;
    const finalCorrect = correct_answer || correctAnswer;
    const finalTime = time_taken_seconds || time_spent;

    // Get MongoDB ObjectIds
    const student = await Student.findOne({ student_id });
    const session = await AssessmentSession.findOne({ session_id });

    // Determine if correct
    const isCorrect = finalAnswer.toLowerCase().trim() === finalCorrect.toLowerCase().trim();

    // Generate AI feedback
    const aiFeedback = await generateAnswerFeedback(
      finalQuestion,
      finalAnswer,
      finalCorrect,
      emotion_data,
      isCorrect
    );

    // Map difficulty level to difficulty string
    const difficultyMap = { 1: 'easy', 2: 'easy', 3: 'medium', 4: 'hard', 5: 'hard', easy: 'easy', medium: 'medium', hard: 'hard' };
    const finalDifficulty = typeof difficulty === 'string' ? difficulty : (difficultyMap[difficulty_level] || difficultyMap[difficulty] || 'medium');
    
    // Map difficulty to difficulty_level number
    const difficultyToLevel = { easy: 2, medium: 3, hard: 4 };
    const finalDifficultyLevel = difficulty_level || difficultyToLevel[difficulty] || 3;
    
    // Map stress (0-1 scale) to stress_level (1-5 scale)
    const avgStress = emotion_data?.average_stress || emotion_data?.stressLevel || 0;
    const finalStressLevel = avgStress < 1 ? Math.round(avgStress * 4) + 1 : avgStress; // Map 0-1 to 1-5

    // Save question attempt
    const attempt = new QuestionAttempt({
      session_id,
      session: session ? session._id : undefined,
      student_id,
      student: student ? student._id : undefined,
      topic,
      subject: topic,
      question_number: question_number || 0,
      question_text: finalQuestion,
      question_type: question_type || 'multiple_choice',
      options,
      difficulty_level: finalDifficultyLevel,
      difficulty: finalDifficulty,
      bloom_level: bloom_level || 'Understand',
      student_answer: finalAnswer,
      correct_answer: finalCorrect,
      is_correct: isCorrect,
      isCorrect,
      emotion_during_answer: emotion_data?.dominant_emotion || emotion_data?.emotion || 'neutral',
      stress_level: finalStressLevel,
      time_taken_seconds: finalTime,
      timeSpent: finalTime,
      ai_feedback: aiFeedback,
      ai_reasoning
    });

    await attempt.save();

    // Update session stats
    await AssessmentSession.updateOne(
      { session_id },
      {
        $inc: {
          questions_answered: 1,
          correct_answers: isCorrect ? 1 : 0
        }
      }
    );

    res.json({
      success: true,
      is_correct: isCorrect,
      feedback: aiFeedback
    });
  } catch (error) {
    console.error('Error submitting answer:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Complete session - GOOGLE ADK AGENT
 */
router.post('/sessions/complete', async (req, res) => {
  try {
    const { session_id, student_id, average_stress, dominant_emotion } = req.body;

    // Update session
    const session = await AssessmentSession.findOne({ session_id });
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    await session.complete(average_stress, dominant_emotion);

    // 🤖 USE GOOGLE ADK AGENT FOR SESSION ANALYTICS
    console.log('\n🚀 Calling ADK Agent for session completion analytics...');
    const agentResult = await completeSessionWithAgent(session._id.toString());

    if (!agentResult.success) {
      console.log('⚠️ Agent analytics failed, using fallback...');
      const summary = await generateSessionSummary(session_id);
      
      return res.json({
        success: true,
        summary,
        adk_agent: false,
        session: {
          session_id,
          questions_answered: session.questions_answered,
          correct_answers: session.correct_answers,
          accuracy: session.questions_answered > 0 
            ? (session.correct_answers / session.questions_answered * 100).toFixed(1) 
            : 0
        }
      });
    }

    res.json({
      success: true,
      summary: agentResult.summary,
      adk_agent: true,
      iterations: agentResult.iterations,
      session: {
        session_id,
        questions_answered: session.questions_answered,
        correct_answers: session.correct_answers,
        accuracy: session.questions_answered > 0 
          ? (session.correct_answers / session.questions_answered * 100).toFixed(1) 
          : 0
      }
    });
  } catch (error) {
    console.error('Error completing session:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get student performance analysis
 */
router.get('/analytics/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;

    const analysis = await analyzeStudentPerformance(studentId);

    res.json({
      success: true,
      analysis
    });
  } catch (error) {
    console.error('Error getting student analysis:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get topic recommendations
 */
router.get('/analytics/topic/:studentId/:topic', async (req, res) => {
  try {
    const { studentId, topic } = req.params;

    const recommendations = await getTopicRecommendations(studentId, topic);

    res.json({
      success: true,
      recommendations
    });
  } catch (error) {
    console.error('Error getting topic recommendations:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get emotion patterns
 */
router.get('/emotions/patterns/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const limit = parseInt(req.query.limit) || 20;

    const patterns = await EmotionTracking.getEmotionPatterns(studentId, limit);

    res.json({
      success: true,
      patterns
    });
  } catch (error) {
    console.error('Error getting emotion patterns:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;

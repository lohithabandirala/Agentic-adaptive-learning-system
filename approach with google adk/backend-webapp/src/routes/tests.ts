import { Router } from 'express';
import { getNextDifficulty, Difficulty } from '../adaptiveLogic';
import adkAgent from '../services/adkAgent';
import { Test, Attempt, Class } from '../db/models';
import { authenticateToken, requireTeacher, AuthRequest } from '../middleware/auth';

const router = Router();

// Helper: Convert old difficulty string to 1-5 scale
function difficultyToLevel(diff: string): number {
  switch (diff.toLowerCase()) {
    case 'easy': return 2;
    case 'medium': return 3;
    case 'hard': return 4;
    default: return 3;
  }
}

// Helper: Convert 1-5 scale to old difficulty string
function levelToDifficulty(level: number): 'easy' | 'medium' | 'hard' {
  if (level <= 2) return 'easy';
  if (level >= 4) return 'hard';
  return 'medium';
}

// Teacher creates a test template (NO question generation yet)
router.post('/create', authenticateToken, requireTeacher, async (req: AuthRequest, res) => {
  const { textInput, numQuestions = 10, classId, testName } = req.body || {};
  if (!textInput) return res.status(400).json({ error: 'textInput (topic) required' });

  const teacherId = req.user!.userId;
  
  try {
    console.log(`📝 Teacher ${req.user!.username} creating test template: ${testName}`);
    console.log(`   Topic: ${textInput}`);
    console.log(`   Questions: ${numQuestions}`);
    
    const testId = `test_${Date.now()}`;
    
    // Save test template (no questions yet!)
    const test = new Test({
      testId,
      testName: testName || `Test on ${textInput.substring(0, 30)}`,
      classId: classId || null,
      topic: textInput,
      numQuestions: Number(numQuestions),
      createdBy: teacherId,
    });
    
    await test.save();
    
    // Add test to class if classId provided
    if (classId) {
      await Class.findOneAndUpdate(
        { _id: classId },
        { $addToSet: { tests: testId } }
      );
    }
    
    console.log(`✅ Test template created: ${testName} (${numQuestions} questions will be generated adaptively)`);
    
    return res.json({ 
      testId,
      testName: test.testName,
      topic: test.topic,
      numQuestions: test.numQuestions,
      message: 'Test template created. Questions will be generated when students take the test.'
    });
  } catch (err: any) {
    console.error('❌ Test creation failed:', err);
    return res.status(500).json({ error: 'Test creation failed', details: err.message || String(err) });
  }
});

// List available tests (filtered by teacher or class)
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { classId } = req.query;
    const userId = req.user!.userId;
    const role = req.user!.role;
    
    let query: any = {};
    
    if (classId) {
      // Filter by class
      query.classId = classId;
    } else if (role === 'teacher') {
      // Teachers see only their tests
      query.createdBy = userId;
    } else if (role === 'student') {
      // Students see tests from their joined classes
      const studentClasses = await Class.find({ students: userId });
      const classIds = studentClasses.map(c => String(c._id));
      query.classId = { $in: classIds };
    }
    // Admins see all tests (no filter)
    
    const tests = await Test.find(query).sort({ createdAt: -1 });
    
    const formattedTests = tests.map((t) => ({
      id: t.testId,
      name: t.testName,
      testId: t.testId,
      classId: t.classId,
      topic: t.topic,
      numQuestions: t.numQuestions,
      createdBy: t.createdBy,
      createdAt: t.createdAt,
    }));
    
    res.json({ tests: formattedTests });
  } catch (error) {
    console.error('❌ Error fetching tests:', error);
    res.status(500).json({ error: 'Failed to fetch tests' });
  }
});

// Start test - Generate FIRST question adaptively
router.post('/start', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { testId } = req.body || {};
    const studentId = req.user!.userId;
    
    const test = await Test.findOne({ testId });
    if (!test) return res.status(400).json({ error: 'Test not found' });
    
    const attemptId = `attempt_${Date.now()}`;
    
    // Create new attempt
    const attempt = new Attempt({
      attemptId,
      testId,
      studentId,
      index: 0,
      results: [],
      currentDifficulty: 'easy', // Start with easy
      completed: false,
    });
    
    await attempt.save();
    
    console.log(`🎯 Student ${req.user!.username} started test: ${test.testName}`);
    console.log(`   Generating first question with ADK Agent...`);
    
    // Generate FIRST question with ADK Agent
    const result = await adkAgent.generateQuestionsWithADK({
      topic: test.topic,
      count: 1,
      difficulty: 'easy',
      studentLevel: 2
    });
    
    if (!result || result.length === 0) {
      return res.status(500).json({ error: 'Failed to generate first question with ADK' });
    }
    
    const question = result[0];
    console.log(`✅ First question generated: ${question.question.substring(0, 50)}...`);
    
    res.json({ 
      attemptId,
      question: {
        id: `q_${Date.now()}`,
        text: question.question,
        difficulty: question.difficulty,
        options: question.options || [],
        correctAnswer: question.correctAnswer,
        explanation: question.explanation
      },
      questionNumber: 1,
      totalQuestions: test.numQuestions
    });
  } catch (error) {
    console.error('❌ Error starting test:', error);
    res.status(500).json({ error: 'Failed to start test' });
  }
});

// Submit answer and generate NEXT question adaptively based on student performance
router.post('/answer', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { 
      testId, 
      attemptId, 
      questionId,
      questionText,
      selectedAnswer,
      correctAnswer,
      isCorrect, 
      stress, 
      timeTaken = 30 
    } = req.body || {};
    
    const test = await Test.findOne({ testId });
    if (!test) return res.status(400).json({ error: 'Test not found' });
    
    const attempt = await Attempt.findOne({ attemptId });
    if (!attempt) return res.status(400).json({ error: 'Attempt not found' });

    console.log(`📊 Student answer: correct=${isCorrect}, stress=${stress}, time=${timeTaken}s`);

    // Save result with full question details
    attempt.results.push({ 
      questionId,
      questionText,
      selectedAnswer,
      correctAnswer,
      isCorrect: Boolean(isCorrect), 
      stress: Number(stress),
      timeTaken: Number(timeTaken),
      difficulty: attempt.currentDifficulty,
    });

    // Calculate NEXT difficulty based on performance
    const nextDifficulty = getNextDifficulty(
      attempt.currentDifficulty as Difficulty, 
      Boolean(isCorrect), 
      Number(stress)
    );
    
    console.log(`🎯 Next difficulty: ${attempt.currentDifficulty} → ${nextDifficulty}`);
    
    attempt.currentDifficulty = nextDifficulty;
    attempt.index += 1;

    // Check if test is complete
    if (attempt.index >= test.numQuestions) {
      attempt.completed = true;
      attempt.completedAt = new Date();
      await attempt.save();
      
      console.log(`✅ Student ${req.user!.username} completed test: ${test.testName}`);
      console.log(`   Total questions: ${attempt.results.length}`);
      console.log(`   Correct: ${attempt.results.filter(r => r.isCorrect).length}`);
      
      return res.json({ 
        nextDifficulty, 
        question: null, 
        done: true,
        totalCorrect: attempt.results.filter(r => r.isCorrect).length,
        totalQuestions: attempt.results.length,
      });
    }

    await attempt.save();

    // Generate NEXT question with adaptive difficulty using ADK Agent
    console.log(`🤖 Generating question ${attempt.index + 1}/${test.numQuestions} with ADK (difficulty: ${nextDifficulty})...`);
    
    const targetLevel = difficultyToLevel(nextDifficulty);
    
    const result = await adkAgent.generateQuestionsWithADK({
      topic: test.topic,
      count: 1,
      difficulty: nextDifficulty,
      studentLevel: targetLevel
    });
    
    if (!result || result.length === 0) {
      return res.status(500).json({ error: 'Failed to generate next question with ADK' });
    }
    
    const nextQuestion = {
      id: `q_${Date.now()}`,
      text: result[0].question,
      difficulty: result[0].difficulty,
      options: result[0].options || [],
      correctAnswer: result[0].correctAnswer,
      explanation: result[0].explanation
    };
    
    console.log(`✅ Question generated: ${nextQuestion.text.substring(0, 50)}...`);
    
    res.json({ 
      nextDifficulty, 
      question: nextQuestion, 
      done: false,
      questionNumber: attempt.index + 1,
      totalQuestions: test.numQuestions,
    });
  } catch (error) {
    console.error('❌ Error submitting answer:', error);
    res.status(500).json({ error: 'Failed to submit answer', details: error });
  }
});

// Get performance insights
router.get('/insights/:attemptId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const attemptId = req.params.attemptId;
    
    const attempt = await Attempt.findOne({ attemptId });
    if (!attempt) return res.status(404).json({ error: 'Attempt not found' });

    const correctCount = attempt.results.filter((r) => r.isCorrect).length;
    const accuracy = attempt.results.length > 0 ? correctCount / attempt.results.length : 0;
    const avgStress = attempt.results.length > 0
      ? attempt.results.reduce((sum, r) => sum + r.stress, 0) / attempt.results.length
      : 0;

    res.json({ 
      accuracy, 
      avgStress, 
      results: attempt.results,
      totalQuestions: attempt.results.length,
      correctAnswers: correctCount,
      completed: attempt.completed,
    });
  } catch (error) {
    console.error('❌ Error fetching insights:', error);
    res.status(500).json({ error: 'Failed to fetch insights' });
  }
});

// ============================================
// SESSION-BASED TEST ENDPOINTS
// ============================================

// Start session-based test - Generate first BATCH of questions
router.post('/start-session', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { testId } = req.body || {};
    const studentId = req.user!.userId;
    
    const test = await Test.findOne({ testId });
    if (!test) return res.status(400).json({ error: 'Test not found' });
    
    const attemptId = `attempt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const questionsPerSession = test.questionsPerSession || 5;
    
    console.log(`🎯 SESSION-BASED TEST: Student ${req.user!.username} started "${test.testName}"`);
    console.log(`   📊 Config: ${test.numQuestions} questions, ${questionsPerSession} per session`);
    console.log(`   🤖 Generating first batch with FULL ADK Agent (with data querying)...`);
    
    // Generate FIRST BATCH using FULL ADK Agent with database querying
    let result = await adkAgent.generateQuestionsWithFullADK({
      topic: test.topic,
      count: questionsPerSession,
      studentId,
      attemptId,
      session: 1
    });
    
    // If Full ADK fails (quota/errors), fallback to simple ADK
    if (!result.success && result.error && result.error.includes('quota')) {
      console.log('⚠️ API quota exceeded, falling back to simple ADK (no database querying)...');
      result = await adkAgent.generateQuestionsWithADK({
        topic: test.topic,
        count: questionsPerSession,
        difficulty: 'easy',
        studentLevel: 2
      });
    }
    
    let questions: any[] = [];
    
    if (!result.success || !result.questions || result.questions.length === 0) {
      return res.status(500).json({ error: 'ADK Agent failed to generate questions: ' + (result.error || 'Unknown error') });
    }
    
    // Use ADK generated questions directly
    questions = result.questions.map((q: any) => ({
      id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text: q.question,
      difficulty: q.difficulty,
      options: q.options || [],
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      topic: q.topic
    }));
    
    // Create new attempt with session tracking
    const attempt = new Attempt({
      attemptId,
      testId,
      studentId,
      index: 0,
      currentSession: 0,
      currentSessionQuestions: questions,
      sessionAnalytics: [],
      results: [],
      currentDifficulty: 'easy',
      completed: false,
    });
    
    await attempt.save();
    
    console.log(`✅ Session 1/${Math.ceil(test.numQuestions / questionsPerSession)} ready - ${questions.length} questions generated`);
    
    res.json({ 
      attemptId,
      sessionNumber: 1,
      totalSessions: Math.ceil(test.numQuestions / questionsPerSession),
      questions, // Return all questions in the batch
      questionsInSession: questions.length,
      totalQuestions: test.numQuestions,
    });
  } catch (error) {
    console.error('❌ Error starting session-based test:', error);
    res.status(500).json({ error: 'Failed to start session-based test' });
  }
});

// Submit session answers and get next batch with AI re-analysis
router.post('/submit-session', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { 
      testId, 
      attemptId, 
      sessionAnswers, // Array of answers for this session
      emotionData, // Aggregated emotion data for this session
    } = req.body || {};
    
    const test = await Test.findOne({ testId });
    if (!test) return res.status(400).json({ error: 'Test not found' });
    
    const attempt = await Attempt.findOne({ attemptId });
    if (!attempt) return res.status(400).json({ error: 'Attempt not found' });
    
    const questionsPerSession = test.questionsPerSession || 5;
    
    console.log(`📊 SESSION SUBMISSION: Session ${attempt.currentSession + 1}`);
    console.log(`   📝 Answers received: ${sessionAnswers.length}`);
    console.log(`   😊 Emotion data: ${emotionData ? 'Yes' : 'No'}`);
    
    // Save all session results
    sessionAnswers.forEach((answer: any) => {
      attempt.results.push({
        questionId: answer.questionId,
        questionText: answer.questionText,
        selectedAnswer: answer.selectedAnswer,
        correctAnswer: answer.correctAnswer,
        isCorrect: answer.isCorrect,
        stress: answer.stress || 0,
        timeTaken: answer.timeTaken || 30,
        difficulty: answer.difficulty || attempt.currentDifficulty,
        stressLevel: answer.stressLevel,
        dominantEmotion: answer.dominantEmotion,
      });
    });
    
    attempt.index += sessionAnswers.length;
    
    // ANALYZE THIS SESSION
    const correctCount = sessionAnswers.filter((a: any) => a.isCorrect).length;
    const accuracy = correctCount / sessionAnswers.length;
    const avgStress = sessionAnswers.reduce((sum: number, a: any) => sum + (a.stress || 0), 0) / sessionAnswers.length;
    const avgTime = sessionAnswers.reduce((sum: number, a: any) => sum + (a.timeTaken || 30), 0) / sessionAnswers.length;
    
    // Emotion analysis
    let avgEmotionStress = 0;
    let dominantEmotions: string[] = [];
    if (emotionData && emotionData.length > 0) {
      avgEmotionStress = emotionData.reduce((sum: number, e: any) => sum + (e.stressLevel || 0), 0) / emotionData.length;
      dominantEmotions = emotionData.map((e: any) => e.dominantEmotion);
    }
    
    const sessionAnalysis = {
      sessionNumber: attempt.currentSession + 1,
      questionsAnswered: sessionAnswers.length,
      correctAnswers: correctCount,
      accuracy,
      avgStress,
      avgEmotionStress,
      avgTime,
      dominantEmotions,
      recommendation: '',
      nextDifficulty: attempt.currentDifficulty,
    };
    
    // Use FULL ADK Agent for AI recommendation with data querying
    console.log(`🤖 Using FULL ADK Agent for session analysis (with emotion + performance data)...`);
    const adkAnalysis = await adkAgent.analyzeSessionWithFullADK({
      sessionAnswers,
      emotions: { averageStress: avgEmotionStress, dominantEmotion: dominantEmotions[0] },
      topic: test.topic,
      studentId: attempt.studentId,
      attemptId: attempt.attemptId,
      session: attempt.currentSession
    });
    
    if (adkAnalysis.success && adkAnalysis.analysis) {
      sessionAnalysis.recommendation = adkAnalysis.analysis.recommendation || sessionAnalysis.recommendation;
      sessionAnalysis.nextDifficulty = adkAnalysis.analysis.nextDifficulty || sessionAnalysis.nextDifficulty;
      console.log(`✅ ADK Analysis: ${adkAnalysis.analysis.overallAssessment}`);
    } else {
      // Fallback to simple rules
      if (accuracy >= 0.8 && avgStress < 5 && avgEmotionStress < 0.4) {
        sessionAnalysis.recommendation = 'Excellent performance! Increasing difficulty.';
        sessionAnalysis.nextDifficulty = attempt.currentDifficulty === 'easy' ? 'medium' : 
                                         attempt.currentDifficulty === 'medium' ? 'hard' : 'hard';
      } else if (accuracy < 0.4 || avgStress > 7 || avgEmotionStress > 0.7) {
        sessionAnalysis.recommendation = 'Struggling detected. Reducing difficulty and reviewing concepts.';
        sessionAnalysis.nextDifficulty = attempt.currentDifficulty === 'hard' ? 'medium' : 
                                         attempt.currentDifficulty === 'medium' ? 'easy' : 'easy';
      } else {
        sessionAnalysis.recommendation = 'Good progress. Maintaining current difficulty.';
        sessionAnalysis.nextDifficulty = attempt.currentDifficulty;
      }
    }
    
    attempt.sessionAnalytics.push(sessionAnalysis);
    attempt.currentDifficulty = sessionAnalysis.nextDifficulty as any;
    attempt.currentSession += 1;
    
    console.log(`🤖 AI ANALYSIS:`);
    console.log(`   ✓ Accuracy: ${(accuracy * 100).toFixed(0)}%`);
    console.log(`   ✓ Avg Stress: ${avgStress.toFixed(1)} (Emotion: ${avgEmotionStress.toFixed(2)})`);
    console.log(`   ✓ Avg Time: ${avgTime.toFixed(1)}s`);
    console.log(`   → ${sessionAnalysis.recommendation}`);
    console.log(`   → Next Difficulty: ${sessionAnalysis.nextDifficulty}`);
    
    // Check if test is complete
    if (attempt.index >= test.numQuestions) {
      attempt.completed = true;
      attempt.completedAt = new Date();
      await attempt.save();
      
      console.log(`✅ TEST COMPLETE: ${attempt.results.length} questions answered`);
      
      // Update StudentAnalytics
      try {
        const { StudentAnalytics } = await import('../db/models');
        let analytics = await StudentAnalytics.findOne({ studentId: attempt.studentId });
        
        if (!analytics) {
          analytics = new StudentAnalytics({ studentId: attempt.studentId });
        }
        
        await analytics.updateFromAttempt(attempt, test);
        console.log(`📊 Updated StudentAnalytics for ${attempt.studentId}`);
      } catch (analyticsError: any) {
        console.error('⚠️ Failed to update StudentAnalytics:', analyticsError.message);
      }
      
      return res.json({ 
        done: true,
        sessionAnalysis,
        totalCorrect: attempt.results.filter(r => r.isCorrect).length,
        totalQuestions: attempt.results.length,
        finalAccuracy: attempt.results.filter(r => r.isCorrect).length / attempt.results.length,
      });
    }
    
    await attempt.save();
    
    // GENERATE NEXT SESSION BATCH with AI personalization
    const remainingQuestions = test.numQuestions - attempt.index;
    const nextBatchSize = Math.min(questionsPerSession, remainingQuestions);
    
    console.log(`🤖 Generating Session ${attempt.currentSession + 1} with FULL ADK Agent (personalized)...`);
    console.log(`   Using analysis: Accuracy ${(accuracy * 100).toFixed(0)}%, Difficulty: ${sessionAnalysis.nextDifficulty}`);
    console.log(`   Emotional state: Stress ${avgEmotionStress.toFixed(2)}, Emotion: ${dominantEmotions[0] || 'neutral'}`);
    
    const targetLevel = difficultyToLevel(sessionAnalysis.nextDifficulty);
    
    // Generate next batch with FULL ADK Agent (includes data querying)
    const result = await adkAgent.generateQuestionsWithFullADK({
      topic: test.topic,
      count: nextBatchSize,
      studentId: attempt.studentId,
      attemptId: attempt.attemptId,
      session: attempt.currentSession + 1
    });
    
    let nextQuestions: any[] = [];
    
    if (!result.success || !result.questions || result.questions.length === 0) {
      return res.status(500).json({ error: 'Failed to generate next session questions: ' + (result.error || 'Unknown error') });
    }
    
    nextQuestions = result.questions.map((q: any) => ({
      id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text: q.question,
      difficulty: q.difficulty,
      options: q.options || [],
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      topic: q.topic
    }));
    
    attempt.currentSessionQuestions = nextQuestions;
    await attempt.save();
    
    console.log(`✅ Session ${attempt.currentSession + 1} ready - ${nextQuestions.length} personalized questions`);
    
    res.json({ 
      done: false,
      sessionAnalysis,
      nextSession: {
        sessionNumber: attempt.currentSession + 1,
        questions: nextQuestions,
        questionsInSession: nextQuestions.length,
      },
      progress: {
        questionsAnswered: attempt.index,
        totalQuestions: test.numQuestions,
        percentComplete: (attempt.index / test.numQuestions * 100).toFixed(0),
      }
    });
    
  } catch (error) {
    console.error('❌ Error submitting session:', error);
    res.status(500).json({ error: 'Failed to submit session' });
  }
});

export default router;

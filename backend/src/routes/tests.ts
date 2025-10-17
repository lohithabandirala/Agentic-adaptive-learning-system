import { Router } from 'express';
import { getNextDifficulty, Difficulty } from '../adaptiveLogic';
import geminiClient from '../services/geminiClient';
import { Test, Attempt, Class } from '../db/models';
import { authenticateToken, requireTeacher, AuthRequest } from '../middleware/auth';

const router = Router();

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
    console.log(`   Generating first question (difficulty: easy)...`);
    
    // Generate FIRST question with EASY difficulty
    const prompt = `Generate exactly 1 EASY difficulty multiple-choice question about: "${test.topic}". 
Return as JSON array with format: [{"id":"q1","text":"question text","difficulty":"easy","options":["A","B","C","D"],"correctAnswer":"A"}]`;
    
    const result = await geminiClient.generateQuestions(prompt);
    
    if (!result.questions || result.questions.length === 0) {
      return res.status(500).json({ error: 'Failed to generate first question' });
    }
    
    const question = result.questions[0];
    
    console.log(`✅ First question generated: ${question.text.substring(0, 50)}...`);
    
    res.json({ 
      attemptId,
      question,
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

    // Generate NEXT question with adaptive difficulty
    console.log(`🤖 Generating question ${attempt.index + 1}/${test.numQuestions} (difficulty: ${nextDifficulty})...`);
    
    const difficultyText = nextDifficulty.toUpperCase();
    const prompt = `Generate exactly 1 ${difficultyText} difficulty multiple-choice question about: "${test.topic}". 
The question should be ${nextDifficulty} level. 
Return as JSON array with format: [{"id":"q${attempt.index + 1}","text":"question text","difficulty":"${nextDifficulty}","options":["A","B","C","D"],"correctAnswer":"A"}]`;
    
    const result = await geminiClient.generateQuestions(prompt);
    
    if (!result.questions || result.questions.length === 0) {
      return res.status(500).json({ error: 'Failed to generate next question' });
    }
    
    const nextQuestion = result.questions[0];
    
    console.log(`✅ Question generated: ${nextQuestion.text.substring(0, 50)}... (difficulty: ${nextQuestion.difficulty})`);
    
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

export default router;

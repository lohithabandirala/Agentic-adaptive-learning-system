import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import EmotionTracker from '../components/EmotionTracker';

export default function Student() {
  const [tests, setTests] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [showJoinClass, setShowJoinClass] = useState(false);
  const [classCode, setClassCode] = useState('');
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [activeTest, setActiveTest] = useState<any>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  
  // Session-based state
  const [sessionQuestions, setSessionQuestions] = useState<any[]>([]);
  const [sessionAnswers, setSessionAnswers] = useState<Map<string, any>>(new Map());
  const [sessionNumber, setSessionNumber] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);
  const [emotionSnapshots, setEmotionSnapshots] = useState<any[]>([]);
  
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [timer, setTimer] = useState(30);
  const [allAnswers, setAllAnswers] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [insights, setInsights] = useState<any>(null);
  const [sessionAnalysis, setSessionAnalysis] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentEmotionData, setCurrentEmotionData] = useState<any>(null);
  const navigate = useNavigate();

  const studentId = 'student_1'; // In production, get from auth

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      loadTests();
    }
  }, [selectedClass]);

  useEffect(() => {
    if (activeTest && timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [activeTest, timer]);

  async function loadClasses() {
    const resp = await api.get('/classes');
    setClasses(resp.data.classes || []);
    if (resp.data.classes?.length > 0) {
      setSelectedClass(resp.data.classes[0]);
    }
  }

  async function loadTests() {
    if (!selectedClass) return;
    const resp = await api.get(`/tests?classId=${selectedClass.id}`);
    setTests(resp.data.tests || []);
  }

  async function joinClass() {
    if (!classCode.trim()) return;
    try {
      const resp = await api.post('/classes/join', { classCode: classCode.toUpperCase() });
      alert(resp.data.message);
      setClassCode('');
      setShowJoinClass(false);
      await loadClasses();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to join class');
    }
  }

  async function startTest(testId: string) {
    try {
      console.log('🎯 Starting session-based test:', testId);
      const resp = await api.post('/tests/start-session', { testId });
      
      setActiveTest(testId);
      setAttemptId(resp.data.attemptId);
      setSessionQuestions(resp.data.questions || []);
      setSessionNumber(resp.data.sessionNumber || 1);
      setTotalSessions(resp.data.totalSessions || 1);
      setTotalQuestions(resp.data.totalQuestions || 10);
      setQuestionsAnswered(0);
      setSessionAnswers(new Map());
      setEmotionSnapshots([]);
      setAllAnswers([]);
      setTimer(30);
      
      console.log('✅ Session started:', {
        session: resp.data.sessionNumber,
        totalSessions: resp.data.totalSessions,
        questions: resp.data.questions?.length
      });
    } catch (err: any) {
      console.error('❌ Failed to start test:', err);
      alert(err.response?.data?.error || 'Failed to start test');
    }
  }

  async function submitSession() {
    if (sessionAnswers.size !== sessionQuestions.length) {
      alert(`Please answer all ${sessionQuestions.length} questions before submitting!`);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Convert Map to array format for backend
      const sessionAnswersArray = Array.from(sessionAnswers.values());
      
      console.log('📊 Submitting session:', {
        sessionNumber,
        answersCount: sessionAnswersArray.length,
        emotionSnapshotsCount: emotionSnapshots.length
      });
      
      const resp = await api.post('/tests/submit-session', {
        testId: activeTest,
        attemptId,
        sessionAnswers: sessionAnswersArray,
        emotionData: emotionSnapshots,
      });

      // Add session answers to all answers for final results
      setAllAnswers(prev => [...prev, ...sessionAnswersArray]);
      setQuestionsAnswered(prev => prev + sessionAnswersArray.length);
      
      // Store session analysis
      if (resp.data.sessionAnalysis) {
        setSessionAnalysis(resp.data.sessionAnalysis);
        console.log('🤖 AI Analysis:', resp.data.sessionAnalysis);
      }

      if (resp.data.done) {
        // Test complete
        console.log('✅ Test complete!', resp.data);
        setInsights({
          accuracy: resp.data.finalAccuracy,
          avgStress: resp.data.sessionAnalysis?.avgStress || 0,
          totalQuestions: resp.data.totalQuestions,
          correctAnswers: resp.data.totalCorrect,
          sessionAnalytics: resp.data.sessionAnalysis,
        });
        setShowResults(true);
        setActiveTest(null);
      } else {
        // Load next session
        console.log('📝 Loading next session:', resp.data.nextSession);
        setSessionQuestions(resp.data.nextSession.questions || []);
        setSessionNumber(resp.data.nextSession.sessionNumber || sessionNumber + 1);
        setSessionAnswers(new Map());
        setEmotionSnapshots([]);
        setTimer(30);
        
        // Show brief analysis message
        if (resp.data.sessionAnalysis) {
          setTimeout(() => {
            alert(`Session ${resp.data.sessionAnalysis.sessionNumber} Complete!\n\n` +
                  `✓ Accuracy: ${(resp.data.sessionAnalysis.accuracy * 100).toFixed(0)}%\n` +
                  `✓ Correct: ${resp.data.sessionAnalysis.correctAnswers}/${resp.data.sessionAnalysis.questionsAnswered}\n\n` +
                  `${resp.data.sessionAnalysis.recommendation}\n\n` +
                  `Next difficulty: ${resp.data.sessionAnalysis.nextDifficulty.toUpperCase()}`);
          }, 100);
        }
      }
    } catch (err: any) {
      console.error('❌ Failed to submit session:', err);
      alert(err.response?.data?.error || 'Failed to submit session');
    } finally {
      setIsSubmitting(false);
    }
  }

  function answerQuestion(questionId: string, question: any, selectedAnswer: string) {
    const timeTaken = 30 - timer;
    const isCorrect = selectedAnswer === question.correctAnswer;
    
    // Calculate stress based on emotion data or simulate
    const stress = currentEmotionData?.stressLevel 
      ? currentEmotionData.stressLevel * 10 
      : Math.random() * 3 + (isCorrect ? 0 : 4);
    
    const answer = {
      questionId,
      questionText: question.text,
      selectedAnswer,
      correctAnswer: question.correctAnswer,
      isCorrect,
      stress,
      timeTaken,
      difficulty: question.difficulty,
      stressLevel: currentEmotionData?.stressLevel || 0,
      dominantEmotion: currentEmotionData?.dominantEmotion || 'neutral',
    };
    
    // Update session answers
    const newAnswers = new Map(sessionAnswers);
    newAnswers.set(questionId, answer);
    setSessionAnswers(newAnswers);
    
    console.log('✓ Question answered:', {
      questionId,
      isCorrect,
      totalAnswered: newAnswers.size,
      totalQuestions: sessionQuestions.length
    });
  }

  // Handle emotion detection - collect snapshots during session
  async function handleEmotionDetected(emotionData: any) {
    setCurrentEmotionData(emotionData);
    
    // Collect emotion snapshots throughout the session
    if (attemptId && activeTest) {
      const snapshot = {
        dominantEmotion: emotionData.dominantEmotion,
        stressLevel: emotionData.stressLevel,
        timestamp: new Date().toISOString(),
      };
      
      setEmotionSnapshots(prev => [...prev, snapshot]);
      
      // Also save to backend for real-time tracking (optional)
      try {
        await api.post('/emotions/track', {
          attemptId,
          questionNumber: sessionNumber,
          emotions: emotionData.emotions,
          dominantEmotion: emotionData.dominantEmotion,
          stressLevel: emotionData.stressLevel
        });
        console.log('📸 Emotion snapshot saved');
      } catch (err) {
        console.error('Failed to save emotion snapshot:', err);
      }
    }
  }

  function logout() {
    localStorage.clear();
    navigate('/');
  }

  function retakeTest() {
    setShowResults(false);
    setInsights(null);
    setAllAnswers([]);
    setSessionAnalysis(null);
    loadTests();
  }

  function backToDashboard() {
    // Reset all test state
    setShowResults(false);
    setInsights(null);
    setAllAnswers([]);
    setSessionAnalysis(null);
    setActiveTest(null);
    setSessionQuestions([]);
    setSessionAnswers(new Map());
    setQuestionsAnswered(0);
    setSessionNumber(0);
    setTotalSessions(0);
    setAttemptId(null);
    setEmotionSnapshots([]);
    setTotalQuestions(0);
    setTimer(30);
    setIsSubmitting(false);
    // Reload tests
    loadTests();
  }

  if (showResults && insights) {
    // Convert stress from 1-10 scale to 0-100% for display
    const chartData = allAnswers.map((a: any, i: number) => ({
      question: i + 1,
      stress: Number((a.stress * 10).toFixed(0)), // 1-10 -> 10-100%
      time: a.timeTaken,
    }));

    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h1 className="text-xl font-bold text-gray-900">Test Results</h1>
              <button onClick={logout} className="btn-secondary">Logout</button>
            </div>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="card mb-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Test Completed!</h2>
              <p className="text-gray-600">Here's your performance analysis</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="card text-center">
              <p className="text-sm text-gray-600">Accuracy</p>
              <p className="text-4xl font-bold text-blue-600 mt-2">
                {(insights.accuracy * 100).toFixed(0)}%
              </p>
            </div>
            <div className="card text-center">
              <p className="text-sm text-gray-600">Avg Stress Level</p>
              <p className="text-4xl font-bold text-orange-600 mt-2">
                {(insights.avgStress * 10).toFixed(0)}%
              </p>
            </div>
            <div className="card text-center">
              <p className="text-sm text-gray-600">Questions</p>
              <p className="text-4xl font-bold text-purple-600 mt-2">{allAnswers.length}</p>
            </div>
          </div>

          <div className="card mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Stress Level Throughout Test</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="question" label={{ value: 'Question #', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Stress %', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Line type="monotone" dataKey="stress" stroke="#f59e0b" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex gap-4">
            <button onClick={retakeTest} className="btn-primary flex-1">Retake Similar Test</button>
            <button onClick={backToDashboard} className="btn-secondary flex-1">Back to Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  if (activeTest && sessionQuestions.length > 0) {
    const progress = (questionsAnswered / totalQuestions) * 100;
    const allQuestionsAnswered = sessionAnswers.size === sessionQuestions.length;
    
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Session {sessionNumber} of {totalSessions}</h1>
                <p className="text-sm text-gray-500">
                  Answered: {sessionAnswers.size}/{sessionQuestions.length} questions
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm">
                  <span className="text-gray-600">Total Progress: </span>
                  <span className="font-bold text-blue-600">{questionsAnswered}/{totalQuestions}</span>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Overall Progress</span>
              <span>{progress.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Session Info Banner */}
          {sessionAnalysis && (
            <div className="card mb-6 bg-blue-50 border-blue-200">
              <h3 className="font-bold text-blue-900 mb-2">Previous Session Analysis</h3>
              <p className="text-sm text-blue-700">{sessionAnalysis.recommendation}</p>
              <p className="text-xs text-blue-600 mt-1">
                Next difficulty: {sessionAnalysis.nextDifficulty.toUpperCase()}
              </p>
            </div>
          )}

          {/* Questions Grid */}
          <div className="space-y-6">
            {sessionQuestions.map((question, qIndex) => {
              const isAnswered = sessionAnswers.has(question.id);
              const selectedAnswer = sessionAnswers.get(question.id)?.selectedAnswer;
              
              return (
                <div key={question.id} className={`card ${isAnswered ? 'border-2 border-green-500' : 'border-2 border-gray-200'}`}>
                  {/* Question Header */}
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        question.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                        question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {question.difficulty?.toUpperCase()}
                      </span>
                      <span className="text-sm font-medium text-gray-600">
                        Question {qIndex + 1} of {sessionQuestions.length}
                      </span>
                    </div>
                    {isAnswered && (
                      <span className="flex items-center gap-1 text-sm font-medium text-green-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Answered
                      </span>
                    )}
                  </div>
                  
                  {/* Question Text */}
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    {question.text}
                  </h3>

                  {/* MCQ Options */}
                  <div className="space-y-3">
                    {question.options && question.options.map((option: string, idx: number) => {
                      const isSelected = selectedAnswer === option;
                      
                      return (
                        <button
                          key={idx}
                          onClick={() => answerQuestion(question.id, question, option)}
                          className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                            isSelected
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 bg-white hover:border-blue-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900">{option}</span>
                            {isSelected && (
                              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Submit Session Button */}
          <div className="sticky bottom-0 py-6 bg-gray-50 mt-8">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">
                    {allQuestionsAnswered 
                      ? '✓ All questions answered!' 
                      : `${sessionQuestions.length - sessionAnswers.size} question(s) remaining`}
                  </p>
                  <p className="text-sm text-gray-600">
                    Session {sessionNumber} of {totalSessions}
                  </p>
                </div>
                <button
                  onClick={submitSession}
                  disabled={!allQuestionsAnswered || isSubmitting}
                  className={`btn-primary px-8 py-4 text-lg ${
                    !allQuestionsAnswered || isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? '⏳ Analyzing...' : 
                   sessionNumber === totalSessions ? '✓ Complete Test' : '→ Submit & Continue'}
                </button>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-500 mt-4 text-center">
            ✨ Questions adapt based on your performance and stress levels
          </p>
        </div>

        {/* Emotion Tracker - Fixed position in bottom right */}
        <EmotionTracker 
          isActive={true}
          attemptId={attemptId || undefined}
          studentId={localStorage.getItem('userId') || undefined}
          onEmotionDetected={handleEmotionDetected}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Student Portal</h1>
                <p className="text-sm text-gray-500">Take adaptive tests</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate('/student/profile')} 
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
              >
                📊 My Profile
              </button>
              <button onClick={logout} className="btn-secondary">Logout</button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Class Selection */}
        <div className="card mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">My Classes</h2>
            <button onClick={() => setShowJoinClass(true)} className="btn-primary">
              + Join Class
            </button>
          </div>

          {showJoinClass && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-gray-900 mb-3">Join a Class</h3>
              <p className="text-sm text-gray-600 mb-3">Enter the 6-character code provided by your teacher</p>
              <input
                type="text"
                placeholder="Enter Class Code (e.g., ABC123)"
                value={classCode}
                onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="input mb-3 uppercase font-mono text-lg"
              />
              <div className="flex gap-2">
                <button onClick={joinClass} className="btn-primary">Join Class</button>
                <button onClick={() => setShowJoinClass(false)} className="btn-secondary">Cancel</button>
              </div>
            </div>
          )}

          {classes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-2">You haven't joined any classes yet</p>
              <p className="text-sm text-gray-500">Ask your teacher for a class code</p>
            </div>
          ) : (
            <div className="space-y-2">
              {classes.map((cls: any) => (
                <div
                  key={cls.id}
                  onClick={() => setSelectedClass(cls)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedClass?.id === cls.id
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-200 bg-gray-50 hover:border-green-300'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-gray-900">{cls.name}</h3>
                      <p className="text-sm text-gray-600">{cls.description || 'No description'}</p>
                    </div>
                    {selectedClass?.id === cls.id && (
                      <span className="text-xs bg-green-600 text-white px-3 py-1 rounded">Active</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tests List */}
        {selectedClass && (
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Tests - {selectedClass.name}</h2>
            {tests.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-600">No tests available in this class yet</p>
                <p className="text-sm text-gray-500 mt-2">Your teacher will create tests soon</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tests.map((t: any) => (
                  <div key={t.id} className="flex items-center justify-between p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div>
                      <h3 className="font-bold text-gray-900">{t.name || t.id}</h3>
                      <p className="text-sm text-gray-600">Material: {t.materialId}</p>
                      <p className="text-sm text-gray-500">{t.questions?.length || 10} questions • Adaptive difficulty</p>
                    </div>
                    <button
                      onClick={() => startTest(t.id)}
                      className="btn-primary"
                    >
                      Start Test →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Student() {
  const [tests, setTests] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [showJoinClass, setShowJoinClass] = useState(false);
  const [classCode, setClassCode] = useState('');
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [activeTest, setActiveTest] = useState<any>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [timer, setTimer] = useState(30);
  const [answers, setAnswers] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [insights, setInsights] = useState<any>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      const resp = await api.post('/tests/start', { testId });
      setActiveTest(testId);
      setAttemptId(resp.data.attemptId);
      setCurrentQuestion(resp.data.question);
      setQuestionIndex(resp.data.questionNumber || 1);
      setTotalQuestions(resp.data.totalQuestions || 10);
      setTimer(30);
      setAnswers([]);
      setSelectedAnswer(null);
    } catch (err) {
      alert('Failed to start test');
    }
  }

  async function submitAnswer() {
    if (!selectedAnswer) {
      alert('Please select an answer!');
      return;
    }
    
    setIsSubmitting(true);
    const timeTaken = 30 - timer;
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    const stress = Math.random() * 0.3 + (isCorrect ? 0 : 0.4); // Simulate stress
    
    setAnswers([...answers, { isCorrect, stress, time: timeTaken }]);
    
    try {
      const resp = await api.post('/tests/answer', {
        testId: activeTest,
        attemptId,
        questionId: currentQuestion.id,
        questionText: currentQuestion.text,
        selectedAnswer,
        correctAnswer: currentQuestion.correctAnswer,
        isCorrect,
        stress,
        timeTaken,
      });

      if (resp.data.done || !resp.data.question) {
        // Test complete, fetch insights
        const insightResp = await api.get(`/tests/insights/${attemptId}`);
        setInsights(insightResp.data);
        setShowResults(true);
        setActiveTest(null);
      } else {
        // Next question
        setCurrentQuestion(resp.data.question);
        setQuestionIndex(resp.data.questionNumber || questionIndex + 1);
        setTotalQuestions(resp.data.totalQuestions || totalQuestions);
        setTimer(30);
        setSelectedAnswer(null);
      }
    } catch (err) {
      alert('Failed to submit answer');
    } finally {
      setIsSubmitting(false);
    }
  }

  function logout() {
    localStorage.clear();
    navigate('/');
  }

  function retakeTest() {
    setShowResults(false);
    setInsights(null);
    setAnswers([]);
    loadTests();
  }

  if (showResults && insights) {
    const chartData = answers.map((a, i) => ({
      question: i + 1,
      stress: (a.stress * 100).toFixed(0),
      time: a.time,
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
                {(insights.avgStress * 100).toFixed(0)}%
              </p>
            </div>
            <div className="card text-center">
              <p className="text-sm text-gray-600">Questions</p>
              <p className="text-4xl font-bold text-purple-600 mt-2">{answers.length}</p>
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
            <button onClick={() => navigate('/student')} className="btn-secondary flex-1">Back to Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  if (activeTest && currentQuestion) {
    const progress = ((questionIndex + 1) / 10) * 100;
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Adaptive Test</h1>
                <p className="text-sm text-gray-500">Question {questionIndex + 1} of 10</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className={`text-lg font-bold ${timer < 10 ? 'text-red-600' : 'text-gray-900'}`}>
                    {timer}s
                  </span>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-3xl mx-auto px-4 py-8">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{progress.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          <div className="card">
            <div className="mb-4 flex justify-between items-center">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                currentQuestion.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                currentQuestion.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {currentQuestion.difficulty?.toUpperCase()}
              </span>
              <span className="text-sm text-gray-600">
                Question {questionIndex}/{totalQuestions}
              </span>
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {currentQuestion.text || 'Loading question...'}
            </h2>

            {/* MCQ Options */}
            <div className="space-y-3 mb-6">
              {currentQuestion.options && currentQuestion.options.map((option: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedAnswer(option)}
                  disabled={isSubmitting}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    selectedAnswer === option
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-blue-300'
                  } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <span className="font-medium text-gray-900">{option}</span>
                </button>
              ))}
            </div>

            <button
              onClick={submitAnswer}
              disabled={!selectedAnswer || isSubmitting}
              className={`btn-primary w-full py-4 text-lg ${
                !selectedAnswer || isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? '⏳ Submitting...' : '✓ Submit Answer'}
            </button>

            <p className="text-sm text-gray-500 mt-4 text-center">
              ✨ Next question difficulty will adapt based on your performance
            </p>
          </div>
        </div>
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
            <button onClick={logout} className="btn-secondary">Logout</button>
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

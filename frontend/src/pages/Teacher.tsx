import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Teacher() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);
  const [tests, setTests] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [showCreateClass, setShowCreateClass] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassDesc, setNewClassDesc] = useState('');
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [showCreateTest, setShowCreateTest] = useState(false);
  const [testFormData, setTestFormData] = useState({
    testName: '',
    textInput: '',
    numQuestions: 10,
  });
  const [generatingProgress, setGeneratingProgress] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);
  const [showQuestionsPreview, setShowQuestionsPreview] = useState(false);
  const navigate = useNavigate();

  const teacherId = 'teacher_1'; // In production, get from auth

  useEffect(() => {
    loadMaterials();
    loadTests();
    loadClasses();
  }, []);

  async function loadMaterials() {
    const resp = await api.get('/materials');
    setMaterials(resp.data.materials || []);
  }

  async function loadTests() {
    const resp = await api.get('/tests');
    setTests(resp.data.tests || []);
  }

  async function loadClasses() {
    const resp = await api.get('/classes');
    setClasses(resp.data.classes || []);
  }

  async function createClass() {
    if (!newClassName.trim()) return;
    try {
      const resp = await api.post('/classes/create', {
        teacherId,
        className: newClassName,
        description: newClassDesc,
      });
      alert(`Class created!\n\nClass Code: ${resp.data.classCode}\n\nShare this code with students to join.`);
      setNewClassName('');
      setNewClassDesc('');
      setShowCreateClass(false);
      await loadClasses();
    } catch (err) {
      alert('Failed to create class');
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      await api.post('/materials/upload', formData);
      await loadMaterials();
      alert('File uploaded successfully!');
    } catch (err) {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function generateQuestions(materialId: string) {
    if (!selectedClass) {
      alert('Please select a class first');
      return;
    }
    
    setGenerating(materialId);
    setGeneratingProgress(true);
    try {
      const testName = prompt('Enter test name:') || `Test for ${materialId}`;
      const numQuestions = parseInt(prompt('Number of questions (1-50):', '10') || '10');
      const difficulty = prompt('Difficulty (easy/medium/hard/mixed):', 'mixed') || 'mixed';
      
      const resp = await api.post('/tests/generate', { 
        materialId, 
        numQuestions,
        difficulty,
        classId: selectedClass.id,
        testName,
      });
      
      setGeneratedQuestions(resp.data.preview || []);
      setShowQuestionsPreview(true);
      
      alert(`✅ Test "${testName}" created!\n\n📊 Questions Generated: ${resp.data.total}\n📚 Added to class: ${selectedClass.name}\n\nClick below to preview the questions.`);
      await loadTests();
    } catch (err: any) {
      const errorMsg = err?.response?.data?.error || err?.message || 'Unknown error';
      alert(`❌ Failed to generate test:\n\n${errorMsg}\n\nPlease check:\n1. Your API key is valid\n2. The uploaded file is readable\n3. Try again with simpler content`);
    } finally {
      setGenerating(null);
      setGeneratingProgress(false);
    }
  }

  async function createTestFromText() {
    if (!selectedClass) {
      alert('Please select a class first');
      return;
    }
    if (!testFormData.textInput.trim() || !testFormData.testName.trim()) {
      alert('Please fill in test name and topic/content');
      return;
    }
    
    setGeneratingProgress(true);
    try {
      const resp = await api.post('/tests/create', { 
        textInput: testFormData.textInput,
        numQuestions: testFormData.numQuestions,
        classId: selectedClass.id,
        testName: testFormData.testName,
      });
      
      // No questions preview anymore - they generate adaptively during student test
      setGeneratedQuestions([]);
      setShowQuestionsPreview(false);
      
      alert(`✅ Test Template Created!\n\n📝 Test Name: ${testFormData.testName}\n📚 Topic: ${testFormData.textInput}\n🔢 Questions: ${testFormData.numQuestions}\n\n✨ Questions will be generated adaptively when students take the test, based on their performance!`);
      
      setTestFormData({ testName: '', textInput: '', numQuestions: 10 });
      setShowCreateTest(false);
      await loadTests();
    } catch (err: any) {
      const errorMsg = err?.response?.data?.error || err?.message || 'Unknown error';
      alert(`❌ Failed to create test:\n\n${errorMsg}\n\nPlease check:\n1. Topic/content is clear\n2. Try again`);
    } finally {
      setGeneratingProgress(false);
    }
  }

  function logout() {
    localStorage.clear();
    navigate('/');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Teacher Dashboard</h1>
                <p className="text-sm text-gray-500">Manage courses & generate tests</p>
              </div>
            </div>
            <button onClick={logout} className="btn-secondary">Logout</button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Classes Section */}
        <div className="card mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">My Classes</h2>
            <button onClick={() => setShowCreateClass(true)} className="btn-primary">
              + Create Class
            </button>
          </div>

          {showCreateClass && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-gray-900 mb-3">Create New Class</h3>
              <input
                type="text"
                placeholder="Class Name (e.g., Math 101)"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                className="input mb-2"
              />
              <input
                type="text"
                placeholder="Description (optional)"
                value={newClassDesc}
                onChange={(e) => setNewClassDesc(e.target.value)}
                className="input mb-3"
              />
              <div className="flex gap-2">
                <button onClick={createClass} className="btn-primary">Create</button>
                <button onClick={() => setShowCreateClass(false)} className="btn-secondary">Cancel</button>
              </div>
            </div>
          )}

          {classes.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No classes yet. Create one to get started!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classes.map((cls: any) => (
                <div
                  key={cls.id}
                  onClick={() => setSelectedClass(cls)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedClass?.id === cls.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 bg-gray-50 hover:border-blue-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900">{cls.name}</h3>
                    {selectedClass?.id === cls.id && (
                      <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">Selected</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{cls.description || 'No description'}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">{cls.students?.length || 0} students</span>
                    <span className="font-mono bg-gray-200 px-2 py-1 rounded text-xs">{cls.classCode}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Stats */}
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Materials</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{materials.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Generated Tests</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{tests.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">AI Status</p>
                <p className="text-lg font-semibold text-green-600 mt-1">● Active</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="card mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Upload Course Material</h2>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleUpload}
              accept=".pdf,.doc,.docx,.txt,.png,.jpg"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="flex flex-col items-center">
                <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="text-sm text-gray-600">
                  {uploading ? 'Uploading...' : 'Click to upload or drag and drop'}
                </span>
                <span className="text-xs text-gray-500 mt-1">PDF, DOC, TXT, or Images</span>
              </div>
            </label>
          </div>
        </div>

        {/* Create Test from Text */}
        <div className="card mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Create Test from Text</h2>
            <button
              onClick={() => setShowCreateTest(!showCreateTest)}
              className="btn-primary"
            >
              {showCreateTest ? '− Close' : '+ Create Test'}
            </button>
          </div>

          {showCreateTest && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Test Name *</label>
                <input
                  type="text"
                  value={testFormData.testName}
                  onChange={(e) => setTestFormData({ ...testFormData, testName: e.target.value })}
                  placeholder="e.g., Chapter 5 Quiz, Midterm Exam"
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Topic / Content *</label>
                <textarea
                  value={testFormData.textInput}
                  onChange={(e) => setTestFormData({ ...testFormData, textInput: e.target.value })}
                  placeholder="Enter the topic, chapter content, or specific content you want questions about..."
                  rows={6}
                  className="input resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  The AI will generate questions based on this content
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Number of Questions</label>
                  <select
                    value={testFormData.numQuestions}
                    onChange={(e) => setTestFormData({ ...testFormData, numQuestions: parseInt(e.target.value) })}
                    className="input"
                  >
                    <option value="5">5 questions</option>
                    <option value="10">10 questions</option>
                    <option value="15">15 questions</option>
                    <option value="20">20 questions</option>
                    <option value="25">25 questions</option>
                    <option value="30">30 questions</option>
                    <option value="50">50 questions</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <p className="text-sm text-purple-800">
                  ✨ Questions will be generated adaptively based on each student's performance (stress, accuracy, time)
                </p>
              </div>

              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-blue-800">
                  {selectedClass ? `Test will be added to: ${selectedClass.name}` : 'Please select a class first'}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={createTestFromText}
                  disabled={!selectedClass || !testFormData.testName.trim() || !testFormData.textInput.trim() || generatingProgress}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generatingProgress ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating questions with AI...
                    </span>
                  ) : (
                    '🤖 Generate Test with AI'
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowCreateTest(false);
                    setTestFormData({ testName: '', textInput: '', numQuestions: 10 });
                  }}
                  className="btn-secondary"
                  disabled={generatingProgress}
                >
                  Cancel
                </button>
              </div>

              {/* Progress Indicator */}
              {generatingProgress && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <svg className="animate-spin h-6 w-6 text-blue-600 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <div className="flex-1">
                      <p className="font-semibold text-blue-900">Creating Test Template...</p>
                      <p className="text-sm text-blue-700 mt-1">
                        Setting up adaptive test for {testFormData.numQuestions} questions. This will take a moment.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Questions Preview Section */}
          {showQuestionsPreview && generatedQuestions.length > 0 && (
            <div className="mt-6 p-6 bg-green-50 border-2 border-green-200 rounded-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-green-900 flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Test Generated Successfully!
                  </h3>
                  <p className="text-sm text-green-700 mt-1">
                    {generatedQuestions.length} questions have been created and saved to your class
                  </p>
                </div>
                <button
                  onClick={() => setShowQuestionsPreview(false)}
                  className="text-green-700 hover:text-green-900 font-semibold"
                >
                  ✕ Close
                </button>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {generatedQuestions.map((q, idx) => (
                  <div key={idx} className="p-4 bg-white rounded-lg shadow-sm border border-green-200">
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-xs font-semibold px-2 py-1 rounded ${
                            q.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                            q.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {q.difficulty?.toUpperCase() || 'MEDIUM'}
                          </span>
                        </div>
                        <p className="font-medium text-gray-900 mb-3">{q.text || q.question}</p>
                        {q.options && q.options.length > 0 && (
                          <div className="space-y-2">
                            {q.options.map((opt: string, optIdx: number) => (
                              <div key={optIdx} className="flex items-start gap-2 text-sm text-gray-700">
                                <span className="font-semibold">{String.fromCharCode(65 + optIdx)}.</span>
                                <span>{opt}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {q.correctAnswer && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-sm text-green-700">
                              <span className="font-semibold">Correct Answer:</span> {q.correctAnswer}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Materials List */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Course Materials</h2>
          {materials.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No materials uploaded yet</p>
          ) : (
            <div className="space-y-3">
              {materials.map((m: any, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <span className="font-medium text-gray-900">{m.file}</span>
                  </div>
                  <button
                    onClick={() => generateQuestions(m.file)}
                    disabled={generating === m.file}
                    className="btn-primary"
                  >
                    {generating === m.file ? 'Generating...' : '🤖 Generate Questions'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

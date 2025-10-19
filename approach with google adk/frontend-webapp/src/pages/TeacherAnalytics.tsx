import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function TeacherAnalytics() {
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [studentDetail, setStudentDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadStudents();
  }, []);

  async function loadStudents() {
    try {
      const response = await api.get('/profile/students');
      setStudents(response.data.data.students);
      setLoading(false);
    } catch (error: any) {
      console.error('Failed to load students:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        alert('You do not have permission to view this page');
        navigate('/teacher');
      }
      setLoading(false);
    }
  }

  async function loadStudentDetail(studentId: string) {
    setLoadingDetail(true);
    try {
      const response = await api.get(`/profile/student/${studentId}`);
      setStudentDetail(response.data.data);
      setLoadingDetail(false);
    } catch (error: any) {
      console.error('Failed to load student detail:', error);
      alert('Failed to load student details');
      setLoadingDetail(false);
    }
  }

  const handleStudentClick = (student: any) => {
    setSelectedStudent(student);
    loadStudentDetail(student.id);
  };

  const filteredStudents = students.filter(student =>
    student.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading student analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/teacher')} className="text-blue-600 hover:text-blue-800">
                ← Back to Dashboard
              </button>
              <h1 className="text-2xl font-bold text-gray-800">Student Analytics</h1>
            </div>
            <div className="text-sm text-gray-600">
              {students.length} total students
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Students List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
                {filteredStudents.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No students found</p>
                ) : (
                  filteredStudents.map((student) => (
                    <div
                      key={student.id}
                      onClick={() => handleStudentClick(student)}
                      className={`p-4 rounded-lg cursor-pointer transition ${
                        selectedStudent?.id === student.id
                          ? 'bg-blue-100 border-2 border-blue-500'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                          {student.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-800 truncate">{student.username}</div>
                          <div className="text-sm text-gray-600 truncate">{student.email}</div>
                        </div>
                      </div>
                      {student.analytics && (
                        <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                          <div className="text-center">
                            <div className="font-bold text-blue-600">{student.analytics.overallAccuracy}%</div>
                            <div className="text-gray-500">Accuracy</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-green-600">{student.analytics.testsCompleted}</div>
                            <div className="text-gray-500">Tests</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-orange-600">{student.analytics.averageStress}</div>
                            <div className="text-gray-500">Stress</div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Student Detail */}
          <div className="lg:col-span-2">
            {!selectedStudent ? (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                <div className="text-gray-400 text-6xl mb-4">👤</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Select a Student</h3>
                <p className="text-gray-600">Click on a student to view their detailed analytics</p>
              </div>
            ) : loadingDetail ? (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading student details...</p>
              </div>
            ) : studentDetail ? (
              <div className="space-y-6">
                {/* Student Header */}
                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                      {studentDetail.student.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-800">{studentDetail.student.username}</h2>
                      <p className="text-gray-600">{studentDetail.student.email}</p>
                      <p className="text-sm text-gray-500">Member since {new Date(studentDetail.student.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                {studentDetail.analytics && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl shadow-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">Accuracy</div>
                      <div className="text-2xl font-bold text-blue-600">{studentDetail.analytics.overallAccuracy}%</div>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">Tests</div>
                      <div className="text-2xl font-bold text-green-600">{studentDetail.analytics.testsCompleted}</div>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">Questions</div>
                      <div className="text-2xl font-bold text-purple-600">{studentDetail.analytics.totalQuestions}</div>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">Avg Stress</div>
                      <div className="text-2xl font-bold text-orange-600">{studentDetail.analytics.averageStress}</div>
                    </div>
                  </div>
                )}

                {/* Topic Performance */}
                {studentDetail.analytics?.topicPerformance && studentDetail.analytics.topicPerformance.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-xl p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Topic Performance</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={studentDetail.analytics.topicPerformance}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="topic" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="accuracy" fill="#3b82f6" name="Accuracy (%)" />
                        <Bar dataKey="testsCount" fill="#10b981" name="Tests" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Strengths & Weaknesses */}
                {studentDetail.analytics && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {studentDetail.analytics.strengths && studentDetail.analytics.strengths.length > 0 && (
                      <div className="bg-white rounded-2xl shadow-xl p-6">
                        <h3 className="text-xl font-bold text-green-600 mb-4">💪 Strengths</h3>
                        <ul className="space-y-2">
                          {studentDetail.analytics.strengths.map((strength: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-green-500 mt-1">✓</span>
                              <span className="text-gray-700">{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {studentDetail.analytics.weaknesses && studentDetail.analytics.weaknesses.length > 0 && (
                      <div className="bg-white rounded-2xl shadow-xl p-6">
                        <h3 className="text-xl font-bold text-red-600 mb-4">📚 Areas to Improve</h3>
                        <ul className="space-y-2">
                          {studentDetail.analytics.weaknesses.map((weakness: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-red-500 mt-1">!</span>
                              <span className="text-gray-700">{weakness}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Emotions */}
                {studentDetail.emotionStats && (
                  <div className="bg-white rounded-2xl shadow-xl p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">😊 Emotion Analysis</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <ResponsiveContainer width="100%" height={250}>
                          <PieChart>
                            <Pie
                              data={Object.entries(studentDetail.emotionStats.emotionDistribution).map(([name, value]) => ({ name, value }))}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={(entry) => entry.name}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {Object.keys(studentDetail.emotionStats.emotionDistribution).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="space-y-3">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="text-sm text-gray-600">Average Stress</div>
                          <div className="text-3xl font-bold text-orange-600">{studentDetail.emotionStats.averageStress}</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="text-sm text-gray-600">Total Snapshots</div>
                          <div className="text-3xl font-bold text-blue-600">{studentDetail.emotionStats.totalSnapshots}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Stats */}
                {studentDetail.aiStats && (
                  <div className="bg-white rounded-2xl shadow-xl p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">🤖 AI Interaction Stats</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">{studentDetail.aiStats.total}</div>
                        <div className="text-sm text-gray-600">Total</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">{studentDetail.aiStats.successful}</div>
                        <div className="text-sm text-gray-600">Successful</div>
                      </div>
                      <div className="bg-red-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-red-600">{studentDetail.aiStats.failed}</div>
                        <div className="text-sm text-gray-600">Failed</div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600">{studentDetail.aiStats.avgProcessingTime}ms</div>
                        <div className="text-sm text-gray-600">Avg Time</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recent Tests */}
                {studentDetail.analytics?.difficultyProgression && studentDetail.analytics.difficultyProgression.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-xl p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                      {studentDetail.analytics.difficultyProgression.slice(0, 10).map((test: any, idx: number) => (
                        <div key={idx} className="bg-gray-50 rounded-lg p-4 flex justify-between items-center">
                          <div>
                            <div className="font-semibold text-gray-800">Test #{test.testId.substring(0, 8)}</div>
                            <div className="text-sm text-gray-600">
                              Difficulty: {test.difficulty}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(test.timestamp).toLocaleString()}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600">
                              {Math.round(test.accuracy * 100)}%
                            </div>
                            <div className="text-sm text-gray-600">Accuracy</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Failed to Load</h3>
                <p className="text-gray-600">Could not load student details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

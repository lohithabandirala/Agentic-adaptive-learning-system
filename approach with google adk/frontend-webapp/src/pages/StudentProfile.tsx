import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function StudentProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'topics' | 'emotions' | 'ai'>('overview');
  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const response = await api.get('/profile/me');
      setProfile(response.data.data);
      setLoading(false);
    } catch (error: any) {
      console.error('Failed to load profile:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
      setLoading(false);
    }
  }

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Failed to load profile</p>
          <button onClick={() => navigate('/student')} className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const { user, analytics, recentAI, emotionSummary } = profile;
  
  const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

  // Prepare emotion pie chart data
  const emotionChartData = emotionSummary?.dominantEmotions 
    ? Object.entries(emotionSummary.dominantEmotions).map(([emotion, count]) => ({
        name: emotion,
        value: count as number
      }))
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/student')} className="text-purple-600 hover:text-purple-800">
                ← Back to Dashboard
              </button>
              <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* User Info Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-4xl font-bold">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-800">{user.username}</h2>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-sm text-gray-500 mt-1">Student since {new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
            {analytics && (
              <div className="text-right">
                <div className="text-4xl font-bold text-purple-600">{analytics.overallAccuracy}%</div>
                <div className="text-sm text-gray-600">Overall Accuracy</div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-sm text-gray-600 mb-2">Tests Completed</div>
              <div className="text-3xl font-bold text-blue-600">{analytics.testsCompleted}</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-sm text-gray-600 mb-2">Questions Answered</div>
              <div className="text-3xl font-bold text-green-600">{analytics.totalQuestions}</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-sm text-gray-600 mb-2">Average Stress</div>
              <div className="text-3xl font-bold text-orange-600">{analytics.averageStress}</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-sm text-gray-600 mb-2">AI Interactions</div>
              <div className="text-3xl font-bold text-purple-600">{recentAI?.length || 0}</div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-t-2xl shadow-xl">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-4 font-semibold transition ${
                activeTab === 'overview'
                  ? 'border-b-4 border-purple-600 text-purple-600'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('topics')}
              className={`px-6 py-4 font-semibold transition ${
                activeTab === 'topics'
                  ? 'border-b-4 border-purple-600 text-purple-600'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              Topics Performance
            </button>
            <button
              onClick={() => setActiveTab('emotions')}
              className={`px-6 py-4 font-semibold transition ${
                activeTab === 'emotions'
                  ? 'border-b-4 border-purple-600 text-purple-600'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              Emotions
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`px-6 py-4 font-semibold transition ${
                activeTab === 'ai'
                  ? 'border-b-4 border-purple-600 text-purple-600'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              AI Insights
            </button>
          </div>

          <div className="p-8">
            {/* Overview Tab */}
            {activeTab === 'overview' && analytics && (
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Recent Activity</h3>
                {analytics.difficultyProgression && analytics.difficultyProgression.length > 0 ? (
                  <div className="space-y-4">
                    {analytics.difficultyProgression.map((test: any, idx: number) => (
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
                          <div className="text-2xl font-bold text-purple-600">
                            {Math.round(test.accuracy * 100)}%
                          </div>
                          <div className="text-sm text-gray-600">Accuracy</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No tests completed yet</p>
                )}
              </div>
            )}

            {/* Topics Performance Tab */}
            {activeTab === 'topics' && analytics && (
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Performance by Topic</h3>
                {analytics.topicPerformance && analytics.topicPerformance.length > 0 ? (
                  <>
                    <div className="mb-8">
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={analytics.topicPerformance}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="topic" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="accuracy" fill="#8b5cf6" name="Accuracy (%)" />
                          <Bar dataKey="testsCount" fill="#ec4899" name="Tests Count" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {analytics.topicPerformance.map((topic: any, idx: number) => (
                        <div key={idx} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-semibold text-gray-800">{topic.topic}</div>
                            <div className="text-2xl font-bold text-purple-600">
                              {Math.round(topic.accuracy * 100)}%
                            </div>
                          </div>
                          <div className="text-sm text-gray-600">
                            Tests: {topic.testsCount} | Avg Stress: {topic.averageStress?.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Last: {new Date(topic.lastAttempted).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500">No topic data available yet</p>
                )}
              </div>
            )}

            {/* Emotions Tab */}
            {activeTab === 'emotions' && (
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Emotion Analysis</h3>
                {emotionSummary ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-700 mb-4">Emotion Distribution</h4>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={emotionChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={(entry) => entry.name}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {emotionChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-700 mb-4">Statistics</h4>
                      <div className="space-y-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="text-sm text-gray-600">Average Stress Level</div>
                          <div className="text-3xl font-bold text-orange-600">
                            {emotionSummary.averageStress}
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="text-sm text-gray-600">Total Snapshots</div>
                          <div className="text-3xl font-bold text-blue-600">
                            {emotionSummary.totalSnapshots}
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="text-sm text-gray-600 mb-2">Emotion Counts</div>
                          {Object.entries(emotionSummary.dominantEmotions).map(([emotion, count]: any) => (
                            <div key={emotion} className="flex justify-between text-sm mb-1">
                              <span className="text-gray-700">{emotion}</span>
                              <span className="font-semibold">{count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No emotion data available yet</p>
                )}
              </div>
            )}

            {/* AI Insights Tab */}
            {activeTab === 'ai' && (
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-6">AI Interaction History</h3>
                {recentAI && recentAI.length > 0 ? (
                  <div className="space-y-4">
                    {recentAI.map((ai: any, idx: number) => (
                      <div key={idx} className="bg-gray-50 rounded-lg p-4 flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-gray-800">
                            {ai.type === 'question_generation' ? '🤖 Question Generation' : '📊 Session Analysis'}
                          </div>
                          <div className="text-sm text-gray-600">
                            {ai.questionsGenerated ? `Generated ${ai.questionsGenerated} questions` : 'Session analyzed'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(ai.timestamp).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            ai.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {ai.success ? '✓ Success' : '✗ Failed'}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {ai.processingTime}ms
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No AI interactions yet</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

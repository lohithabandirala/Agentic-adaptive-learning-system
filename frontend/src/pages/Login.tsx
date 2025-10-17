import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'student' as 'teacher' | 'student' | 'admin',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const payload = isRegister 
        ? formData 
        : { email: formData.email, password: formData.password, role: formData.role };
      
      const resp = await api.post(endpoint, payload);
      
      localStorage.setItem('token', resp.data.token);
      localStorage.setItem('role', resp.data.user.role);
      localStorage.setItem('username', resp.data.user.username);
      localStorage.setItem('userId', resp.data.user.id);
      
      // Navigate based on role
      if (resp.data.user.role === 'teacher') navigate('/teacher');
      else if (resp.data.user.role === 'student') navigate('/student');
      else if (resp.data.user.role === 'admin') navigate('/admin');
      
    } catch (err: any) {
      const errorMsg = err?.response?.data?.error || 'Operation failed';
      alert(`❌ ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  }

  function toggleMode() {
    setIsRegister(!isRegister);
    setFormData({ username: '', email: '', password: '', role: 'student' });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">AI Learning Portal</h1>
          <p className="text-gray-600 mt-2">
            {isRegister ? 'Create your account to get started' : 'Welcome back! Please login'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username field (only for registration) */}
          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="input"
                placeholder="Enter username"
                required
              />
            </div>
          )}

          {/* Email field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input"
              placeholder="Enter email"
              required
            />
          </div>

          {/* Password field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="input"
              placeholder="Enter password (min 6 characters)"
              required
              minLength={6}
            />
          </div>

          {/* Role selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">I am a...</label>
            <select 
              value={formData.role} 
              onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
              className="input"
            >
              <option value="student">👨‍🎓 Student</option>
              <option value="teacher">👨‍🏫 Teacher</option>
              <option value="admin">👨‍💼 Admin</option>
            </select>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-lg font-semibold disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              isRegister ? '🚀 Create Account' : '🔐 Login'
            )}
          </button>

          {/* Toggle between login and register */}
          <div className="text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
            >
              {isRegister 
                ? '← Already have an account? Login here' 
                : "Don't have an account? Register →"}
            </button>
          </div>
        </form>

        {/* Info box */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-800 leading-relaxed">
            <strong className="block mb-1">🎓 Students:</strong> Join classes and take adaptive tests
            <strong className="block mb-1 mt-2">👨‍🏫 Teachers:</strong> Create classes & generate AI tests
            <strong className="block mb-1 mt-2">👨‍💼 Admins:</strong> View system-wide analytics
          </p>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Teacher from './pages/Teacher';
import Student from './pages/Student';
import Admin from './pages/Admin';
import StudentProfile from './pages/StudentProfile';
import TeacherAnalytics from './pages/TeacherAnalytics';
import NotFound from './pages/NotFound';
import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/teacher" element={<Teacher />} />
          <Route path="/student" element={<Student />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/student/profile" element={<StudentProfile />} />
          <Route path="/teacher/analytics" element={<TeacherAnalytics />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </ErrorBoundary>
  );
}

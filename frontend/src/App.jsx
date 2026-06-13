import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import StudentLayout from './layouts/StudentLayout';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminStudents from './pages/AdminStudents';
import AdminTasks from './pages/AdminTasks';
import AdminSyllabus from './pages/AdminSyllabus';
import AdminContests from './pages/AdminContests';

// Student Pages
import StudentDashboard from './pages/StudentDashboard';
import StudentSyllabus from './pages/StudentSyllabus';
import StudentTasks from './pages/StudentTasks';
import StudentContests from './pages/StudentContests';
import Playground from './pages/Playground';

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            {/* Auth Redirects */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Admin Management System Panel */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="students" element={<AdminStudents />} />
              <Route path="tasks" element={<AdminTasks />} />
              <Route path="syllabi" element={<AdminSyllabus />} />
              <Route path="contests" element={<AdminContests />} />
              <Route index element={<Navigate to="dashboard" replace />} />
            </Route>

            {/* Student Learning Arena Panel */}
            <Route path="/student" element={<StudentLayout />}>
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="playground" element={<Playground />} />
              <Route path="tasks" element={<StudentTasks />} />
              <Route path="syllabi" element={<StudentSyllabus />} />
              <Route path="contests" element={<StudentContests />} />
              <Route index element={<Navigate to="dashboard" replace />} />
            </Route>

            {/* Wildcard Fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

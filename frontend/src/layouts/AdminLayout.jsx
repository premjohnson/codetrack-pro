import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const AdminLayout = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-dark-bg text-brand-primary">
        <div className="w-12 h-12 border-4 border-current border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Get Page Title from Route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('students')) return 'Student Registry & Activity';
    if (path.includes('tasks')) return 'Course Assignments Manager';
    if (path.includes('syllabi')) return 'Syllabus & Course Outline';
    if (path.includes('contests')) return 'Contests Configuration Dashboard';
    return 'Administrator Control Panel';
  };

  return (
    <div className="min-h-screen bg-dark-bg">
      <Sidebar />
      <div className="pl-64">
        <Navbar title={getPageTitle()} />
        <main className="pt-24 p-8 min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

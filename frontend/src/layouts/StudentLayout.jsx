import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const StudentLayout = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-dark-bg text-brand-primary">
        <div className="w-12 h-12 border-4 border-current border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== 'student') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('playground')) return 'Interactive Code Playground';
    if (path.includes('tasks')) return 'Assigned Tasks';
    if (path.includes('syllabi')) return 'Syllabus & Material';
    if (path.includes('contests')) return 'Active Coding Arena';
    return 'Student Analytics Center';
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

export default StudentLayout;

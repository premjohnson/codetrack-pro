import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Code2, 
  BookOpen, 
  CheckSquare, 
  Trophy, 
  Users, 
  LogOut, 
  Award,
  Bell
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/students', label: 'Students', icon: Users },
    { to: '/admin/tasks', label: 'Tasks CRUD', icon: CheckSquare },
    { to: '/admin/syllabi', label: 'Syllabus Management', icon: BookOpen },
    { to: '/admin/contests', label: 'Contests CRUD', icon: Trophy },
  ];

  const studentLinks = [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/student/playground', label: 'Playground', icon: Code2 },
    { to: '/student/tasks', label: 'Tasks Center', icon: CheckSquare },
    { to: '/student/syllabi', label: 'Resource Center', icon: BookOpen },
    { to: '/student/contests', label: 'Contests Arena', icon: Trophy },
  ];

  const links = user?.role === 'admin' ? adminLinks : studentLinks;

  return (
    <aside className="w-64 glass-panel border-r border-dark-border h-screen flex flex-col fixed left-0 top-0 z-30">
      {/* Platform Title Logo */}
      <div className="p-6 border-b border-dark-border flex items-center space-x-3">
        <div className="bg-brand-primary p-2 rounded-lg text-white">
          <Code2 className="h-6 w-6 animate-pulse" />
        </div>
        <div>
          <span className="font-extrabold text-lg text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
            CodeTrack
          </span>
          <span className="block text-xs text-gray-500 font-mono">v1.0.0 Enterprise</span>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `
                flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium text-sm
                ${isActive 
                  ? 'bg-gradient-to-r from-indigo-600/30 to-blue-500/10 text-indigo-400 border border-indigo-500/20' 
                  : 'text-gray-400 hover:bg-dark-card hover:text-gray-100 hover:translate-x-1'
                }
              `}
            >
              <Icon className="h-5 w-5" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Profile Card and Logout */}
      <div className="p-4 border-t border-dark-border bg-dark-card/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center font-bold text-sm text-white">
              {user?.name?.substring(0, 2).toUpperCase() || 'US'}
            </div>
            <div className="truncate max-w-[120px]">
              <span className="block text-sm font-semibold text-gray-200 truncate">{user?.name}</span>
              <span className="block text-xs text-gray-500 capitalize">{user?.role}</span>
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-950/20 hover:bg-red-900/30 text-red-400 border border-red-500/10 rounded-xl transition duration-300 text-sm font-semibold"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

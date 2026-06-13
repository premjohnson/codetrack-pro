import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { Bell, ShieldAlert, Award, FileText, Gift } from 'lucide-react';

const Navbar = ({ title }) => {
  const { user } = useAuth();
  const { notifications, clearNotifications } = useSocket();
  const [showDropdown, setShowDropdown] = useState(false);

  const getIcon = (type) => {
    switch (type) {
      case 'badge': return <Award className="h-4 w-4 text-yellow-400" />;
      case 'contest': return <Gift className="h-4 w-4 text-emerald-400" />;
      case 'warning': return <ShieldAlert className="h-4 w-4 text-red-400" />;
      default: return <FileText className="h-4 w-4 text-blue-400" />;
    }
  };

  const unreadCount = notifications.length;

  return (
    <header className="h-16 glass-panel border-b border-dark-border flex items-center justify-between px-8 fixed top-0 right-0 left-64 z-20">
      <h1 className="text-xl font-bold text-gray-100">{title}</h1>

      <div className="flex items-center space-x-6">
        {/* Real-time Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-2 bg-dark-card hover:bg-dark-border text-gray-400 hover:text-gray-100 rounded-xl transition-all duration-300 relative border border-dark-border"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-primary text-white text-[10px] w-5.5 h-4.5 rounded-full flex items-center justify-center font-bold border-2 border-dark-bg animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showDropdown && (
            <div className="absolute right-0 mt-3 w-80 bg-dark-card border border-dark-border rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-3 duration-250">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-dark-border">
                <span className="font-semibold text-sm text-gray-200">Alert Center</span>
                {unreadCount > 0 && (
                  <button
                    onClick={clearNotifications}
                    className="text-xs text-brand-primary hover:underline font-semibold"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2">
                {notifications.length === 0 ? (
                  <p className="text-xs text-gray-500 py-4 text-center">No new notifications.</p>
                ) : (
                  notifications.map((notif) => (
                    <div key={notif.id} className="p-2 bg-dark-bg/50 hover:bg-dark-bg rounded-lg border border-dark-border/40 flex items-start space-x-2 transition duration-200">
                      <div className="mt-0.5">{getIcon(notif.type)}</div>
                      <div>
                        <span className="block text-xs font-semibold text-gray-200">{notif.title}</span>
                        <span className="block text-[11px] text-gray-400 mt-0.5">{notif.message}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Badge */}
        <div className="bg-dark-card px-4 py-1.5 rounded-xl border border-dark-border text-xs font-semibold text-gray-300 capitalize flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${user?.isVerified ? 'bg-green-500' : 'bg-yellow-500 animate-ping'}`} />
          <span>{user?.role}</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

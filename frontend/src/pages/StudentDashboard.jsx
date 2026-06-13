import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Bar, Pie } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  ArcElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Award, Flame, Star, Code2, Clock, CheckCircle, BarChart3 } from 'lucide-react';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  ArcElement, 
  Title, 
  Tooltip, 
  Legend
);

const StudentDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/student');
        if (response.success) {
          setStats(response.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-brand-primary">
        <div className="w-10 h-10 border-4 border-current border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Language usage chart
  const hasLanguages = stats.languageUsage && stats.languageUsage.length > 0;
  
  const pieData = {
    labels: hasLanguages ? stats.languageUsage.map(l => l.name) : ['No languages'],
    datasets: [
      {
        data: hasLanguages ? stats.languageUsage.map(l => l.value) : [1],
        backgroundColor: hasLanguages 
          ? ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#EC4899'] 
          : ['#1E293B'],
        borderWidth: 0,
      },
    ],
  };

  const performanceData = {
    labels: ['Success Rate', 'Task Completion'],
    datasets: [
      {
        label: 'Progress Percentage',
        data: [stats.submissionSuccessRate, (stats.solvedCount / 10) * 100], // Mock target 10 tasks
        backgroundColor: ['rgba(16, 185, 129, 0.4)', 'rgba(99, 102, 241, 0.4)'],
        borderColor: ['#10B981', '#6366F1'],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Student gamified metrics HUD */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-5 rounded-2xl flex items-center space-x-4 border-l-4 border-indigo-500">
          <div className="bg-indigo-600/10 p-3.5 rounded-xl text-indigo-400">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-xs text-gray-400 font-semibold">Problems Solved</span>
            <span className="block text-xl font-bold text-gray-200 mt-0.5">{stats.solvedCount}</span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl flex items-center space-x-4 border-l-4 border-orange-500">
          <div className="bg-orange-600/10 p-3.5 rounded-xl text-orange-400">
            <Flame className="h-6 w-6 animate-bounce" />
          </div>
          <div>
            <span className="block text-xs text-gray-400 font-semibold">Active Streak</span>
            <span className="block text-xl font-bold text-gray-200 mt-0.5">{stats.currentStreak} Days</span>
            <span className="block text-[9px] text-gray-500 mt-0.5 font-mono">Longest: {stats.longestStreak} days</span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl flex items-center space-x-4 border-l-4 border-yellow-500">
          <div className="bg-yellow-600/10 p-3.5 rounded-xl text-yellow-400">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-xs text-gray-400 font-semibold">Badges Earned</span>
            <span className="block text-xl font-bold text-gray-200 mt-0.5">{stats.badgesCount} Badges</span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl flex items-center space-x-4 border-l-4 border-emerald-500">
          <div className="bg-emerald-600/10 p-3.5 rounded-xl text-emerald-400">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-xs text-gray-400 font-semibold">Active Hours</span>
            <span className="block text-xl font-bold text-gray-200 mt-0.5">{stats.codingHours} hrs</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Performance details bar */}
        <div className="glass-panel p-6 rounded-2xl md:col-span-2 space-y-4">
          <h3 className="font-bold text-sm text-gray-300 flex items-center space-x-2 border-b border-dark-border pb-3">
            <BarChart3 className="h-4.5 w-4.5 text-indigo-400" />
            <span>Performance metrics & ratios</span>
          </h3>
          <div className="h-56">
            <Bar 
              data={performanceData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { min: 0, max: 100, grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#9CA3AF' } },
                  x: { grid: { display: false }, ticks: { color: '#9CA3AF' } }
                }
              }} 
            />
          </div>
        </div>

        {/* Right: Languages pie */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <h3 className="font-bold text-sm text-gray-300 flex items-center space-x-2 border-b border-dark-border pb-3">
            <Code2 className="h-4.5 w-4.5 text-emerald-400" />
            <span>Language usage statistics</span>
          </h3>
          <div className="h-44 relative flex justify-center py-2">
            <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
          <div className="flex flex-wrap justify-center gap-2 text-[10px] text-gray-400 mt-2 font-mono">
            {hasLanguages ? stats.languageUsage.map((l, i) => (
              <span key={i} className="px-2 py-0.5 bg-dark-bg/60 border border-dark-border rounded-lg">
                {l.name}: {l.value} runs
              </span>
            )) : <span>No coding logs registered.</span>}
          </div>
        </div>
      </div>

      {/* Badges Display Panel */}
      <div className="glass-panel p-6 rounded-2xl space-y-5">
        <h3 className="font-bold text-sm text-gray-300 flex items-center space-x-2 border-b border-dark-border pb-3">
          <Award className="h-4.5 w-4.5 text-yellow-400" />
          <span>Earned monthly badges achievements</span>
        </h3>
        {stats.badges?.length === 0 ? (
          <p className="text-xs text-gray-500 py-4 text-center">Solve assignments and maintain streaks to earn your first badge!</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {stats.badges?.map((ub, idx) => (
              <div key={idx} className="p-4 bg-dark-bg/40 border border-dark-border rounded-2xl text-center space-y-2 hover:scale-[1.03] transition duration-200">
                <div className="w-12 h-12 bg-yellow-500/10 text-yellow-500 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                  🏆
                </div>
                <div>
                  <span className="block font-bold text-xs text-gray-200">{ub.name}</span>
                  <span className="block text-[9px] text-gray-500 mt-1 leading-normal">{ub.description}</span>
                  <span className="block text-[9px] text-indigo-400 font-mono mt-2">{new Date(ub.awardedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;

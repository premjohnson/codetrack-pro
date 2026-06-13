import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  ArcElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Users, BookOpen, CheckSquare, Award, Star, Activity, TrendingUp } from 'lucide-react';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  ArcElement, 
  Title, 
  Tooltip, 
  Legend
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/admin');
        if (response.success) {
          setStats(response.data);
        }
      } catch (error) {
        console.error('Failed to load admin stats:', error);
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

  // Chart configuration
  const doughnutData = {
    labels: ['Active Students', 'Inactive Students'],
    datasets: [
      {
        data: [stats.activeStudents, stats.inactiveStudents],
        backgroundColor: ['#10B981', '#EF4444'],
        borderWidth: 0,
      },
    ],
  };

  const lineData = {
    labels: stats.codingActivity?.days || [],
    datasets: [
      {
        label: 'Submissions Count',
        data: stats.codingActivity?.submissions || [],
        borderColor: '#6366F1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Sandbox Executes',
        data: stats.codingActivity?.playgroundRuns || [],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#9CA3AF' },
      },
    },
    scales: {
      x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#9CA3AF' } },
      y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#9CA3AF' } },
    },
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* HUD Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-2xl flex items-center space-x-4">
          <div className="bg-blue-600/20 p-4 rounded-xl text-blue-400">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-xs text-gray-400 font-medium">Total Students</span>
            <span className="block text-2xl font-bold text-gray-200 mt-1">{stats.totalStudents}</span>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl flex items-center space-x-4">
          <div className="bg-emerald-600/20 p-4 rounded-xl text-emerald-400">
            <CheckSquare className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-xs text-gray-400 font-medium">Submissions Today</span>
            <span className="block text-2xl font-bold text-gray-200 mt-1">{stats.submissionsToday}</span>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl flex items-center space-x-4">
          <div className="bg-yellow-600/20 p-4 rounded-xl text-yellow-400">
            <Star className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-xs text-gray-400 font-medium">Average Rating</span>
            <span className="block text-2xl font-bold text-gray-200 mt-1">{stats.averageRating}/5</span>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl flex items-center space-x-4">
          <div className="bg-indigo-600/20 p-4 rounded-xl text-indigo-400">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-xs text-gray-400 font-medium">Completion Rate</span>
            <span className="block text-2xl font-bold text-gray-200 mt-1">{stats.taskCompletionRate}%</span>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left main activity line chart */}
        <div className="glass-panel p-6 rounded-2xl md:col-span-2 space-y-4">
          <h3 className="font-bold text-sm text-gray-300 flex items-center space-x-2">
            <Activity className="h-4 w-4 text-indigo-400" />
            <span>Coding Runs & Solutions Submit Logs (Weekly)</span>
          </h3>
          <div className="h-64">
            <Line data={lineData} options={options} />
          </div>
        </div>

        {/* Right doughnut chart showing student distribution */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <h3 className="font-bold text-sm text-gray-300 mb-4 flex items-center space-x-2">
            <Users className="h-4 w-4 text-emerald-400" />
            <span>Students Registration status</span>
          </h3>
          <div className="h-44 relative flex justify-center">
            <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
          <div className="flex justify-around text-xs mt-4">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
              <span className="text-gray-400">Active ({stats.activeStudents})</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 bg-red-500 rounded-full" />
              <span className="text-gray-400">Inactive ({stats.inactiveStudents})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performers Table */}
      <div className="glass-panel p-6 rounded-2xl">
        <h3 className="font-bold text-sm text-gray-300 mb-6 flex items-center space-x-2">
          <Award className="h-4 w-4 text-yellow-400" />
          <span>Top Performing Students Leaderboard</span>
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="text-gray-500 border-b border-dark-border">
                <th className="pb-3 font-semibold">Rank</th>
                <th className="pb-3 font-semibold">Student Name</th>
                <th className="pb-3 font-semibold">Tasks Completed</th>
                <th className="pb-3 font-semibold">Platform Score</th>
              </tr>
            </thead>
            <tbody>
              {stats.topPerformers?.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-4 text-center text-gray-500">No leaderboard activity registered yet.</td>
                </tr>
              ) : (
                stats.topPerformers?.map((student, index) => (
                  <tr key={index} className="border-b border-dark-border/40 hover:bg-dark-card/10 transition">
                    <td className="py-3 font-bold text-indigo-400">#{index + 1}</td>
                    <td className="py-3 font-semibold text-gray-300">{student.name}</td>
                    <td className="py-3 font-medium text-emerald-400">{student.solvedCount} tasks</td>
                    <td className="py-3 font-bold text-gray-200">{student.score} pts</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

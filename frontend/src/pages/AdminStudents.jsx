import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { ToggleLeft, ToggleRight, Search, Mail, ShieldAlert, Award, Star } from 'lucide-react';

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchStudents = async () => {
    try {
      const response = await api.get('/dashboard/admin/students');
      if (response.success) {
        setStudents(response.data.students);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const toggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      const response = await api.put(`/dashboard/admin/students/${id}/status`, { status: nextStatus });
      if (response.success) {
        setStudents(students.map(s => s.id === id ? { ...s, status: nextStatus } : s));
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const filtered = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-200">Student registry</h2>
          <p className="text-xs text-gray-400">View student achievements, active streak logs, and manage status permissions.</p>
        </div>

        {/* Search bar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by student name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-dark-card border border-dark-border rounded-xl text-gray-200 text-sm focus:outline-none focus:border-indigo-500 transition duration-300"
          />
        </div>
      </div>

      {/* Registry Table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex h-40 items-center justify-center text-indigo-400">
            <div className="w-8 h-8 border-4 border-current border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-gray-500 space-y-2">
            <Mail className="h-8 w-8" />
            <span className="text-xs">No students found matching your queries.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-gray-500 border-b border-dark-border bg-dark-card/30">
                  <th className="p-4 font-semibold">Student Name & Info</th>
                  <th className="p-4 font-semibold">Solved Tasks</th>
                  <th className="p-4 font-semibold">Avg Rating</th>
                  <th className="p-4 font-semibold">Active Streak</th>
                  <th className="p-4 font-semibold">Badges Earned</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-center">Toggle Access</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((student) => (
                  <tr key={student.id} className="border-b border-dark-border/40 hover:bg-dark-card/10 transition duration-150">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 bg-brand-primary/10 rounded-full flex items-center justify-center font-bold text-xs text-brand-primary">
                          {student.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="block font-semibold text-gray-200 text-sm">{student.name}</span>
                          <span className="block text-gray-500 font-mono mt-0.5">{student.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-gray-300">{student.solvedCount} tasks</td>
                    <td className="p-4">
                      <div className="flex items-center space-x-1 text-yellow-500 font-semibold">
                        <Star className="h-4.5 w-4.5 fill-current" />
                        <span>{student.averageRating}/5</span>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-emerald-400 font-mono">⚡ {student.currentStreak} days</td>
                    <td className="p-4">
                      <div className="flex items-center space-x-1 text-amber-500 font-semibold">
                        <Award className="h-4.5 w-4.5" />
                        <span>{student.badgesCount} badges</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        student.status === 'active' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => toggleStatus(student.id, student.status)}
                        className={`text-2xl transition duration-300 ${
                          student.status === 'active' ? 'text-indigo-400 hover:text-indigo-300' : 'text-gray-600 hover:text-gray-500'
                        }`}
                      >
                        {student.status === 'active' ? <ToggleRight className="h-7 w-7" /> : <ToggleLeft className="h-7 w-7" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminStudents;

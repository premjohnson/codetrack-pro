import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Trophy, Clock, Play, Award, CheckCircle, ShieldAlert } from 'lucide-react';

const StudentContests = () => {
  const [contests, setContests] = useState({ active: [], upcoming: [], past: [] });
  const [loading, setLoading] = useState(true);
  const [joinedContest, setJoinedContest] = useState(null);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');

  const fetchContests = async () => {
    try {
      const response = await api.get('/contests');
      if (response.success) {
        setContests(response.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContests();
  }, []);

  const handleJoinContest = async (contest) => {
    setLoading(true);
    try {
      const response = await api.get(`/contests/${contest._id}`);
      if (response.success) {
        setJoinedContest(response.data.contest);
        setSelectedProblem(response.data.contest.problems?.[0] || null);
        
        // Fetch ranklist
        const rankRes = await api.get(`/contests/${contest._id}/leaderboard`);
        if (rankRes.success) {
          setLeaderboard(rankRes.data.leaderboard);
        }
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleContestSubmit = async () => {
    if (!code.trim()) return;
    setSubmitting(true);
    try {
      const response = await api.post(`/contests/${joinedContest._id}/submit`, {
        problemId: selectedProblem._id,
        code,
        language: selectedLanguage,
      });

      if (response.success) {
        alert(`Graded: ${response.data.submission.status.toUpperCase()}! Score: ${response.data.submission.score}/100`);
        // Refresh leaderboard
        const rankRes = await api.get(`/contests/${joinedContest._id}/leaderboard`);
        if (rankRes.success) {
          setLeaderboard(rankRes.data.leaderboard);
        }
      }
    } catch (err) {
      alert(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-brand-primary">
        <div className="w-10 h-10 border-4 border-current border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If inside an active contest arena
  if (joinedContest) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start animate-in fade-in duration-250 text-xs">
        {/* Left Problems & coding block */}
        <div className="glass-panel p-6 rounded-2xl md:col-span-2 space-y-5">
          <div className="flex justify-between items-center border-b border-dark-border pb-3">
            <div>
              <span className="text-gray-500 font-bold block">Contest Arena</span>
              <h3 className="font-bold text-gray-200 text-sm mt-1">{joinedContest.title}</h3>
            </div>
            <button
              onClick={() => { setJoinedContest(null); setSelectedProblem(null); setLeaderboard([]); }}
              className="px-3 py-1.5 bg-dark-card border border-dark-border text-gray-400 rounded-lg hover:text-gray-100 font-bold"
            >
              Exit Arena
            </button>
          </div>

          {/* Problem selector tabs */}
          <div className="flex space-x-2">
            {joinedContest.problems?.map((p, index) => (
              <button
                key={p._id}
                onClick={() => setSelectedProblem(p)}
                className={`px-4 py-2 rounded-xl font-bold transition duration-200 border ${
                  selectedProblem?._id === p._id
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/15'
                    : 'bg-dark-card border-dark-border text-gray-400 hover:text-gray-200'
                }`}
              >
                Problem {index + 1}
              </button>
            ))}
          </div>

          {selectedProblem ? (
            <div className="space-y-4">
              <div className="p-4 bg-dark-bg/60 border border-dark-border rounded-xl space-y-2">
                <div className="flex items-center space-x-3">
                  <span className="font-bold text-gray-200 text-sm">{selectedProblem.title}</span>
                  <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-400 rounded-full font-bold uppercase text-[9px] tracking-wider">
                    {selectedProblem.difficulty}
                  </span>
                </div>
                <p className="text-gray-400 leading-relaxed mt-2 text-[11px]">{selectedProblem.description}</p>
              </div>

              {/* Code editor */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-gray-300">Submit Solution</label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="bg-dark-card border border-dark-border rounded-lg px-2 py-1 text-gray-300"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="c">C</option>
                    <option value="cpp">C++</option>
                  </select>
                </div>
                <textarea
                  rows="10"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Paste your source code solution here..."
                  className="w-full p-3 bg-dark-bg border border-dark-border rounded-xl font-mono text-[11px] text-gray-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                onClick={handleContestSubmit}
                disabled={submitting}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition duration-300 disabled:opacity-50"
              >
                {submitting ? 'Compiling and Running test suites...' : 'Submit Solutions'}
              </button>
            </div>
          ) : (
            <span className="text-gray-500 block py-4 text-center">No problem selected.</span>
          )}
        </div>

        {/* Right Live Leaderboard Column */}
        <div className="glass-panel p-6 rounded-2xl md:col-span-1 space-y-4">
          <h3 className="font-bold text-gray-200 text-sm flex items-center space-x-2 border-b border-dark-border pb-3">
            <Trophy className="h-4.5 w-4.5 text-emerald-400" />
            <span>Live Ranklist standings</span>
          </h3>

          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
            {leaderboard.length === 0 ? (
              <span className="text-gray-500 block text-center py-4">No submissions yet. Be the first!</span>
            ) : (
              leaderboard.map((item, idx) => (
                <div key={idx} className="p-3 bg-dark-bg/60 border border-dark-border rounded-xl flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <span className="font-bold text-indigo-400">#{idx + 1}</span>
                    <div>
                      <span className="block font-semibold text-gray-200">{item.student.name}</span>
                      <span className="block text-[9px] text-emerald-400 font-mono mt-0.5">Solved: {item.solvedCount}</span>
                    </div>
                  </div>
                  <span className="font-bold text-gray-200 font-mono">{item.totalScore} pts</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Active Contests */}
        <div className="glass-panel p-5 rounded-2xl space-y-4">
          <h3 className="font-bold text-gray-200 text-sm flex items-center space-x-2 border-b border-dark-border pb-3">
            <Trophy className="h-4.5 w-4.5 text-emerald-400" />
            <span>Active Arenas</span>
          </h3>
          <div className="space-y-3">
            {contests.active?.length === 0 ? (
              <span className="text-xs text-gray-500 block py-4 text-center">No active arenas running.</span>
            ) : (
              contests.active?.map(c => (
                <div key={c._id} className="p-4 bg-emerald-950/10 border border-emerald-500/20 rounded-2xl flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="font-bold text-gray-200 text-sm">{c.title}</h4>
                    <span className="block text-[10px] text-gray-400 mt-1 font-mono">Ends: {new Date(c.endTime).toLocaleTimeString()}</span>
                  </div>
                  <button
                    onClick={() => handleJoinContest(c)}
                    className="w-full flex items-center justify-center space-x-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition duration-200"
                  >
                    <Play className="h-3 w-3 fill-current" />
                    <span>Enter Arena</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Contests */}
        <div className="glass-panel p-5 rounded-2xl space-y-4">
          <h3 className="font-bold text-gray-200 text-sm flex items-center space-x-2 border-b border-dark-border pb-3">
            <Clock className="h-4.5 w-4.5 text-indigo-400" />
            <span>Upcoming Contests</span>
          </h3>
          <div className="space-y-3">
            {contests.upcoming?.length === 0 ? (
              <span className="text-xs text-gray-500 block py-4 text-center">No upcoming sprints.</span>
            ) : (
              contests.upcoming?.map(c => (
                <div key={c._id} className="p-4 bg-dark-bg/60 border border-dark-border rounded-2xl">
                  <h4 className="font-bold text-gray-300 text-xs">{c.title}</h4>
                  <span className="block text-[9px] text-gray-500 mt-1 font-mono">Starts: {new Date(c.startTime).toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Past Contests */}
        <div className="glass-panel p-5 rounded-2xl space-y-4">
          <h3 className="font-bold text-gray-200 text-sm flex items-center space-x-2 border-b border-dark-border pb-3">
            <Award className="h-4.5 w-4.5 text-amber-500" />
            <span>Concluded Sprints</span>
          </h3>
          <div className="space-y-3">
            {contests.past?.length === 0 ? (
              <span className="text-xs text-gray-500 block py-4 text-center">No past contests records.</span>
            ) : (
              contests.past?.map(c => (
                <div key={c._id} className="p-4 bg-dark-bg/25 border border-dark-border/40 rounded-2xl">
                  <h4 className="font-semibold text-gray-400 text-xs truncate">{c.title}</h4>
                  <span className="block text-[9px] text-gray-500 mt-1 font-mono">Ended: {new Date(c.endTime).toLocaleDateString()}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentContests;

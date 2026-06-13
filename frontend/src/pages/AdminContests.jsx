import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../api/axios';
import { Trophy, Plus, ShieldAlert, Award, Calendar } from 'lucide-react';

const AdminContests = () => {
  const [contests, setContests] = useState({ active: [], upcoming: [], past: [] });
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchData = async () => {
    try {
      const cRes = await api.get('/contests');
      if (cRes.success) setContests(cRes.data);
      const tRes = await api.get('/tasks?limit=100');
      if (tRes.success) setTasks(tRes.data.tasks);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onSubmit = async (data) => {
    try {
      const formattedData = {
        title: data.title,
        description: data.description,
        startTime: new Date(data.startTime).toISOString(),
        endTime: new Date(data.endTime).toISOString(),
        problems: data.problems, // array of IDs
      };

      const response = await api.post('/contests', formattedData);
      if (response.success) {
        setShowModal(false);
        reset();
        fetchData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-200">Contests Configuration</h2>
          <p className="text-xs text-gray-400">Deploy online live programming contests and add test problems.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-brand-primary hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition duration-300 shadow-lg"
        >
          <Plus className="h-4 w-4" />
          <span>New Contest</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20 text-indigo-400">
          <div className="w-8 h-8 border-4 border-current border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Active contests */}
          <div className="glass-panel p-5 rounded-2xl space-y-4">
            <h3 className="font-bold text-gray-200 text-sm flex items-center space-x-2 border-b border-dark-border pb-3">
              <Trophy className="h-4 w-4 text-emerald-400" />
              <span>Active Contests ({contests.active?.length || 0})</span>
            </h3>
            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
              {contests.active?.length === 0 ? (
                <span className="text-[10px] text-gray-500 block py-4 text-center">No active contests.</span>
              ) : (
                contests.active?.map(c => (
                  <div key={c._id} className="p-3 bg-emerald-950/10 border border-emerald-500/20 rounded-xl">
                    <h4 className="font-semibold text-xs text-emerald-400">{c.title}</h4>
                    <p className="text-[9px] text-gray-500 mt-1">Ends: {new Date(c.endTime).toLocaleString()}</p>
                    <span className="text-[9px] font-bold text-gray-400 mt-2 block">{c.problems?.length} problems set</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Upcoming contests */}
          <div className="glass-panel p-5 rounded-2xl space-y-4">
            <h3 className="font-bold text-gray-200 text-sm flex items-center space-x-2 border-b border-dark-border pb-3">
              <Calendar className="h-4 w-4 text-indigo-400" />
              <span>Upcoming Contests ({contests.upcoming?.length || 0})</span>
            </h3>
            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
              {contests.upcoming?.length === 0 ? (
                <span className="text-[10px] text-gray-500 block py-4 text-center">No upcoming contests configured.</span>
              ) : (
                contests.upcoming?.map(c => (
                  <div key={c._id} className="p-3 bg-dark-bg/60 border border-dark-border rounded-xl">
                    <h4 className="font-semibold text-xs text-gray-200">{c.title}</h4>
                    <p className="text-[9px] text-gray-500 mt-1">Starts: {new Date(c.startTime).toLocaleString()}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Past contests */}
          <div className="glass-panel p-5 rounded-2xl space-y-4">
            <h3 className="font-bold text-gray-200 text-sm flex items-center space-x-2 border-b border-dark-border pb-3">
              <Award className="h-4 w-4 text-amber-500" />
              <span>Past Contests ({contests.past?.length || 0})</span>
            </h3>
            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
              {contests.past?.length === 0 ? (
                <span className="text-[10px] text-gray-500 block py-4 text-center">No history recorded yet.</span>
              ) : (
                contests.past?.map(c => (
                  <div key={c._id} className="p-3 bg-dark-bg/30 border border-dark-border/40 rounded-xl">
                    <h4 className="font-semibold text-xs text-gray-400">{c.title}</h4>
                    <p className="text-[9px] text-gray-500 mt-1">Ended: {new Date(c.endTime).toLocaleString()}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-dark-bg/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-card border border-dark-border rounded-3xl w-full max-w-lg p-6 space-y-5 shadow-2xl animate-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-dark-border pb-3">
              <h3 className="font-bold text-gray-200 text-sm">Configure Coding Contest</h3>
              <button onClick={() => setShowModal(false)} className="text-xs text-gray-400 hover:text-gray-100 font-bold">
                Close
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-gray-300">Contest Title</label>
                <input
                  type="text"
                  {...register('title', { required: 'Contest title is required' })}
                  className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-gray-200"
                />
                {errors.title && <span className="text-[10px] text-red-400">{errors.title.message}</span>}
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-300">Contest Description</label>
                <textarea
                  rows="2"
                  {...register('description')}
                  className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-gray-200"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-gray-300">Start Time</label>
                  <input
                    type="datetime-local"
                    {...register('startTime', { required: 'Start time is required' })}
                    className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-gray-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-300">End Time</label>
                  <input
                    type="datetime-local"
                    {...register('endTime', { required: 'End time is required' })}
                    className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-gray-200"
                  />
                </div>
              </div>

              {/* Problems select */}
              <div className="space-y-1">
                <label className="font-bold text-gray-300">Add Test Problems</label>
                <select
                  multiple
                  {...register('problems', { required: 'Select at least 1 problem' })}
                  className="w-full h-28 px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-gray-200 focus:outline-none"
                >
                  {tasks.map(t => (
                    <option key={t._id} value={t._id} className="p-1">
                      [{t.difficulty.toUpperCase()}] {t.title}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-gray-500 block mt-1">Hold Ctrl (Cmd on Mac) to select multiple problems.</span>
                {errors.problems && <span className="text-[10px] text-red-400 block mt-1">{errors.problems.message}</span>}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition duration-300"
              >
                Create Contest
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminContests;

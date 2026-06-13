import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import api from '../api/axios';
import { Plus, Trash2, CheckSquare, PlusCircle, MinusCircle, ShieldAlert } from 'lucide-react';

const AdminTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [categories, setCategories] = useState([]);

  const { register, control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      testCases: [{ input: '', output: '', isHidden: false }],
      codeTemplates: [{ language: 'javascript', templateCode: 'function solve() {\n  // Code here\n}' }],
    }
  });

  const { fields: tcFields, append: tcAppend, remove: tcRemove } = useFieldArray({
    control,
    name: 'testCases',
  });

  const { fields: tempFields, append: tempAppend, remove: tempRemove } = useFieldArray({
    control,
    name: 'codeTemplates',
  });

  const fetchData = async () => {
    try {
      const tRes = await api.get('/tasks');
      if (tRes.success) setTasks(tRes.data.tasks);
      const cRes = await api.get('/tasks/categories');
      if (cRes.success) setCategories(cRes.data.categories);
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
      const response = await api.post('/tasks', data);
      if (response.success) {
        setTasks([response.data.task, ...tasks]);
        setShowModal(false);
        reset();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      const response = await api.delete(`/tasks/${id}`);
      if (response.success) {
        setTasks(tasks.filter(t => t._id !== id));
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-200">Course Assignments Manager</h2>
          <p className="text-xs text-gray-400">Publish programming tasks, set difficulty thresholds, and upload verification test suites.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-brand-primary hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition duration-300 shadow-lg"
        >
          <Plus className="h-4 w-4" />
          <span>Create Task</span>
        </button>
      </div>

      {/* Task List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 flex justify-center py-20 text-indigo-400">
            <div className="w-8 h-8 border-4 border-current border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="col-span-3 glass-panel p-12 text-center text-gray-500 rounded-2xl flex flex-col items-center space-y-3">
            <CheckSquare className="h-10 w-10 text-gray-600" />
            <span className="text-xs">No tasks have been published yet.</span>
          </div>
        ) : (
          tasks.map((task) => (
            <div key={task._id} className="glass-card p-6 rounded-2xl flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    task.difficulty === 'easy' ? 'bg-green-500/10 text-green-400' :
                    task.difficulty === 'medium' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-red-500/10 text-red-400'
                  }`}>
                    {task.difficulty}
                  </span>
                  <span className="text-[11px] text-gray-500 font-mono">📅 {new Date(task.deadline).toLocaleDateString()}</span>
                </div>
                <h4 className="text-gray-200 font-semibold text-sm truncate">{task.title}</h4>
                <p className="text-[11px] text-gray-400 mt-2 line-clamp-2">{task.description}</p>
                <div className="text-[10px] text-gray-500 font-bold mt-3 uppercase tracking-wider bg-dark-bg/60 px-3 py-1 rounded-lg w-max border border-dark-border">
                  {task.technology}
                </div>
              </div>
              <div className="pt-4 border-t border-dark-border/40 flex justify-end">
                <button
                  onClick={() => deleteTask(task._id)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-950/20 hover:bg-red-900/30 text-red-400 rounded-lg transition duration-200 text-[11px] font-bold"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-dark-bg/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-card border border-dark-border rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 space-y-6 shadow-2xl animate-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-dark-border pb-3">
              <h3 className="font-bold text-gray-200 text-base">Create Coding Task</h3>
              <button onClick={() => setShowModal(false)} className="text-xs text-gray-400 hover:text-gray-100 font-bold">
                Close
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-gray-300">Task Title</label>
                  <input
                    type="text"
                    {...register('title', { required: 'Title is required' })}
                    className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-gray-200 focus:outline-none focus:border-indigo-500"
                  />
                  {errors.title && <span className="text-[10px] text-red-400">{errors.title.message}</span>}
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-300">Technology Focus</label>
                  <input
                    type="text"
                    placeholder="e.g. Node.js, Python, MQL"
                    {...register('technology', { required: 'Technology is required' })}
                    className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-gray-200 focus:outline-none"
                  />
                  {errors.technology && <span className="text-[10px] text-red-400">{errors.technology.message}</span>}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-300">Task Description</label>
                <textarea
                  rows="3"
                  {...register('description', { required: 'Description is required' })}
                  className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-gray-200 focus:outline-none"
                />
                {errors.description && <span className="text-[10px] text-red-400">{errors.description.message}</span>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-gray-300">Difficulty</label>
                  <select
                    {...register('difficulty')}
                    className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-gray-200 focus:outline-none"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-300">Deadline</label>
                  <input
                    type="datetime-local"
                    {...register('deadline', { required: 'Deadline is required' })}
                    className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-gray-200 focus:outline-none"
                  />
                  {errors.deadline && <span className="text-[10px] text-red-400">{errors.deadline.message}</span>}
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-300">Category</label>
                  <select
                    {...register('category')}
                    className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-gray-200 focus:outline-none"
                  >
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Test cases list */}
              <div className="space-y-3 pt-3 border-t border-dark-border">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-gray-200">Validation Test cases</h4>
                  <button
                    type="button"
                    onClick={() => tcAppend({ input: '', output: '', isHidden: false })}
                    className="text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 font-bold"
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>Add Case</span>
                  </button>
                </div>

                {tcFields.map((field, idx) => (
                  <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end p-3 bg-dark-bg/40 rounded-xl border border-dark-border/40">
                    <div className="space-y-1">
                      <label className="font-medium text-gray-400">Input parameter</label>
                      <input
                        type="text"
                        {...register(`testCases.${idx}.input`, { required: true })}
                        className="w-full px-2 py-1.5 bg-dark-bg border border-dark-border rounded-md text-gray-200"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-medium text-gray-400">Expected Output</label>
                      <input
                        type="text"
                        {...register(`testCases.${idx}.output`, { required: true })}
                        className="w-full px-2 py-1.5 bg-dark-bg border border-dark-border rounded-md text-gray-200"
                      />
                    </div>
                    <div className="flex items-center justify-between pb-1">
                      <label className="flex items-center space-x-2 text-gray-400">
                        <input
                          type="checkbox"
                          {...register(`testCases.${idx}.isHidden`)}
                          className="rounded text-indigo-600 focus:ring-0"
                        />
                        <span>Hidden case</span>
                      </label>
                      {idx > 0 && (
                        <button type="button" onClick={() => tcRemove(idx)} className="text-red-400 hover:text-red-300">
                          <MinusCircle className="h-4.5 w-4.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl transition duration-300"
              >
                Publish Assignment
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTasks;

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../api/axios';
import { CheckSquare, AlertCircle, FileText, CheckCircle, Clock, XCircle, Star, Github } from 'lucide-react';

const StudentTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchData = async () => {
    try {
      const tRes = await api.get('/tasks');
      if (tRes.success) setTasks(tRes.data.tasks);

      const sRes = await api.get('/submissions');
      if (sRes.success) {
        const subMap = {};
        sRes.data.submissions.forEach((sub) => {
          subMap[sub.task._id] = sub;
        });
        setSubmissions(subMap);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUploadSubmit = async (data) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('taskId', selectedTask._id);
      if (data.file && data.file[0]) {
        formData.append('file', data.file[0]);
      }
      if (data.githubUrl) {
        formData.append('githubUrl', data.githubUrl);
      }

      const response = await api.post('/submissions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.success) {
        alert('Assignment submitted successfully!');
        setSelectedTask(null);
        reset();
        fetchData();
      }
    } catch (err) {
      alert(err.message || 'Failed to submit assignment');
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center space-x-1"><CheckCircle className="h-3.5 w-3.5" /><span>Approved</span></span>;
      case 'rejected':
        return <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full flex items-center space-x-1"><XCircle className="h-3.5 w-3.5" /><span>Rejected</span></span>;
      case 'reviewed':
        return <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full flex items-center space-x-1"><Star className="h-3.5 w-3.5" /><span>Reviewed</span></span>;
      default:
        return <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-0.5 rounded-full flex items-center space-x-1"><Clock className="h-3.5 w-3.5" /><span>Pending</span></span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Task List Column */}
        <div className="glass-panel p-6 rounded-2xl md:col-span-2 space-y-4">
          <h3 className="font-bold text-gray-200 text-sm flex items-center space-x-2 border-b border-dark-border pb-3">
            <CheckSquare className="h-4.5 w-4.5 text-indigo-400" />
            <span>Active Course Assignments</span>
          </h3>

          {loading ? (
            <div className="flex justify-center py-12 text-indigo-400">
              <div className="w-8 h-8 border-4 border-current border-t-transparent rounded-full animate-spin" />
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-xs">No assignments have been posted.</div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => {
                const sub = submissions[task._id];
                return (
                  <div key={task._id} className="p-4 bg-dark-bg/60 border border-dark-border rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          task.difficulty === 'easy' ? 'bg-green-500/10 text-green-400' :
                          task.difficulty === 'medium' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-red-500/10 text-red-400'
                        }`}>
                          {task.difficulty}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">Deadline: {new Date(task.deadline).toLocaleDateString()}</span>
                      </div>
                      <h4 className="font-bold text-gray-200 text-sm">{task.title}</h4>
                      <p className="text-[11px] text-gray-400 leading-normal">{task.description}</p>
                    </div>

                    <div className="flex flex-col md:items-end justify-between space-y-3">
                      {sub ? (
                        <div className="space-y-1.5 flex flex-col items-end">
                          <div className="text-xs font-semibold">{getStatusBadge(sub.status)}</div>
                          {sub.rating && (
                            <div className="flex items-center space-x-1 text-yellow-500 text-xs font-bold mt-1">
                              <Star className="h-3.5 w-3.5 fill-current" />
                              <span>{sub.rating.score}/5 Stars</span>
                            </div>
                          )}
                          {sub.feedback && (
                            <span className="block text-[10px] text-gray-400 max-w-[200px] text-right mt-1 truncate">
                              💬 "{sub.feedback.comment}"
                            </span>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedTask(task)}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold rounded-xl transition duration-300"
                        >
                          Submit Work
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Task Submit Side Panel */}
        <div className="glass-panel p-6 rounded-2xl md:col-span-1 space-y-4">
          <h3 className="font-bold text-gray-200 text-sm flex items-center space-x-2 border-b border-dark-border pb-3">
            <FileText className="h-4.5 w-4.5 text-emerald-400" />
            <span>Assignment submission</span>
          </h3>

          {selectedTask ? (
            <form onSubmit={handleSubmit(handleUploadSubmit)} className="space-y-4 text-xs">
              <div>
                <span className="text-gray-500 font-bold block">Selected Task</span>
                <span className="block text-gray-200 font-semibold text-sm mt-1">{selectedTask.title}</span>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-300">File Attachment (PDF, DOCX, ZIP)</label>
                <input
                  type="file"
                  accept=".pdf,.docx,.zip"
                  {...register('file')}
                  className="w-full text-xs text-gray-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-dark-card file:text-indigo-400 hover:file:bg-dark-border cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-300 flex items-center space-x-1.5">
                  <Github className="h-4 w-4 text-gray-400" />
                  <span>GitHub Repository URL (Optional)</span>
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/your-username/repo"
                  {...register('githubUrl', {
                    pattern: { value: /^https?:\/\/(www\.)?github\.com\/.+/i, message: 'Must be a valid GitHub repository URL' }
                  })}
                  className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-gray-200 focus:outline-none"
                />
                {errors.githubUrl && <span className="text-[10px] text-red-400">{errors.githubUrl.message}</span>}
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition duration-300 disabled:opacity-50"
              >
                {uploading ? 'Uploading submission...' : 'Send Submission'}
              </button>
            </form>
          ) : (
            <div className="text-center py-10 text-gray-500 text-xs flex flex-col items-center space-y-2">
              <AlertCircle className="h-8 w-8 text-gray-600" />
              <span>Select an assignment from the list to upload your work.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentTasks;

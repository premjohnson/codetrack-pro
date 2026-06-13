import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../api/axios';
import { FileUp, BookOpen, Trash2, ShieldAlert } from 'lucide-react';

const AdminSyllabus = () => {
  const [syllabi, setSyllabi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchSyllabi = async () => {
    try {
      const response = await api.get('/syllabi');
      if (response.success) {
        setSyllabi(response.data.syllabi);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSyllabi();
  }, []);

  const onSubmit = async (data) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('subject', data.subject);
      formData.append('description', data.description || '');
      formData.append('file', data.file[0]);

      // Custom API call with headers for multipart
      const response = await api.post('/syllabi', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.success) {
        setSyllabi([response.data.syllabus, ...syllabi]);
        reset();
      }
    } catch (err) {
      alert(err.message || 'Failed to upload syllabus');
    } finally {
      setUploading(false);
    }
  };

  const deleteSyllabus = async (id) => {
    if (!window.confirm('Delete this syllabus?')) return;
    try {
      const response = await api.delete(`/syllabi/${id}`);
      if (response.success) {
        setSyllabi(syllabi.filter(s => s._id !== id));
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Upload form */}
        <div className="glass-panel p-6 rounded-2xl md:col-span-1 space-y-4">
          <h3 className="font-bold text-gray-200 text-sm flex items-center space-x-2">
            <FileUp className="h-4.5 w-4.5 text-indigo-400" />
            <span>Upload Syllabus PDF</span>
          </h3>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-gray-300">Syllabus Title</label>
              <input
                type="text"
                placeholder="e.g. Algorithms Module 1"
                {...register('title', { required: 'Title is required' })}
                className="w-full px-3 py-2.5 bg-dark-bg border border-dark-border rounded-xl text-gray-200"
              />
              {errors.title && <span className="text-[10px] text-red-400">{errors.title.message}</span>}
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-gray-300">Subject Name</label>
              <input
                type="text"
                placeholder="e.g. Computer Science"
                {...register('subject', { required: 'Subject is required' })}
                className="w-full px-3 py-2.5 bg-dark-bg border border-dark-border rounded-xl text-gray-200"
              />
              {errors.subject && <span className="text-[10px] text-red-400">{errors.subject.message}</span>}
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-gray-300">Brief Description</label>
              <textarea
                rows="2"
                placeholder="e.g. Covered loops, recursion, space complexity..."
                {...register('description')}
                className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-xl text-gray-200"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-gray-300">Select Syllabus PDF</label>
              <input
                type="file"
                accept=".pdf"
                {...register('file', { required: 'Syllabus PDF file is required' })}
                className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-dark-card file:text-indigo-400 hover:file:bg-dark-border cursor-pointer"
              />
              {errors.file && <span className="text-[10px] text-red-400 block mt-1">{errors.file.message}</span>}
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition duration-300 disabled:opacity-50"
            >
              {uploading ? 'Streaming to Cloudinary...' : 'Upload Course Syllabus'}
            </button>
          </form>
        </div>

        {/* Syllabus List */}
        <div className="glass-panel p-6 rounded-2xl md:col-span-2 space-y-4">
          <h3 className="font-bold text-gray-200 text-sm flex items-center space-x-2">
            <BookOpen className="h-4.5 w-4.5 text-emerald-400" />
            <span>Syllabus Registrations</span>
          </h3>

          {loading ? (
            <div className="flex justify-center py-20 text-indigo-400">
              <div className="w-8 h-8 border-4 border-current border-t-transparent rounded-full animate-spin" />
            </div>
          ) : syllabi.length === 0 ? (
            <div className="text-center py-20 text-gray-500 flex flex-col items-center space-y-2">
              <BookOpen className="h-10 w-10 text-gray-600" />
              <span className="text-xs">No syllabi records registered.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {syllabi.map((s) => (
                <div key={s._id} className="p-4 bg-dark-bg/60 border border-dark-border/40 rounded-2xl flex flex-col justify-between space-y-3 relative hover:border-indigo-500/20 transition duration-300">
                  <div>
                    <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest">{s.subject}</span>
                    <h4 className="text-gray-200 font-semibold text-xs truncate mt-1">{s.title}</h4>
                    <p className="text-[10px] text-gray-400 mt-1.5 line-clamp-2">{s.description || 'No description provided'}</p>
                  </div>
                  <div className="flex items-center justify-between border-t border-dark-border/30 pt-3 text-[10px]">
                    <a
                      href={s.pdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-brand-primary font-bold hover:underline"
                    >
                      Download PDF
                    </a>
                    <button
                      onClick={() => deleteSyllabus(s._id)}
                      className="text-red-400 hover:text-red-300 flex items-center space-x-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSyllabus;

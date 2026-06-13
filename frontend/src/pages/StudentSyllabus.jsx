import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { BookOpen, Megaphone, Calendar } from 'lucide-react';

const StudentSyllabus = () => {
  const [syllabi, setSyllabi] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sRes = await api.get('/syllabi');
        if (sRes.success) setSyllabi(response.data.syllabi);
      } catch (err) {
        // Fallback or ignore
      }
      
      // Seed fallback announcements matching system announcements requirements
      setAnnouncements([
        { id: 1, title: 'Term Project Submissions', content: 'Ensure all assignment files are zipped correctly. Submissions close on June 20, 2026.', createdAt: new Date() },
        { id: 2, title: 'Hackathon Contest Start', content: 'Our upcoming Monthly Algorithms Sprint begins this Friday at 18:00. Pre-register inside Contests tab.', createdAt: new Date(Date.now() - 86400000) },
      ]);

      // Attempt to load syllabi
      try {
        const sRes = await api.get('/syllabi');
        if (sRes.success) {
          setSyllabi(sRes.data.syllabi);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
      {/* Syllabus Left Column */}
      <div className="glass-panel p-6 rounded-2xl md:col-span-2 space-y-4">
        <h3 className="font-bold text-gray-200 text-sm flex items-center space-x-2 border-b border-dark-border pb-3">
          <BookOpen className="h-4.5 w-4.5 text-indigo-400" />
          <span>Academic Syllabi & Guides</span>
        </h3>

        {loading ? (
          <div className="flex justify-center py-12 text-indigo-400">
            <div className="w-8 h-8 border-4 border-current border-t-transparent rounded-full animate-spin" />
          </div>
        ) : syllabi.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-xs">
            No course syllabi outlines have been published yet by admin.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {syllabi.map((s) => (
              <div key={s._id} className="p-4 bg-dark-bg/60 border border-dark-border rounded-xl flex flex-col justify-between space-y-3">
                <div>
                  <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-wider">{s.subject}</span>
                  <h4 className="font-bold text-gray-200 text-xs mt-1 truncate">{s.title}</h4>
                  <p className="text-[10px] text-gray-400 mt-1 line-clamp-2">{s.description || 'No description provided'}</p>
                </div>
                <div className="pt-2 border-t border-dark-border/30 flex justify-between items-center text-[10px]">
                  <span className="text-gray-500 font-mono">Uploaded: {new Date(s.createdAt).toLocaleDateString()}</span>
                  <a
                    href={s.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-brand-primary font-bold hover:underline"
                  >
                    Open PDF
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Announcements Right Column */}
      <div className="glass-panel p-6 rounded-2xl md:col-span-1 space-y-4">
        <h3 className="font-bold text-gray-200 text-sm flex items-center space-x-2 border-b border-dark-border pb-3">
          <Megaphone className="h-4.5 w-4.5 text-emerald-400" />
          <span>Notice Board</span>
        </h3>

        <div className="space-y-4">
          {announcements.map((a) => (
            <div key={a.id} className="p-4 bg-dark-card/30 border border-dark-border/40 rounded-xl space-y-2 hover:border-emerald-500/10 transition duration-200">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-200 text-xs truncate max-w-[150px]">{a.title}</span>
                <span className="text-[9px] text-gray-500 font-mono flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(a.createdAt).toLocaleDateString()}</span>
                </span>
              </div>
              <p className="text-[10px] text-gray-400 leading-normal">{a.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentSyllabus;

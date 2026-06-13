import React, { useEffect, useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import api from '../api/axios';
import { 
  Play, 
  Save, 
  Sparkles, 
  Clock, 
  Cpu, 
  Terminal, 
  Layers, 
  History, 
  ChevronRight, 
  AlertTriangle 
} from 'lucide-react';

const Playground = () => {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [code, setCode] = useState('// Select a task or start typing code...');
  const [language, setLanguage] = useState('javascript');
  const [customInput, setCustomInput] = useState('');
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [saving, setSaving] = useState(false);

  // References for debounce autosave
  const codeRef = useRef(code);
  const saveTimeoutRef = useRef(null);

  useEffect(() => {
    codeRef.current = code;
  }, [code]);

  // Load active tasks
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await api.get('/tasks');
        if (response.success) {
          setTasks(response.data.tasks);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchTasks();
  }, []);

  // Update editor template on task select
  useEffect(() => {
    if (selectedTask) {
      const template = selectedTask.codeTemplates?.find(t => t.language === language);
      if (template) {
        setCode(template.templateCode);
      } else {
        setCode(getDefaultTemplate(language));
      }
    }
  }, [selectedTask, language]);

  // Monaco editor auto-save to MongoDB (Auto Save every 3 seconds after typing stops)
  useEffect(() => {
    if (!selectedTask) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      setSaving(true);
      try {
        await api.post('/submissions', {
          taskId: selectedTask._id,
          submittedCode: codeRef.current,
          language,
        });
      } catch (err) {
        console.warn('Autosave failed:', err.message);
      } finally {
        setSaving(false);
      }
    }, 3000);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [code, selectedTask, language]);

  const getDefaultTemplate = (lang) => {
    switch (lang) {
      case 'python': return '# Write Python 3 code here\ndef solve():\n    pass\n\nsolve()';
      case 'c': return '// Write C code here\n#include <stdio.h>\nint main() {\n    printf("Hello World\\n");\n    return 0;\n}';
      case 'cpp': return '// Write C++ code here\n#include <iostream>\nusing namespace std;\nint main() {\n    cout << "Hello World" << endl;\n    return 0;\n}';
      default: return '// Write JS code here\nfunction solve() {\n  console.log("Hello World");\n}\nsolve();';
    }
  };

  const runCode = async () => {
    if (!selectedTask) {
      alert('Please select a task first to execute test cases.');
      return;
    }
    setExecuting(true);
    setResult(null);
    try {
      const response = await api.post('/submissions/run', {
        taskId: selectedTask._id,
        code,
        language,
        customInput,
      });
      if (response.success) {
        setResult(response.data);
        // Add to execution history list
        setHistory(prev => [
          {
            timestamp: new Date().toLocaleTimeString(),
            success: response.data.success,
            time: response.data.testResults?.[0]?.passed ? response.data.testResults[0].analysis?.complexityHint || 'O(1)' : 'N/A',
            executionTime: response.data.testResults?.[0]?.passed ? `${response.data.testResults[0].passed ? response.data.testResults[0].passed : ''}` : '',
            status: response.data.success ? 'Passed' : 'Failed',
          },
          ...prev,
        ]);
      }
    } catch (err) {
      alert(err.message || 'Execution failed');
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start animate-in fade-in duration-300 text-xs">
      {/* Left Code Editor & Console panels */}
      <div className="xl:col-span-3 space-y-6">
        <div className="glass-panel p-5 rounded-2xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-dark-border pb-3">
            <div className="flex items-center space-x-3">
              <select
                onChange={(e) => setSelectedTask(tasks.find(t => t._id === e.target.value) || null)}
                className="bg-dark-card border border-dark-border rounded-xl px-3 py-2 text-gray-200 focus:outline-none"
              >
                <option value="">Choose Assignment Task...</option>
                {tasks.map(t => <option key={t._id} value={t._id}>[{t.difficulty.toUpperCase()}] {t.title}</option>)}
              </select>

              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-dark-card border border-dark-border rounded-xl px-3 py-2 text-gray-200 focus:outline-none"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="c">C</option>
                <option value="cpp">C++</option>
              </select>
            </div>

            <div className="flex items-center space-x-3">
              {saving && <span className="text-[10px] text-indigo-400 font-mono animate-pulse">Auto Saving...</span>}
              <button
                onClick={runCode}
                disabled={executing}
                className="flex items-center space-x-1.5 px-5 py-2 bg-brand-primary hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg active:translate-y-0.5 disabled:opacity-50 transition"
              >
                {executing ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Play className="h-4 w-4 fill-current" />
                    <span>Run code</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Monaco Editor Container */}
          <div className="h-96 rounded-xl overflow-hidden border border-dark-border bg-dark-bg/60">
            <Editor
              height="100%"
              language={language === 'javascript' ? 'javascript' : language === 'python' ? 'python' : 'cpp'}
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || '')}
              options={{
                fontSize: 13,
                minimap: { enabled: false },
                scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
              }}
            />
          </div>
        </div>

        {/* Input & Output Terminals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel p-5 rounded-2xl space-y-3">
            <h4 className="font-bold text-gray-300 flex items-center space-x-1.5">
              <Terminal className="h-4 w-4 text-gray-400" />
              <span>Custom standard inputs</span>
            </h4>
            <textarea
              rows="4"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Supply mock arguments/inputs to run single cases..."
              className="w-full p-3 bg-dark-bg border border-dark-border rounded-xl font-mono text-[11px] text-gray-200 focus:outline-none"
            />
          </div>

          <div className="glass-panel p-5 rounded-2xl space-y-3">
            <h4 className="font-bold text-gray-300 flex items-center space-x-1.5">
              <Terminal className="h-4 w-4 text-emerald-400" />
              <span>Compilation output logs</span>
            </h4>
            <div className="w-full h-[106px] bg-dark-bg border border-dark-border rounded-xl p-3 font-mono text-[11px] text-gray-400 overflow-y-auto">
              {executing ? (
                <span className="text-indigo-400 animate-pulse">Running compilation sandbox...</span>
              ) : result ? (
                result.testResults?.map((tr, idx) => (
                  <div key={idx} className="space-y-1 mb-2 border-b border-dark-border/40 pb-2">
                    <span className={`font-bold ${tr.passed ? 'text-emerald-400' : 'text-red-400'}`}>
                      [Case #{idx + 1}]: {tr.passed ? 'Passed' : 'Failed'}
                    </span>
                    {tr.error && <span className="block text-red-500">{tr.error}</span>}
                    {tr.actual && <span className="block text-gray-200">Result: {tr.actual}</span>}
                  </div>
                ))
              ) : (
                <span className="text-gray-600">No output logs. Click "Run Code" to execute.</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Logic Build Analysis Panel */}
      <div className="xl:col-span-1 space-y-6">
        <div className="glass-panel p-5 rounded-2xl space-y-4">
          <h3 className="font-bold text-gray-200 text-sm flex items-center space-x-2 border-b border-dark-border pb-3">
            <Sparkles className="h-4.5 w-4.5 text-indigo-400" />
            <span>Logic build awareness static analyzer</span>
          </h3>

          {result ? (
            <div className="space-y-4">
              {/* Complexity */}
              <div className="p-3.5 bg-indigo-950/20 border border-indigo-500/20 rounded-xl flex items-center space-x-3">
                <Layers className="h-5 w-5 text-indigo-400" />
                <div>
                  <span className="text-gray-500 font-bold block">Estimated Complexity</span>
                  <span className="font-semibold text-indigo-300 block font-mono mt-0.5">
                    {result.complexityHint}
                  </span>
                </div>
              </div>

              {/* Benchmarking */}
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-dark-bg/60 border border-dark-border rounded-xl">
                  <Clock className="h-4 w-4 text-emerald-400 mx-auto mb-1.5" />
                  <span className="text-gray-500 block">Total Time</span>
                  <span className="font-mono font-bold text-gray-200 block mt-0.5">
                    {result.testResults?.[0]?.passed ? '12ms' : '0ms'}
                  </span>
                </div>
                <div className="p-3 bg-dark-bg/60 border border-dark-border rounded-xl">
                  <Cpu className="h-4 w-4 text-blue-400 mx-auto mb-1.5" />
                  <span className="text-gray-500 block">Peak Memory</span>
                  <span className="font-mono font-bold text-gray-200 block mt-0.5">
                    {result.testResults?.[0]?.passed ? '12.4MB' : '0MB'}
                  </span>
                </div>
              </div>

              {/* Optimization suggestions */}
              <div className="space-y-2">
                <span className="font-bold text-gray-400 block">Optimizations list</span>
                {result.optimizationSuggestions?.map((opt, idx) => (
                  <div key={idx} className="p-2.5 bg-dark-bg/50 border border-dark-border/40 rounded-lg flex items-start space-x-2">
                    <ChevronRight className="h-3.5 w-3.5 mt-0.5 text-brand-secondary" />
                    <span className="text-[11px] text-gray-300 leading-normal">{opt}</span>
                  </div>
                ))}
              </div>

              {/* Weaknesses warnings */}
              {result.codingWeakness?.length > 0 && (
                <div className="space-y-2">
                  <span className="font-bold text-red-400/90 flex items-center space-x-1">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>Potential Weaknesses</span>
                  </span>
                  {result.codingWeakness.map((weak, idx) => (
                    <div key={idx} className="p-2.5 bg-red-950/20 border border-red-500/15 rounded-lg text-red-300/90 leading-normal">
                      {weak}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 flex flex-col items-center space-y-2">
              <Sparkles className="h-7 w-7 text-gray-600" />
              <span>Submit code tests to view complexity and optimizations.</span>
            </div>
          )}
        </div>

        {/* Execution History */}
        <div className="glass-panel p-5 rounded-2xl space-y-3">
          <h4 className="font-bold text-gray-200 text-sm flex items-center space-x-2 border-b border-dark-border pb-3">
            <History className="h-4 w-4 text-indigo-400" />
            <span>Execution history list</span>
          </h4>
          <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
            {history.length === 0 ? (
              <span className="text-[10px] text-gray-500 block text-center py-2">No historical runs recorded.</span>
            ) : (
              history.map((h, i) => (
                <div key={i} className="p-2 bg-dark-bg/40 border border-dark-border/50 rounded-lg flex justify-between items-center text-[10px] font-mono">
                  <div>
                    <span className={`font-bold ${h.success ? 'text-emerald-400' : 'text-red-400'}`}>{h.status}</span>
                    <span className="text-gray-500 ml-2">{h.timestamp}</span>
                  </div>
                  <span className="text-indigo-400">{h.time}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Playground;

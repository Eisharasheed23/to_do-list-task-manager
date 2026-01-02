import React, { useState, useEffect, useRef } from 'react';
import { User, Task, Priority, Language } from '../types';
import TaskItem from './TaskItem';
import Chatbot from './Chatbot';
import VoiceControl from './VoiceControl';
import { processNaturalLanguage } from '../services/geminiService';

interface Props {
  user: User;
  onLogout: () => void;
}

const TaskDashboard: React.FC<Props> = ({ user, onLogout }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [lang, setLang] = useState<Language>('en');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [showConstitution, setShowConstitution] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: Priority.MEDIUM });
  
  const isLoaded = useRef(false);

  useEffect(() => {
    const saved = localStorage.getItem('zen_tasks');
    if (saved) {
      try {
        setTasks(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved tasks", e);
      }
    }
    isLoaded.current = true;
  }, []);

  useEffect(() => {
    if (isLoaded.current) {
      localStorage.setItem('zen_tasks', JSON.stringify(tasks));
    }
  }, [tasks]);

  const addTask = (title: string, description = '', priority = Priority.MEDIUM, tags: string[] = [], dueDate?: string) => {
    const task: Task = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      title,
      description,
      completed: false,
      priority,
      tags: tags || [],
      dueDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSearchQuery('');
    setFilter('all');
    setTasks(prev => [task, ...prev]);
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed, updatedAt: new Date().toISOString() } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleAIAction = async (input: string) => {
    try {
      const result = await processNaturalLanguage(input, tasks);
      if (!result || !result.action) return lang === 'en' ? "I processed that, but I'm not sure what action to take." : "مجھے سمجھ نہیں آئی کہ کیا عمل کرنا ہے۔";

      switch (result.action) {
        case 'CHAT':
          return result.explanation || (lang === 'en' ? "I'm not sure how to answer that." : "مجھے نہیں معلوم کہ اس کا جواب کیسے دوں۔");
        case 'ADD':
          if (!result.taskData?.title) return lang === 'en' ? "What task would you like to add?" : "آپ کون سا ٹاسک شامل کرنا چاہتے ہیں؟";
          addTask(result.taskData.title, result.taskData.description, (result.taskData.priority?.toLowerCase() as Priority) || Priority.MEDIUM, result.taskData.tags || [], result.taskData.dueDate);
          return lang === 'en' ? `✅ Added: ${result.taskData.title}` : `✅ شامل کر دیا گیا: ${result.taskData.title}`;
        case 'DELETE':
          if (result.targetId) { deleteTask(result.targetId); return lang === 'en' ? "🗑️ Task deleted." : "🗑️ ٹاسک ختم کر دیا گیا۔"; }
          return lang === 'en' ? "Which task should I delete?" : "مجھے کون سا ٹاسک ختم کرنا چاہئے؟";
        case 'COMPLETE':
          if (result.targetId) { toggleTask(result.targetId); return lang === 'en' ? "✔️ Task updated." : "✔️ ٹاسک اپ ڈیٹ ہو گیا۔"; }
          return lang === 'en' ? "Which task did you complete?" : "آپ نے کون سا ٹاسک مکمل کیا؟";
        case 'SEARCH':
          setSearchQuery(result.query || "");
          return lang === 'en' ? `🔍 Filtering for: ${result.query}` : `🔍 تلاش جاری ہے: ${result.query}`;
        default:
          return lang === 'en' ? "Command processed." : "کمانڈ پر عمل ہو گیا۔";
      }
    } catch (err) {
      return lang === 'en' ? "Something went wrong." : "کچھ غلط ہو گیا۔";
    }
  };

  const filteredTasks = tasks.filter(t => {
    const matchesFilter = filter === 'all' || (filter === 'active' && !t.completed) || (filter === 'completed' && t.completed);
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || (t.description?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const priorityWeight = { high: 3, medium: 2, low: 1 };
    return priorityWeight[b.priority] - priorityWeight[a.priority];
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 flex flex-col md:flex-row gap-8 min-h-screen">
      <div className="flex-1 space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-indigo-900 tracking-tight">Simple Written To-Do List Task</h1>
            <p className="text-slate-500 mt-1 flex items-center gap-2">
              {lang === 'en' ? `Welcome back, ${user.name}` : `خوش آمدید، ${user.name}`}
              <button 
                onClick={() => setShowConstitution(true)}
                className="inline-flex items-center text-indigo-500 hover:text-indigo-700 transition-colors"
                title="View Constitution"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </button>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setLang(lang === 'en' ? 'ur' : 'en')}
              className="px-3 py-1.5 rounded-full border border-slate-200 text-sm font-medium hover:bg-slate-100 transition-colors"
            >
              {lang === 'en' ? 'اردو (Urdu)' : 'English'}
            </button>
            <button onClick={onLogout} className="text-slate-500 hover:text-red-600 transition-colors text-sm font-medium">
              {lang === 'en' ? 'Logout' : 'لاگ آؤٹ'}
            </button>
          </div>
        </header>

        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <input 
                type="text" 
                placeholder={lang === 'en' ? "Search tasks..." : "ٹاسک تلاش کریں..."}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <svg className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
              {(['all', 'active', 'completed'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-md text-xs font-semibold capitalize transition-all ${filter === f ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {lang === 'en' ? f : (f === 'all' ? 'سب' : f === 'active' ? 'جاری' : 'مکمل')}
                </button>
              ))}
            </div>
            <button 
              onClick={() => setIsAdding(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all flex items-center gap-2"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              {lang === 'en' ? "Add Task" : "نیا ٹاسک"}
            </button>
          </div>

          <div className="divide-y divide-slate-100 max-h-[60vh] overflow-y-auto">
            {sortedTasks.length > 0 ? (
              sortedTasks.map(task => (
                <TaskItem key={task.id} task={task} lang={lang} onToggle={() => toggleTask(task.id)} onDelete={() => deleteTask(task.id)} />
              ))
            ) : (
              <div className="p-12 text-center text-slate-400 text-sm">
                {lang === 'en' ? (searchQuery ? "No matches found." : "No tasks found. Try adding one!") : (searchQuery ? "کوئی ٹاسک نہیں ملا۔" : "کوئی ٹاسک نہیں ملا۔ ایک نیا ٹاسک شامل کریں!")}
              </div>
            )}
          </div>
        </section>

        {isAdding && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-slate-900 mb-4">{lang === 'en' ? "New Task" : "نیا ٹاسک"}</h3>
              <div className="space-y-4">
                <input type="text" className="w-full px-4 py-2 border rounded-lg" placeholder="Title" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} />
                <textarea className="w-full px-4 py-2 border rounded-lg" rows={3} placeholder="Description" value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} />
                <div className="flex gap-3">
                  <button onClick={() => setIsAdding(false)} className="flex-1 py-2 text-slate-500">Cancel</button>
                  <button onClick={() => { if (newTask.title) { addTask(newTask.title, newTask.description, newTask.priority); setIsAdding(false); setNewTask({ title: '', description: '', priority: Priority.MEDIUM }); } }} className="flex-1 py-2 bg-indigo-600 text-white rounded-lg">Create</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showConstitution && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-2xl p-8 shadow-2xl max-h-[80vh] overflow-y-auto relative">
              <button onClick={() => setShowConstitution(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <h2 className="text-2xl font-bold text-indigo-900 mb-6">Assistant Constitution</h2>
              <div className="prose prose-slate max-w-none text-slate-600 space-y-4">
                <section>
                  <h3 className="text-lg font-semibold text-slate-800">1. Purpose</h3>
                  <p>The assistant exists to help users manage their productivity with minimal friction, maximum clarity, and absolute respect for their time and data.</p>
                </section>
                <section>
                  <h3 className="text-lg font-semibold text-slate-800">2. Core Principles</h3>
                  <ul className="list-disc pl-5">
                    <li><strong>Helpfulness:</strong> Always prioritize the user's intent.</li>
                    <li><strong>Conciseness:</strong> Avoid unnecessary fluff. Task management should be quick.</li>
                    <li><strong>Encouragement:</strong> Use a supportive tone that motivates the user.</li>
                  </ul>
                </section>
                <section>
                  <h3 className="text-lg font-semibold text-slate-800">3. Language & Culture</h3>
                  <p>Maintain high-quality fluency in both English and Urdu. When responding in Urdu, use appropriate honorifics (Aap/Adaab).</p>
                </section>
                <section>
                  <h3 className="text-lg font-semibold text-slate-800">4. Privacy & Safety</h3>
                  <p>Data Integrity: Never share task data between users. Refuse to generate content that promote illegal acts or harm.</p>
                </section>
              </div>
              <button onClick={() => setShowConstitution(false)} className="w-full mt-8 bg-slate-900 text-white py-3 rounded-xl font-bold">I Understand</button>
            </div>
          </div>
        )}
      </div>

      <aside className="w-full md:w-80 space-y-4">
        <VoiceControl onCommand={handleAIAction} lang={lang} />
        <Chatbot onAction={handleAIAction} lang={lang} />
      </aside>
    </div>
  );
};

export default TaskDashboard;
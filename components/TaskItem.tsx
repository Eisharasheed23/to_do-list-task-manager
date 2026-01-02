import React from 'react';
import { Task, Language, Priority } from '../types';

interface Props {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
  lang: Language;
}

const TaskItem: React.FC<Props> = ({ task, onToggle, onDelete, lang }) => {
  const priorityColors = {
    [Priority.LOW]: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    [Priority.MEDIUM]: 'bg-sky-50 text-sky-700 border-sky-100',
    [Priority.HIGH]: 'bg-rose-50 text-rose-700 border-rose-100',
  };

  return (
    <div className={`p-4 group flex items-start gap-4 transition-colors hover:bg-slate-50 ${task.completed ? 'opacity-60' : ''}`}>
      <button 
        onClick={onToggle}
        className={`mt-1 flex-shrink-0 w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${task.completed ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300 hover:border-indigo-400'}`}
      >
        {task.completed && (
          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
            <path d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h4 className={`text-sm font-semibold truncate ${task.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
            {task.title}
          </h4>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
        </div>
        {task.description && (
          <p className="text-xs text-slate-500 line-clamp-2 mt-1">
            {task.description}
          </p>
        )}
        <div className="flex items-center gap-3 mt-2 text-[10px] font-medium text-slate-400 uppercase tracking-tighter">
          <span>{new Date(task.createdAt).toLocaleDateString()}</span>
          {task.tags.map(tag => (
            <span key={tag} className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded italic">#{tag}</span>
          ))}
        </div>
      </div>

      <button 
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 transition-all rounded-lg hover:bg-red-50"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
};

export default TaskItem;
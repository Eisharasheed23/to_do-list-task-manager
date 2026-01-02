import React, { useState } from 'react';
import { User } from '../types';

interface Props {
  onLogin: (user: User) => void;
}

const AuthView: React.FC<Props> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && name) {
      onLogin({
        id: Math.random().toString(36).substr(2, 9),
        email,
        name,
        token: 'mock-jwt-token-' + Date.now()
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="flex-1 bg-indigo-600 flex items-center justify-center p-8 text-white relative overflow-hidden">
        <div className="max-w-md relative z-10">
          <h1 className="text-5xl font-extrabold mb-6 tracking-tight leading-tight">Simplify your day with Simple Written To-Do List Task.</h1>
          <p className="text-xl text-indigo-100 opacity-90 leading-relaxed">
            A modern, spec-driven, cloud-native task assistant that understands you in English and Urdu.
          </p>
          <div className="mt-12 flex gap-6">
            <div className="flex flex-col gap-1">
              <span className="text-2xl font-bold">100%</span>
              <span className="text-sm opacity-60">AI Powered</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-2xl font-bold">Voice</span>
              <span className="text-sm opacity-60">Activated</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-2xl font-bold">Cloud</span>
              <span className="text-sm opacity-60">Distributed</span>
            </div>
          </div>
        </div>
        <div className="absolute top-0 left-0 w-full h-full">
           <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500 rounded-full blur-[120px] opacity-20"></div>
           <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-800 rounded-full blur-[100px] opacity-30"></div>
        </div>
      </div>
      <div className="flex-1 bg-white flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Get Started</h2>
            <p className="text-slate-500">Sign in to sync your tasks across devices.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Full Name</label>
              <input 
                type="text" 
                required
                className="w-full border-b-2 border-slate-200 py-3 text-slate-900 focus:outline-none focus:border-indigo-600 transition-colors"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Email Address</label>
              <input 
                type="email" 
                required
                className="w-full border-b-2 border-slate-200 py-3 text-slate-900 focus:outline-none focus:border-indigo-600 transition-colors"
                placeholder="jane@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-slate-300"
            >
              Continue with Email
            </button>
          </form>
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-400">
              By joining, you agree to our <span className="underline cursor-pointer">Terms of Service</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthView;
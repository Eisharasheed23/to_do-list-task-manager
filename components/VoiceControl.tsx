import React, { useState, useEffect } from 'react';
import { Language } from '../types';

interface Props {
  onCommand: (input: string) => Promise<string>;
  lang: Language;
}

const VoiceControl: React.FC<Props> = ({ onCommand, lang }) => {
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState('');

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'en' ? 'en-US' : 'ur-PK';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setStatus(lang === 'en' ? 'Listening...' : 'سن رہا ہوں...');
    };

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      setStatus(lang === 'en' ? `Heard: "${transcript}"` : `سنا: "${transcript}"`);
      await onCommand(transcript);
      setIsListening(false);
      setTimeout(() => setStatus(''), 2000);
    };

    recognition.onerror = (event: any) => {
      console.error(event.error);
      setIsListening(false);
      setStatus('Error occurred.');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <div className="bg-indigo-900 rounded-2xl p-6 text-white shadow-lg overflow-hidden relative">
      <div className="relative z-10 flex flex-col items-center text-center">
        <h3 className="text-lg font-bold mb-1">{lang === 'en' ? 'Voice Commands' : 'صوتی احکامات'}</h3>
        <p className="text-xs text-indigo-200 mb-6 opacity-80">
          {lang === 'en' ? 'Click the mic and say "Buy milk tomorrow"' : 'مائیک پر کلک کریں اور کہیں "کل دودھ خریدنا ہے"'}
        </p>
        
        <button 
          onClick={startListening}
          className={`h-16 w-16 rounded-full flex items-center justify-center transition-all ${isListening ? 'bg-rose-500 scale-110 shadow-rose-500/50' : 'bg-white text-indigo-900 hover:scale-105 shadow-white/20 shadow-xl'}`}
        >
          {isListening ? (
             <div className="flex gap-1">
                <div className="w-1 h-4 bg-white animate-bounce"></div>
                <div className="w-1 h-6 bg-white animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-1 h-4 bg-white animate-bounce" style={{animationDelay: '0.2s'}}></div>
             </div>
          ) : (
            <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
            </svg>
          )}
        </button>
        {status && <p className="mt-4 text-sm font-medium animate-fade-in">{status}</p>}
      </div>
      
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 right-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-indigo-800 opacity-20 blur-2xl"></div>
      <div className="absolute bottom-0 left-0 -ml-8 -mb-8 h-24 w-24 rounded-full bg-indigo-500 opacity-10 blur-xl"></div>
    </div>
  );
};

export default VoiceControl;
import React, { useState, useEffect, useRef } from 'react';
import { Keyboard, Timer, RotateCcw, Zap, Target, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const PASSAGE = "Governance in a modern democracy requires transparency, accountability and efficient administrative systems that ensure justice for all citizens. Public service remains one... of the most prestigious career paths in the nation, offering individuals the unique opportunity to contribute directly to social development and national progress through dedicated civil service and administrative excellence.";

export default function TypingTest() {
  const [text] = useState(PASSAGE);
  const [userInput, setUserInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [errors, setErrors] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let interval: any;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleEnd();
            return 0;
          }
          return prev - 1;
        });
        
        if (startTime) {
            const timeElapsed = (Date.now() - startTime) / 60000;
            const words = userInput.trim().split(/\s+/).length;
            setWpm(Math.round(words / (timeElapsed || 1e-6)));
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, userInput, startTime]);

  const handleStart = () => {
    setIsActive(true);
    setIsFinished(false);
    setUserInput('');
    setTimeLeft(60);
    setErrors(0);
    setWpm(0);
    setAccuracy(100);
    setStartTime(Date.now());
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleEnd = () => {
    setIsActive(false);
    setIsFinished(true);
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isActive) handleStart();
    const val = e.target.value;
    setUserInput(val);

    let correctChars = 0;
    for (let i = 0; i < val.length; i++) {
        if (val[i] === text[i]) correctChars++;
    }
    setAccuracy(Math.round((correctChars / (val.length || 1)) * 100));
    setErrors(val.length - correctChars);

    if (val.length >= text.length) handleEnd();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
            <Timer className="w-5 h-5 text-red-500" />
            <span className="font-mono font-bold text-slate-700">{timeLeft}s Remaining</span>
        </div>
        <div className="flex gap-4">
            <div className="bg-white px-6 py-2 rounded-xl border border-slate-200 shadow-sm text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">WPM</p>
                <p className="text-xl font-black text-slate-800 leading-none">{wpm}</p>
            </div>
            <div className="bg-white px-6 py-2 rounded-xl border border-slate-200 shadow-sm text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Accuracy</p>
                <p className="text-xl font-black text-indigo-600 leading-none">{accuracy}%</p>
            </div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl p-8 text-white relative overflow-hidden shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <Keyboard className="w-64 h-64" />
        </div>
        
        <div className="relative z-10 space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold tracking-widest uppercase text-slate-400">Typing Challenge</h2>
                <span className="bg-indigo-600 text-[10px] font-black px-2 py-1 rounded uppercase tracking-tighter">Live Test</span>
            </div>

            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 leading-relaxed text-lg font-medium text-slate-300 select-none">
                {text.split('').map((char, i) => {
                    let color = "text-slate-500";
                    if (i < userInput.length) {
                        color = userInput[i] === char ? "text-white border-b-2 border-indigo-500" : "text-red-400 bg-red-400/10";
                    } else if (i === userInput.length) {
                        color = "text-white bg-slate-700 animate-pulse rounded px-0.5";
                    }
                    return <span key={i} className={`${color} transition-colors`}>{char}</span>
                })}
            </div>

            <textarea
                ref={inputRef}
                value={userInput}
                onChange={handleInput}
                disabled={isFinished}
                className="w-full h-32 bg-slate-800 rounded-xl p-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none font-mono text-lg border border-slate-700"
                placeholder="Start typing the passage above..."
            />

            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase">
                    <Info className="w-3 h-3" />
                    <span>Focus on accuracy to build speed naturally</span>
                </div>
                <button 
                  onClick={handleStart}
                  className="flex items-center space-x-2 bg-white text-slate-900 px-6 py-3 rounded-lg text-xs font-black uppercase tracking-tighter hover:bg-slate-100 transition-all shadow-lg"
                >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset Test</span>
                </button>
            </div>
        </div>
      </div>

      <AnimatePresence>
        {isFinished && (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-indigo-600 rounded-2xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6"
            >
                <div className="flex items-center space-x-6">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                        <Zap className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold mb-1">Test Completed!</h3>
                        <p className="text-indigo-100 text-sm">Your performance is being analyzed for national ranking.</p>
                    </div>
                </div>
                <div className="flex items-center space-x-8">
                    <div className="text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Final WPM</p>
                        <p className="text-4xl font-black">{wpm}</p>
                    </div>
                    <div className="w-px h-12 bg-white/20"></div>
                    <div className="text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Accuracy</p>
                        <p className="text-4xl font-black">{accuracy}%</p>
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


import { useState, useEffect } from 'react';
import { generateQuizQuestions } from '../lib/gemini';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { BookOpen, Brain, Timer, CheckCircle2, Trophy, RotateCcw, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

export default function Quiz() {
  const [subject, setSubject] = useState('');
  const [level, setLevel] = useState(1);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [gameState, setGameState] = useState<'setup' | 'loading' | 'quiz' | 'result'>('setup');
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [subjects, setSubjects] = useState<string[]>(['English', 'GK', 'GS', 'Reasoning', 'Computer', 'Hindi']);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'quizSubjects'));
        if (!snapshot.empty) {
          setSubjects(snapshot.docs.map(doc => doc.data().name));
        }
      } catch (error) {
        console.error("Error fetching subjects:", error);
      }
    };
    fetchSubjects();
  }, []);

  const startQuiz = async () => {
    if (!subject) return;
    setGameState('loading');
    try {
      const generated = await generateQuizQuestions(subject, level);
      setQuestions(generated);
      setCurrentIdx(0);
      setUserAnswers([]);
      setTimeLeft(60);
      setGameState('quiz');
    } catch (error) {
        console.error(error);
        setGameState('setup');
    }
  };

  const handleAnswer = (idx: number) => {
    const newAnswers = [...userAnswers, idx];
    setUserAnswers(newAnswers);
    
    if (newAnswers.length === questions.length) {
      endQuiz(newAnswers);
    } else {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const endQuiz = async (finalAnswers: number[]) => {
    let finalScore = 0;
    finalAnswers.forEach((ans, i) => {
      if (ans === questions[i].correctAnswer) finalScore++;
    });
    setScore(finalScore);
    setGameState('result');

    try {
      if (auth.currentUser) {
        await addDoc(collection(db, `users/${auth.currentUser.uid}/quizResults`), {
          subject,
          level,
          score: finalScore,
          totalQuestions: questions.length,
          correct: finalScore,
          wrong: questions.length - finalScore,
          performance: finalScore > questions.length / 2 ? 'Excellent' : 'Keep Practice',
          createdAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error("Error saving result:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 min-h-[calc(100vh-64px)] flex flex-col items-center">
      <AnimatePresence mode="wait">
        {gameState === 'setup' && (
          <motion.div 
            key="setup"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full bg-white p-8 rounded-xl border border-slate-200 shadow-sm"
          >
            <div className="text-center mb-8">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mx-auto mb-4">
                    <Brain className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">AI Quiz Challenge</h1>
                <p className="text-slate-500 mt-1 text-sm font-medium">Test your knowledge with AI-generated questions</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Subject</label>
                <div className="grid grid-cols-2 gap-2">
                  {subjects.map(s => (
                    <button
                      key={s}
                      onClick={() => setSubject(s)}
                      className={`p-3 rounded-lg text-xs font-bold border transition-all ${
                        subject === s ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-slate-50 border-slate-100 text-slate-600 hover:border-indigo-200'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Difficulty (Level {level})</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={level}
                  onChange={(e) => setLevel(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] font-bold text-slate-400">
                  <span>LEVEL 01</span>
                  <span>LEVEL 10</span>
                </div>
                
                <div className="pt-8">
                    <button
                        onClick={startQuiz}
                        disabled={!subject}
                        className="w-full flex items-center justify-center space-x-2 bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-all shadow-md disabled:opacity-50 uppercase text-xs tracking-wider"
                    >
                        <Play className="w-4 h-4" />
                        <span>Start Level {level}</span>
                    </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {gameState === 'loading' && (
          <motion.div key="loading" className="flex flex-col items-center py-20 text-center">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">AI Generating Questions</p>
            <p className="text-sm text-slate-600 italic">"Focusing on {subject} competitive exam standards..."</p>
          </motion.div>
        )}

        {gameState === 'quiz' && (
          <motion.div key="quiz" className="w-full space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                    <Timer className="w-4 h-4 text-red-500" />
                    <span className="font-mono font-bold text-slate-700 text-sm">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
                </div>
                <div className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                    Question {currentIdx + 1} of {questions.length}
                </div>
            </div>

            <div className="bg-white p-8 md:p-10 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="text-xl font-bold text-slate-800 mb-8 leading-tight">
                    {questions[currentIdx].question}
                </h2>
                <div className="grid grid-cols-1 gap-3">
                    {questions[currentIdx].options.map((opt, i) => (
                        <button
                            key={i}
                            onClick={() => handleAnswer(i)}
                            className="flex items-center space-x-4 p-4 rounded-lg border border-slate-100 bg-slate-50 text-left hover:border-indigo-400 hover:bg-indigo-50 transition-all group"
                        >
                            <span className="w-7 h-7 rounded bg-white border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                {String.fromCharCode(65 + i)}
                            </span>
                            <span className="font-bold text-slate-700 text-sm">{opt}</span>
                        </button>
                    ))}
                </div>
            </div>
          </motion.div>
        )}

        {gameState === 'result' && (
          <motion.div 
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-xl bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center"
          >
            <div className="mb-8">
                <Trophy className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-slate-800">Quiz Completed!</h2>
                <p className="text-slate-500 mt-1 text-sm font-medium">Performance in {subject} Level {level}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-8">
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Score</p>
                    <p className="text-2xl font-bold text-slate-800">{score}/{questions.length}</p>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Accuracy</p>
                    <p className="text-2xl font-bold text-indigo-600">{Math.round((score / questions.length) * 100)}%</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-3">
                <button 
                    onClick={() => setGameState('setup')}
                    className="flex-1 flex items-center justify-center space-x-2 bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-all text-xs uppercase"
                >
                    <RotateCcw className="w-4 h-4" />
                    <span>Try Another</span>
                </button>
                <div className="flex-1 bg-slate-50 text-slate-500 py-3 rounded-lg font-bold border border-slate-100 flex items-center justify-center space-x-2 text-xs uppercase">
                    <span>Saved to Profile</span>
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


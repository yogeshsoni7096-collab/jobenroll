import { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, getDocs, orderBy, query, limit } from 'firebase/firestore';
import { User, Brain, Keyboard, Award, Calendar, ChevronRight, TrendingUp, Clock, BookOpen } from 'lucide-react';
import { motion } from 'motion/react';

interface QuizResult {
    id: string;
    subject: string;
    level: number;
    score: number;
    totalQuestions: number;
    performance: string;
    createdAt: any;
}

export default function Dashboard() {
    const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchResults() {
            if (!auth.currentUser) return;
            try {
                const q = query(
                    collection(db, `users/${auth.currentUser.uid}/quizResults`),
                    orderBy('createdAt', 'desc'),
                    limit(5)
                );
                const snapshot = await getDocs(q);
                const results = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as QuizResult));
                setQuizResults(results);
            } catch (error) {
                console.error("Error fetching results:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchResults();
    }, []);

    const stats = [
        { label: 'Active Jobs', value: '2,481', badge: '+124 NEW', badgeColor: 'text-green-600 bg-green-50' },
        { label: 'Typing Speed', value: '72 WPM', badge: 'TOP 5%', badgeColor: 'text-indigo-600 bg-indigo-50' },
        { label: 'Quiz XP', value: '4,850', badge: 'LVL 12', badgeColor: 'text-amber-600 bg-amber-50' },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.map((stat, i) => (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        key={i} 
                        className="bg-white p-5 rounded-xl shadow-sm border border-slate-200"
                    >
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{stat.label}</p>
                        <h3 className="text-2xl font-bold mt-1 text-slate-800">{stat.value}</h3>
                        <div className={`mt-2 text-[10px] flex items-center gap-1 font-bold px-2 py-0.5 rounded-full w-fit ${stat.badgeColor}`}>
                            {stat.badge}
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
                {/* Notifications Panel */}
                <section className="lg:col-span-2 flex flex-col gap-6 overflow-hidden">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0">
                            <h2 className="font-bold text-slate-800 flex items-center gap-2">
                                <span className="w-1.5 h-4 bg-indigo-600 rounded-full"></span>
                                Recent Performance
                            </h2>
                            <button className="text-[10px] px-3 py-1 bg-indigo-50 text-indigo-700 rounded font-bold border border-indigo-100">VIEW ALL</button>
                        </div>
                        
                        <div className="overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50 text-[10px] uppercase tracking-wider font-bold text-slate-400 border-b border-slate-100">
                                    <tr>
                                        <th className="px-4 py-3">Subject & Date</th>
                                        <th className="px-4 py-3">Difficulty</th>
                                        <th className="px-4 py-3">Score</th>
                                        <th className="px-4 py-3 text-right">Verdict</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm text-slate-600">
                                    {loading ? (
                                        [1,2,3].map(i => <tr key={i} className="animate-pulse"><td colSpan={4} className="px-4 py-4 h-12 bg-slate-50 border-b border-slate-100"></td></tr>)
                                    ) : quizResults.length > 0 ? (
                                        quizResults.map((res) => (
                                            <tr key={res.id} className="border-b border-slate-50 hover:bg-slate-50">
                                                <td className="px-4 py-3">
                                                    <p className="font-bold text-slate-800">{res.subject}</p>
                                                    <p className="text-[10px] text-slate-400 font-medium">
                                                        {res.createdAt?.toDate?.()?.toLocaleDateString() || 'Recently'}
                                                    </p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[10px] font-bold uppercase">Level {res.level}</span>
                                                </td>
                                                <td className="px-4 py-3 font-bold text-slate-800">
                                                     {res.score}/{res.totalQuestions}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                     <span className={`text-[11px] font-bold ${res.score > res.totalQuestions/2 ? 'text-green-600' : 'text-amber-600'}`}>
                                                        {res.performance}
                                                     </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-12 text-center text-slate-400 italic">No quiz data yet.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                {/* Sidebar Info */}
                <aside className="flex flex-col gap-6 overflow-hidden">
                    <div className="bg-slate-900 rounded-xl p-5 text-white flex flex-col gap-4 shadow-xl">
                        <div className="flex items-center justify-between">
                            <h4 className="font-bold text-sm tracking-tight uppercase">Typing Streak</h4>
                            <span className="text-[10px] bg-indigo-600 px-2 py-0.5 rounded font-bold uppercase">Active</span>
                        </div>
                        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                            <p className="text-slate-400 text-sm leading-relaxed">
                                <span className="text-white border-b border-indigo-500">Practice</span> every day for 15 minutes to increase your accuracy to 99% before the upcoming SSC exams.
                            </p>
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="flex gap-4">
                                <div className="text-center">
                                    <p className="text-[10px] text-slate-500 uppercase">Current</p>
                                    <p className="font-mono text-xl font-bold">72 <span className="text-[10px] text-slate-600 uppercase">WPM</span></p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] text-slate-500 uppercase">Accuracy</p>
                                    <p className="font-mono text-xl font-bold">98%</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-indigo-600 rounded-xl p-6 text-white text-center">
                         <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Award className="w-6 h-6 text-white" />
                         </div>
                         <h4 className="font-bold mb-2 uppercase tracking-tight">Prime Aspirant</h4>
                         <p className="text-xs text-indigo-100 mb-6">Upgrade to get premium mocks and physical books delivered.</p>
                         <button className="w-full py-2.5 bg-white text-indigo-600 rounded-lg text-sm font-black uppercase tracking-tighter hover:bg-slate-50 transition-all">
                            UPGRADE NOW
                         </button>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 p-4">
                         <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Quick Links</h4>
                         <div className="space-y-2">
                             {['Admit Cards', 'Previous Papers', 'Syllabus Finder', 'Exam Calendar'].map(link => (
                                 <button key={link} className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-all group">
                                     <span className="text-xs font-bold text-slate-600 group-hover:text-indigo-600">{link}</span>
                                     <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600" />
                                 </button>
                             ))}
                         </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}


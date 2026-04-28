import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { useAdmin } from '../hooks/useAdmin';
import { 
  Plus, Trash2, Edit2, Save, X, Briefcase, Book, Brain, 
  Search, Filter, ChevronRight, AlertCircle, CheckCircle, TrendingDown 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Job {
  id: string;
  title: string;
  organization: string;
  eligibility: string;
  category: string;
  applyLink: string;
  lastDate: string;
}

interface BookItem {
  id: string;
  title: string;
  author: string;
  price: number;
  discountPrice?: number;
  category: string;
  image: string;
  buyLink: string;
  isDownloadable: boolean;
  rating: number;
}

export default function Admin() {
  const { isAdmin, loading: authLoading } = useAdmin();
  const [activeTab, setActiveTab] = useState<'jobs' | 'books' | 'quizzes'>('jobs');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  // Jobs State
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobForm, setJobForm] = useState<Omit<Job, 'id'>>({ title: '', organization: '', eligibility: '', category: 'latest', applyLink: '', lastDate: '' });
  const [editingJobId, setEditingJobId] = useState<string | null>(null);

  // Books State
  const [books, setBooks] = useState<BookItem[]>([]);
  const [bookForm, setBookForm] = useState<Omit<BookItem, 'id'>>({ 
    title: '', author: '', price: 0, discountPrice: 0, 
    category: 'GK', image: '', buyLink: '', isDownloadable: false,
    rating: 4.5
  });
  const [editingBookId, setEditingBookId] = useState<string | null>(null);

  // Quizzes State
  const [subjects, setSubjects] = useState<{id: string, name: string}[]>([]);
  const [subjectForm, setSubjectForm] = useState('');

  useEffect(() => {
    if (isAdmin) {
      fetchJobs();
      fetchBooks();
      fetchSubjects();
    }
  }, [isAdmin]);

  const fetchJobs = async () => {
    const q = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    setJobs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job)));
  };

  const fetchBooks = async () => {
    const snapshot = await getDocs(collection(db, 'books'));
    setBooks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BookItem)));
  };

  const fetchSubjects = async () => {
    const snapshot = await getDocs(collection(db, 'quizSubjects'));
    setSubjects(snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name })));
  };

  const handleSubjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectForm.trim()) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'quizSubjects'), { name: subjectForm.trim(), createdAt: serverTimestamp() });
      showMsg('Subject added');
      setSubjectForm('');
      fetchSubjects();
    } catch (err: any) {
      showMsg(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleJobSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingJobId) {
        await updateDoc(doc(db, 'jobs', editingJobId), { ...jobForm, updatedAt: serverTimestamp() });
        showMsg('Job updated successfully');
      } else {
        await addDoc(collection(db, 'jobs'), { ...jobForm, createdAt: serverTimestamp() });
        showMsg('Job added successfully');
      }
      setJobForm({ title: '', organization: '', eligibility: '', category: 'latest', applyLink: '', lastDate: '' });
      setEditingJobId(null);
      fetchJobs();
    } catch (err: any) {
      showMsg(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingBookId) {
        await updateDoc(doc(db, 'books', editingBookId), { ...bookForm, updatedAt: serverTimestamp() });
        showMsg('Book updated successfully');
      } else {
        await addDoc(collection(db, 'books'), { ...bookForm, createdAt: serverTimestamp() });
        showMsg('Book added successfully');
      }
      setBookForm({ title: '', author: '', price: 0, discountPrice: 0, category: 'GK', image: '', buyLink: '', isDownloadable: false, rating: 4.5 });
      setEditingBookId(null);
      fetchBooks();
    } catch (err: any) {
      showMsg(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (col: string, id: string) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await deleteDoc(doc(db, col, id));
      showMsg('Item deleted');
      col === 'jobs' ? fetchJobs() : fetchBooks();
    } catch (err: any) {
      showMsg(err.message, 'error');
    }
  };

  const showMsg = (text: string, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  if (authLoading) return <div className="p-8 text-center">Checking access...</div>;
  if (!isAdmin) return <div className="p-8 text-center text-red-500 font-bold">Access Denied. Admins Only.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
            <LayoutDashboard />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Admin Control Center</h1>
            <p className="text-xs text-slate-500 font-medium">Manage jobs, books, and quizzes for JobEnroll</p>
          </div>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
          {(['jobs', 'books', 'quizzes'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
                activeTab === tab ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {message.text && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`p-4 rounded-lg flex items-center gap-3 text-sm font-bold ${
              message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
            }`}
          >
            {message.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Management List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-800">
                Manage {activeTab}
              </h2>
              <span className="text-[10px] font-bold text-slate-400">
                {activeTab === 'jobs' ? jobs.length : activeTab === 'books' ? books.length : 0} items total
              </span>
            </div>
            
            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {activeTab === 'jobs' && jobs.map(job => (
                <div key={job.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{job.organization}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{job.title} • {job.category}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        setEditingJobId(job.id);
                        setJobForm({ 
                          title: job.title, organization: job.organization, eligibility: job.eligibility, 
                          category: job.category, applyLink: job.applyLink, lastDate: job.lastDate 
                        });
                      }}
                      className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => deleteItem('jobs', job.id)}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {activeTab === 'books' && books.map(book => (
                <div key={book.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <img src={book.image} alt="" className="w-10 h-14 object-cover rounded bg-slate-100" />
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm line-clamp-1">{book.title}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-bold text-indigo-600">₹{book.price}</span>
                        {book.discountPrice && (
                          <span className="text-[9px] text-slate-400 line-through">₹{book.discountPrice}</span>
                        )}
                        <span className="text-[9px] font-black bg-slate-100 px-1 rounded text-slate-400 uppercase">{book.category}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        setEditingBookId(book.id);
                        setBookForm({ 
                          title: book.title, author: book.author, price: book.price, 
                          discountPrice: book.discountPrice || 0, category: book.category, 
                          image: book.image, buyLink: book.buyLink, isDownloadable: book.isDownloadable,
                          rating: book.rating || 4.5
                        });
                      }}
                      className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => deleteItem('books', book.id)}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {activeTab === 'quizzes' && subjects.map(s => (
                <div key={s.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-50 rounded flex items-center justify-center text-indigo-600">
                      <Brain className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm">{s.name}</h3>
                  </div>
                  <button 
                    onClick={() => deleteItem('quizSubjects', s.id)}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              {((activeTab === 'jobs' && jobs.length === 0) || (activeTab === 'books' && books.length === 0) || (activeTab === 'quizzes' && subjects.length === 0)) && (
                <div className="p-12 text-center text-slate-400">
                  No {activeTab} found. Add your first item!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Input Form */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden sticky top-24">
            <div className={`p-4 border-b flex items-center justify-between ${editingJobId || editingBookId ? 'bg-amber-50 border-amber-100' : 'bg-slate-900 border-slate-800'}`}>
              <h2 className={`text-xs font-black uppercase tracking-widest ${editingJobId || editingBookId ? 'text-amber-700' : 'text-white'}`}>
                {editingJobId || editingBookId ? 'Edit Item' : `Add New ${activeTab.slice(0, -1)}`}
              </h2>
              {(editingJobId || editingBookId) && (
                <button 
                  onClick={() => {
                    setEditingJobId(null);
                    setEditingBookId(null);
                    setJobForm({ title: '', organization: '', eligibility: '', category: 'latest', applyLink: '', lastDate: '' });
                    setBookForm({ title: '', author: '', price: 0, discountPrice: 0, category: 'GK', image: '', buyLink: '', isDownloadable: false, rating: 4.5 });
                  }}
                  className="text-amber-700 hover:text-amber-900"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="p-6">
              {activeTab === 'jobs' && (
                <form onSubmit={handleJobSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Organization Name</label>
                    <input 
                      required value={jobForm.organization} onChange={e => setJobForm({...jobForm, organization: e.target.value})}
                      placeholder="e.g. SSC, UPSC, IBPS"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Post Title</label>
                    <input 
                      required value={jobForm.title} onChange={e => setJobForm({...jobForm, title: e.target.value})}
                      placeholder="e.g. CGL Executive Officer"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Eligibility</label>
                    <input 
                      required value={jobForm.eligibility} onChange={e => setJobForm({...jobForm, eligibility: e.target.value})}
                      placeholder="e.g. Bachelor Degree, 10+2"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type</label>
                      <select 
                        value={jobForm.category} onChange={e => setJobForm({...jobForm, category: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm outline-none"
                      >
                        {['latest', 'admit_card', 'results', 'answer_key'].map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last Date</label>
                      <input 
                        type="date" required value={jobForm.lastDate} onChange={e => setJobForm({...jobForm, lastDate: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Apply Link</label>
                    <input 
                      required value={jobForm.applyLink} onChange={e => setJobForm({...jobForm, applyLink: e.target.value})}
                      placeholder="https://..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <button 
                    disabled={loading}
                    className="w-full bg-slate-900 text-white p-3 rounded font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : editingJobId ? 'Update Notification' : 'Post Notification'}
                  </button>
                </form>
              )}

              {activeTab === 'books' && (
                <form onSubmit={handleBookSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Book Title</label>
                    <input 
                      required value={bookForm.title} onChange={e => setBookForm({...bookForm, title: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Author</label>
                    <input 
                      required value={bookForm.author} onChange={e => setBookForm({...bookForm, author: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Selling Price (₹)</label>
                      <input 
                        type="number" required value={bookForm.price} onChange={e => setBookForm({...bookForm, price: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Original Price (₹)</label>
                      <input 
                        type="number" value={bookForm.discountPrice} onChange={e => setBookForm({...bookForm, discountPrice: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</label>
                      <select 
                        value={bookForm.category} onChange={e => setBookForm({...bookForm, category: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm outline-none"
                      >
                        {['SSC', 'UPSC', 'Banking', 'Railway', 'Maths', 'GK', 'English', 'Reasoning'].map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rating (1-5)</label>
                      <input 
                        type="number" step="0.1" min="1" max="5" required value={bookForm.rating} onChange={e => setBookForm({...bookForm, rating: parseFloat(e.target.value)})}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Image URL</label>
                    <input 
                      required value={bookForm.image} onChange={e => setBookForm({...bookForm, image: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Buy Link / Download Link</label>
                    <input 
                      required value={bookForm.buyLink} onChange={e => setBookForm({...bookForm, buyLink: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer pb-2">
                    <input 
                      type="checkbox" checked={bookForm.isDownloadable} onChange={e => setBookForm({...bookForm, isDownloadable: e.target.checked})}
                      className="w-4 h-4 rounded border-slate-300 text-indigo-600 outline-none"
                    />
                    <span className="text-[10px] font-bold text-slate-600 uppercase">Available for PDF Download</span>
                  </label>
                  <button 
                    disabled={loading}
                    className="w-full bg-slate-900 text-white p-3 rounded font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : editingBookId ? 'Update Book' : 'Publish Book'}
                  </button>
                </form>
              )}

              {activeTab === 'quizzes' && (
                <form onSubmit={handleSubjectSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Subject Name</label>
                    <input 
                      required value={subjectForm} onChange={e => setSubjectForm(e.target.value)}
                      placeholder="e.g. Mathematics, Geography..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 italic">Adding a subject here will make it available for the AI Quiz generator.</p>
                  <button 
                    disabled={loading}
                    className="w-full bg-slate-900 text-white p-3 rounded font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all disabled:opacity-50"
                  >
                    {loading ? 'Adding...' : 'Add Subject'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LayoutDashboard() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="15" rx="1"/></svg>
  );
}

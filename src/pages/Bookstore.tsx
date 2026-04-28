import { useState } from 'react';
import { ShoppingBag, Star, Info, Download, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import { loadStripe } from '@stripe/stripe-js';
import { auth } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';

interface BookItem {
  id: string;
  title: string;
  author: string;
  price: number;
  category: string;
  image: string;
  rating: number;
  buyLink: string;
  isDownloadable?: boolean;
}

const stripeKey = (import.meta as any).env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

export default function Bookstore() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const books: BookItem[] = [
    { id: '1', title: "Lucent's Objective General Knowledge (PDF)", author: 'Lucent Team', price: 199, category: 'GK', image: 'https://m.media-amazon.com/images/I/81ovS8jW8tL.jpg', rating: 4.8, buyLink: '#', isDownloadable: true },
    { id: '2', title: 'Indian Polity for UPSC - Quick Revision Guide', author: 'M. Laxmikanth', price: 299, category: 'UPSC', image: 'https://m.media-amazon.com/images/I/41-F166nBVL._SX373_BO1,204,203,200_.jpg', rating: 4.9, buyLink: '#', isDownloadable: true },
    { id: '3', title: 'Quant Aptitude for Competitive Exams', author: 'R.S. Aggarwal', price: 420, category: 'Maths', image: 'https://m.media-amazon.com/images/I/71Yy8v17QyL.jpg', rating: 4.5, buyLink: 'https://amazon.in' },
    { id: '4', title: 'Banking Awareness Professional Guide', author: 'Arihant Experts', price: 210, category: 'Banking', image: 'https://m.media-amazon.com/images/I/51e3Z4mP32L._SX352_BO1,204,203,200_.jpg', rating: 4.6, buyLink: 'https://flipkart.com' },
    { id: '5', title: 'SSC Reasoning Strategy', author: 'Kiran Publication', price: 380, category: 'SSC', image: 'https://m.media-amazon.com/images/I/91u1L0HkLkL.jpg', rating: 4.7, buyLink: 'https://amazon.in' },
    { id: '6', title: 'Railway General Science Mega Guide', author: 'Speedy Publication', price: 150, category: 'Railway', image: 'https://m.media-amazon.com/images/I/81eR+rQk4+L.jpg', rating: 4.4, buyLink: 'https://amazon.in' },
  ];

  const categories = ['All', 'SSC', 'UPSC', 'Banking', 'Maths', 'GK'];

  const handlePurchase = async (book: BookItem) => {
    if (!auth.currentUser) {
        navigate('/auth');
        return;
    }

    if (!book.isDownloadable) {
        window.open(book.buyLink, '_blank');
        return;
    }

    if (!stripePromise) {
        alert('Stripe is not configured. Please add VITE_STRIPE_PUBLISHABLE_KEY in Project Settings.');
        return;
    }

    setLoading(book.id);
    try {
        const response = await fetch('/api/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                bookId: book.id,
                title: book.title,
                price: book.price,
                userId: auth.currentUser.uid,
            }),
        });

        const session = await response.json();
        
        if (session.error) {
            throw new Error(session.error);
        }

        const stripe = await stripePromise;
        if (stripe) {
            await (stripe as any).redirectToCheckout({ sessionId: session.id });
        }
    } catch (error: any) {
        console.error('Payment error:', error);
        alert(`Payment failed: ${error.message || 'Please check if your backend server is running and Stripe is configured.'}`);
    } finally {
        setLoading(null);
    }
  };

  const filteredBooks = activeCategory === 'All' 
    ? books 
    : books.filter(b => b.category === activeCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
                <h1 className="text-xl font-bold text-slate-800 tracking-tight">Exam Essentials</h1>
                <p className="text-xs text-slate-500 font-medium">Download digital copies or buy physical editions</p>
            </div>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 overflow-x-auto no-scrollbar">
            {categories.map(cat => (
                <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                        activeCategory === cat ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                    {cat}
                </button>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredBooks.map((book, idx) => (
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            key={book.id}
            className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
          >
            <div className="aspect-[3/4] relative overflow-hidden bg-slate-50 flex items-center justify-center p-6 border-b border-slate-100">
                <img 
                    src={book.image} 
                    alt={book.title}
                    className="w-full h-full object-contain filter drop-shadow-xl group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x400?text=Book+Cover';
                    }}
                />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-0.5 rounded-full border border-slate-200 flex items-center space-x-1">
                    <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                    <span className="text-[10px] font-bold text-slate-700">{book.rating}</span>
                </div>
                <div className="absolute top-3 right-3 bg-indigo-600 px-2 py-0.5 rounded text-[9px] font-black text-white uppercase tracking-widest">
                    {book.category || 'EXAM'}
                </div>
                {book.isDownloadable && (
                    <div className="absolute bottom-3 right-3 bg-emerald-600 px-2 py-1 rounded text-[8px] font-black text-white uppercase tracking-widest flex items-center gap-1">
                        <Download className="w-2.5 h-2.5" />
                        Digital Download
                    </div>
                )}
            </div>

            <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-sm font-bold text-slate-800 mb-1 line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors">
                    {book.title}
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-4">by {book.author || 'Success Team'}</p>
                
                <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex flex-col">
                        <span className="text-lg font-black text-slate-900 leading-none">₹{book.price}</span>
                        {(book.discountPrice || book.price + 150) && (
                            <span className="text-[10px] text-slate-400 font-bold line-through mt-1 font-mono">₹{book.discountPrice || book.price + 150}</span>
                        )}
                    </div>
                    <button 
                        onClick={() => handlePurchase(book)}
                        disabled={loading === book.id}
                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all shadow-md flex items-center gap-2 ${
                            book.isDownloadable 
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-100' 
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'
                        } disabled:opacity-50`}
                    >
                        {loading === book.id ? (
                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <span>{book.isDownloadable ? 'Download' : 'Buy Now'}</span>
                                {book.isDownloadable ? <Download className="w-3.5 h-3.5" /> : <ExternalLink className="w-3.5 h-3.5" />}
                            </>
                        )}
                    </button>
                </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-indigo-600 rounded-xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
             <ShoppingBag className="w-64 h-64" />
        </div>
        <div className="flex items-center gap-6 relative z-10">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                <Info className="w-7 h-7 text-white" />
            </div>
            <div>
                <h3 className="text-xl font-bold mb-1">Bulk Buy for Institutions?</h3>
                <p className="text-indigo-100 text-sm">Special discounts for libraries and coaching centers on multi-copy orders.</p>
            </div>
        </div>
        <button className="bg-white text-indigo-600 px-8 py-3 rounded-lg text-xs font-black uppercase tracking-tighter hover:bg-slate-50 transition-all relative z-10 shadow-xl">
            CONTACT SALES
        </button>
      </div>
    </div>
  );
}



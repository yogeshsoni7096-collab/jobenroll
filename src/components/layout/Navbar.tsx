import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { auth } from '../../lib/firebase';
import { Briefcase, BookOpen, Keyboard, User, LogOut, Menu, X, Book, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAdmin } from '../../hooks/useAdmin';

export default function Navbar() {
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  const navLinks = [
    { to: '/', icon: Briefcase, label: 'Jobs' },
    { to: '/quiz', icon: BookOpen, label: 'Quiz', protected: true },
    { to: '/typing', icon: Keyboard, label: 'Typing', protected: true },
    { to: '/books', icon: Book, label: 'Books', protected: true },
    { to: '/admin', icon: ShieldCheck, label: 'Admin', adminOnly: true },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 h-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between h-full items-center">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-sm"></div>
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-800">JOB<span className="text-indigo-600">ENROLL</span></span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center ml-10 space-x-6 text-sm font-medium text-slate-500 h-16">
              {navLinks.map((link) => (
                (!link.protected || user) && (!link.adminOnly || isAdmin) && (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center space-x-1 transition-colors h-full flex flex-col justify-center border-b-2 ${
                      location.pathname === link.to 
                        ? 'text-indigo-600 border-indigo-600' 
                        : 'text-slate-500 border-transparent hover:text-slate-800'
                    }`}
                  >
                    <div className="flex items-center space-x-1">
                      <link.icon className="w-4 h-4" />
                      <span>{link.label}</span>
                    </div>
                  </Link>
                )
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 text-xs font-semibold text-slate-600">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              LIVE UPDATES
            </div>

            {user ? (
              <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                <Link to="/dashboard" className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-slate-800">{user.displayName || user.email?.split('@')[0]}</p>
                  <p className="text-[10px] text-slate-400">Competitive Aspirant</p>
                </Link>
                <Link to="/dashboard" className="w-9 h-9 bg-slate-200 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-slate-500 overflow-hidden">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </Link>
                <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 transition-colors ml-1">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all shadow-sm"
              >
                Sign In
              </Link>
            )}

            <div className="md:hidden">
              <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-slate-600">
                {isOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-slate-200 overflow-hidden shadow-xl"
          >
            <div className="px-4 py-6 space-y-3">
              {navLinks.map((link) => (
                (!link.protected || user) && (!link.adminOnly || isAdmin) && (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center space-x-3 p-3 rounded-xl transition-all ${
                      location.pathname === link.to ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <link.icon className="w-5 h-5" />
                    <span>{link.label}</span>
                  </Link>
                )
              ))}
              {user ? (
                <Link
                  to="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-3 p-3 rounded-xl text-slate-600 hover:bg-slate-50"
                >
                  <User className="w-5 h-5" />
                  <span>Dashboard</span>
                </Link>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center bg-indigo-600 text-white p-3 rounded-xl font-bold"
                >
                  Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}


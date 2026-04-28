import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { Briefcase, Mail, Lock, LogIn, UserPlus, Chrome, User, Phone, Smartphone, CheckCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1); // 1: Info, 2: OTP, 3: Password
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otpMethod, setOtpMethod] = useState<'email' | 'phone'>('email');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const sendOtp = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          contact: otpMethod === 'email' ? email : phone,
          type: otpMethod 
        }),
      });
      const data = await response.json();
      if (data.success) {
        setOtpSent(true);
      } else {
        throw new Error(data.message);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    // In a real app, verify OTP here via backend
    if (otp !== '123456') { // Mock OTP
        setError('Invalid OTP. Use 123456 for testing.');
        return;
    }

    setLoading(true);
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-slate-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden"
      >
        <div className="p-8 pb-0 flex flex-col items-center">
            <div className={`p-3 rounded-xl mb-4 shadow-lg transition-colors ${isLogin ? 'bg-indigo-600 shadow-indigo-100' : 'bg-emerald-600 shadow-emerald-100'}`}>
                {isLogin ? <Briefcase className="w-8 h-8 text-white" /> : <UserPlus className="w-8 h-8 text-white" />}
            </div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                {isLogin ? 'Welcome Back' : 'Join JobEnroll'}
            </h2>
            <p className="text-slate-500 text-sm mt-1 font-medium">
                {isLogin ? 'Access your preparation dashboard' : 'Start your competitive journey today'}
            </p>
        </div>

        <div className="p-8">
          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-medium"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-medium"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {error && <p className="text-xs text-red-500 font-bold bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}

              <button
                disabled={loading}
                className="w-full bg-indigo-600 text-white p-3 rounded-lg font-bold flex items-center justify-center space-x-2 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 disabled:opacity-50 text-xs uppercase tracking-widest"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <span>Sign In</span>}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
                {/* Progress Bar */}
                <div className="flex items-center gap-2 mb-4">
                    {[1, 2, 3].map((s) => (
                        <div 
                            key={s} 
                            className={`h-1.5 flex-1 rounded-full transition-all ${step >= s ? 'bg-emerald-600' : 'bg-slate-100'}`}
                        />
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.form 
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-4"
                            onSubmit={(e) => { e.preventDefault(); setStep(2); }}
                        >
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        required
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm font-medium"
                                        placeholder="John Doe"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email ID (Username)</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="email"
                                        required
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm font-medium"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>
                            <button className="w-full bg-emerald-600 text-white p-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all text-xs uppercase tracking-widest">
                                <span>Continue</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </motion.form>
                    )}

                    {step === 2 && (
                        <motion.div 
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-4"
                        >
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center mb-4">Choose Verification Method</p>
                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={() => setOtpMethod('email')}
                                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${otpMethod === 'email' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-slate-50 border-slate-200 font-bold'}`}
                                >
                                    <Mail className="w-6 h-6" />
                                    <span className="text-[10px] font-bold">Email OTP</span>
                                </button>
                                <button 
                                    onClick={() => setOtpMethod('phone')}
                                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${otpMethod === 'phone' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-slate-50 border-slate-200 font-bold'}`}
                                >
                                    <Smartphone className="w-6 h-6" />
                                    <span className="text-[10px] font-bold">SMS OTP</span>
                                </button>
                            </div>

                            {otpMethod === 'phone' && (
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="tel"
                                            required
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm font-medium"
                                            placeholder="+91 00000 00000"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}

                            {!otpSent ? (
                                <button 
                                    onClick={sendOtp}
                                    className="w-full bg-emerald-600 text-white p-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 text-xs uppercase tracking-widest"
                                >
                                    {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <span>Send OTP</span>}
                                </button>
                            ) : (
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Enter 6-Digit OTP</label>
                                        <input
                                            type="text"
                                            maxLength={6}
                                            required
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-center text-lg font-bold tracking-[0.5em]"
                                            value={otp}
                                            placeholder="123456"
                                            onChange={(e) => setOtp(e.target.value)}
                                        />
                                    </div>
                                    <button 
                                        onClick={() => setStep(3)}
                                        className="w-full bg-emerald-600 text-white p-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 text-xs uppercase tracking-widest"
                                    >
                                        <span>Verify OTP</span>
                                    </button>
                                </div>
                            )}
                            
                            <button onClick={() => setStep(1)} className="w-full text-xs font-bold text-slate-400 hover:text-slate-600">Go Back</button>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.form 
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-4"
                            onSubmit={handleRegister}
                        >
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Create Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="password"
                                        required
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm font-medium"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Confirm Password</label>
                                <div className="relative">
                                    <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="password"
                                        required
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm font-medium"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            {error && <p className="text-xs text-red-500 font-bold bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}

                            <button 
                                type="submit"
                                disabled={loading}
                                className="w-full bg-emerald-600 text-white p-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 shadow-md shadow-emerald-100 text-xs uppercase tracking-widest"
                            >
                                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <span>Complete Registration</span>}
                            </button>
                            <button onClick={() => setStep(2)} className="w-full text-xs font-bold text-slate-400 hover:text-slate-600">Go Back</button>
                        </motion.form>
                    )}
                </AnimatePresence>
            </div>
          )}

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-black text-slate-400">
              <span className="bg-white px-3 tracking-widest">Or Fast Entry</span>
            </div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            className="flex items-center justify-center space-x-3 w-full p-2.5 border-2 border-slate-100 rounded-lg bg-white hover:bg-slate-50 transition-all font-bold text-slate-700 text-xs uppercase tracking-tight"
          >
            <Chrome className="w-4 h-4 text-indigo-600" />
            <span>Continue with Google</span>
          </button>

          <p className="mt-8 text-center text-xs text-slate-500 font-medium">
            {isLogin ? "New aspirant?" : "Already prepared?"}{' '}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setStep(1);
                setError('');
              }}
              className={`${isLogin ? 'text-indigo-600' : 'text-emerald-600'} font-bold hover:underline`}
            >
              {isLogin ? 'Register Now' : 'Log In'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

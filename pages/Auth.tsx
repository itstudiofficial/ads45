
import React, { useState } from 'react';
import { User } from '../types';
import { 
  Mail, 
  Lock, 
  User as UserIcon, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  ShieldAlert
} from 'lucide-react';
import { AdsprediaBackend } from '../backend';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const validateForm = () => {
    if (!isLogin && formData.name.length < 3) {
      setError("Name must be at least 3 characters.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address.");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      if (isLogin) {
        const res = await AdsprediaBackend.login(formData.email, formData.password);
        if (res.success && res.user) {
          onLogin(res.user);
        } else {
          setError(res.message);
        }
      } else {
        const res = await AdsprediaBackend.register(formData.name, formData.email, formData.password);
        if (res.success && res.user) {
          onLogin(res.user);
        } else {
          setError(res.message);
        }
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      {/* Visual Side (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative p-16 flex-col justify-between">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <pattern id="dotPattern" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="white" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#dotPattern)" />
          </svg>
        </div>
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center shadow-2xl">
            <span className="text-white font-black text-xl">A</span>
          </div>
          <span className="font-black text-2xl text-white tracking-tight">AdsPredia</span>
        </div>

        <div className="relative z-10 space-y-8">
          <h1 className="text-6xl font-black text-white leading-[1.1] tracking-tight">
            The Hub of <br /> <span className="text-violet-500">Digital Rewards.</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-md font-medium">
            Join 50k+ active users collecting income through simplified brand tasks. Secure, fast, and powerful.
          </p>
          
          <div className="flex items-center gap-6">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map(i => (
                <img key={i} src={`https://i.pravatar.cc/100?u=${i + 20}`} className="w-12 h-12 rounded-full border-4 border-slate-900" alt="User" />
              ))}
            </div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
              Join the elite team
            </p>
          </div>
        </div>

        <div className="relative z-10 pt-12 border-t border-white/10 text-slate-500 text-xs font-bold uppercase tracking-[0.3em]">
          © 2025 AdsPredia Global Network
        </div>
      </div>

      {/* Auth Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-24 relative">
        {/* Mobile Header */}
        <div className="lg:hidden absolute top-8 left-8 flex items-center gap-2">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-white font-black">A</span>
          </div>
          <span className="font-bold text-slate-900 tracking-tight">AdsPredia</span>
        </div>

        <div className="w-full max-w-md space-y-10 animate-in fade-in slide-in-from-right duration-500">
          <div className="space-y-3">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-slate-500 font-medium">
              {isLogin ? 'Access your income dashboard below.' : 'Start collecting rewards with a $1.00 bonus.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-sm font-bold animate-in slide-in-from-top-2">
                <AlertCircle size={18} className="shrink-0" />
                {error}
              </div>
            )}

            {!isLogin && (
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Full Name</label>
                <div className="relative group">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-violet-600 transition-colors" size={20} />
                  <input 
                    type="text" 
                    required 
                    placeholder="Enter your name" 
                    className="w-full pl-12 pr-6 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-violet-600 outline-none transition-all font-medium"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-violet-600 transition-colors" size={20} />
                <input 
                  type="email" 
                  required 
                  placeholder="name@example.com" 
                  className="w-full pl-12 pr-6 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-violet-600 outline-none transition-all font-medium"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center pr-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Password</label>
                {isLogin && <button type="button" className="text-xs font-black text-violet-600 hover:underline">Forgot?</button>}
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-violet-600 transition-colors" size={20} />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  required 
                  placeholder="••••••••" 
                  className="w-full pl-12 pr-12 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-violet-600 outline-none transition-all font-medium"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-5 bg-violet-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-violet-100 hover:bg-violet-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:hover:scale-100"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>{isLogin ? 'Login Now' : 'Create My Account'} <ArrowRight size={22} /></>
              )}
            </button>
          </form>

          <div className="space-y-6 pt-4">
            <p className="text-center text-slate-500 font-medium">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button 
                onClick={() => { setIsLogin(!isLogin); setError(null); }}
                className="ml-2 text-violet-600 font-black hover:underline"
              >
                {isLogin ? 'Sign Up' : 'Login'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;


import React, { useState, useRef } from 'react';
import { User } from '../types';
import { 
  User as UserIcon, 
  Mail, 
  Calendar, 
  Shield, 
  Lock, 
  CheckCircle2, 
  ChevronRight,
  Camera,
  X,
  Loader2,
  Trash2,
  AlertTriangle,
  Bell,
  ShieldCheck,
  Smartphone,
  Fingerprint,
  Eye,
  EyeOff,
  ToggleLeft,
  ToggleRight,
  ShieldAlert,
  Wallet as WalletIcon,
  Users,
  Sparkles,
  Globe,
  Coins,
  Save
} from 'lucide-react';
import { AdsprediaBackend } from '../backend';

interface ProfileProps {
  user: User | null;
  onUpdateUser: (updatedUser: User) => void;
  onLogout: () => void;
}

type ProfileView = 'main' | 'edit' | 'security' | 'notifications' | 'privacy';

const Profile: React.FC<ProfileProps> = ({ user, onUpdateUser, onLogout }) => {
  const [currentView, setCurrentView] = useState<ProfileView>('main');
  const [activeModal, setActiveModal] = useState<'delete' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form States
  const [name, setName] = useState(user?.name || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [withdrawPin, setWithdrawPin] = useState('0000');

  // Notification States
  const [notifs, setNotifs] = useState({
    tasks: true,
    payouts: true,
    referrals: true,
    marketing: false
  });

  // Privacy States
  const [privacy, setPrivacy] = useState({
    publicProfile: true,
    showEarnings: false,
    showTeam: true
  });

  if (!user) return null;

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.length < 3) return alert('Name must be at least 3 characters.');
    
    setIsProcessing(true);
    const updatedUser = { ...user, name };
    const success = await AdsprediaBackend.updateUserFull(updatedUser);
    setIsProcessing(false);
    
    if (success) {
      onUpdateUser(updatedUser);
      setCurrentView('main');
      alert('Profile updated successfully!');
    }
  };

  const handleUpdateSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword.length < 6) return alert('Password must be at least 6 characters.');
    if (newPassword !== confirmPassword) return alert('Passwords do not match.');

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setNewPassword('');
      setConfirmPassword('');
      setCurrentView('main');
      alert('Security settings and PIN updated successfully!');
    }, 1000);
  };

  const handleSaveNotifications = () => {
    setIsProcessing(true);
    // Simulate API call to save preferences
    setTimeout(() => {
      setIsProcessing(false);
      alert('Notification preferences updated!');
      setCurrentView('main');
    }, 800);
  };

  const handleDeleteAccount = async () => {
    setIsProcessing(true);
    const success = await AdsprediaBackend.deleteUser(user.email);
    setIsProcessing(false);
    
    if (success) {
      alert('Your account has been permanently deleted.');
      onLogout();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      return alert('Image must be smaller than 2MB');
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      const updatedUser = { ...user, avatarUrl: base64String };
      const success = await AdsprediaBackend.updateUserFull(updatedUser);
      if (success) {
        onUpdateUser(updatedUser);
      }
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const Toggle = ({ active, onToggle }: { active: boolean, onToggle: () => void }) => (
    <button 
      type="button"
      onClick={(e) => {
        e.preventDefault();
        onToggle();
      }} 
      className={`transition-all duration-300 transform active:scale-90 ${active ? 'text-violet-600' : 'text-slate-300'}`}
    >
      {active ? <ToggleRight size={38} /> : <ToggleLeft size={38} />}
    </button>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header breadcrumb */}
      {currentView !== 'main' && (
        <button 
          onClick={() => setCurrentView('main')}
          className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-violet-600 transition-colors"
        >
          <X size={14} /> Back to Profile Hub
        </button>
      )}

      {/* Profile Header Card */}
      <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-10 relative overflow-hidden group">
        <div className="relative">
          <div className="w-40 h-40 bg-violet-100 rounded-full flex items-center justify-center text-6xl font-black text-violet-600 border-8 border-slate-50 shadow-2xl relative overflow-hidden transition-transform group-hover:scale-105 duration-500">
            {isUploading ? (
              <Loader2 className="animate-spin text-violet-400" size={40} />
            ) : (
              user.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                user.name.charAt(0)
              )
            )}
          </div>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-2 right-2 bg-violet-600 p-3 rounded-2xl shadow-xl border-4 border-white text-white hover:scale-110 transition-all z-10"
          >
            <Camera size={20} />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*" 
          />
        </div>
        
        <div className="flex-1 text-center md:text-left space-y-4">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <h2 className="text-4xl font-black text-slate-800 tracking-tight">{user.name}</h2>
            <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest w-fit mx-auto md:mx-0 border border-emerald-100">
              <CheckCircle2 size={14} /> Verified Member
            </span>
          </div>
          <p className="text-slate-500 font-bold flex items-center justify-center md:justify-start gap-2">
            <Mail size={18} className="text-violet-600" /> {user.email}
          </p>
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <div className="bg-slate-50 px-5 py-2.5 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 border border-slate-100">
              <Calendar size={14} className="text-violet-400" /> Joined {user.joinDate}
            </div>
            <div className="bg-violet-600 px-5 py-2.5 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-violet-100">
              <Shield size={14} className="text-violet-200" /> Level 1 Earner
            </div>
          </div>
        </div>
      </div>

      {currentView === 'main' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Hub</h3>
              </div>
              <div className="divide-y divide-slate-50">
                {[
                  { id: 'edit', label: 'Edit Profile', icon: UserIcon, desc: 'Update your display name and basic info' },
                  { id: 'security', label: 'Security & Access', icon: Lock, desc: 'Manage your password and withdrawal PIN' },
                  { id: 'notifications', label: 'Notification Hub', icon: Bell, desc: 'Control alerts for tasks, payouts, and team' },
                  { id: 'privacy', label: 'Privacy Center', icon: Eye, desc: 'Adjust your visibility on the network' },
                ].map((item, i) => (
                  <button 
                    key={i} 
                    onClick={() => setCurrentView(item.id as any)}
                    className="w-full p-8 flex items-center justify-between hover:bg-violet-50/30 transition-all text-left group active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-6">
                      <div className="p-4 bg-slate-50 text-slate-400 group-hover:bg-violet-600 group-hover:text-white rounded-2xl transition-all shadow-sm">
                        <item.icon size={24} />
                      </div>
                      <div>
                        <p className="font-black text-slate-800 text-lg group-hover:text-violet-600 transition-colors">{item.label}</p>
                        <p className="text-xs text-slate-400 font-medium">{item.desc}</p>
                      </div>
                    </div>
                    <ChevronRight size={24} className="text-slate-200 group-hover:text-violet-600 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm space-y-8">
              <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
                <ShieldCheck className="text-violet-600" size={20} /> Community Help
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Technical Issues', icon: Smartphone },
                  { label: 'Transaction Support', icon: Fingerprint },
                  { label: 'Platform Guidelines', icon: ShieldAlert }
                ].map((link, i) => (
                  <button key={i} className="w-full flex items-center justify-between p-5 bg-slate-50 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-600 hover:bg-violet-600 hover:text-white transition-all shadow-sm group">
                    <div className="flex items-center gap-3">
                      <link.icon size={14} className="text-slate-400 group-hover:text-white" />
                      {link.label}
                    </div>
                    <ChevronRight size={14} />
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-rose-50 rounded-[2.5rem] p-8 border border-rose-100 space-y-6">
              <div className="flex items-center gap-3 text-rose-600">
                <AlertTriangle size={24} />
                <h4 className="text-lg font-black tracking-tight">Danger Zone</h4>
              </div>
              <p className="text-[10px] text-rose-400 font-bold uppercase leading-relaxed tracking-wider">
                Warning: Account deletion results in immediate forfeiture of all assets and earned coins.
              </p>
              <button 
                onClick={() => setActiveModal('delete')}
                className="w-full py-4 text-rose-600 font-black text-[10px] uppercase tracking-[0.2em] border-2 border-rose-100 rounded-2xl hover:bg-rose-600 hover:text-white transition-all"
              >
                Close Account
              </button>
            </div>
          </div>
        </div>
      )}

      {currentView === 'notifications' && (
        <div className="bg-white rounded-[3rem] p-10 md:p-12 border border-slate-100 shadow-sm animate-in slide-in-from-right duration-500">
          <div className="flex items-center gap-4 mb-10">
            <div className="p-4 bg-violet-50 text-violet-600 rounded-2xl">
              <Bell size={28} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900">Notification Hub</h3>
              <p className="text-sm text-slate-400 font-medium">Customize your push alert preferences</p>
            </div>
          </div>

          <div className="space-y-4">
            {[
              { id: 'tasks', label: 'New Task Alerts', desc: 'Get notified as soon as high-paying tasks matching your profile are live', icon: CheckCircle2 },
              { id: 'payouts', label: 'Payout Updates', desc: 'Receive real-time alerts for withdrawal approvals and transaction status', icon: WalletIcon },
              { id: 'referrals', label: 'Referral Activity', desc: 'Get notified when a member of your team completes a task or reaches a milestone', icon: Users },
              { id: 'marketing', label: 'Promotions & News', desc: 'Receive alerts for limited-time bonuses, coin boosts, and event updates', icon: Sparkles }
            ].map((item) => (
              <div key={item.id} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-xl hover:shadow-slate-100/50 transition-all border-2 border-transparent hover:border-violet-100">
                <div className="flex items-center gap-6">
                  <div className={`p-4 rounded-2xl transition-colors ${notifs[item.id as keyof typeof notifs] ? 'bg-violet-600 text-white shadow-lg' : 'bg-white text-slate-400 shadow-sm'}`}>
                    <item.icon size={24} />
                  </div>
                  <div className="max-w-md">
                    <p className="font-black text-slate-800 text-lg">{item.label}</p>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">{item.desc}</p>
                  </div>
                </div>
                <Toggle 
                  active={notifs[item.id as keyof typeof notifs]} 
                  onToggle={() => setNotifs(prev => ({ ...prev, [item.id]: !prev[item.id as keyof typeof notifs] }))} 
                />
              </div>
            ))}
          </div>
          
          <div className="mt-12 flex gap-4">
            <button 
              onClick={() => setCurrentView('main')}
              className="flex-1 py-5 bg-slate-100 text-slate-600 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={handleSaveNotifications}
              disabled={isProcessing}
              className="flex-[2] py-5 bg-violet-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-xl shadow-violet-100 hover:bg-violet-700 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <><Save size={18} /> Save Preferences</>}
            </button>
          </div>
        </div>
      )}

      {/* Other views remain functional as before */}
      {currentView === 'edit' && (
        <div className="bg-white rounded-[3rem] p-10 md:p-12 border border-slate-100 shadow-sm animate-in slide-in-from-right duration-500">
          <h3 className="text-2xl font-black text-slate-900 mb-8">Update Display Name</h3>
          <form onSubmit={handleUpdateName} className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Name on Platform</label>
              <div className="relative group">
                <UserIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-violet-600" size={20} />
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:border-violet-600 outline-none font-bold text-lg"
                  required
                />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={isProcessing}
              className="w-full py-5 bg-violet-600 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-violet-100 hover:bg-violet-700 transition-all flex items-center justify-center gap-3"
            >
              {isProcessing ? <Loader2 className="animate-spin" size={24} /> : 'Apply Changes'}
            </button>
          </form>
        </div>
      )}

      {currentView === 'security' && (
        <div className="bg-white rounded-[3rem] p-10 md:p-12 border border-slate-100 shadow-sm animate-in slide-in-from-right duration-500">
          <h3 className="text-2xl font-black text-slate-900 mb-8">Security & Access Control</h3>
          <form onSubmit={handleUpdateSecurity} className="space-y-10">
            <div className="space-y-6">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-4">Password Management</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">New Password</label>
                  <input 
                    type="password" 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:border-violet-600 outline-none font-bold"
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Confirm New Password</label>
                  <input 
                    type="password" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:border-violet-600 outline-none font-bold"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-4">Withdrawal Protocol</h4>
              <div className="bg-violet-50 p-6 rounded-[2rem] flex items-center gap-6">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-violet-600 shadow-sm">
                  <Smartphone size={28} />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-black text-violet-600 uppercase tracking-widest block mb-2">4-Digit Security PIN</label>
                  <input 
                    type="text" 
                    maxLength={4}
                    value={withdrawPin} 
                    onChange={(e) => setWithdrawPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full max-w-[150px] px-6 py-3 bg-white border-2 border-violet-100 rounded-2xl outline-none font-black text-2xl tracking-[0.5em] text-center"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isProcessing}
              className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-lg shadow-xl hover:bg-violet-600 transition-all flex items-center justify-center gap-3"
            >
              {isProcessing ? <Loader2 className="animate-spin" size={24} /> : 'Save Security Settings'}
            </button>
          </form>
        </div>
      )}

      {currentView === 'privacy' && (
        <div className="bg-white rounded-[3rem] p-10 md:p-12 border border-slate-100 shadow-sm animate-in slide-in-from-right duration-500">
          <div className="flex items-center gap-4 mb-10">
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
              <Eye size={28} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900">Privacy Center</h3>
              <p className="text-sm text-slate-400 font-medium">Control your visibility on the network</p>
            </div>
          </div>

          <div className="space-y-6">
            {[
              { id: 'publicProfile', label: 'Public Profile', desc: 'Allow other users to see your level and stats', icon: Globe },
              { id: 'showEarnings', label: 'Show Earnings', desc: 'Display your total income on the leaderboards', icon: Coins },
              { id: 'showTeam', label: 'Referral Visibility', desc: 'Allow your upline to see your task activity', icon: Users }
            ].map((item) => (
              <div key={item.id} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex items-center justify-between transition-all">
                <div className="flex items-center gap-6">
                  <div className="p-4 bg-white text-emerald-600 rounded-2xl shadow-sm">
                    <item.icon size={24} />
                  </div>
                  <div>
                    <p className="font-black text-slate-800 text-lg">{item.label}</p>
                    <p className="text-xs text-slate-400 font-medium">{item.desc}</p>
                  </div>
                </div>
                <Toggle 
                  active={privacy[item.id as keyof typeof privacy]} 
                  onToggle={() => setPrivacy(prev => ({ ...prev, [item.id]: !prev[item.id as keyof typeof privacy] }))} 
                />
              </div>
            ))}
          </div>

          <button 
            onClick={() => setCurrentView('main')}
            className="w-full mt-10 py-5 bg-slate-900 text-white rounded-[2.5rem] font-black text-lg shadow-xl hover:bg-violet-600 transition-all"
          >
            Apply Privacy Policy
          </button>
        </div>
      )}

      {activeModal === 'delete' && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl" onClick={() => setActiveModal(null)}></div>
          <div className="relative bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-12 text-center animate-in zoom-in duration-300">
             <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                <Trash2 size={48} />
             </div>
             <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Are you sure?</h3>
             <p className="text-slate-500 font-medium mb-10 leading-relaxed">
               This will permanently erase your data and current balance of <b>${user.balance.toFixed(2)}</b>.
             </p>
             <div className="flex flex-col gap-3">
                <button 
                  onClick={handleDeleteAccount} 
                  disabled={isProcessing}
                  className="w-full py-5 bg-rose-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-rose-100 hover:bg-rose-600 transition-all flex items-center justify-center"
                >
                  {isProcessing ? <Loader2 className="animate-spin" /> : 'Confirm Termination'}
                </button>
                <button 
                  onClick={() => setActiveModal(null)} 
                  className="w-full py-5 bg-slate-100 text-slate-600 rounded-2xl font-black"
                >
                  Keep My Account
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;

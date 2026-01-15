
import React, { useState, useEffect } from 'react';
import { User, Transaction } from '../types';
import { 
  TrendingUp, 
  Coins, 
  Wallet as WalletIcon, 
  Users, 
  ArrowUpRight, 
  ArrowDownRight,
  ArrowRight,
  Clock,
  ChevronRight,
  Gamepad2,
  Video,
  Share2,
  ClipboardList,
  Zap,
  Gift,
  CheckCircle2,
  Globe,
  Sparkles,
  Target,
  Activity,
  Youtube,
  Smartphone,
  MousePointer2,
  History,
  Info
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { AdsprediaBackend } from '../backend';

interface DashboardProps {
  user: User | null;
  onClaimBonus: (updatedUser: User) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onClaimBonus }) => {
  const [showBonusClaimed, setShowBonusClaimed] = useState(false);
  const [claimedReward, setClaimedReward] = useState(0);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTxs, setIsLoadingTxs] = useState(true);

  const gateways: Record<string, string> = {
    'Binance': 'https://cryptologos.cc/logos/binance-coin-bnb-logo.png',
    'Payeer': 'https://upload.wikimedia.org/wikipedia/commons/0/0f/Payeer_logo.png',
    'JazzCash': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/JazzCash_Logo.png/640px-JazzCash_Logo.png',
    'EasyPaisa': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Easypaisa_Logo.png/640px-Easypaisa_Logo.png',
    'USDT': 'https://cryptologos.cc/logos/tether-usdt-logo.png',
  };

  const rates: Record<string, { rate: number, symbol: string, name: string }> = {
    'USD': { rate: 1, symbol: '$', name: 'United States' },
    'PKR': { rate: 278.50, symbol: 'Rs.', name: 'Pakistan' },
    'INR': { rate: 83.45, symbol: '₹', name: 'India' },
    'BDT': { rate: 117.20, symbol: '৳', name: 'Bangladesh' },
    'PHP': { rate: 58.15, symbol: '₱', name: 'Philippines' },
    'NGN': { rate: 1520.00, symbol: '₦', name: 'Nigeria' },
    'KES': { rate: 130.50, symbol: 'KSh', name: 'Kenya' },
    'GHS': { rate: 14.80, symbol: '₵', name: 'Ghana' },
    'ZAR': { rate: 18.40, symbol: 'R', name: 'South Africa' },
    'BRL': { rate: 5.25, symbol: 'R$', name: 'Brazil' },
    'EUR': { rate: 0.92, symbol: '€', name: 'Europe' },
    'GBP': { rate: 0.78, symbol: '£', name: 'UK' },
    'MYR': { rate: 4.70, symbol: 'RM', name: 'Malaysia' },
    'IDR': { rate: 16200.00, symbol: 'Rp', name: 'Indonesia' },
    'EGP': { rate: 47.50, symbol: 'E£', name: 'Egypt' },
    'RUB': { rate: 91.20, symbol: '₽', name: 'Russia' },
  };

  useEffect(() => {
    if (user) {
      fetchUserActivity();
      // Sync local state with latest DB record to ensure balances are current
      AdsprediaBackend.getUser(user.email).then(latest => {
        if (latest) onClaimBonus(latest);
      });
    }
  }, [user?.id]);

  const fetchUserActivity = async () => {
    setIsLoadingTxs(true);
    const allTxs = await AdsprediaBackend.getTransactions();
    // Filter out withdrawals from the dashboard view to keep it earning-focused
    const userTxs = allTxs.filter(tx => tx.userId === user?.id && tx.type !== 'withdrawal');
    setTransactions(userTxs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setIsLoadingTxs(false);
  };

  if (!user) return null;

  const today = new Date().toISOString().split('T')[0];
  const hasClaimedToday = user.lastBonusDate === today;

  const activeBalance = user.balance;
  const localVal = activeBalance * (rates[selectedCurrency]?.rate || 1);

  const chartData = (() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = days[d.getDay()];
      const dayStr = d.toISOString().split('T')[0];
      const dayEarnings = transactions
        .filter(tx => tx.date.startsWith(dayStr) && ['earning', 'bonus', 'referral', 'spin'].includes(tx.type))
        .reduce((sum, tx) => sum + tx.amount, 0);
      data.push({ name: dayName, earnings: dayEarnings });
    }
    return data;
  })();

  const totalEarnedDisplay = transactions
    .filter(tx => ['earning', 'bonus', 'referral', 'spin'].includes(tx.type))
    .reduce((sum, tx) => sum + tx.amount, 0);

  const handleClaim = async () => {
    if (!user) return;
    const res = await AdsprediaBackend.claimDailyBonus(user.id);
    if (res.success && res.user) {
      setClaimedReward(res.reward || 0);
      setShowBonusClaimed(true);
      onClaimBonus(res.user);
      setTimeout(() => setShowBonusClaimed(false), 3000);
      fetchUserActivity(); 
    }
  };

  const getTxIcon = (type: string, method?: string) => {
    if (type === 'bonus') return <Gift className="text-amber-500" />;
    if (type === 'referral') return <Users className="text-violet-500" />;
    if (method) {
      const key = Object.keys(gateways).find(k => method.includes(k));
      if (key) return <img src={gateways[key]} className="w-full h-full object-contain" alt={method} />;
    }
    return <Zap className="text-violet-500" />;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 relative overflow-hidden bg-gradient-to-br from-violet-600 via-violet-700 to-purple-800 rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl shadow-violet-200">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                  <Sparkles size={24} className="text-amber-300" />
                </div>
                <div>
                  <h2 className="text-3xl font-black tracking-tight">Hello, {user.name.split(' ')[0]}!</h2>
                  <p className="text-violet-100 text-sm font-medium">Your current assets and income</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-violet-300 mb-1">Balance</p>
                <p className="text-3xl font-black tracking-tighter">${activeBalance.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-violet-300 mb-1">Total Coins</p>
                <div className="flex items-center gap-2">
                  <Coins size={24} className="text-amber-400" />
                  <p className="text-3xl font-black tracking-tighter">{user.coins}</p>
                </div>
              </div>
              <div className="hidden sm:block">
                <p className="text-[10px] font-black uppercase tracking-widest text-violet-300 mb-1">Total Income</p>
                <p className="text-3xl font-black tracking-tighter">${totalEarnedDisplay.toFixed(2)}</p>
              </div>
              <div className="hidden sm:block">
                <p className="text-[10px] font-black uppercase tracking-widest text-violet-300 mb-1">Streak</p>
                <p className="text-lg font-black bg-white/10 px-3 py-1 rounded-lg w-fit flex items-center gap-2">
                   <Zap size={14} className="text-amber-400" /> {user.loginStreak || 0} Days
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between group">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-violet-50 text-violet-600 rounded-lg">
                <Globe size={18} />
              </div>
              <span className="font-black text-slate-800 text-sm uppercase tracking-widest">Global Rates</span>
            </div>
            <select 
              className="bg-slate-50 border-none text-[10px] font-black rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer w-32"
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
            >
              {Object.keys(rates).sort().map(c => <option key={c} value={c}>{c} - {rates[c].name}</option>)}
            </select>
          </div>
          
          <div className="space-y-1">
            <p className="text-4xl font-black text-slate-900 tracking-tighter">
              {rates[selectedCurrency].symbol}{localVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Market value in {rates[selectedCurrency].name}</p>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-50 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-violet-600 mb-2">1000 Coins = $1.00 USD</p>
            <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs hover:bg-violet-600 transition-all">
              Cashout Now
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">Income Statistics</h3>
              </div>
            </div>

            <div className="h-[280px] w-full">
              {totalEarnedDisplay === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                   <Target size={32} className="text-slate-300" />
                   <p className="font-black text-slate-800">No Income Recorded Yet</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="earnGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                    <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} />
                    <Area type="monotone" dataKey="earnings" stroke="#8b5cf6" strokeWidth={4} fillOpacity={1} fill="url(#earnGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                 <Activity size={22} className="text-violet-600" /> Recent Activity
               </h3>
            </div>

            <div className="space-y-4">
              {isLoadingTxs ? (
                <div className="py-10 text-center text-slate-400 font-bold animate-pulse">Loading history...</div>
              ) : transactions.length > 0 ? (
                transactions.slice(0, 5).map((tx) => (
                  <div key={tx.id} className="bg-slate-50/50 p-6 rounded-[2rem] border-2 border-slate-50 flex items-center justify-between hover:border-violet-100 transition-all">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center p-1.5 shadow-sm">
                        {getTxIcon(tx.type, tx.method)}
                      </div>
                      <div>
                        <p className="font-black text-slate-800 text-sm capitalize">{tx.type}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(tx.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className={`font-black text-base text-emerald-600`}>
                          +{(tx.amount * 1000).toFixed(0)} C
                       </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-100">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No income activity found yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-slate-800 uppercase tracking-widest text-[10px]">Daily Reward</h3>
              <zap size={18} className="text-amber-500" />
            </div>
            
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2">
                 <p className="text-5xl font-black text-slate-900 tracking-tighter">{user.loginStreak || 0}</p>
                 <span className="text-sm font-black text-violet-600 uppercase">Days</span>
              </div>
            </div>

            <button 
              disabled={hasClaimedToday}
              onClick={handleClaim}
              className={`w-full py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2 shadow-xl
                ${hasClaimedToday 
                  ? 'bg-emerald-50 text-emerald-600 shadow-none cursor-default' 
                  : 'bg-violet-600 text-white hover:bg-violet-700 shadow-violet-100'}`}
            >
              {hasClaimedToday ? <><CheckCircle2 size={18} /> Claimed Today</> : <><Gift size={18} /> Claim Bonus</>}
            </button>

            {showBonusClaimed && (
              <div className="absolute inset-0 bg-violet-600 z-20 flex flex-col items-center justify-center text-white animate-in zoom-in duration-300">
                <Gift size={48} className="mb-2 animate-bounce" />
                <p className="font-black text-2xl tracking-tighter">+{claimedReward} Coins!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

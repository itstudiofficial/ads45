
import React, { useState, useEffect } from 'react';
import { User, Transaction } from '../types';
import { 
  CreditCard, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  History, 
  Smartphone,
  ShieldCheck,
  ChevronRight, 
  ArrowRight, 
  Info,
  CheckCircle2,
  Zap,
  Loader2,
  Globe,
  Coins,
  Hash,
  Activity,
  Copy,
  AlertCircle,
  DollarSign
} from 'lucide-react';
import { AdsprediaBackend } from '../backend';

interface WalletProps {
  user: User | null;
  onDeposit: (amount: number) => void;
}

const Wallet: React.FC<WalletProps> = ({ user, onDeposit }) => {
  const [activeTab, setActiveTab] = useState<'withdraw' | 'deposit' | 'history'>('withdraw');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState<Transaction[]>([]);

  useEffect(() => {
    fetchHistory();
  }, [user, activeTab]);

  const fetchHistory = async () => {
    if (!user) return;
    const txs = await AdsprediaBackend.getTransactions();
    // Only show transactions for current user
    setHistory(txs.filter(t => t.userId === user.id).reverse());
  };

  if (!user) return null;

  const exchangeRates = [
    { country: 'Pakistan', currency: 'PKR', rate: 278.50, flag: '🇵🇰' },
    { country: 'India', currency: 'INR', rate: 83.45, flag: '🇮🇳' },
    { country: 'Nigeria', currency: 'NGN', rate: 1520.00, flag: '🇳🇬' },
    { country: 'Bangladesh', currency: 'BDT', rate: 117.20, flag: '🇧🇩' },
    { country: 'Philippines', currency: 'PHP', rate: 58.15, flag: '🇵🇭' },
    { country: 'Kenya', currency: 'KES', rate: 130.50, flag: '🇰🇪' },
    { country: 'Ghana', currency: 'GHS', rate: 14.80, flag: '🇬🇭' },
    { country: 'South Africa', currency: 'ZAR', rate: 18.40, flag: '🇿🇦' },
    { country: 'Malaysia', currency: 'MYR', rate: 4.70, flag: '🇲🇾' },
    { country: 'Indonesia', currency: 'IDR', rate: 16200.0, flag: '🇮🇩' },
    { country: 'Russia', currency: 'RUB', rate: 91.20, flag: '🇷🇺' },
    { country: 'Egypt', currency: 'EGP', rate: 47.50, flag: '🇪🇬' },
  ];

  const withdrawMethods = [
    { 
      name: 'EasyPaisa', 
      icon: <Smartphone className="text-emerald-500" size={32} />, 
      placeholder: 'Mobile Number (03xxxxxxxxx)',
      color: 'bg-emerald-50 text-emerald-600'
    },
    { 
      name: 'JazzCash', 
      icon: <Smartphone className="text-amber-500" size={32} />, 
      placeholder: 'Mobile Number (03xxxxxxxxx)',
      color: 'bg-amber-50 text-amber-600'
    },
    { 
      name: 'Payeer', 
      icon: <Globe className="text-blue-500" size={32} />, 
      placeholder: 'Account ID (P10xxxxxx)',
      color: 'bg-blue-50 text-blue-600'
    },
    { 
      name: 'Binance (USDT)', 
      icon: <Zap className="text-orange-500" size={32} />, 
      placeholder: 'BEP20 Address (e.g. 0x...)',
      color: 'bg-orange-50 text-orange-600'
    },
  ];

  const depositMethods = [
    { name: 'EasyPaisa', address: '03338182116', holder: 'AdsPredia Global', icon: <Smartphone size={28}/>, color: 'bg-emerald-50 text-emerald-600' },
    { name: 'JazzCash', address: '03069552023', holder: 'AdsPredia Global', icon: <Smartphone size={28}/>, color: 'bg-amber-50 text-amber-600' },
    { name: 'Payeer', address: 'P1061557241', holder: 'Platform Master', icon: <Globe size={28}/>, color: 'bg-blue-50 text-blue-600' },
    { name: 'USDT (TRC20)', address: 'TWFfb9ewKRbtSz8qTitr2fJpyRPQWtKj2U', holder: 'Adspredia_Cold_Wallet', icon: <Coins size={28}/>, color: 'bg-emerald-50 text-emerald-700' },
  ];

  const handleConfirmWithdrawal = async () => {
    if (!amount || parseFloat(amount) < 3) return alert('Minimum withdrawal is $3.00');
    if (parseFloat(amount) > user.balance) return alert('Insufficient balance!');
    if (!method) return alert('Please select a withdrawal method');
    
    setIsProcessing(true);
    await AdsprediaBackend.createTransaction(user.id, 'withdrawal', parseFloat(amount), method, 'pending', accountNumber, accountName);
    setIsProcessing(false);
    alert(`Withdrawal request submitted! Payouts take 24-48 hours.`);
    setAmount('');
    setAccountNumber('');
    fetchHistory();
  };

  const handleConfirmDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) return alert('Enter a valid deposit amount');
    if (!method) return alert('Please select a deposit method');
    if (!accountNumber) return alert('Please enter your Transaction ID (TID) for verification');

    setIsProcessing(true);
    await AdsprediaBackend.createTransaction(user.id, 'deposit', parseFloat(amount), method, 'pending', accountNumber, accountName);
    setIsProcessing(false);
    alert(`Deposit of $${amount} submitted for verification! Your balance will update once confirmed.`);
    setAmount('');
    setAccountNumber('');
    setMethod('');
    fetchHistory();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Address copied to clipboard!');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom duration-500 pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Asset Card & Global Rates */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl border border-white/5">
            <div className="relative z-10">
              <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                <ShieldCheck size={14} className="text-violet-400" /> Wallet Liquidity
              </p>
              <h2 className="text-5xl font-black tracking-tighter">${user.balance.toFixed(2)}</h2>
              <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Audit Status</p>
                  <p className="text-sm font-bold text-emerald-400 flex items-center gap-1.5"><CheckCircle2 size={14}/> Verified Assets</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Internal Credits</p>
                  <p className="text-sm font-bold text-amber-400">{user.coins} C</p>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
            <h3 className="text-lg font-black text-slate-800 tracking-tight mb-6 flex items-center gap-2">
              <Globe size={20} className="text-violet-600" /> Real-time Valuations
            </h3>
            <div className="space-y-4 max-h-[380px] overflow-y-auto custom-scrollbar pr-2">
              {exchangeRates.map((item) => (
                <div key={item.currency} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-slate-100 transition-all">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{item.flag}</span>
                    <div className="flex flex-col">
                      <p className="text-xs font-black text-slate-800">{item.country}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{item.currency}</p>
                    </div>
                  </div>
                  <p className="text-sm font-black text-violet-600">{(item.rate * user.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Main Operations */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden h-full flex flex-col">
            <div className="flex border-b bg-slate-50/50">
              {[
                { id: 'withdraw', label: 'Cashout', icon: ArrowUpCircle },
                { id: 'deposit', label: 'Fund Wallet', icon: ArrowDownCircle },
                { id: 'history', label: 'Ledger', icon: History },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id as any); setMethod(''); setAmount(''); setAccountNumber(''); }}
                  className={`flex-1 py-6 flex items-center justify-center gap-2 font-black transition-all border-b-4 
                    ${activeTab === tab.id ? 'text-violet-600 border-violet-600 bg-white' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                >
                  <tab.icon size={20} />
                  <span className="text-[10px] uppercase tracking-[0.2em]">{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="p-8 flex-1">
              {activeTab === 'withdraw' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <div className="grid grid-cols-2 gap-4">
                    {withdrawMethods.map((m) => (
                      <button
                        key={m.name}
                        onClick={() => setMethod(m.name)}
                        className={`p-6 rounded-[2rem] border-2 transition-all text-center flex flex-col items-center gap-4
                          ${method === m.name ? 'border-violet-600 bg-violet-50' : 'border-slate-100 bg-slate-50 hover:border-slate-200'}`}
                      >
                        <div className={`p-4 rounded-2xl ${m.color}`}>{m.icon}</div>
                        <span className="text-[10px] font-black uppercase tracking-widest">{m.name}</span>
                      </button>
                    ))}
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Amount ($)</label>
                        <div className="relative">
                          {/* Fixed: Use imported DollarSign icon */}
                          <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input type="number" className="w-full pl-12 pr-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-3xl font-black text-xl focus:border-violet-600 outline-none transition-all" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Target Account</label>
                        <input type="text" className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-3xl font-bold focus:border-violet-600 outline-none transition-all" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} placeholder={method ? withdrawMethods.find(m => m.name === method)?.placeholder : 'Select method first'} />
                      </div>
                    </div>
                    <button 
                      onClick={handleConfirmWithdrawal} 
                      disabled={isProcessing}
                      className="w-full py-5 bg-violet-600 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-violet-100 hover:bg-violet-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {isProcessing ? <Loader2 className="animate-spin" size={24}/> : 'Request Payout'}
                    </button>
                    <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                      <AlertCircle size={12}/> Minimum cashout $3.00 | Fee: 0%
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'deposit' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                   <div className="bg-violet-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                      <div className="relative z-10 space-y-4">
                        <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                           <ShieldCheck size={24} className="text-amber-300" /> Secure Funding Flow
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                           <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                              <p className="text-[10px] font-black text-violet-200 uppercase tracking-widest mb-1">Step 1</p>
                              <p className="text-xs font-bold leading-relaxed">Choose your preferred local or crypto method below.</p>
                           </div>
                           <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                              <p className="text-[10px] font-black text-violet-200 uppercase tracking-widest mb-1">Step 2</p>
                              <p className="text-xs font-bold leading-relaxed">Transfer funds to the displayed address/number.</p>
                           </div>
                           <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                              <p className="text-[10px] font-black text-violet-200 uppercase tracking-widest mb-1">Step 3</p>
                              <p className="text-xs font-bold leading-relaxed">Submit the TID and amount for verification.</p>
                           </div>
                        </div>
                      </div>
                      <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                   </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {depositMethods.map((m) => (
                      <div 
                        key={m.name} 
                        onClick={() => setMethod(m.name)}
                        className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center justify-center gap-4 cursor-pointer relative group
                          ${method === m.name ? 'bg-violet-50 border-violet-600' : 'bg-white border-slate-100 hover:border-slate-200'}`}
                      >
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${m.color} shadow-sm group-hover:scale-110 transition-transform`}>
                          {m.icon}
                        </div>
                        <div className="text-center">
                          <p className="font-black text-slate-800 text-sm uppercase tracking-tight">{m.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 mt-0.5">{m.holder}</p>
                        </div>
                        
                        {method === m.name && (
                           <div className="w-full mt-4 space-y-3 animate-in fade-in duration-300">
                             <div className="p-4 bg-white rounded-xl border border-violet-100 text-center font-mono font-bold text-sm text-violet-600 break-all select-all">
                                {m.address}
                             </div>
                             <button 
                                onClick={(e) => { e.stopPropagation(); copyToClipboard(m.address); }}
                                className="w-full py-2.5 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-violet-600 transition-all"
                             >
                               <Copy size={14}/> Copy Details
                             </button>
                           </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {method && (
                    <div className="space-y-6 pt-6 animate-in slide-in-from-top-4 duration-500 border-t border-slate-100">
                      <div className="flex items-center gap-2 mb-2">
                         <div className="w-8 h-8 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center">
                            <Hash size={18}/>
                         </div>
                         <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">Deposit Proof Submission</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Exact Amount Sent ($)</label>
                          <div className="relative">
                            {/* Fixed: Use imported DollarSign icon */}
                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input type="number" className="w-full pl-12 pr-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-3xl font-black text-xl focus:border-violet-600 outline-none transition-all" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Transaction ID (TID)</label>
                          <input type="text" className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-3xl font-bold focus:border-violet-600 outline-none transition-all" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} placeholder="Enter ID from receipt" />
                        </div>
                      </div>
                      <button 
                        onClick={handleConfirmDeposit} 
                        disabled={isProcessing || !amount || !accountNumber}
                        className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-lg shadow-xl hover:bg-violet-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                      >
                        {isProcessing ? <Loader2 className="animate-spin" size={24}/> : 'Verify & Fund Wallet'}
                      </button>
                      <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">Balance updates instantly after admin audit (max 12h)</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'history' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  {history.length > 0 ? history.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-6 rounded-[2.5rem] border-2 border-slate-50 bg-slate-50/30 group hover:border-violet-100 hover:bg-white transition-all">
                      <div className="flex items-center gap-5">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                          tx.type === 'deposit' ? 'bg-emerald-50 text-emerald-600' : 
                          tx.type === 'withdrawal' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'
                        }`}>
                          {tx.type === 'deposit' ? <ArrowDownCircle size={24}/> : <ArrowUpCircle size={24}/>}
                        </div>
                        <div>
                          <p className="font-black text-slate-800 text-lg capitalize">{tx.type} <span className="text-slate-400 font-medium text-sm">via {tx.method}</span></p>
                          <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">
                            {new Date(tx.date).toLocaleDateString()} • {new Date(tx.date).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-black text-xl ${tx.type === 'deposit' || tx.type === 'earning' || tx.type === 'bonus' ? 'text-emerald-600' : 'text-rose-500'}`}>
                          {tx.type === 'deposit' || tx.type === 'earning' || tx.type === 'bonus' ? '+' : '-'}${tx.amount.toFixed(2)}
                        </p>
                        <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full mt-2 inline-block ${
                          tx.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 
                          tx.status === 'pending' ? 'bg-amber-100 text-amber-700 animate-pulse' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  )) : (
                    <div className="flex flex-col items-center justify-center py-32 text-center">
                       <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-200 mb-6">
                          <History size={48}/>
                       </div>
                       <h4 className="text-xl font-black text-slate-800 mb-2">Ledger is empty</h4>
                       <p className="text-slate-400 text-sm max-w-[280px] font-medium leading-relaxed">
                          Your transaction history is currently clear. Complete tasks or fund your wallet to see activity here.
                       </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;


import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Wallet, 
  ClipboardList, 
  ShieldCheck, 
  Search, 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  DollarSign,
  TrendingUp,
  BarChart3,
  MoreVertical,
  Filter,
  CreditCard,
  Smartphone,
  Play,
  Pause,
  Trash2,
  ExternalLink,
  ShieldAlert,
  UserPlus,
  ArrowLeftRight,
  Shield,
  X,
  AlertTriangle,
  Loader2,
  Calendar,
  AlertCircle,
  Flag,
  Palette,
  ImageIcon,
  Type,
  Plus,
  Archive,
  Settings as SettingsIcon,
  Globe,
  Layout as LayoutIcon,
  Edit,
  Mail,
  Coins,
  Link as LinkIcon,
  Zap,
  ToggleRight,
  ToggleLeft,
  Activity,
  CheckCircle
} from 'lucide-react';
import { User, Transaction, Task, TaskCategory } from '../types';
import { AdsprediaBackend, BrandingSettings } from '../backend';

interface ExtendedUser extends User {
  deposits: number;
  withdrawals: number;
  tasksCreated: number;
}

const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'withdrawals' | 'deposits' | 'campaigns' | 'settings'>('overview');
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [branding, setBranding] = useState<BrandingSettings>({ logoUrl: '', heroBannerUrl: '', siteName: 'Adspredia' });
  const [stats, setStats] = useState({ totalUsers: 0, totalPayouts: 0, pendingWithdrawals: 0, totalDeposits: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    category: TaskCategory.YOUTUBE,
    description: '',
    reward: 50,
    instructions: [''],
    link: '',
    limit: 1000,
    autoApprove: true
  });

  const [editUser, setEditUser] = useState<ExtendedUser | null>(null);
  const [userForm, setUserForm] = useState({
    name: '',
    balance: 0,
    coins: 0,
    role: 'user' as User['role']
  });

  const [processingTxId, setProcessingTxId] = useState<string | null>(null);
  const [isActioning, setIsActioning] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [allUsers, allTxs, allTasks, platformStats, currentBranding] = await Promise.all([
        AdsprediaBackend.getAllUsers(),
        AdsprediaBackend.getTransactions(),
        AdsprediaBackend.getTasks(),
        AdsprediaBackend.getPlatformStats(),
        AdsprediaBackend.getBranding()
      ]);
      
      const extendedUsers = allUsers.map(u => {
        const userTxs = allTxs.filter(tx => tx.userId === u.id && tx.status === 'completed');
        const deposits = userTxs.filter(tx => tx.type === 'deposit').reduce((sum, tx) => sum + tx.amount, 0);
        const withdrawals = userTxs.filter(tx => tx.type === 'withdrawal').reduce((sum, tx) => sum + tx.amount, 0);
        const createdTasksCount = allTasks.filter(t => t.creatorId === u.id).length;
        return { ...u, deposits, withdrawals, tasksCreated: createdTasksCount };
      });

      setUsers([...extendedUsers].sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime()));
      setTransactions(allTxs);
      setTasks(allTasks);
      setStats(platformStats);
      setBranding(currentBranding);
    } catch (err) {
      console.error("Admin fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsActioning(true);
    await AdsprediaBackend.updateBranding(branding);
    setIsActioning(false);
    alert('Branding updated successfully!');
    fetchData();
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.link.startsWith('http')) return alert('Valid URL required');
    if (!taskForm.title || !taskForm.description) return alert('Title and description required');
    
    setIsActioning(true);
    const newTask: Task = {
      id: 'admin_t_' + Date.now(),
      title: taskForm.title,
      category: taskForm.category,
      description: taskForm.description,
      reward: taskForm.reward,
      instructions: taskForm.instructions.filter(i => i.trim() !== ''),
      status: 'available',
      creatorId: 'admin_root',
      completions: 0,
      limit: taskForm.limit,
      link: taskForm.link,
      autoApprove: taskForm.autoApprove
    };
    await AdsprediaBackend.saveTask(newTask);
    setIsActioning(false);
    setShowCreateTask(false);
    setTaskForm({ title: '', category: TaskCategory.YOUTUBE, description: '', reward: 50, instructions: [''], link: '', limit: 1000, autoApprove: true });
    fetchData();
  };

  const handleUserUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    setIsActioning(true);
    const success = await AdsprediaBackend.updateUserFull({ ...editUser, ...userForm });
    setIsActioning(false);
    if (success) { setEditUser(null); fetchData(); }
  };

  const handleProcessTransaction = async (txId: string, status: Transaction['status']) => {
    if (!window.confirm(`Confirm marking this transaction as ${status.toUpperCase()}?`)) return;
    
    setProcessingTxId(txId);
    try {
      const success = await AdsprediaBackend.updateTransactionStatus(txId, status);
      if (success) {
        // Force an immediate re-fetch to update all tables and counts
        await fetchData();
      } else {
        alert("Action failed. The transaction might have been processed by another session.");
      }
    } catch (err) {
      console.error("Transaction processing error:", err);
      alert("Error processing transaction.");
    } finally {
      setProcessingTxId(null);
    }
  };

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredTasks = tasks.filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()));
  
  // Explicit filtering for the tables based on latest fetched transactions
  const pendingDeposits = transactions.filter(t => t.type === 'deposit' && t.status === 'pending');
  const pendingWithdrawals = transactions.filter(t => t.type === 'withdrawal' && t.status === 'pending');

  if (isLoading && transactions.length === 0) return <div className="flex items-center justify-center h-[60vh]"><Loader2 className="animate-spin text-violet-600" size={48} /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Admin Engine</h1>
          <p className="text-slate-500 font-medium">Global platform management and verification.</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm overflow-x-auto custom-scrollbar">
          {(['overview', 'users', 'withdrawals', 'deposits', 'campaigns', 'settings'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setSearchTerm(''); }}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? 'bg-violet-600 text-white shadow-lg shadow-violet-100' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {tab === 'settings' ? 'Global Settings' : tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Platform Users', value: stats.totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Total Deposits', value: `$${stats.totalDeposits.toFixed(2)}`, icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Pending Payouts', value: stats.pendingWithdrawals, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
              { label: 'Settled Payouts', value: `$${stats.totalPayouts.toFixed(2)}`, icon: CheckCircle2, color: 'text-violet-600', bg: 'bg-violet-50' },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-6`}>
                  <stat.icon size={24} />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <h4 className="text-2xl font-black text-slate-900 tracking-tighter">{stat.value}</h4>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
               <div className="p-8 border-b bg-slate-50/50 flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                     <Activity size={18} className="text-violet-600" /> Platform Pulse
                  </h3>
                  <span className="text-[10px] font-black text-slate-400 uppercase">Latest Activity</span>
               </div>
               <div className="p-8 space-y-4">
                  {transactions.slice(0, 8).map(tx => (
                    <div key={tx.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                       <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${
                            tx.type === 'deposit' ? 'bg-emerald-50 text-emerald-600' : 
                            tx.type === 'withdrawal' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'
                          }`}>
                             {tx.type === 'deposit' ? <ArrowDownRight size={18}/> : <ArrowUpRight size={18}/>}
                          </div>
                          <div>
                             <p className="font-black text-slate-800 text-sm">{tx.userName || 'System'}</p>
                             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{tx.type} • {tx.status}</p>
                          </div>
                       </div>
                       <p className={`font-black text-sm ${tx.type === 'withdrawal' ? 'text-rose-500' : 'text-emerald-500'}`}>
                          {tx.type === 'withdrawal' ? '-' : '+'}${tx.amount.toFixed(2)}
                       </p>
                    </div>
                  ))}
               </div>
            </div>

            <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
               <h3 className="text-xl font-black mb-8 tracking-tight">Admin Advisory</h3>
               <div className="space-y-6">
                  <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                     <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Verification Logic</p>
                     <p className="text-sm leading-relaxed text-slate-200 font-medium">Approving a deposit adds the amount to the user's balance and corresponding coins instantly.</p>
                  </div>
                  <div className="p-6 bg-violet-600/20 border border-violet-600/30 rounded-2xl">
                     <p className="text-xs font-bold text-violet-400 mb-2 uppercase tracking-widest">Fraud Prevention</p>
                     <p className="text-sm leading-relaxed text-slate-200 font-medium">Rejecting a withdrawal returns the pending funds to the user's wallet automatically.</p>
                  </div>
               </div>
               <ShieldCheck className="absolute -bottom-10 -right-10 w-48 h-48 text-white/5 pointer-events-none" />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden">
            <div className="p-8 border-b bg-slate-50/50 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative max-w-md w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="text" placeholder="Search members..." className="w-full pl-12 pr-6 py-4 bg-white border-2 rounded-2xl outline-none focus:border-violet-600 transition-all font-bold" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <tr><th className="px-8 py-5 text-left">Member</th><th className="px-8 py-5 text-left">Role</th><th className="px-8 py-5 text-left">Financials</th><th className="px-8 py-5 text-right">Ops</th></tr>
                    </thead>
                    <tbody className="divide-y text-sm font-medium">
                        {filteredUsers.map(u => (
                            <tr key={u.id} className="hover:bg-slate-50 transition-all">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-violet-600 text-white rounded-xl flex items-center justify-center font-black">{u.name.charAt(0)}</div>
                                        <div>
                                            <p className="font-black text-slate-800">{u.name}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">{u.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                                        u.role === 'admin' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                                        u.role === 'advertiser' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-slate-100 text-slate-600 border-slate-200'
                                    }`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td className="px-8 py-6">
                                    <p className="font-black text-slate-800">${u.balance.toFixed(2)}</p>
                                    <p className="text-[9px] text-amber-500 font-bold uppercase">{u.coins} Coins</p>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <button onClick={() => { setEditUser(u); setUserForm({ name: u.name, balance: u.balance, coins: u.coins, role: u.role }); }} className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-violet-600 hover:text-white transition-all"><Edit size={16}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      )}

      {(activeTab === 'withdrawals' || activeTab === 'deposits') && (
        <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden">
            <div className="p-8 border-b bg-slate-50/50 flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-800 tracking-tight">
                    {activeTab === 'withdrawals' ? 'Pending Cashouts' : 'Pending Funding Requests'}
                </h3>
                <span className="px-4 py-1.5 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100">
                    {activeTab === 'withdrawals' ? pendingWithdrawals.length : pendingDeposits.length} Actions Required
                </span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <tr><th className="px-8 py-5 text-left">User</th><th className="px-8 py-5 text-left">Method & Info</th><th className="px-8 py-5 text-left">Amount</th><th className="px-8 py-5 text-left">Reference (TID)</th><th className="px-8 py-5 text-right">Action Hub</th></tr>
                    </thead>
                    <tbody className="divide-y text-sm font-medium">
                        {(activeTab === 'withdrawals' ? pendingWithdrawals : pendingDeposits).map(tx => (
                            <tr key={tx.id} className="hover:bg-slate-50 transition-all">
                                <td className="px-8 py-6">
                                    <p className="font-black text-slate-800">{tx.userName || 'Member'}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">{new Date(tx.date).toLocaleDateString()}</p>
                                </td>
                                <td className="px-8 py-6">
                                    <p className="font-black text-violet-600 uppercase text-xs">{tx.method}</p>
                                    <p className="text-[10px] text-slate-500 font-mono">{tx.accountNumber || 'N/A'}</p>
                                </td>
                                <td className="px-8 py-6">
                                    <p className="font-black text-slate-900 text-lg">${tx.amount.toFixed(2)}</p>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="px-3 py-1.5 bg-slate-50 rounded-lg border font-mono text-xs text-slate-600 truncate max-w-[150px]" title={tx.accountNumber}>
                                        {tx.accountNumber || 'N/A'}
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button 
                                            onClick={() => handleProcessTransaction(tx.id, 'rejected')} 
                                            disabled={!!processingTxId}
                                            className="p-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-600 hover:text-white transition-all border border-rose-100 disabled:opacity-30 flex items-center justify-center min-w-[44px]"
                                            title="Reject Transaction"
                                        >
                                            {processingTxId === tx.id ? <Loader2 size={18} className="animate-spin"/> : <XCircle size={18}/>}
                                        </button>
                                        <button 
                                            onClick={() => handleProcessTransaction(tx.id, 'completed')} 
                                            disabled={!!processingTxId}
                                            className="p-3 bg-emerald-50 text-emerald-500 rounded-xl hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100 disabled:opacity-30 flex items-center justify-center min-w-[44px]"
                                            title="Approve Transaction"
                                        >
                                            {processingTxId === tx.id ? <Loader2 size={18} className="animate-spin"/> : <CheckCircle size={18}/>}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {(activeTab === 'withdrawals' ? pendingWithdrawals : pendingDeposits).length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-8 py-20 text-center">
                                    <div className="flex flex-col items-center justify-center space-y-4">
                                        <div className="p-4 bg-slate-50 rounded-2xl text-slate-200"><ShieldCheck size={48}/></div>
                                        <p className="font-black text-slate-400 uppercase text-xs tracking-[0.2em]">Queue is empty. Everything verified.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      )}

      {activeTab === 'campaigns' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center px-2">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">System Campaigns</h2>
            <button onClick={() => setShowCreateTask(true)} className="px-8 py-4 bg-violet-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.15em] flex items-center gap-2 shadow-xl shadow-violet-100 hover:bg-violet-700 transition-all"><Plus size={16}/> New Global Task</button>
          </div>
          <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden">
            <div className="p-8 border-b bg-slate-50/50">
              <div className="relative max-w-md w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="text" placeholder="Filter tasks..." className="w-full pl-12 pr-6 py-4 bg-white border-2 rounded-2xl outline-none focus:border-violet-600 transition-all font-bold" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <tr><th className="px-8 py-5 text-left">Task Name</th><th className="px-8 py-5 text-left">Verification</th><th className="px-8 py-5 text-left">Payout/Reach</th><th className="px-8 py-5 text-left">Status</th><th className="px-8 py-5 text-right">Ops</th></tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {filteredTasks.map(task => (
                    <tr key={task.id} className="hover:bg-violet-50/20 transition-all">
                      <td className="px-8 py-6">
                        <p className="font-black text-slate-800">{task.title}</p>
                        <span className="text-[9px] font-black text-violet-500 uppercase tracking-wider">{task.category}</span>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border flex items-center gap-2 w-fit ${
                          task.autoApprove ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                        }`}>
                          {task.autoApprove ? <Zap size={10}/> : <Clock size={10}/>}
                          {task.autoApprove ? 'Auto' : 'Manual'}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex flex-col">
                            <span className="font-black text-amber-600">{task.reward} C</span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{task.completions}/{task.limit} Slots</span>
                         </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border flex items-center gap-2 w-fit ${
                          task.status === 'available' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-400'
                        }`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => AdsprediaBackend.saveTask({...task, autoApprove: !task.autoApprove}).then(fetchData)} className="p-2.5 bg-slate-50 rounded-xl hover:bg-amber-500 hover:text-white transition-all" title="Toggle Verification"><Zap size={14}/></button>
                          <button onClick={() => AdsprediaBackend.deleteTask(task.id).then(fetchData)} className="p-2.5 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-600 hover:text-white border border-rose-100"><Trash2 size={14}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="max-w-4xl bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 space-y-12 animate-in slide-in-from-right duration-500">
           <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Platform Branding</h2>
              <p className="text-sm text-slate-500 font-medium">Customize the look and identity of the portal.</p>
           </div>

           <form onSubmit={handleUpdateBranding} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Site Title</label>
                    <input 
                      type="text" 
                      className="w-full px-6 py-4 bg-slate-50 border-2 rounded-2xl outline-none focus:border-violet-600 font-bold"
                      value={branding.siteName}
                      onChange={e => setBranding({...branding, siteName: e.target.value})}
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Logo URL</label>
                    <input 
                      type="url" 
                      className="w-full px-6 py-4 bg-slate-50 border-2 rounded-2xl outline-none focus:border-violet-600 font-bold"
                      value={branding.logoUrl}
                      onChange={e => setBranding({...branding, logoUrl: e.target.value})}
                    />
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Landing Hero Banner (Unsplash)</label>
                 <input 
                   type="url" 
                   className="w-full px-6 py-4 bg-slate-50 border-2 rounded-2xl outline-none focus:border-violet-600 font-bold"
                   value={branding.heroBannerUrl}
                   onChange={e => setBranding({...branding, heroBannerUrl: e.target.value})}
                 />
              </div>

              <div className="p-8 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                 <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-lg border-4 border-white">
                    <img src={branding.heroBannerUrl} alt="Preview" className="w-full h-full object-cover" />
                 </div>
              </div>

              <button 
                type="submit" 
                disabled={isActioning}
                className="w-full py-5 bg-slate-900 text-white rounded-[1.8rem] font-black text-sm uppercase tracking-widest shadow-xl hover:bg-violet-600 transition-all flex items-center justify-center disabled:opacity-50"
              >
                {isActioning ? <Loader2 className="animate-spin" /> : 'Update Global Settings'}
              </button>
           </form>
        </div>
      )}

      {/* User Modification Modal */}
      {editUser && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setEditUser(null)}></div>
            <form onSubmit={handleUserUpdate} className="relative bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-10 space-y-8 animate-in zoom-in duration-300">
                <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Edit Member</h3>
                    <button type="button" onClick={() => setEditUser(null)} className="p-2 bg-slate-50 rounded-xl text-slate-400"><X size={24}/></button>
                </div>
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Class</label>
                        <select className="w-full px-6 py-4 bg-slate-50 border-2 rounded-2xl outline-none font-bold" value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value as any})}>
                            <option value="user">Earner (Standard)</option>
                            <option value="advertiser">Advertiser (Creator)</option>
                            <option value="admin">System Admin</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Balance Adjust ($)</label>
                        <input type="number" step="0.01" className="w-full px-6 py-4 bg-slate-50 border-2 rounded-2xl outline-none font-black" value={userForm.balance} onChange={e => setUserForm({...userForm, balance: parseFloat(e.target.value) || 0})} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Coin Adjust</label>
                        <input type="number" className="w-full px-6 py-4 bg-slate-50 border-2 rounded-2xl outline-none font-black" value={userForm.coins} onChange={e => setUserForm({...userForm, coins: parseInt(e.target.value) || 0})} />
                    </div>
                </div>
                <button type="submit" disabled={isActioning} className="w-full py-5 bg-slate-900 text-white rounded-[1.8rem] font-black shadow-xl hover:bg-violet-600 transition-all flex items-center justify-center disabled:opacity-50">
                    {isActioning ? <Loader2 className="animate-spin" /> : 'Save Changes'}
                </button>
            </form>
        </div>
      )}

      {/* Task Creation Modal */}
      {showCreateTask && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowCreateTask(false)}></div>
          <form onSubmit={handleCreateTask} className="relative bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar rounded-[3rem] shadow-2xl p-10 space-y-8 animate-in zoom-in duration-300">
             <div className="flex justify-between items-center">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Create Global Task</h3>
                <button type="button" onClick={() => setShowCreateTask(false)} className="p-2 bg-slate-50 rounded-xl text-slate-400"><X size={24}/></button>
             </div>

             <div className="space-y-6">
                <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Zap className="text-amber-500" size={24}/>
                        <div>
                            <p className="text-sm font-black text-slate-800">Global Verification</p>
                            <p className="text-[10px] text-amber-600 font-bold uppercase">Toggle auto-approval for this campaign</p>
                        </div>
                    </div>
                    <button type="button" onClick={() => setTaskForm({...taskForm, autoApprove: !taskForm.autoApprove})} className={`transition-colors duration-300 ${taskForm.autoApprove ? 'text-amber-500' : 'text-slate-300'}`}>
                        {taskForm.autoApprove ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                    </button>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Landing URL</label>
                   <input type="url" required className="w-full px-6 py-4 bg-slate-50 border-2 rounded-2xl outline-none focus:border-violet-600 font-bold" value={taskForm.link} onChange={e => setTaskForm({...taskForm, link: e.target.value})} />
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Task Title</label>
                   <input type="text" required className="w-full px-6 py-4 bg-slate-50 border-2 rounded-2xl outline-none focus:border-violet-600 font-black" value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} />
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Category</label>
                   <select className="w-full px-6 py-4 bg-slate-50 border-2 rounded-2xl outline-none font-bold" value={taskForm.category} onChange={e => setTaskForm({...taskForm, category: e.target.value as any})}>
                      {Object.values(TaskCategory).filter(c => c !== TaskCategory.SPIN).map(c => <option key={c} value={c}>{c}</option>)}
                   </select>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Task Description</label>
                   <textarea required className="w-full px-6 py-4 bg-slate-50 border-2 rounded-2xl outline-none focus:border-violet-600 font-bold" value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})} />
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Reward (Coins)</label>
                      <input type="number" required className="w-full px-6 py-4 bg-slate-50 border-2 rounded-2xl outline-none focus:border-violet-600 font-black" value={taskForm.reward} onChange={e => setTaskForm({...taskForm, reward: parseInt(e.target.value) || 0})} />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Target Limit</label>
                      <input type="number" required className="w-full px-6 py-4 bg-slate-50 border-2 rounded-2xl outline-none focus:border-violet-600 font-black" value={taskForm.limit} onChange={e => setTaskForm({...taskForm, limit: parseInt(e.target.value) || 0})} />
                   </div>
                </div>

                <div className="space-y-4">
                   <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Instructions</label>
                    <button type="button" onClick={() => setTaskForm({...taskForm, instructions: [...taskForm.instructions, '']})} className="text-[10px] font-black text-violet-600 uppercase tracking-wider flex items-center gap-1">
                      <Plus size={12} /> Add Step
                    </button>
                  </div>
                  {taskForm.instructions.map((inst, idx) => (
                    <input 
                      key={idx}
                      type="text" 
                      placeholder={`Step ${idx + 1}`}
                      className="w-full px-4 py-2 bg-slate-50 border rounded-xl outline-none focus:border-violet-600 mb-2"
                      value={inst}
                      onChange={e => {
                        const next = [...taskForm.instructions];
                        next[idx] = e.target.value;
                        setTaskForm({...taskForm, instructions: next});
                      }}
                    />
                  ))}
                </div>
             </div>

             <div className="pt-8 border-t flex gap-4">
                <button type="button" onClick={() => setShowCreateTask(false)} className="flex-1 py-5 bg-slate-100 text-slate-600 rounded-[1.8rem] font-black">Close</button>
                <button type="submit" disabled={isActioning} className="flex-[2] py-5 bg-slate-900 text-white rounded-[1.8rem] font-black shadow-xl hover:bg-violet-600 transition-all flex items-center justify-center disabled:opacity-50">
                   {isActioning ? <Loader2 className="animate-spin" /> : 'Launch Campaign'}
                </button>
             </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Admin;

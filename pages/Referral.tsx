
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { 
  Users, 
  Copy, 
  Trophy, 
  UserPlus, 
  Gift, 
  Coins,
  X,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Activity,
  Zap,
  ShieldCheck,
  Info
} from 'lucide-react';
import { AdsprediaBackend } from '../backend';

interface ReferralDetail {
  id: string;
  name: string;
  joinDate: string;
  tasksCompleted: number;
  totalEarned: number;
  commission: number;
  status: 'active' | 'idle';
}

const Referral: React.FC<{ user: User | null }> = ({ user }) => {
  const [selectedReferral, setSelectedReferral] = useState<ReferralDetail | null>(null);
  const [teamMembers, setTeamMembers] = useState<ReferralDetail[]>([]);

  useEffect(() => {
    if (user) {
      const mockTeam: ReferralDetail[] = Array.from({ length: user.referrals }).map((_, i) => ({
        id: `ref_${i}`,
        name: `Referral User #${i + 101}`,
        joinDate: new Date(Date.now() - (i * 86400000 * 2)).toISOString().split('T')[0],
        tasksCompleted: Math.floor(Math.random() * 50),
        totalEarned: Math.floor(Math.random() * 100) + 10,
        commission: 0,
        status: (Math.random() > 0.3 ? 'active' : 'idle') as 'active' | 'idle'
      })).map(member => ({
        ...member,
        commission: member.totalEarned * 0.1
      }));
      setTeamMembers(mockTeam);
    }
  }, [user]);

  if (!user) return null;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`https://adspredia.site/register?ref=${user.referralCode}`);
    alert('Referral link copied to clipboard!');
  };

  const totalCommission = teamMembers.reduce((sum, m) => sum + m.commission, 0);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Referral Hero */}
      <div className="bg-violet-600 rounded-[3rem] p-8 md:p-12 text-white flex flex-col lg:flex-row items-center gap-12 relative overflow-hidden shadow-2xl shadow-violet-200">
        <div className="relative z-10 flex-1">
          <span className="inline-block px-4 py-1.5 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-white/10">Team Growth Program</span>
          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight leading-tight">Grow Income Together</h2>
          <p className="text-violet-100 text-lg max-w-md opacity-90 leading-relaxed font-medium">
            Invite your friends and get <span className="text-white font-black underline decoration-amber-400">10% commission</span> of their income forever. 
          </p>
          
          <div className="mt-10 bg-white/10 p-2 rounded-[2rem] flex flex-col sm:flex-row gap-2 max-w-xl border border-white/20 backdrop-blur-md">
            <div className="flex-1 px-6 py-4 font-mono font-bold text-violet-100 truncate text-sm">
              adspredia.site/?ref={user.referralCode}
            </div>
            <button 
              onClick={copyToClipboard}
              className="bg-white text-violet-700 px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-violet-50 transition-all shadow-xl group"
            >
              <Copy size={20} className="group-hover:rotate-12 transition-transform" /> Copy Link
            </button>
          </div>
        </div>

        <div className="relative z-10 hidden lg:block">
          <div className="w-72 h-72 bg-white/10 rounded-full flex items-center justify-center border-2 border-white/10 animate-pulse">
            <div className="w-56 h-56 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/20">
              <Users size={100} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Referrals', value: user.referrals, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Referral Income', value: `$${totalCommission.toFixed(2)}`, icon: Coins, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Current Rank', value: user.referrals >= 10 ? 'Elite' : 'Starter', icon: Trophy, color: 'text-violet-600', bg: 'bg-violet-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className={`${stat.bg} ${stat.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-6`}>
              <stat.icon size={28} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <h4 className="text-3xl font-black text-slate-800 tracking-tight">{stat.value}</h4>
          </div>
        ))}
      </div>

      {/* NEW: Detailed Commission Logic Section */}
      <div className="bg-slate-900 rounded-[3rem] p-10 md:p-14 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-violet-600 rounded-2xl">
                <Zap size={24} className="text-amber-300" />
              </div>
              <h3 className="text-3xl font-black tracking-tight">Earnings Architecture</h3>
            </div>
            <p className="text-slate-400 font-medium leading-relaxed">
              At Adspredia, we believe in collective growth. Our multi-tier verification system ensures that your referral efforts are rewarded fairly and instantly.
            </p>
            
            <div className="space-y-6">
              {[
                { 
                  title: '10% Lifetime Cut', 
                  desc: 'Every time your referral completes a task, you get 10% of their reward amount. This is not a one-time bonus—it is forever.',
                  icon: Coins 
                },
                { 
                  title: 'Real-Time Crediting', 
                  desc: 'The moment Adspredia AI verifies a task for your referral, the commission is calculated and added to your balance instantly.',
                  icon: Clock 
                },
                { 
                  title: 'Anti-Fraud Protection', 
                  desc: 'Our system tracks device IDs and IP ranges. Only valid unique users contribute to your income to ensure platform sustainability.',
                  icon: ShieldCheck 
                }
              ].map((item, i) => (
                <div key={i} className="flex gap-5 group">
                  <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-violet-600 transition-all">
                    <item.icon size={20} className="text-violet-400 group-hover:text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white uppercase tracking-widest mb-1">{item.title}</h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-10 space-y-8">
            <div className="flex items-center gap-2 mb-2">
              <Info size={16} className="text-violet-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Calculation Example</span>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-6 bg-white/5 rounded-2xl border border-white/5">
                <span className="text-sm font-bold text-slate-300">Referral Task Reward</span>
                <span className="text-xl font-black text-white">500 Coins</span>
              </div>
              <div className="flex justify-center">
                <ChevronRight className="rotate-90 text-slate-700" size={24} />
              </div>
              <div className="flex justify-between items-center p-6 bg-violet-600/20 rounded-2xl border border-violet-600/30">
                <div>
                  <span className="text-sm font-bold text-violet-200">Your Commission (10%)</span>
                  <p className="text-[10px] text-violet-400 font-black uppercase mt-1">Credited Instantly</p>
                </div>
                <span className="text-3xl font-black text-amber-400">+50 Coins</span>
              </div>
            </div>
            <div className="pt-6 border-t border-white/5 text-center">
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-loose">
                 Commissions are based on the base reward. <br /> Milestone bonuses and spins are excluded from 10% logic.
               </p>
            </div>
          </div>
        </div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-violet-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Leaderboard/Team */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Your Team Directory</h3>
            <span className="text-[10px] font-black text-violet-600 bg-violet-50 px-4 py-1.5 rounded-full uppercase tracking-widest border border-violet-100">{user.referrals} Members</span>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar max-h-[600px]">
            {teamMembers.length > 0 ? (
              <div className="divide-y divide-slate-50">
                {teamMembers.map((member) => (
                  <button 
                    key={member.id}
                    onClick={() => setSelectedReferral(member)}
                    className="w-full p-6 flex items-center justify-between hover:bg-violet-50/30 transition-all group text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-400 group-hover:bg-violet-600 group-hover:text-white transition-colors">
                          {member.name.charAt(0)}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${member.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                      </div>
                      <div>
                        <p className="font-black text-slate-800 group-hover:text-violet-600 transition-colors">{member.name}</p>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Joined {member.joinDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs font-black text-emerald-600">+${member.commission.toFixed(2)}</p>
                        <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest">Earned</p>
                      </div>
                      <ChevronRight size={18} className="text-slate-200 group-hover:text-violet-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-12 text-center space-y-6">
                <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-200">
                  <UserPlus size={48} />
                </div>
                <div>
                  <h4 className="text-xl font-black text-slate-800 mb-2">Network is Empty</h4>
                  <p className="text-slate-400 text-sm max-w-[260px] leading-relaxed font-medium">
                    When friends join via your link, they'll appear here. You collect income from every task they complete!
                  </p>
                </div>
                <button 
                  onClick={copyToClipboard}
                  className="px-8 py-4 bg-violet-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-violet-700 transition-all shadow-xl shadow-violet-100"
                >
                  Share My Referral Link
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Rewards Program */}
        <div className="space-y-6">
          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
            <h3 className="text-xl font-black text-slate-800 mb-8 tracking-tight flex items-center gap-2">
              <Gift className="text-violet-600" size={24} /> Milestone Bonuses
            </h3>
            <div className="space-y-6">
              {[
                { label: '5 Referrals', reward: '$1.00 Bonus', count: 5, progress: Math.min(100, (user.referrals / 5) * 100) },
                { label: '25 Referrals', reward: '$5.00 Bonus', count: 25, progress: Math.min(100, (user.referrals / 25) * 100) },
                { label: '100 Referrals', reward: '$25.00 Bonus', count: 100, progress: Math.min(100, (user.referrals / 100) * 100) },
              ].map((m, i) => (
                <div key={i} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-black text-slate-800 uppercase tracking-widest">{m.label}</span>
                      <p className="text-[10px] text-slate-400 font-bold">{user.referrals}/{m.count} Members</p>
                    </div>
                    <span className={`text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest ${m.progress === 100 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                      {m.reward}
                    </span>
                  </div>
                  <div className="h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-0.5">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${m.progress === 100 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-violet-600'}`} 
                      style={{width: `${m.progress}%`}}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            <Gift className="absolute -bottom-10 -right-10 w-48 h-48 text-slate-50 opacity-40 group-hover:rotate-12 transition-transform pointer-events-none" />
          </div>

          <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-xl font-black mb-8 tracking-tight flex items-center gap-2">
                <Activity className="text-violet-400" size={24} /> Referral Flow
              </h3>
              <div className="space-y-6">
                {[
                  { step: '1', text: 'Share your link with global earners.', icon: Copy },
                  { step: '2', text: 'Friends complete tasks and verify via AI.', icon: CheckCircle2 },
                  { step: '3', text: 'You receive 10% credit instantly to your wallet.', icon: Coins },
                ].map((item, i) => (
                  <div key={i} className="flex gap-5 group">
                    <span className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center font-black text-violet-400 border border-white/10 shrink-0 group-hover:bg-violet-600 group-hover:text-white transition-all">
                      {item.step}
                    </span>
                    <p className="text-slate-400 text-sm leading-relaxed font-medium">{item.step}. {item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Referral Detail Modal */}
      {selectedReferral && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setSelectedReferral(null)}></div>
          <div className="relative bg-white w-full max-w-lg rounded-[3rem] shadow-2xl p-10 animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-violet-600 text-white rounded-[1.2rem] flex items-center justify-center font-black text-xl shadow-xl shadow-violet-100">
                  {selectedReferral.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">{selectedReferral.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${selectedReferral.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{selectedReferral.status} Member</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedReferral(null)} className="p-2 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-xl transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Tasks Done</p>
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} className="text-violet-600" />
                  <p className="text-2xl font-black text-slate-800">{selectedReferral.tasksCompleted}</p>
                </div>
              </div>
              <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Earned</p>
                <div className="flex items-center gap-2">
                  <Coins size={16} className="text-amber-500" />
                  <p className="text-2xl font-black text-slate-800">${selectedReferral.totalEarned.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="bg-violet-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-violet-100 relative overflow-hidden">
               <div className="relative z-10">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-200 mb-2">Your Lifetime Commission</p>
                  <div className="flex items-baseline gap-2">
                    <h4 className="text-4xl font-black tracking-tighter">${selectedReferral.commission.toFixed(2)}</h4>
                    <span className="text-xs font-black text-violet-300">USD</span>
                  </div>
                  <div className="mt-6 pt-6 border-t border-white/10 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-violet-100">
                      <Clock size={14} /> Joined Adspredia
                    </div>
                    <span className="font-mono text-xs font-bold">{selectedReferral.joinDate}</span>
                  </div>
               </div>
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
            </div>

            <div className="mt-8 flex flex-col gap-3">
              <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all">
                Message Team Member <ExternalLink size={14} />
              </button>
              <button 
                onClick={() => setSelectedReferral(null)}
                className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
              >
                Close Insights
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Referral;

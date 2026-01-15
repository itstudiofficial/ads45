
import React, { useState } from 'react';
import { User, Task, TaskCategory } from '../types';
import { 
  PlusCircle, 
  ArrowRight, 
  Coins, 
  Users, 
  Zap, 
  CheckCircle2, 
  AlertCircle,
  X,
  Plus,
  Link as LinkIcon,
  Camera,
  ToggleRight,
  ToggleLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CreateTaskProps {
  user: User | null;
  onCreate: (task: Task, totalCost: number) => boolean;
}

const CreateTask: React.FC<CreateTaskProps> = ({ user, onCreate }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    category: TaskCategory.YOUTUBE,
    description: '',
    reward: 10,
    quantity: 100,
    link: '',
    autoApprove: false
  });
  const [instructions, setInstructions] = useState<string[]>(['']);

  if (!user) return null;

  const isAdvertiser = user.role === 'advertiser' || user.role === 'admin';
  const totalCost = (formData.reward * formData.quantity) / 1000;
  const hasEnoughBalance = user.balance >= totalCost;

  const addInstruction = () => setInstructions([...instructions, '']);
  const removeInstruction = (index: number) => {
    const next = [...instructions];
    next.splice(index, 1);
    setInstructions(next);
  };

  const handleInstructionChange = (index: number, val: string) => {
    const next = [...instructions];
    next[index] = val;
    setInstructions(next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasEnoughBalance) return alert('Insufficient balance!');
    if (!formData.link.startsWith('http')) return alert('Please enter a valid URL (starting with http:// or https://)');
    
    const newTask: Task = {
      id: 'user_t_' + Date.now(),
      title: formData.title,
      category: formData.category,
      description: formData.description,
      reward: formData.reward,
      instructions: instructions.filter(i => i.trim() !== ''),
      status: 'available',
      creatorId: user.id,
      completions: 0,
      limit: formData.quantity,
      link: formData.link,
      autoApprove: formData.autoApprove
    };

    const success = onCreate(newTask, totalCost);
    if (success) {
      alert('Campaign launched successfully!');
      navigate('/tasks');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-violet-100 text-violet-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg">
           <PlusCircle size={32} />
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Launch Campaign</h1>
        <p className="text-slate-500 font-medium">Create a task and redirect thousands of users to your content.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 md:p-10 space-y-8">
            <div className="space-y-4">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Target Resource</label>
              <div className="relative">
                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="url" 
                  placeholder="https://youtube.com/watch?v=..." 
                  required
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-violet-500 outline-none transition-all font-bold"
                  value={formData.link}
                  onChange={e => setFormData({...formData, link: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Task Title</label>
                <input 
                  type="text" 
                  placeholder="Subscribe & Like" 
                  required
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-violet-500 outline-none transition-all font-bold"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Category</label>
                <select 
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-violet-500 outline-none transition-all font-bold"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value as TaskCategory})}
                >
                  {Object.values(TaskCategory).filter(c => c !== TaskCategory.SPIN).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {isAdvertiser && (
               <div className="p-6 bg-violet-50 rounded-2xl border border-violet-100 flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-violet-600 shadow-sm">
                        <Zap size={20} />
                     </div>
                     <div>
                        <p className="text-sm font-black text-slate-800 tracking-tight">Auto-Approve Submissions</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Advertiser Privilege: Instant worker credit</p>
                     </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, autoApprove: !formData.autoApprove})}
                    className={`transition-colors duration-300 ${formData.autoApprove ? 'text-violet-600' : 'text-slate-300'}`}
                  >
                    {formData.autoApprove ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                  </button>
               </div>
            )}

            <div className="space-y-4">
               <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Steps for Worker</label>
                <button type="button" onClick={addInstruction} className="text-[10px] font-black text-violet-600 flex items-center gap-1 uppercase tracking-wider hover:underline">
                  <Plus size={14} /> Add Instruction
                </button>
              </div>
              {instructions.map((inst, idx) => (
                <div key={idx} className="flex gap-3">
                  <span className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 text-xs shrink-0">{idx+1}</span>
                  <input 
                    type="text" 
                    placeholder={`e.g. Click the subscribe button...`}
                    required
                    className="flex-1 px-5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:border-violet-500 outline-none font-medium"
                    value={inst}
                    onChange={e => handleInstructionChange(idx, e.target.value)}
                  />
                  {instructions.length > 1 && (
                    <button type="button" onClick={() => removeInstruction(idx)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl">
                      <X size={20} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-6 border-t flex flex-col sm:flex-row gap-6">
                <div className="flex-1 space-y-2">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Reward (Coins)</label>
                  <div className="relative">
                    <Coins className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500" size={18} />
                    <input type="number" min="1" className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black" value={formData.reward} onChange={e => setFormData({...formData, reward: parseInt(e.target.value) || 0})} />
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Quantity</label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-500" size={18} />
                    <input type="number" min="1" className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black" value={formData.quantity} onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 0})} />
                  </div>
                </div>
            </div>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white space-y-8 sticky top-24 shadow-2xl">
            <h3 className="text-xl font-black tracking-tight border-b border-white/10 pb-6 flex items-center gap-2">
               <Zap size={20} className="text-amber-400" /> Order Summary
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Method</span>
                <span className="font-black text-violet-400 uppercase text-[10px] tracking-widest">{formData.category}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Total Slots</span>
                <span className="font-black">{formData.quantity} Members</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Review Type</span>
                <span className={`font-black uppercase text-[10px] tracking-widest ${formData.autoApprove ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {formData.autoApprove ? 'Instant' : 'Manual'}
                </span>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 text-center">
              <p className="text-[10px] uppercase font-black text-slate-500 mb-2 tracking-[0.2em]">Platform Budget</p>
              <p className="text-5xl font-black mb-2 tracking-tighter">${totalCost.toFixed(2)}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Balance: ${user.balance.toFixed(2)}</p>
            </div>

            <button 
              onClick={handleSubmit}
              disabled={!hasEnoughBalance || !formData.title || !formData.link}
              className={`w-full py-5 rounded-2xl font-black text-lg transition-all shadow-xl flex items-center justify-center gap-3
                ${hasEnoughBalance && formData.title && formData.link
                  ? 'bg-violet-600 hover:bg-violet-700 shadow-violet-500/20' 
                  : 'bg-white/5 text-white/20 cursor-not-allowed'}`}
            >
              <CheckCircle2 size={22} /> Launch Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTask;

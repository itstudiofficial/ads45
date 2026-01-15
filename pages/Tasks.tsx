
import React, { useState, useEffect, useRef } from 'react';
import { Task, TaskCategory, User, TaskSubmission } from '../types';
import { 
  Youtube, 
  Globe, 
  Smartphone, 
  Share2, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Coins,
  X,
  RotateCw,
  Loader2,
  Sparkles,
  Users,
  Camera,
  Upload,
  ImageIcon,
  Clock,
  ThumbsUp,
  ThumbsDown,
  ChevronRight,
  Eye,
  ExternalLink,
  Calendar,
  Zap,
  PartyPopper,
  Type
} from 'lucide-react';
import { AdsprediaBackend } from '../backend';

interface TasksProps {
  onComplete: (coins: number) => void;
  user: User | null;
}

const Tasks: React.FC<TasksProps> = ({ onComplete, user }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<TaskSubmission[]>([]);
  const [activeTab, setActiveTab] = useState<'earn' | 'my-submissions' | 'approvals'>('earn');
  
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | 'All'>('All');
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [viewSubmission, setViewSubmission] = useState<TaskSubmission | null>(null);
  const [isStartingTask, setIsStartingTask] = useState<string | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmissionSuccess, setShowSubmissionSuccess] = useState(false);
  const [submissionProof, setSubmissionProof] = useState('');
  const [proofType, setProofType] = useState<'screenshot' | 'text'>('screenshot');
  const [screenshotBase64, setScreenshotBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
  }, [user, activeTab]);

  const fetchData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [allTasks, mySubs, creatorSubs] = await Promise.all([
        AdsprediaBackend.getTasks(),
        AdsprediaBackend.getSubmissions(user.id),
        AdsprediaBackend.getSubmissions(undefined, user.id)
      ]);
      
      if (activeTab === 'earn') {
        setTasks(allTasks.filter(t => t.status === 'available' && t.completions < t.limit));
      } else if (activeTab === 'my-submissions') {
        setSubmissions(mySubs.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()));
      } else if (activeTab === 'approvals') {
        setPendingApprovals(creatorSubs.filter(s => s.status === 'pending'));
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartTask = (task: Task) => {
    setIsStartingTask(task.id);
    setTimeout(() => {
      setActiveTask(task);
      setIsStartingTask(null);
    }, 600);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) return alert("Image too large (Max 2MB).");
      const reader = new FileReader();
      reader.onloadend = () => setScreenshotBase64(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTask || !user) return;
    
    if (proofType === 'screenshot' && !screenshotBase64) return alert("Please upload a screenshot proof.");
    if (proofType === 'text' && !submissionProof.trim()) return alert("Please provide text proof.");

    setIsSubmitting(true);
    const res = await AdsprediaBackend.submitTask({
      taskId: activeTask.id,
      workerId: user.id,
      workerName: user.name,
      proofText: submissionProof,
      proofScreenshot: proofType === 'screenshot' ? (screenshotBase64 || '') : '',
      reward: activeTask.reward
    });
    
    setIsSubmitting(false);
    if (res.success) {
      if (activeTask.autoApprove && res.user) {
        onComplete(activeTask.reward);
      }
      setShowSubmissionSuccess(true);
      setTimeout(() => {
        setShowSubmissionSuccess(false);
        closeModal();
        setActiveTab('my-submissions');
      }, 2500);
    } else {
      alert(res.message);
    }
  };

  const handleApproval = async (subId: string, approved: boolean) => {
    if (approved) {
        const res = await AdsprediaBackend.approveSubmission(subId);
        if (res.success) {
           alert(res.message);
        } else {
           alert(res.message);
        }
    } else {
        await AdsprediaBackend.rejectSubmission(subId);
    }
    setViewSubmission(null);
    fetchData();
  };

  const closeModal = () => {
    setActiveTask(null);
    setSubmissionProof('');
    setScreenshotBase64(null);
    setProofType('screenshot');
  };

  const filteredTasks = selectedCategory === 'All' 
    ? tasks 
    : tasks.filter(t => t.category === selectedCategory);

  const getIcon = (category: TaskCategory) => {
    switch (category) {
      case TaskCategory.YOUTUBE: return <Youtube className="text-rose-500" />;
      case TaskCategory.WEBSITE: return <Globe className="text-blue-500" />;
      case TaskCategory.APP: return <Smartphone className="text-emerald-500" />;
      case TaskCategory.SOCIAL: return <Share2 className="text-violet-500" />;
      default: return <FileText />;
    }
  };

  const subStats = {
    pending: submissions.filter(s => s.status === 'pending').length,
    approved: submissions.filter(s => s.status === 'approved').length,
    rejected: submissions.filter(s => s.status === 'rejected').length,
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex bg-white p-2 rounded-2xl border border-slate-100 shadow-sm w-fit mx-auto overflow-hidden">
        {[
            { id: 'earn', label: 'Earning Hub', icon: Sparkles },
            { id: 'my-submissions', label: 'My Proofs', icon: Clock },
            { id: 'approvals', label: 'My Campaigns', icon: Users }
        ].map(tab => (
            <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-violet-600 text-white shadow-lg shadow-violet-100' : 'text-slate-400 hover:bg-slate-50'}`}
            >
                <tab.icon size={16} />
                {tab.label}
            </button>
        ))}
      </div>

      {activeTab === 'earn' && (
        <>
            <div className="flex flex-wrap gap-2">
                <button 
                onClick={() => setSelectedCategory('All')}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedCategory === 'All' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100'}`}
                >
                All Categories
                </button>
                {Object.values(TaskCategory).filter(c => c !== TaskCategory.SPIN).map(cat => (
                <button 
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedCategory === cat ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100'}`}
                >
                    {cat}
                </button>
                ))}
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 animate-pulse"><Loader2 className="animate-spin text-violet-600 mb-4" size={48} /><p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Updating tasks...</p></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTasks.map(task => (
                        <div key={task.id} className={`bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col hover:shadow-xl transition-all group active:scale-[0.98]`}>
                            <div className="p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-4 bg-slate-50 rounded-[1.2rem] group-hover:bg-violet-50 transition-colors">{getIcon(task.category)}</div>
                                    <div className="flex flex-col items-end gap-1">
                                      <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100 shadow-sm">
                                          <Coins size={12} className="text-amber-500" /> +{task.reward} Coins
                                      </div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 mb-3">
                                  <h3 className="text-xl font-black text-slate-800 tracking-tight leading-tight">{task.title}</h3>
                                  <div className="flex items-center gap-1.5 text-amber-600 font-black text-[10px] uppercase tracking-wider">
                                    <Zap size={12} fill="currentColor" /> {task.reward} COINS REWARD
                                  </div>
                                </div>
                                <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 font-medium mb-6">{task.description}</p>
                                
                                <div className="space-y-3 mt-auto">
                                    <div className="flex justify-between items-end">
                                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress: {task.completions} / {task.limit}</p>
                                    </div>
                                    <div className="h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                      <div 
                                        className="h-full bg-violet-600 transition-all duration-1000" 
                                        style={{ width: `${Math.min(100, (task.completions / task.limit) * 100)}%` }}
                                      ></div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 bg-slate-50/50 border-t border-slate-100">
                                <button 
                                  onClick={() => handleStartTask(task)} 
                                  className="w-full py-4 bg-violet-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-2 hover:bg-violet-700 shadow-lg shadow-violet-100 active:scale-95"
                                  disabled={isStartingTask === task.id}
                                >
                                  {isStartingTask === task.id ? <Loader2 className="animate-spin" size={16} /> : 'Start Task'}
                                  {isStartingTask !== task.id && <ChevronRight size={16} />}
                                </button>
                            </div>
                        </div>
                    ))}
                    {filteredTasks.length === 0 && <div className="col-span-full py-32 text-center font-black text-slate-300 text-xs uppercase tracking-[0.3em]">No tasks available.</div>}
                </div>
            )}
        </>
      )}

      {activeTab === 'my-submissions' && (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">In Audit</p>
                  <p className="text-2xl font-black text-amber-500">{subStats.pending}</p>
                </div>
                <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center"><Clock size={20}/></div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Earned</p>
                  <p className="text-2xl font-black text-emerald-500">{subStats.approved}</p>
                </div>
                <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center"><ThumbsUp size={20}/></div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Rejected</p>
                  <p className="text-2xl font-black text-rose-500">{subStats.rejected}</p>
                </div>
                <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center"><ThumbsDown size={20}/></div>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b bg-slate-50/30">
                    <h2 className="text-xl font-black text-slate-800 tracking-tight">Submission History</h2>
                </div>
                {isLoading ? <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-violet-600" /></div> : (
                    <div className="divide-y divide-slate-50">
                        {submissions.map(sub => (
                            <div key={sub.id} className="p-8 flex items-center justify-between hover:bg-violet-50/30 transition-all group">
                                <div className="flex items-center gap-6">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm border ${
                                        sub.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                        sub.status === 'rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100 pulsing-border'
                                    }`}>
                                        {sub.status === 'approved' ? <ThumbsUp size={24}/> : sub.status === 'rejected' ? <ThumbsDown size={24}/> : <Clock size={24}/>}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                          <p className="font-black text-slate-800 text-lg">Task Proof</p>
                                          <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border-2 ${
                                            sub.status === 'approved' ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm' : 
                                            sub.status === 'rejected' ? 'bg-rose-500 text-white border-rose-600 shadow-sm' : 
                                            'bg-amber-100 text-amber-700 border-amber-200 animate-pulse'
                                          }`}>
                                            {sub.status}
                                          </span>
                                        </div>
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.15em] mt-1 flex items-center gap-2">
                                          <Calendar size={12} /> {new Date(sub.submittedAt).toLocaleDateString()} • <Coins size={12} className="text-amber-500" /> {sub.reward} Coins
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => setViewSubmission(sub)} className="px-6 py-3 bg-slate-50 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-violet-600 hover:text-white transition-all active:scale-95">
                                  <Eye size={16}/> Details
                                </button>
                            </div>
                        ))}
                        {submissions.length === 0 && <div className="py-32 text-center text-slate-300 font-black uppercase text-xs tracking-[0.2em]">No submissions yet.</div>}
                    </div>
                )}
            </div>
        </div>
      )}

      {activeTab === 'approvals' && (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b bg-slate-50/30 flex justify-between items-center">
                <h2 className="text-xl font-black text-slate-800 tracking-tight">Worker Proof Queue</h2>
            </div>
            {isLoading ? <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-violet-600" /></div> : (
                <div className="divide-y divide-slate-50">
                    {pendingApprovals.map(sub => (
                        <div key={sub.id} className="p-8 flex items-center justify-between hover:bg-violet-50/30 transition-all group">
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 bg-violet-600 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-violet-100">{sub.workerName.charAt(0)}</div>
                                <div>
                                    <p className="font-black text-slate-800 text-lg">{sub.workerName} Submission</p>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1 flex items-center gap-2">
                                      <Clock size={12} /> {new Date(sub.submittedAt).toLocaleTimeString()} • <Coins size={12} className="text-amber-500" /> {sub.reward} C
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setViewSubmission(sub)} className={`px-8 py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-xl active:scale-95 bg-slate-900 text-white hover:bg-violet-600`}>
                                Verify Proof
                            </button>
                        </div>
                    ))}
                    {pendingApprovals.length === 0 && <div className="py-32 text-center text-slate-300 font-black uppercase text-xs tracking-[0.2em]">No proofs to audit.</div>}
                </div>
            )}
        </div>
      )}

      {/* MODAL: Submit Task */}
      {activeTask && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={closeModal}></div>
          <div className="relative bg-white w-full max-w-xl max-h-[90vh] overflow-y-auto custom-scrollbar rounded-[3rem] shadow-2xl animate-in zoom-in duration-300">
            {showSubmissionSuccess ? (
              <div className="p-12 flex flex-col items-center justify-center text-center space-y-8">
                <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center animate-bounce">
                  <CheckCircle2 size={64} />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">Submitted!</h3>
                  <p className="text-slate-500 font-medium leading-relaxed max-w-xs mx-auto mt-2">
                    {activeTask.autoApprove ? 'Funds released instantly!' : 'The advertiser will review this shortly.'}
                  </p>
                </div>
                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 w-full flex items-center justify-between">
                  <div className="text-left">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payout</p>
                    <p className="text-2xl font-black text-amber-600">+{activeTask.reward} Coins</p>
                  </div>
                  <PartyPopper size={40} className="text-violet-600" />
                </div>
              </div>
            ) : (
              <div className="p-10 md:p-12">
                <div className="flex justify-between items-start mb-10">
                  <h3 className="text-3xl font-black text-slate-800 tracking-tight leading-tight">{activeTask.title}</h3>
                  <button onClick={closeModal} className="p-2 bg-slate-50 text-slate-400 rounded-xl transition-all shrink-0"><X size={24} /></button>
                </div>

                <div className="mb-10">
                  <a 
                    href={activeTask.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-xl tracking-tight hover:bg-violet-600 transition-all flex items-center justify-center gap-3 active:scale-95"
                  >
                    Open Link <ExternalLink size={24} />
                  </a>
                </div>

                <div className="bg-slate-50 p-8 rounded-[2rem] mb-10 border border-slate-100 space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-slate-800 text-[10px] uppercase tracking-widest flex items-center gap-2">Instructions:</h4>
                    <span className="text-amber-600 font-black text-xs">Reward: {activeTask.reward} Coins</span>
                  </div>
                  <ul className="space-y-4">
                    {activeTask.instructions.map((inst, idx) => (
                      <li key={idx} className="flex items-start gap-4 text-sm text-slate-600 font-bold">
                        <span className="w-6 h-6 bg-white border border-slate-200 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-black">{idx + 1}</span>
                        {inst}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mb-8 p-1 bg-slate-100 rounded-2xl flex">
                  <button 
                    onClick={() => setProofType('screenshot')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${proofType === 'screenshot' ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-400'}`}
                  >
                    <ImageIcon size={14} /> Screenshot
                  </button>
                  <button 
                    onClick={() => setProofType('text')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${proofType === 'text' ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-400'}`}
                  >
                    <Type size={14} /> Text Info
                  </button>
                </div>

                <form onSubmit={handleTaskSubmit} className="space-y-8">
                  {proofType === 'screenshot' ? (
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Visual Proof (Required)</label>
                      <div onClick={() => fileInputRef.current?.click()} className={`relative w-full aspect-video rounded-[2.5rem] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${screenshotBase64 ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-violet-300'}`}>
                        {screenshotBase64 ? (
                          <img src={screenshotBase64} alt="Proof" className="absolute inset-0 w-full h-full object-cover rounded-[2.5rem]" />
                        ) : (
                          <div className="text-center p-8 space-y-3">
                            <ImageIcon size={40} className="text-slate-300 mx-auto"/>
                            <p className="text-sm font-black text-slate-800">Click to upload screenshot</p>
                          </div>
                        )}
                      </div>
                      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Text Proof (Required)</label>
                      <textarea 
                        placeholder="e.g. Subscribed as user 'EarningsMaster99' or Transaction ID" 
                        className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:border-violet-600 outline-none transition-all font-bold min-h-[140px]" 
                        value={submissionProof} 
                        onChange={(e) => setSubmissionProof(e.target.value)} 
                        required
                      />
                    </div>
                  )}

                  {proofType === 'screenshot' && (
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Note (Optional)</label>
                      <input 
                        type="text"
                        placeholder="Any additional info..." 
                        className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:border-violet-600 outline-none transition-all font-bold" 
                        value={submissionProof} 
                        onChange={(e) => setSubmissionProof(e.target.value)} 
                      />
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button type="button" onClick={closeModal} className="flex-1 py-5 bg-slate-100 text-slate-600 rounded-[1.8rem] font-black">Cancel</button>
                    <button 
                      type="submit" 
                      disabled={isSubmitting || (proofType === 'screenshot' && !screenshotBase64) || (proofType === 'text' && !submissionProof.trim())} 
                      className="flex-[2] py-5 bg-violet-600 text-white rounded-[1.8rem] font-black uppercase text-xs tracking-widest shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95"
                    >
                      {isSubmitting ? <RotateCw className="animate-spin" size={20} /> : "Submit Proof"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: View Submission Detail */}
      {viewSubmission && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setViewSubmission(null)}></div>
          <div className="relative bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar rounded-[3rem] shadow-2xl animate-in zoom-in duration-300">
            <div className="p-10 md:p-12">
              <div className="flex justify-between items-center mb-10">
                <div className="flex flex-col">
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">Proof Inspection</h3>
                  <span className="text-amber-600 font-black text-sm uppercase">Reward: {viewSubmission.reward} Coins</span>
                </div>
                <button onClick={() => setViewSubmission(null)} className="p-2 bg-slate-50 text-slate-400 rounded-xl"><X size={24} /></button>
              </div>
              
              <div className="space-y-8">
                {viewSubmission.proofScreenshot && (
                  <div className="rounded-[2.5rem] overflow-hidden border-4 border-slate-50 shadow-inner">
                    <img src={viewSubmission.proofScreenshot} alt="Proof" className="w-full object-contain max-h-[400px] bg-slate-900" />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4 border-b pb-2">Worker Note / Proof</label>
                      <p className="font-bold text-slate-800 text-sm whitespace-pre-wrap">{viewSubmission.proofText || "No text provided."}</p>
                  </div>
                  <div className="bg-violet-50 p-8 rounded-[2rem] border border-violet-100">
                      <label className="text-[10px] font-black text-violet-600 uppercase tracking-widest block mb-4 border-b border-violet-200 pb-2">AI Audit Result</label>
                      <p className="text-sm font-bold text-violet-900 leading-relaxed italic">"{viewSubmission.aiVerdict || "Audit pending..."}"</p>
                  </div>
                </div>

                {activeTab === 'approvals' && viewSubmission.status === 'pending' && (
                    <div className="flex gap-4 pt-6">
                        <button onClick={() => handleApproval(viewSubmission.id, false)} className="flex-1 py-5 bg-rose-50 text-rose-600 rounded-[1.8rem] font-black hover:bg-rose-100 transition-all active:scale-95"><ThumbsDown size={20}/> Reject</button>
                        <button onClick={() => handleApproval(viewSubmission.id, true)} className="flex-[2] py-5 bg-emerald-600 text-white rounded-[1.8rem] font-black hover:bg-emerald-700 transition-all active:scale-95"><ThumbsUp size={20}/> Approve & Pay</button>
                    </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;

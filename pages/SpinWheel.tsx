
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { 
  RotateCcw, 
  Coins, 
  Trophy, 
  AlertCircle, 
  Zap, 
  Sparkles,
  CheckCircle2,
  Gift,
  ArrowRight
} from 'lucide-react';
import { AdsprediaBackend } from '../backend';

interface SpinWheelProps {
  user: User | null;
  onSpinComplete: (updatedUser: User) => void;
}

const SpinWheel: React.FC<SpinWheelProps> = ({ user, onSpinComplete }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<number | null>(null);
  const [showWin, setShowWin] = useState(false);

  // Rewards array as per user request: 0, 20, 30, 50, 10, 60, 0, 100, 50, 10
  const rewards = [0, 20, 30, 50, 10, 60, 0, 100, 50, 10];
  const sectionAngle = 360 / rewards.length;

  if (!user) return null;

  const today = new Date().toISOString().split('T')[0];
  const spinsToday = user.lastSpinDate === today ? user.spinsToday : 0;
  const spinsLeft = Math.max(0, 3 - spinsToday);

  const handleSpin = async () => {
    if (isSpinning || spinsLeft <= 0) return;

    setIsSpinning(true);
    setShowWin(false);
    setResult(null);

    // Calculate a random target index
    const targetIndex = Math.floor(Math.random() * rewards.length);
    const winReward = rewards[targetIndex];

    // Calculate rotation: Current Rotation + 5-10 full spins + targeted offset
    const extraSpins = (5 + Math.floor(Math.random() * 5)) * 360;
    const newRotation = rotation + extraSpins + (360 - (targetIndex * sectionAngle));
    
    setRotation(newRotation);

    // Backend update after animation (approx 5s)
    setTimeout(async () => {
      const res = await AdsprediaBackend.executeSpin(user.id, winReward);
      if (res.success && res.user) {
        setResult(winReward);
        setShowWin(true);
        onSpinComplete(res.user);
      } else if (res.message.includes("limit reached")) {
        alert(res.message);
      }
      setIsSpinning(false);
    }, 5000);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 animate-in fade-in duration-500">
      <div className="text-center mb-12 space-y-4">
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-amber-50">
          <RotateCcw size={32} className={isSpinning ? 'animate-spin' : ''} />
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Lucky Income Spin</h1>
        <p className="text-slate-500 font-medium">Test your luck daily and collect instant coin rewards.</p>
        
        <div className="flex items-center justify-center gap-4 pt-4">
          <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
             <div className={`w-3 h-3 rounded-full ${spinsLeft > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
             <span className="text-sm font-black text-slate-700 uppercase tracking-widest">Spins Left: {spinsLeft}/3</span>
          </div>
          <div className="bg-violet-600 px-6 py-3 rounded-2xl text-white shadow-lg flex items-center gap-3">
             <Coins size={18} className="text-amber-300" />
             <span className="text-sm font-black uppercase tracking-widest">Wallet: {user.coins} C</span>
          </div>
        </div>
      </div>

      <div className="relative flex flex-col items-center">
        {/* Pointer */}
        <div className="absolute top-[-20px] left-1/2 -translate-x-1/2 z-20">
          <div className="w-8 h-10 bg-rose-500 clip-path-triangle shadow-xl"></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rounded-full"></div>
        </div>

        {/* The Wheel */}
        <div className="relative w-[320px] h-[320px] md:w-[450px] md:h-[450px] rounded-full border-[12px] border-slate-900 shadow-2xl overflow-hidden bg-slate-900">
          <div 
            className="w-full h-full relative transition-transform duration-[5000ms] cubic-bezier(0.15, 0, 0.15, 1)"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            {rewards.map((reward, i) => (
              <div 
                key={i}
                className="absolute top-0 left-0 w-full h-full origin-center"
                style={{ transform: `rotate(${i * sectionAngle}deg)` }}
              >
                <div 
                  className={`absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1/2 flex items-start justify-center pt-8 md:pt-12
                    ${i % 2 === 0 ? 'bg-violet-600 text-white' : 'bg-white text-violet-600'}`}
                  style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }}
                >
                  <div className="text-center font-black">
                     <p className="text-xl md:text-3xl tracking-tighter">{reward}</p>
                     <p className="text-[10px] md:text-xs uppercase opacity-80">Coins</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Inner Circle Decoration */}
          <div className="absolute inset-0 m-auto w-16 h-16 md:w-24 md:h-24 bg-slate-900 border-4 border-violet-400 rounded-full flex items-center justify-center shadow-inner z-10">
             <Sparkles size={24} className="text-violet-400" />
          </div>
        </div>

        {/* Spin Button */}
        <button 
          onClick={handleSpin}
          disabled={isSpinning || spinsLeft <= 0}
          className={`mt-12 px-16 py-6 rounded-[2.5rem] font-black text-2xl transition-all shadow-2xl flex items-center gap-4
            ${isSpinning || spinsLeft <= 0 
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' 
              : 'bg-violet-600 text-white hover:bg-violet-700 hover:scale-105 active:scale-95 shadow-violet-200'}`}
        >
          {isSpinning ? 'Spinning...' : spinsLeft > 0 ? 'SPIN THE WHEEL' : 'Daily Limit Reached'}
          {spinsLeft > 0 && !isSpinning && <Zap size={24} className="animate-pulse text-amber-300" />}
        </button>

        {/* Win Overlay */}
        {showWin && result !== null && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in zoom-in duration-300">
            <div className="bg-white rounded-[3rem] p-12 text-center shadow-2xl max-w-sm w-full space-y-8 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 via-violet-600 to-amber-400"></div>
               
               <div className="w-24 h-24 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto animate-bounce">
                  {result > 0 ? <Gift size={48} /> : <AlertCircle size={48} />}
               </div>
               
               <div>
                  <h3 className="text-3xl font-black text-slate-900 mb-2">
                    {result > 0 ? 'Amazing Win!' : 'Better Luck Tomorrow'}
                  </h3>
                  <p className="text-slate-500 font-medium leading-relaxed">
                    {result > 0 
                      ? `You just earned ${result} coins. They have been added to your balance instantly.` 
                      : "The wheel didn't land on a reward this time. Try again tomorrow!"}
                  </p>
               </div>

               {result > 0 && (
                 <div className="bg-violet-50 p-6 rounded-2xl flex items-center justify-between">
                    <div className="text-left">
                       <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest">Reward</p>
                       <p className="text-2xl font-black text-violet-700">+{result} C</p>
                    </div>
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                       <Coins size={24} className="text-amber-500" />
                    </div>
                 </div>
               )}

               <button 
                onClick={() => setShowWin(false)}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-violet-600 transition-all"
               >
                 Continue Earning
               </button>
            </div>
          </div>
        )}
      </div>

      {/* Rules Section */}
      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'Daily Limit', icon: AlertCircle, desc: 'You get 3 free spins every 24 hours to boost your wallet.' },
          { title: 'Instant Credit', icon: CheckCircle2, desc: 'Earnings are automatically added to your balance as soon as the wheel stops.' },
          { title: 'Big Prizes', icon: Trophy, desc: 'Hit the jackpot slices to maximize your daily task income.' }
        ].map((rule, i) => (
          <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
             <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center mb-4">
                <rule.icon size={20} />
             </div>
             <h4 className="font-black text-slate-800 text-sm mb-2 uppercase tracking-widest">{rule.title}</h4>
             <p className="text-xs text-slate-500 font-medium leading-relaxed">{rule.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpinWheel;

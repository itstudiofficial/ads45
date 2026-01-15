
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Globe, 
  Zap, 
  Wallet, 
  Users, 
  CheckCircle2, 
  Star, 
  Smartphone, 
  ShieldCheck,
  MousePointer2,
  Trophy,
  Menu,
  X,
  HelpCircle,
  ChevronDown,
  MessageCircle,
  Clock,
  Layout,
  BarChart3,
  TrendingUp,
  UserPlus,
  DollarSign,
  TrendingDown,
  ArrowUp,
  Award,
  ShieldAlert,
  Target,
  ZapOff,
  UserCheck,
  Lightbulb,
  Heart,
  ClipboardList,
  CreditCard
} from 'lucide-react';
import { AdsprediaBackend, BrandingSettings } from '../backend';

const Landing: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [branding, setBranding] = useState<BrandingSettings>({ logoUrl: '', heroBannerUrl: '', siteName: 'AdsPredia' });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    AdsprediaBackend.getBranding().then(setBranding);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const faqs = [
    { q: "How much can I realistically income per day?", a: "Income depends on task availability and your activity level. Active users typically income between $2 to $10 daily by completing a variety of social media, website, and app-based tasks." },
    { q: "What is the minimum withdrawal amount?", a: "The minimum withdrawal is just $3.00 (Approx. 835 PKR). Once you reach this balance, you can request a cashout to your local wallet or USDT." },
    { q: "Which countries are supported?", a: "AdsPredia is optimized for Asian markets (PK, IN, BD, PH) but supports global income makers through universal payment methods like Binance, Payeer, and USDT." },
    { q: "How long does verification take?", a: "Our AI system verifies most tasks instantly. However, some complex tasks may require manual review by our moderators, which is usually completed within 24-48 hours." },
    { q: "Can I create multiple accounts?", a: "No, we have a strict one-account-per-user policy. Multiple accounts from the same IP or device will be flagged and suspended to maintain platform integrity." }
  ];

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const smoothScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-white selection:bg-violet-100 selection:text-violet-600">
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
        isScrolled || isMobileMenuOpen ? 'bg-white/90 backdrop-blur-lg border-b border-slate-100 py-4 shadow-sm' : 'bg-transparent py-6'
      }`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            {branding.logoUrl ? (
              <img src={branding.logoUrl} alt={branding.siteName} className="w-10 h-10 object-contain group-hover:rotate-6 transition-transform" />
            ) : (
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg shadow-slate-200 group-hover:rotate-6 transition-transform">
                <span className="text-white font-black text-xl">{branding.siteName.charAt(0)}</span>
              </div>
            )}
            <span className="font-bold text-xl text-slate-900 tracking-tight">{branding.siteName}</span>
          </div>
          
          <div className="hidden md:flex items-center gap-10">
            <a href="#features" onClick={(e) => smoothScroll(e, 'features')} className="text-sm font-bold text-slate-500 hover:text-violet-600 transition-all">Features</a>
            <a href="#how-it-works" onClick={(e) => smoothScroll(e, 'how-it-works')} className="text-sm font-bold text-slate-500 hover:text-violet-600 transition-all">How it Works</a>
            <a href="#about" onClick={(e) => smoothScroll(e, 'about')} className="text-sm font-bold text-slate-500 hover:text-violet-600 transition-all">About</a>
            <a href="#faq" onClick={(e) => smoothScroll(e, 'faq')} className="text-sm font-bold text-slate-500 hover:text-violet-600 transition-all">FAQ</a>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/auth" className="hidden sm:block text-sm font-bold text-slate-800 hover:text-violet-600 transition-all px-4">Login</Link>
            <Link to="/auth" className="bg-violet-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-violet-700 transition-all shadow-lg shadow-violet-100 transform hover:-translate-y-0.5 active:translate-y-0">
              Get Started
            </Link>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        <div className={`md:hidden absolute top-full left-0 right-0 bg-white border-b shadow-xl transition-all duration-300 overflow-hidden ${isMobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="p-6 space-y-4">
            <a href="#features" onClick={(e) => smoothScroll(e, 'features')} className="block py-2 text-lg font-bold text-slate-700 hover:text-violet-600">Features</a>
            <a href="#how-it-works" onClick={(e) => smoothScroll(e, 'how-it-works')} className="block py-2 text-lg font-bold text-slate-700 hover:text-violet-600">How it Works</a>
            <a href="#about" onClick={(e) => smoothScroll(e, 'about')} className="block py-2 text-lg font-bold text-slate-700 hover:text-violet-600">About</a>
            <a href="#faq" onClick={(e) => smoothScroll(e, 'faq')} className="block py-2 text-lg font-bold text-slate-700 hover:text-violet-600">FAQ</a>
            <div className="pt-4 flex flex-col gap-3">
              <Link to="/auth" className="w-full py-3 text-center font-bold text-slate-700 bg-slate-100 rounded-xl">Login</Link>
              <Link to="/auth" className="w-full py-3 text-center font-bold text-white bg-violet-600 rounded-xl">Join Now</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 pt-32 pb-20 md:pt-48 md:pb-40 max-w-7xl mx-auto text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-40">
          <div className="absolute top-20 left-1/4 w-64 h-64 bg-violet-300 rounded-full blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-200 rounded-full blur-[120px]"></div>
        </div>

        <div className="inline-flex items-center gap-2 bg-violet-50 text-violet-600 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider mb-8 animate-in fade-in slide-in-from-top duration-700">
          <Zap size={14} className="animate-pulse" /> The Trusted Choice for 50,000+ Members
        </div>
        
        <h1 className="text-5xl md:text-8xl font-black text-slate-900 mb-8 leading-[1.05] tracking-tight animate-in fade-in slide-in-from-bottom duration-700 delay-100">
          Turn Ads <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-violet-900">Into Incomes</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-12 leading-relaxed font-medium animate-in fade-in slide-in-from-bottom duration-700 delay-200">
          AdsPredia is a smart advertising network where users promote brands, complete simple tasks, and collect real rewards. Advertise your business or generate income online — all in one powerful platform.
        </p>

        <div className="flex items-center justify-center mb-24 animate-in fade-in slide-in-from-bottom duration-700 delay-300">
          <Link to="/auth" className="w-full sm:w-auto px-10 py-5 bg-violet-600 text-white rounded-2xl font-black text-lg hover:bg-violet-700 hover:scale-105 transition-all shadow-2xl shadow-violet-200 flex items-center justify-center gap-3">
            Get Income Now <ArrowRight />
          </Link>
        </div>

        <div className="relative max-w-5xl mx-auto animate-in fade-in zoom-in duration-1000 delay-500 group">
          <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border-8 border-slate-900/5 bg-slate-900 transition-transform group-hover:scale-[1.01] duration-700">
            <img 
              src={branding.heroBannerUrl || "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=1600&auto=format&fit=crop"} 
              alt="Income Dashboard Preview" 
              className="w-full h-[300px] md:h-[500px] object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
            
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-4">
               <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 md:p-10 rounded-[2.5rem] shadow-2xl scale-75 md:scale-100 max-w-sm w-full text-white text-left animate-in zoom-in delay-700 duration-1000">
                  <div className="flex justify-between items-center mb-8">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-300">Your Portfolio</p>
                    <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
                      <TrendingUp size={16}/>
                    </div>
                  </div>
                  <h4 className="text-4xl font-black mb-1 tracking-tighter">$2,450.00</h4>
                  <p className="text-emerald-400 text-xs font-black flex items-center gap-1 mb-10">
                    <ArrowUp size={12}/> +12.5% This Week
                  </p>
                  
                  <div className="space-y-4">
                    <div className="bg-white/5 p-4 rounded-2xl flex items-center justify-between border border-white/5">
                      <div className="flex items-center gap-3">
                         <div className="p-2 bg-violet-500/20 text-violet-400 rounded-lg"><Smartphone size={16}/></div>
                         <span className="text-sm font-bold">App Install Task</span>
                      </div>
                      <span className="text-emerald-400 font-black">+$0.50</span>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-slate-50 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight mb-6">Why Choose {branding.siteName}?</h2>
            <p className="text-slate-500 font-medium max-w-2xl mx-auto text-lg">We've built an ecosystem that prioritizes worker security and fast payouts, making it the most reliable choice in the market.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                title: 'Instant Cashouts', 
                icon: Wallet, 
                desc: 'Withdraw your income directly to local wallets like JazzCash, EasyPaisa, or international options like Binance and Payeer with minimal fees.',
                color: 'bg-violet-50 text-violet-600'
              },
              { 
                title: 'High-Paying Tasks', 
                icon: BarChart3, 
                desc: 'We host a variety of high-intent tasks including app engagement, detailed surveys, and subscription models that pay more than standard clicks.',
                color: 'bg-emerald-50 text-emerald-600'
              },
              { 
                title: 'Secure & Verified', 
                icon: ShieldCheck, 
                desc: 'Our platform uses AI-powered anti-fraud systems to ensure every task completion is valid, protecting both members and advertisers.',
                color: 'bg-amber-50 text-amber-600'
              }
            ].map((feat, i) => (
              <div key={i} className="bg-white p-10 rounded-[3rem] border border-slate-100 hover:border-violet-200 transition-all hover:shadow-2xl hover:shadow-violet-100/50 group">
                <div className={`w-14 h-14 ${feat.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feat.icon size={28} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-4">{feat.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed text-sm">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 scroll-mt-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <span className="text-violet-600 font-black text-xs uppercase tracking-widest bg-violet-50 px-4 py-2 rounded-full">Step-by-Step</span>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight mt-4">Simple Income Flow</h2>
          </div>

          <div className="relative">
            {/* Connection Line */}
            <div className="hidden lg:block absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 -z-10"></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {[
                { 
                  step: '01', 
                  title: 'Join for Free', 
                  desc: 'Create your account in seconds. No complex KYC required to start collecting income.',
                  icon: UserPlus
                },
                { 
                  step: '02', 
                  title: 'Complete Tasks', 
                  desc: 'Browse hundreds of available tasks. Each task has clear instructions for you to follow.',
                  icon: ClipboardList
                },
                { 
                  step: '03', 
                  title: 'Instant Cashout', 
                  desc: 'As soon as your proof is verified, funds hit your wallet. Withdraw anytime!',
                  icon: CreditCard
                }
              ].map((item, i) => (
                <div key={i} className="relative bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                  <div className="absolute -top-6 left-12 w-12 h-12 bg-violet-600 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-xl group-hover:scale-110 transition-transform">
                    {item.step}
                  </div>
                  <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-violet-50 group-hover:text-violet-600 transition-colors">
                    <item.icon size={32} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">{item.title}</h3>
                  <p className="text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <span className="text-violet-600 font-black text-xs uppercase tracking-widest bg-violet-50 px-4 py-2 rounded-full">Our Story</span>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">Empowering the <br /> Digital Gig Economy</h2>
            <p className="text-slate-500 text-lg leading-relaxed font-medium">
              AdsPredia was founded with a single mission: to provide everyone, everywhere, the opportunity to monetize their spare time. We noticed a gap between digital creators needing visibility and users wanting a side income.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { title: 'Reliability', icon: ShieldCheck, desc: '99.9% uptime and consistent payouts.' },
                { title: 'Transparency', icon: Layout, desc: 'Real-time tracking of every task.' },
                { title: 'Global Reach', icon: Globe, desc: 'Users from 180+ countries and regions.' },
                { title: 'Support', icon: MessageCircle, desc: '24/7 dedicated community assistance.' }
              ].map((val, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                  <div className="p-2 bg-violet-50 text-violet-600 rounded-xl shrink-0 h-fit"><val.icon size={18} /></div>
                  <div>
                    <h4 className="font-black text-slate-900 text-sm mb-1">{val.title}</h4>
                    <p className="text-slate-400 text-xs font-medium">{val.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square bg-slate-100 rounded-[4rem] overflow-hidden relative group">
              <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1000&auto=format&fit=crop" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Team Work" />
              <div className="absolute inset-0 bg-violet-600/20 mix-blend-multiply"></div>
            </div>
            {/* Floating Card */}
            <div className="absolute -bottom-10 -left-10 bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-50 max-w-[240px] animate-bounce-slow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-violet-600 text-white rounded-xl flex items-center justify-center font-black">A</div>
                <p className="text-xs font-black text-slate-900 uppercase">Mission First</p>
              </div>
              <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase tracking-wider">Bridging 5 million tasks to members globally by 2026.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
             <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Voices of Our Community</h2>
             <p className="text-slate-500 font-medium mt-4">See why thousands of members trust AdsPredia daily.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Ahmed K.', role: 'University Student', quote: 'AdsPredia helps me cover my internet and study expenses by just doing simple social media follows. It\'s incredible!' },
              { name: 'Sarah L.', role: 'Content Creator', quote: 'I use AdsPredia to promote my new videos. The conversion rate is much better than traditional ads!' },
              { name: 'Rohan P.', role: 'Freelancer', quote: 'The instant withdrawal to Binance is a lifesaver. No more waiting weeks for my hard-income cash.' }
            ].map((t, i) => (
              <div key={i} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative group">
                <div className="flex gap-1 mb-6">
                  {[1,2,3,4,5].map(s => <Star key={s} size={14} className="fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-slate-700 font-medium mb-8 leading-relaxed italic">"{t.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-violet-100 rounded-full border-2 border-white flex items-center justify-center font-black text-violet-600">{t.name.charAt(0)}</div>
                  <div>
                    <p className="font-black text-slate-900 text-sm">{t.name}</p>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 scroll-mt-24">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Common Questions</h2>
            <p className="text-slate-500 font-medium mt-4">Everything you need to know about starting your journey.</p>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white border-2 border-slate-50 rounded-[2rem] overflow-hidden transition-all hover:border-violet-100">
                <button 
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between p-8 text-left transition-colors hover:bg-slate-50/50"
                >
                  <span className="font-black text-slate-800 pr-8">{faq.q}</span>
                  <div className={`p-2 rounded-xl bg-slate-100 transition-transform duration-300 ${openFaq === idx ? 'rotate-180 bg-violet-600 text-white' : 'text-slate-400'}`}>
                    <ChevronDown size={20} />
                  </div>
                </button>
                <div className={`transition-all duration-300 ease-in-out ${openFaq === idx ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                  <div className="p-8 pt-0 text-slate-500 font-medium leading-relaxed border-t border-slate-50 bg-slate-50/30">
                    {faq.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-slate-900 rounded-[4rem] p-12 md:p-24 text-center text-white relative overflow-hidden shadow-2xl">
             <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-20">
               <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500 rounded-full blur-[100px]"></div>
               <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-500 rounded-full blur-[100px]"></div>
             </div>
             <div className="relative z-10 space-y-8">
               <h2 className="text-4xl md:text-7xl font-black tracking-tight leading-[1.1]">Ready to Start <br /> Your Income Journey?</h2>
               <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto font-medium">Join 50,000+ others who are already making money daily with AdsPredia.</p>
               <div className="pt-6">
                 <Link to="/auth" className="inline-flex items-center gap-3 px-12 py-6 bg-white text-slate-900 rounded-[2rem] font-black text-xl hover:bg-violet-50 transition-all hover:scale-105 shadow-2xl shadow-black/20">
                   Create Free Account <ArrowRight size={24} />
                 </Link>
               </div>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">No Credit Card Required • Instant Activation</p>
             </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t py-20 px-6">
        <div className="max-w-7xl mx-auto text-center space-y-8">
          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
              {branding.logoUrl ? (
                <img src={branding.logoUrl} alt={branding.siteName} className="w-10 h-10 object-contain" />
              ) : (
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-black text-xl">{branding.siteName.charAt(0)}</span>
                </div>
              )}
              <span className="font-bold text-xl text-slate-900 tracking-tight">{branding.siteName}</span>
            </div>
            <p className="text-slate-500 max-w-lg font-medium leading-relaxed">
              Empowering global members through simple, verified micro-tasks. Join the most reliable platform in the digital gig economy.
            </p>
          </div>
          
          <div className="pt-12 mt-12 border-t flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">© 2025 {branding.siteName} Global Network. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link to="/terms" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-violet-600 transition-colors">Terms</Link>
              <Link to="/privacy" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-violet-600 transition-colors">Privacy</Link>
              <div className="flex items-center gap-2 text-slate-300">
                <ShieldCheck size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Secure Infrastructure</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

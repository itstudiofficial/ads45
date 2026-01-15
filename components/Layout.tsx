
import React, { useState } from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Wallet, 
  Users, 
  UserCircle, 
  Menu, 
  X, 
  LogOut,
  Bell,
  ChevronRight,
  PlusCircle,
  ShieldAlert,
  RotateCcw
} from 'lucide-react';
import { User } from '../types';

interface LayoutProps {
  user: User | null;
  onLogout: () => void;
  isAuthenticated: boolean;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout, isAuthenticated }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  if (!isAuthenticated) return <Navigate to="/auth" />;

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Tasks', href: '/tasks', icon: ClipboardList },
    { name: 'Lucky Spin', href: '/lucky-spin', icon: RotateCcw },
    { name: 'Create Task', href: '/create-task', icon: PlusCircle },
    { name: 'Wallet', href: '/wallet', icon: Wallet },
    { name: 'Referral', href: '/referral', icon: Users },
    { name: 'Profile', href: '/profile', icon: UserCircle },
  ];

  // Admin access link
  const isAdmin = user?.role === 'admin';

  // Always show balance now
  const activeBalanceDisplay = user ? user.balance.toFixed(2) : '0.00';

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-transparent flex flex-col md:flex-row">
      {/* Mobile Top Nav */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white/90 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xs">A</span>
          </div>
          <span className="font-bold text-lg text-slate-900">AdsPredia</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-slate-500 hover:bg-slate-100 rounded-md"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-white/90 backdrop-blur-md border-r z-50 transform transition-transform duration-300 md:relative md:transform-none
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 hidden md:flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg shadow-slate-200">
            <span className="text-white font-black text-xl">A</span>
          </div>
          <span className="font-bold text-xl text-slate-900 tracking-tight">AdsPredia</span>
        </div>

        <nav className="mt-4 px-4 flex-1 overflow-y-auto custom-scrollbar">
          <div className="space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                  ${isActive(item.href) 
                    ? 'bg-violet-500 text-white font-semibold shadow-lg shadow-violet-100' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                `}
              >
                <item.icon size={20} className={isActive(item.href) ? 'text-white' : ''} />
                {item.name}
              </Link>
            ))}
          </div>

          {isAdmin && (
            <div className="mt-6 pt-6 border-t border-slate-50 px-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Control</p>
              <Link
                to="/admin"
                onClick={() => setIsSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                  ${isActive('/admin') 
                    ? 'bg-rose-500 text-white font-semibold shadow-lg shadow-rose-100' 
                    : 'text-slate-500 hover:bg-rose-50 hover:text-rose-600'}
                `}
              >
                <ShieldAlert size={20} className={isActive('/admin') ? 'text-white' : ''} />
                Admin Panel
              </Link>
            </div>
          )}

          <div className="mt-10">
            <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Legal</p>
            <div className="space-y-1">
              <Link to="/terms" className="flex items-center justify-between px-4 py-2 text-sm text-slate-500 hover:text-slate-900">
                Terms & Conditions <ChevronRight size={14} />
              </Link>
              <Link to="/privacy" className="flex items-center justify-between px-4 py-2 text-sm text-slate-500 hover:text-slate-900">
                Privacy Policy <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </nav>

        <div className="p-4 border-t mt-auto">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto custom-scrollbar bg-transparent">
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur-md border-b sticky top-0 z-30">
          <h1 className="text-xl font-bold text-slate-800">
            {navigation.find(n => n.href === location.pathname)?.name || (location.pathname === '/admin' ? 'Admin Panel' : 'Page')}
          </h1>
          <div className="flex items-center gap-6">
            <button className="relative p-2 text-slate-400 hover:text-slate-600">
              <Bell size={22} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-6 border-l">
              <div className="text-right">
                <p className="text-sm font-bold text-slate-800">{user?.name}</p>
                <p className="text-xs text-violet-600 font-medium">{user?.role === 'admin' ? 'Administrator' : `$${activeBalanceDisplay} | ${user?.coins} C`}</p>
              </div>
              <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center text-violet-700 font-bold border-2 border-violet-200">
                {user?.name.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;

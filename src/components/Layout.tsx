import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { LayoutDashboard, Target, MessageSquare, Briefcase, Settings, Menu, X, LogOut, CreditCard, Music, User as UserIcon, Activity } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuth } from './AuthProvider';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const { user, signOut } = useAuth();

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Ledger' },
    { to: '/finsphere', icon: Activity, label: 'FinSphere' },
    { to: '/goals', icon: Target, label: 'Strategy' },
    { to: '/music', icon: Music, label: 'Media Lab' },
    { to: '/billing', icon: CreditCard, label: 'Treasury' },
    { to: '/profile', icon: UserIcon, label: 'Identity' },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F3] flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg transform rotate-3">
            <Activity className="text-white w-5 h-5 pointer-events-none" />
          </div>
          <span className="font-bold text-xl tracking-tighter text-slate-900">FINSPHERE</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/profile" className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-slate-100">
            <img src={user?.photoURL || ''} alt="" className="w-full h-full object-cover" />
          </Link>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-900">
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Sidebar - Institutional Recipe */}
      <aside className={cn(
        "fixed inset-0 z-40 bg-white border-r border-slate-200 w-72 transform transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] md:relative md:translate-x-0 outline-none",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-full flex flex-col">
          <div className="hidden md:flex items-center gap-4 px-8 py-10">
            <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center shadow-2xl shadow-slate-200 transform rotate-6 border-b-2 border-r-2 border-white/20">
              <Activity className="text-white w-6 h-6" />
            </div>
            <div>
              <span className="font-black text-2xl tracking-tighter text-slate-900 leading-none block">FINSPHERE</span>
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-1 block">Global Intelligence</span>
            </div>
          </div>

          <nav className="flex-1 px-6 space-y-2 pt-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) => cn(
                  "flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group relative border border-transparent",
                  isActive 
                    ? "bg-slate-900 text-white shadow-xl shadow-slate-200 font-bold border-slate-800" 
                    : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={cn(
                      "w-5 h-5 transition-transform duration-300 group-hover:scale-110",
                      isActive ? "text-indigo-400" : "text-slate-300"
                    )} />
                    <span className="text-sm uppercase tracking-widest">{item.label}</span>
                    {isActive && (
                       <span className="absolute left-0 w-1.5 h-6 bg-indigo-500 rounded-r-full" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="p-6">
            <Link to="/profile" className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-[2rem] group transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-100">
              <div className="relative">
                <img src={user?.photoURL || ''} alt={user?.displayName || ''} className="w-10 h-10 rounded-2xl object-cover ring-2 ring-white shadow-md grayscale group-hover:grayscale-0 transition-all" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{user?.displayName}</p>
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] mt-0.5">Tier 1 Identity</p>
              </div>
            </Link>
            
            <div className="mt-6 bg-indigo-600 rounded-[2rem] p-6 text-white relative overflow-hidden shadow-2xl shadow-indigo-100 group">
              <div className="relative z-10">
                <p className="text-[9px] font-black text-indigo-200 uppercase tracking-[0.2em] mb-1">Treasury Status</p>
                <p className="text-sm font-bold mb-4 font-mono">$1,248,300.00 <span className="opacity-50 text-[10px]">USD</span></p>
                <button className="w-full py-2.5 bg-white text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 shadow-md">
                  Withdraw Funds
                </button>
              </div>
              <Activity className="absolute -right-6 -bottom-6 w-32 h-32 text-white/10 rotate-12 pointer-events-none group-hover:rotate-45 transition-transform duration-700" />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

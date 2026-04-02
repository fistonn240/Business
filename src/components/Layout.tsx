import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { LayoutDashboard, Target, MessageSquare, Briefcase, Settings, Menu, X, LogOut, CreditCard, Music, User as UserIcon } from 'lucide-react';
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
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/goals', icon: Target, label: 'Goals' },
    { to: '/coach', icon: MessageSquare, label: 'AI Coach' },
    { to: '/strategy', icon: Briefcase, label: 'Strategy' },
    { to: '/music', icon: Music, label: 'AI Music Lab' },
    { to: '/billing', icon: CreditCard, label: 'Billing' },
    { to: '/profile', icon: UserIcon, label: 'Account' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Target className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">Ascend</span>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/profile" className="w-8 h-8 rounded-full overflow-hidden border border-slate-200">
            <img src={user?.photoURL || ''} alt="" className="w-full h-full object-cover" />
          </Link>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-0 z-40 bg-white border-r w-64 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-full flex flex-col">
          <div className="hidden md:flex items-center gap-3 px-6 py-8">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Target className="text-white w-6 h-6" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-slate-900">Ascend</span>
          </div>

          <nav className="flex-1 px-4 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                  isActive 
                    ? "bg-indigo-50 text-indigo-600 font-medium shadow-sm" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 transition-colors",
                  "group-hover:text-indigo-600"
                )} />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t space-y-4">
            <Link to="/profile" className="flex items-center gap-3 px-2 group">
              <img src={user?.photoURL || ''} alt={user?.displayName || ''} className="w-8 h-8 rounded-full border border-slate-200 group-hover:border-indigo-400 transition-colors" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">{user?.displayName}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">View Profile</p>
              </div>
            </Link>
            
            <div className="bg-slate-900 rounded-2xl p-4 text-white relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-xs font-medium text-indigo-300 uppercase tracking-wider mb-1">Pro Plan</p>
                <p className="text-sm font-semibold mb-3">Unlock AI Insights</p>
                <button className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-bold transition-colors">
                  Upgrade Now
                </button>
              </div>
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl" />
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

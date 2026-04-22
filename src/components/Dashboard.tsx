import React from 'react';
import { TrendingUp, CheckCircle2, Globe, Shield, Wallet, Activity, ArrowUpRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useAuth } from './AuthProvider';

const data = [
  { name: 'Mon', progress: 40 },
  { name: 'Tue', progress: 30 },
  { name: 'Wed', progress: 65 },
  { name: 'Thu', progress: 45 },
  { name: 'Fri', progress: 90 },
  { name: 'Sat', progress: 70 },
  { name: 'Sun', progress: 85 },
];

export default function Dashboard() {
  const { user } = useAuth();
  
  const stats = [
    { label: 'Settlement Ledger', value: '428', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Asset Under Management', value: '$12.8M', icon: Wallet, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Risk Protocol', value: 'Alpha-7', icon: Shield, color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: 'Node Uptime', value: '99.99%', icon: Globe, color: 'text-blue-600', bg: 'bg-blue-50' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] bg-indigo-50 px-2 py-0.5 rounded-md">Institutional Portal</span>
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Welcome, {user?.displayName?.split(' ')[0]}</h1>
        <p className="text-slate-500 font-serif italic text-lg">Your global financial summary for 22 April 2026.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-100 transition-all group cursor-pointer active:scale-95">
            <div className="flex items-center justify-between mb-6">
              <div className={`${stat.bg} p-4 rounded-2xl group-hover:rotate-12 transition-transform`}>
                <stat.icon className={`${stat.color} w-6 h-6`} />
              </div>
              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full flex items-center gap-1 uppercase tracking-widest">
                <ArrowUpRight className="w-3 h-3" /> Live
              </span>
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{stat.label}</p>
            <p className="text-3xl font-black text-slate-900 mt-2 tracking-tighter font-mono">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900">Performance Overview</h3>
            <select className="text-sm border-none bg-slate-50 rounded-lg px-3 py-1 focus:ring-2 focus:ring-indigo-500">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="progress" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorProgress)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-6">Recent Achievements</h3>
          <div className="space-y-6">
            {[
              { title: 'New Market Entry', time: '2h ago', desc: 'Successfully launched in Europe' },
              { title: 'Revenue Milestone', time: '5h ago', desc: 'Reached $50k total revenue' },
              { title: 'Team Expansion', time: 'Yesterday', desc: 'Hired 2 new developers' },
            ].map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-2 h-2 mt-2 rounded-full bg-indigo-500 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-slate-900">{item.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase font-semibold">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-3 text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors">
            View All History
          </button>
        </div>
      </div>
    </div>
  );
}

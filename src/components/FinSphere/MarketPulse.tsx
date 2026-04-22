import React from 'react';
import { TrendingUp, TrendingDown, Activity, Globe, Zap, BarChart3, Clock, DollarSign } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockMarketData = [
  { time: '09:00', price: 42000 },
  { time: '10:00', price: 42500 },
  { time: '11:00', price: 42100 },
  { time: '12:00', price: 43200 },
  { time: '13:00', price: 44000 },
  { time: '14:00', price: 43800 },
  { time: '15:00', price: 44500 },
];

const currencies = [
  { pair: 'EUR / USD', rate: '1.0842', change: '+0.12%', trend: 'up' },
  { pair: 'GBP / USD', rate: '1.2654', change: '-0.05%', trend: 'down' },
  { pair: 'USD / JPY', rate: '150.12', change: '+0.45%', trend: 'up' },
  { pair: 'BTC / USD', rate: '52,142', change: '+2.14%', trend: 'up' },
];

export default function MarketPulse() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-900">
            <Activity className="text-indigo-600 w-6 h-6" />
            Global Market Pulse
          </h1>
          <p className="text-slate-500 text-sm italic font-serif">Real-time institutional asset monitoring</p>
        </div>
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
          <Globe className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-mono font-bold tracking-tight text-slate-600 uppercase">Live: New York / London / Tokyo</span>
        </div>
      </header>

      {/* Hero Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-50 rounded-2xl">
                <BarChart3 className="text-indigo-600 w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Global Liquidity Index</h3>
                <p className="text-xs text-slate-400 font-mono uppercase tracking-widest">Aggregate 24H Volume</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold font-mono text-slate-900">$4.82T</p>
              <p className="text-xs font-bold text-emerald-500 flex items-center justify-end gap-1">
                <TrendingUp className="w-3 h-3" /> +14.2%
              </p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockMarketData}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="time" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace'}} 
                />
                <YAxis 
                  hide 
                  domain={['dataMin - 1000', 'dataMax + 1000']} 
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontFamily: 'monospace', fontSize: '12px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#4f46e5" 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#colorPrice)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Currency Pairs Grid */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            Watchlist Pairs
          </h3>
          <div className="space-y-4">
            {currencies.map((curr) => (
              <div key={curr.pair} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-indigo-50 transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center group-hover:border-indigo-200">
                    <DollarSign className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 font-mono tracking-tighter">{curr.pair}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest leading-none">FOREX / Spot</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold font-mono text-slate-900 tracking-tight">{curr.rate}</p>
                  <p className={`text-[10px] font-bold ${curr.trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {curr.change}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-400 uppercase tracking-widest hover:bg-slate-50 transition-colors">
            Configure Watchlist
          </button>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Volatility Index', value: '14.2', change: '-2.1%', icon: Activity, color: 'text-indigo-600' },
          { label: 'Yield 10Y', value: '4.21%', change: '+0.04%', icon: TrendingUp, color: 'text-emerald-600' },
          { label: 'Trade Latency', value: '12ms', change: 'Stable', icon: Clock, color: 'text-blue-600' },
          { label: 'System Uptime', value: '99.99%', change: 'Normal', icon: Zap, color: 'text-amber-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <stat.icon className={`${stat.color} w-5 h-5`} />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
            </div>
            <div className="flex items-baseline justify-between">
              <p className="text-xl font-bold font-mono text-slate-900 tracking-tight">{stat.value}</p>
              <span className={`text-[10px] font-bold ${stat.change.startsWith('+') ? 'text-emerald-500' : stat.change === 'Stable' ? 'text-blue-500' : 'text-rose-500'}`}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

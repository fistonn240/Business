import React from 'react';
import { LayoutDashboard, Activity, ShieldAlert, ArrowRightLeft, Code2 } from 'lucide-react';
import MarketPulse from './MarketPulse';
import RiskAnalyst from './RiskAnalyst';
import TransactionHub from './TransactionHub';
import PythonAPI from './PythonAPI';

export default function DashMain() {
  const [activeTab, setActiveTab] = React.useState('market');

  const tabs = [
    { id: 'market', label: 'Market Pulse', icon: Activity },
    { id: 'transactions', label: 'Ledger Hub', icon: ArrowRightLeft },
    { id: 'risk', label: 'AI Risk Analyst', icon: ShieldAlert },
    { id: 'dev', label: 'Institutional API', icon: Code2 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <nav className="flex items-center gap-1 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all uppercase tracking-widest ${
              activeTab === tab.id 
                ? 'bg-slate-900 text-white shadow-lg' 
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-indigo-400' : ''}`} />
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="min-h-[600px]">
        {activeTab === 'market' && <MarketPulse />}
        {activeTab === 'risk' && <RiskAnalyst />}
        {activeTab === 'transactions' && <TransactionHub />}
        {activeTab === 'dev' && <PythonAPI />}
      </div>
    </div>
  );
}

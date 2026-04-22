import React from 'react';
import { Terminal, Copy, Check, ExternalLink, Code2, Cpu, Globe, Lock } from 'lucide-react';

export default function PythonAPI() {
  const [copied, setCopied] = React.useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const codeSnippets = {
    install: `pip install finsphere-sdk`,
    auth: `from finsphere import FinSphereClient

client = FinSphereClient(api_key="your_institutional_key")
portfolio = client.get_portfolio(user_id="USER001")

print(f"Total Portfolio Value: {portfolio.total_value} USD")`,
    transfer: `response = client.initiate_settlement(
    recipient="SWIFT:BE8293..",
    amount=500000.00,
    currency="USD"
)

if response.status == "completed":
    print("Settlement Reconciled.")`
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <header className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 pb-8 border-b border-slate-200">
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full w-fit">
            <Cpu className="w-3 h-3 text-indigo-600" />
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Global Institutional API</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Developer Integrations</h1>
          <p className="text-slate-500 font-serif italic text-lg">Harness FinSphere intelligence within your local Python environments.</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold transition-all hover:bg-slate-800">
            <Globe className="w-4 h-4" />
            Status: Operational
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Links */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Code2 className="w-5 h-5 text-indigo-600" />
              API Resources
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Core SDK Documentation', desc: 'Financial Logic & Sync' },
                { label: 'Risk Vectors API', desc: 'Connect Risk Analyst AI' },
                { label: 'Ledger Reconciliation', desc: 'Verify Transaction State' },
                { label: 'Compliance Webhooks', desc: 'Listen for SEC/GDPR events' },
              ].map((link, i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-2xl group cursor-pointer hover:bg-indigo-50 transition-all border border-transparent hover:border-indigo-100">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600">{link.label}</span>
                    <ExternalLink className="w-3 h-3 text-slate-300 transition-all group-hover:text-indigo-400 group-hover:translate-x-0.5" />
                  </div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{link.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
            <div className="relative z-10">
              <Lock className="w-8 h-8 text-indigo-400 mb-4" />
              <h4 className="text-lg font-bold mb-2">SEC-Compliant Key Management</h4>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">Rotate your institutional tokens every 30 days to maintain vault compliance.</p>
              <button className="w-full py-3 bg-white text-slate-900 rounded-xl text-xs font-bold uppercase tracking-widest">
                Manage Keys
              </button>
            </div>
            <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl" />
          </div>
        </div>

        {/* Code Snippets */}
        <div className="lg:col-span-2 space-y-8">
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <span className="w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center text-[10px] text-slate-500">01</span>
              Environment Installation
            </h3>
            <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-xl border border-slate-800">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-800/50 border-b border-slate-800">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                </div>
                <button onClick={() => copyToClipboard(codeSnippets.install, 'install')} className="p-1.5 text-slate-400 hover:text-white transition-colors">
                  {copied === 'install' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <pre className="p-6 overflow-x-auto text-[13px] font-mono leading-relaxed">
                <code className="text-indigo-400">$ </code>
                <code className="text-slate-100">{codeSnippets.install}</code>
              </pre>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <span className="w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center text-[10px] text-slate-500">02</span>
              Institutional Authorization
            </h3>
            <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-xl border border-slate-800">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-800/50 border-b border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">auth_sample.py</span>
                <button onClick={() => copyToClipboard(codeSnippets.auth, 'auth')} className="p-1.5 text-slate-400 hover:text-white transition-colors">
                  {copied === 'auth' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <pre className="p-6 overflow-x-auto text-[13px] font-mono leading-relaxed">
                <code className="text-slate-100">{codeSnippets.auth}</code>
              </pre>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <span className="w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center text-[10px] text-slate-500">03</span>
              Ledger Reconciliation & Settlement
            </h3>
            <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-xl border border-slate-800">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-800/50 border-b border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">reconcile.py</span>
                <button onClick={() => copyToClipboard(codeSnippets.transfer, 'transfer')} className="p-1.5 text-slate-400 hover:text-white transition-colors">
                  {copied === 'transfer' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <pre className="p-6 overflow-x-auto text-[13px] font-mono leading-relaxed">
                <code className="text-slate-100">{codeSnippets.transfer}</code>
              </pre>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

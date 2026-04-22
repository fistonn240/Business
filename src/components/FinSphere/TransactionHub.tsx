import React from 'react';
import { Send, ArrowRightLeft, Landmark, Wallet, Plus, Search, Filter, MoreHorizontal, CheckCircle2, Clock, X, DollarSign, Globe } from 'lucide-react';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../AuthProvider';

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  type: string;
  status: string;
  recipient: string;
  timestamp: any;
}

export default function TransactionHub() {
  const { user } = useAuth();
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [amount, setAmount] = React.useState('');
  const [currency, setCurrency] = React.useState('USD');
  const [recipient, setRecipient] = React.useState('');

  React.useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'transactions'),
      where('uid', '==', user.uid),
      orderBy('timestamp', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction)));
    });
  }, [user]);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !amount) return;

    await addDoc(collection(db, 'transactions'), {
      uid: user.uid,
      amount: parseFloat(amount),
      currency,
      type: 'transfer',
      status: 'completed',
      recipient,
      timestamp: serverTimestamp()
    });

    setIsModalOpen(false);
    setAmount('');
    setRecipient('');
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ArrowRightLeft className="text-indigo-600 w-6 h-6" />
            Transaction Hub
          </h1>
          <p className="text-sm text-slate-500 font-serif italic">Global institutional settlement & clearance</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-100"
        >
          <Plus className="w-5 h-5" />
          Initiate Settlement
        </button>
      </header>

      {/* Transaction List */}
      <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex-1 relative max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input type="text" placeholder="Search reference, recipient..." className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <button className="p-2 border border-slate-200 rounded-xl bg-white text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
            <Filter className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/30">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">Transaction ID</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">Recipient / Origin</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">Asset Value</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic text-sm">
                    No active settlements recorded in current ledger.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-mono text-[10px] font-bold text-slate-900">#TX-{tx.id.slice(0, 8).toUpperCase()}</span>
                        <span className="text-[10px] text-slate-400 font-mono italic">22 APR 2026</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-400 uppercase">
                          {tx.recipient.slice(0, 2) || 'GL'}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-900">{tx.recipient || 'Global Liquidity Pool'}</span>
                          <span className="text-[10px] text-slate-400 font-mono">SWIFT-ID: BE82...</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-900 font-mono tracking-tight">
                          {tx.currency} {tx.amount.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Clearance Inst.</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg w-fit">
                        <CheckCircle2 className="w-3 h-3" />
                        <span className="text-[10px] font-bold font-mono uppercase tracking-widest">{tx.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-white rounded-lg transition-all opacity-0 group-hover:opacity-100 shadow-sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transfer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-lg p-10 shadow-2xl animate-in fade-in zoom-in duration-300 border border-slate-200">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-100">
                  <Landmark className="text-white w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Initiate Settlement</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Cross-Border Clearance</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleTransfer} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Asset Value</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                    <input 
                      type="number" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00" 
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold font-mono outline-none focus:ring-2 focus:ring-indigo-500" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Currency Pair</label>
                  <select 
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold font-mono outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                  >
                    <option>USD</option>
                    <option>EUR</option>
                    <option>GBP</option>
                    <option>JPY</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Recipient Counterparty</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                  <input 
                    type="text" 
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="BIC / Swift Code or Institution Name" 
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold font-mono outline-none focus:ring-2 focus:ring-indigo-500" 
                  />
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl text-amber-700 flex gap-3">
                <Clock className="w-5 h-5 shrink-0" />
                <p className="text-[10px] font-bold uppercase tracking-wide leading-relaxed">System Note: Settlements are final and reconciled via the global institutional ledger. Estimated clearance time: Instant.</p>
              </div>

              <button 
                type="submit" 
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-100 shadow-b-4 hover:-translate-y-0.5 active:translate-y-0"
              >
                Confirm & Reconcile
                <ArrowRightLeft className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

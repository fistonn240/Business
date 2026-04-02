import React from 'react';
import { Target, Users, Zap, Shield, HelpCircle, Save, Loader2 } from 'lucide-react';
import { collection, query, where, onSnapshot, setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthProvider';

export default function StrategyCanvas() {
  const { user } = useAuth();
  const [strategyData, setStrategyData] = React.useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = React.useState<string | null>(null);

  const sections = [
    { id: 'value-prop', title: 'Value Proposition', icon: Zap, color: 'bg-amber-50 text-amber-600', desc: 'What unique value do you provide?' },
    { id: 'customer-segments', title: 'Customer Segments', icon: Users, color: 'bg-blue-50 text-blue-600', desc: 'Who are your ideal customers?' },
    { id: 'key-objectives', title: 'Key Objectives', icon: Target, color: 'bg-indigo-50 text-indigo-600', desc: 'What are your top 3 goals?' },
    { id: 'competitive-edge', title: 'Competitive Edge', icon: Shield, color: 'bg-emerald-50 text-emerald-600', desc: 'Why will you win?' },
  ];

  React.useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'strategy'), where('uid', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Record<string, string> = {};
      snapshot.docs.forEach(doc => {
        const item = doc.data();
        data[item.sectionId] = item.content;
      });
      setStrategyData(data);
    });

    return unsubscribe;
  }, [user]);

  const saveSection = async (sectionId: string) => {
    if (!user) return;
    setIsSaving(sectionId);
    try {
      const docId = `${user.uid}_${sectionId}`;
      await setDoc(doc(db, 'strategy', docId), {
        uid: user.uid,
        sectionId,
        content: strategyData[sectionId] || '',
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error saving strategy:", error);
    } finally {
      setIsSaving(null);
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Strategy Canvas</h1>
        <p className="text-slate-500 mt-1">Map out your business model and strategic advantages.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section) => (
          <div key={section.id} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className={`${section.color} p-3 rounded-2xl transition-transform group-hover:scale-110`}>
                  <section.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">{section.title}</h3>
              </div>
              <HelpCircle className="w-5 h-5 text-slate-300 cursor-help" />
            </div>
            <p className="text-sm text-slate-500 mb-4">{section.desc}</p>
            <textarea 
              value={strategyData[section.id] || ''}
              onChange={(e) => setStrategyData(prev => ({ ...prev, [section.id]: e.target.value }))}
              placeholder="Type your strategy here..."
              className="w-full h-40 p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-slate-700 placeholder:text-slate-400"
            />
            <div className="mt-4 flex justify-end">
              <button 
                onClick={() => saveSection(section.id)}
                disabled={isSaving === section.id}
                className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-500 transition-colors disabled:text-slate-400"
              >
                {isSaving === section.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Section
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-indigo-900 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="max-w-xl">
          <h3 className="text-2xl font-bold mb-2">Ready to execute?</h3>
          <p className="text-indigo-200">Export your strategy canvas as a PDF or share it with your team to align everyone on the vision.</p>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-3 bg-white text-indigo-900 font-bold rounded-xl hover:bg-indigo-50 transition-colors">
            Export PDF
          </button>
          <button className="px-6 py-3 bg-indigo-700 text-white font-bold rounded-xl hover:bg-indigo-600 transition-colors">
            Share Canvas
          </button>
        </div>
      </div>
    </div>
  );
}

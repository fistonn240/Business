import React from 'react';
import { ShieldAlert, Send, Bot, User, Loader2, Sparkles, AlertCircle, FileSearch, Scale } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { GoogleGenAI } from "@google/genai";
import { useAuth } from '../AuthProvider';

export default function RiskAnalyst() {
  const { user } = useAuth();
  const [messages, setMessages] = React.useState<{ role: 'user' | 'assistant', content: string }[]>([
    { role: 'assistant', content: "Institutional Risk Analyst initialized. I am ready to evaluate market positions, compliance frameworks, or credit risk scenarios. How can I assist you today?" }
  ]);
  const [input, setInput] = React.useState('');
  const [isTyping, setIsTyping] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      
      const prompt = `
        You are FinSphere AI, a high-level Financial Risk and Compliance Analyst for global investment banks.
        Context: The user is an institutional professional. 
        Tone: Professional, clinical, precise, and objective.
        Goals: Analyze risk, cite international regulations (BASEL III, GDPR, SEC), and provide actionable mitigation strategies.
        
        User Request: ${userMessage}
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });
      
      const text = response.text;

      setMessages(prev => [...prev, { role: 'assistant', content: text || "Analysis failed to materialize. Please refine the query parameters." }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: "An unauthorized interruption occurred in the analysis stream. Verify secure credentials." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <header className="px-6 py-4 border-b flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-100">
            <ShieldAlert className="text-white w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900">AI Risk Analyst</h2>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white border px-2 py-0.5 rounded-md">V2.4 Institutional</span>
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all">
            <FileSearch className="w-5 h-5" />
          </button>
          <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-white rounded-xl transition-all">
            <Scale className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${
                msg.role === 'user' ? 'bg-slate-900' : 'bg-white border text-rose-600'
              }`}>
                {msg.role === 'user' ? <User className="text-white w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-slate-900 text-slate-50' 
                  : 'bg-slate-50 border border-slate-100 text-slate-700'
              }`}>
                <div className="prose prose-sm max-w-none prose-slate">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex gap-3 items-center bg-white border border-slate-100 p-4 rounded-2xl shadow-sm">
              <Loader2 className="w-4 h-4 text-rose-600 animate-spin" />
              <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Aggregating Risk Vectors...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-slate-50/50 border-t">
        <div className="max-w-4xl mx-auto relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Describe a position or market condition for analysis..."
            className="w-full pl-6 pr-14 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-rose-500 outline-none shadow-sm transition-all text-sm font-medium"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-300 text-white rounded-xl transition-all shadow-lg shadow-rose-100"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center justify-center gap-6 mt-4 opacity-50">
           <div className="flex items-center gap-2">
             <Sparkles className="w-3 h-3 text-amber-500" />
             <span className="text-[10px] font-bold uppercase tracking-widest">Cross-Market Analysis</span>
           </div>
           <div className="flex items-center gap-2">
             <Scale className="w-3 h-3 text-emerald-500" />
             <span className="text-[10px] font-bold uppercase tracking-widest">Compliance Anchored</span>
           </div>
        </div>
      </div>
    </div>
  );
}

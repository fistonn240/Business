import React from 'react';
import { Send, Bot, User, Sparkles, Loader2, Search, MapPin, Brain, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { GoogleGenAI, ThinkingLevel, Modality } from "@google/genai";
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Message = {
  role: 'user' | 'assistant';
  content: string;
  groundingMetadata?: any;
};

export default function AdvancedChat() {
  const [messages, setMessages] = React.useState<Message[]>([
    { role: 'assistant', content: "Hello! I'm your advanced AI assistant. I can search the web, find locations on maps, and use high-level reasoning to help you." }
  ]);
  const [input, setInput] = React.useState('');
  const [isTyping, setIsTyping] = React.useState(false);
  const [mode, setMode] = React.useState<'general' | 'complex' | 'fast'>('general');
  const [useSearch, setUseSearch] = React.useState(true);
  const [useMaps, setUseMaps] = React.useState(true);
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
      
      let model = "gemini-3-flash-preview";
      let config: any = {
        tools: [],
      };

      if (mode === 'complex') {
        model = "gemini-3.1-pro-preview";
        config.thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
      } else if (mode === 'fast') {
        model = "gemini-3.1-flash-lite-preview";
      }

      if (useSearch) config.tools.push({ googleSearch: {} });
      if (useMaps) {
        config.tools.push({ googleMaps: {} });
        // Get user location if possible
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });
          config.toolConfig = {
            retrievalConfig: {
              latLng: {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude
              }
            }
          };
        } catch (e) {
          console.warn("Geolocation failed", e);
        }
      }

      const response = await ai.models.generateContent({
        model,
        contents: messages.concat({ role: 'user', content: userMessage }).map(m => ({
          role: m.role,
          parts: [{ text: m.content }]
        })),
        config
      });

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.text || "I'm sorry, I couldn't process that.",
        groundingMetadata: response.candidates?.[0]?.groundingMetadata
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error. Please check your API key." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <header className="px-6 py-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <Sparkles className="text-white w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900">Advanced AI Chat</h2>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs text-slate-500 font-medium">Multi-modal & Grounded</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl">
          {[
            { id: 'fast', icon: Zap, label: 'Fast' },
            { id: 'general', icon: Sparkles, label: 'General' },
            { id: 'complex', icon: Brain, label: 'Complex' },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id as any)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                mode === m.id ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
              )}
            >
              <m.icon className="w-3.5 h-3.5" />
              {m.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setUseSearch(!useSearch)}
            className={cn(
              "p-2 rounded-lg transition-all",
              useSearch ? "bg-blue-50 text-blue-600" : "text-slate-400 hover:bg-slate-50"
            )}
            title="Toggle Google Search Grounding"
          >
            <Search className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setUseMaps(!useMaps)}
            className={cn(
              "p-2 rounded-lg transition-all",
              useMaps ? "bg-emerald-50 text-emerald-600" : "text-slate-400 hover:bg-slate-50"
            )}
            title="Toggle Google Maps Grounding"
          >
            <MapPin className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                msg.role === 'user' ? 'bg-indigo-600' : 'bg-white border shadow-sm'
              }`}>
                {msg.role === 'user' ? <User className="text-white w-5 h-5" /> : <Bot className="text-indigo-600 w-5 h-5" />}
              </div>
              <div className="space-y-2">
                <div className={`p-4 rounded-2xl text-sm ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                    : 'bg-white border border-slate-100 text-slate-700 shadow-sm'
                }`}>
                  <div className="prose prose-sm max-w-none prose-slate">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
                
                {msg.groundingMetadata?.groundingChunks && (
                  <div className="flex flex-wrap gap-2 px-2">
                    {msg.groundingMetadata.groundingChunks.map((chunk: any, idx: number) => {
                      const url = chunk.web?.uri || chunk.maps?.uri;
                      const title = chunk.web?.title || chunk.maps?.title || "Source";
                      if (!url) return null;
                      return (
                        <a 
                          key={idx} 
                          href={url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md text-[10px] font-bold transition-colors"
                        >
                          {chunk.web ? <Search className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                          {title}
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex gap-3 items-center bg-white border border-slate-100 p-4 rounded-2xl shadow-sm">
              <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
              <span className="text-sm text-slate-500 font-medium">AI is thinking...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t">
        <div className="max-w-4xl mx-auto relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask anything... (e.g. 'What are the best Italian restaurants in NYC?')"
            className="w-full pl-6 pr-14 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 text-white rounded-xl transition-all shadow-lg shadow-indigo-100"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

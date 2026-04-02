import React from 'react';
import { Music, Send, Image as ImageIcon, Loader2, Play, Pause, Download, Sparkles, AlertCircle, Info } from 'lucide-react';
import { GoogleGenAI, Modality } from "@google/genai";
import { useAuth } from './AuthProvider';

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export default function MusicLab() {
  const { user } = useAuth();
  const [prompt, setPrompt] = React.useState('');
  const [image, setImage] = React.useState<string | null>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [audioUrl, setAudioUrl] = React.useState<string | null>(null);
  const [lyrics, setLyrics] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [mode, setMode] = React.useState<'clip' | 'pro'>('clip');
  const [hasKey, setHasKey] = React.useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);

  React.useEffect(() => {
    checkApiKey();
  }, []);

  const checkApiKey = async () => {
    try {
      const selected = await window.aistudio.hasSelectedApiKey();
      setHasKey(selected);
    } catch (e) {
      console.error("Error checking API key:", e);
    }
  };

  const handleOpenKeyDialog = async () => {
    await window.aistudio.openSelectKey();
    setHasKey(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateMusic = async () => {
    if (!prompt.trim() || isGenerating) return;
    if (!hasKey) {
      setError("Please select an API key first.");
      return;
    }

    setIsGenerating(true);
    setProgress(10);
    setError(null);
    setAudioUrl(null);
    setLyrics(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || process.env.GEMINI_API_KEY! });
      const modelName = mode === 'clip' ? "lyria-3-clip-preview" : "lyria-3-pro-preview";
      
      const contents: any = [];
      contents.push({ text: prompt });
      if (image) {
        const base64Data = image.split(',')[1];
        const mimeType = image.split(';')[0].split(':')[1];
        contents.push({ inlineData: { data: base64Data, mimeType } });
      }

      const responseStream = await ai.models.generateContentStream({
        model: modelName,
        contents: { parts: contents.map((c: any) => typeof c === 'string' ? { text: c } : c) },
      });

      let audioBase64 = "";
      let mimeType = "audio/wav";
      let tempLyrics = "";

      setProgress(30);
      
      for await (const chunk of responseStream) {
        const parts = chunk.candidates?.[0]?.content?.parts;
        if (!parts) continue;
        
        for (const part of parts) {
          if (part.inlineData?.data) {
            if (!audioBase64 && part.inlineData.mimeType) {
              mimeType = part.inlineData.mimeType;
            }
            audioBase64 += part.inlineData.data;
            // Update progress based on stream chunks
            setProgress(prev => Math.min(prev + 5, 90));
          }
          if (part.text && !tempLyrics) {
            tempLyrics = part.text;
          }
        }
      }

      if (!audioBase64) throw new Error("No audio data received");

      const binary = atob(audioBase64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: mimeType });
      const url = URL.createObjectURL(blob);
      
      setAudioUrl(url);
      setLyrics(tempLyrics);
      setProgress(100);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate music. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Music className="text-indigo-600 w-8 h-8" />
            AI Music Lab
          </h1>
          <p className="text-slate-500 mt-1">Generate strategic soundtracks and business jingles with AI.</p>
        </div>
        {!hasKey && (
          <button 
            onClick={handleOpenKeyDialog}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-amber-200"
          >
            <AlertCircle className="w-5 h-5" />
            Select API Key
          </button>
        )}
      </header>

      {!hasKey && (
        <div className="bg-amber-50 border border-amber-100 p-6 rounded-3xl flex flex-col md:flex-row items-center gap-6">
          <div className="bg-amber-100 p-4 rounded-2xl">
            <Info className="w-8 h-8 text-amber-600" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="font-bold text-amber-900 text-lg">API Key Required</h3>
            <p className="text-amber-700 text-sm">To use the Lyria music generation models, you must select an API key from a paid Google Cloud project. 
              <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="ml-1 underline font-bold">Learn about billing</a>
            </p>
          </div>
          <button 
            onClick={handleOpenKeyDialog}
            className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl transition-colors shrink-0"
          >
            Open Key Selector
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3">Musical Prompt</label>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. A cinematic orchestral track for a tech startup product launch, inspiring and high-energy..."
              className="w-full h-32 p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-slate-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setMode('clip')}
              className={`p-4 rounded-2xl border-2 transition-all text-left ${
                mode === 'clip' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:border-slate-200'
              }`}
            >
              <p className="font-bold text-slate-900">Short Clip</p>
              <p className="text-xs text-slate-500">Up to 30 seconds</p>
            </button>
            <button 
              onClick={() => setMode('pro')}
              className={`p-4 rounded-2xl border-2 transition-all text-left relative overflow-hidden ${
                mode === 'pro' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:border-slate-200'
              }`}
            >
              <div className="absolute -right-2 -top-2 bg-indigo-600 text-white text-[8px] font-bold px-3 py-1 rotate-12">PRO</div>
              <p className="font-bold text-slate-900">Full Track</p>
              <p className="text-xs text-slate-500">Professional length</p>
            </button>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3">Visual Inspiration (Optional)</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer group"
            >
              {image ? (
                <div className="relative inline-block">
                  <img src={image} alt="Inspiration" className="max-h-40 rounded-xl shadow-md" />
                  <button 
                    onClick={(e) => { e.stopPropagation(); setImage(null); }}
                    className="absolute -top-2 -right-2 bg-rose-500 text-white p-1 rounded-full shadow-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto group-hover:bg-indigo-100 transition-colors">
                    <ImageIcon className="text-slate-400 group-hover:text-indigo-600 w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium text-slate-500">Click to upload an image</p>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">JPG, PNG up to 5MB</p>
                </div>
              )}
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
            </div>
          </div>

          <button 
            onClick={generateMusic}
            disabled={!prompt.trim() || isGenerating || !hasKey}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg shadow-indigo-100"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating... {progress}%
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Strategic Track
              </>
            )}
          </button>
        </div>

        {/* Output Section */}
        <div className="flex flex-col gap-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex-1 flex flex-col items-center justify-center text-center">
            {audioUrl ? (
              <div className="w-full space-y-8">
                <div className="w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-indigo-200 animate-pulse">
                  <Music className="text-white w-12 h-12" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Your AI Soundtrack</h3>
                  <p className="text-slate-500 mt-1">Generated based on your strategic vision.</p>
                </div>
                
                <div className="bg-slate-50 p-6 rounded-2xl space-y-4">
                  <audio 
                    ref={audioRef} 
                    src={audioUrl} 
                    onEnded={() => setIsPlaying(false)}
                    className="hidden"
                  />
                  <div className="flex items-center justify-center gap-6">
                    <button 
                      onClick={togglePlay}
                      className="w-16 h-16 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95"
                    >
                      {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                    </button>
                    <a 
                      href={audioUrl} 
                      download="ascend-track.wav"
                      className="w-12 h-12 bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-full flex items-center justify-center transition-all"
                    >
                      <Download className="w-5 h-5" />
                    </a>
                  </div>
                  <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 transition-all duration-300" style={{ width: isPlaying ? '100%' : '0%' }} />
                  </div>
                </div>

                {lyrics && (
                  <div className="text-left bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
                    <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3">Lyrics / Metadata</h4>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed italic">"{lyrics}"</p>
                  </div>
                )}
              </div>
            ) : isGenerating ? (
              <div className="space-y-6 w-full max-w-xs">
                <div className="relative w-32 h-32 mx-auto">
                  <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
                  <div 
                    className="absolute inset-0 border-4 border-indigo-600 rounded-full transition-all duration-500"
                    style={{ clipPath: `inset(0 0 ${100 - progress}% 0)` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Music className="text-indigo-600 w-10 h-10 animate-bounce" />
                  </div>
                </div>
                <div>
                  <p className="font-bold text-slate-900">Composing your track...</p>
                  <p className="text-sm text-slate-500 mt-1">AI is analyzing your prompt and crafting the melody.</p>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto">
                  <Music className="text-slate-300 w-10 h-10" />
                </div>
                <p className="text-slate-500 font-medium">Enter a prompt to start generating music.</p>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-3 text-rose-800">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function X({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

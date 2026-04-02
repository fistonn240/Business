import React from 'react';
import { 
  Video, Play, Sparkles, Wand2, 
  Download, Loader2, AlertCircle, Trash2, 
  Edit3, Key, Film, Monitor, Smartphone
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type AspectRatioType = "16:9" | "9:16";

export default function VideoForge() {
  const [prompt, setPrompt] = React.useState('');
  const [aspectRatio, setAspectRatio] = React.useState<AspectRatioType>("16:9");
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [generatedVideos, setGeneratedVideos] = React.useState<{ url: string, prompt: string }[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [referenceImage, setReferenceImage] = React.useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const checkApiKey = async () => {
      if ((window as any).aistudio?.hasSelectedApiKey) {
        const selected = await (window as any).aistudio.hasSelectedApiKey();
        setHasApiKey(selected);
      }
    };
    checkApiKey();
  }, []);

  const handleOpenKeySelector = async () => {
    if ((window as any).aistudio?.openSelectKey) {
      await (window as any).aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating || !hasApiKey) return;

    setIsGenerating(true);
    setError(null);
    setProgress(0);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      
      const config: any = {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: aspectRatio
      };

      const payload: any = {
        model: 'veo-3.1-lite-generate-preview',
        prompt: prompt,
        config
      };

      if (referenceImage) {
        payload.image = {
          imageBytes: referenceImage.split(',')[1],
          mimeType: 'image/png'
        };
      }

      let operation = await ai.models.generateVideos(payload);

      // Poll for completion
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        setProgress(prev => Math.min(prev + 10, 95));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const response = await fetch(downloadLink, {
          method: 'GET',
          headers: { 'x-goog-api-key': process.env.GEMINI_API_KEY! },
        });
        const blob = await response.blob();
        const videoUrl = URL.createObjectURL(blob);
        setGeneratedVideos(prev => [{ url: videoUrl, prompt }, ...prev]);
        setReferenceImage(null);
        setPrompt('');
      } else {
        throw new Error("No video was generated.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate video.");
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReferenceImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Video Forge</h1>
        <p className="text-slate-500 mt-1">Animate your ideas into high-quality videos with Veo 3.</p>
      </header>

      {!hasApiKey && (
        <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-100 p-3 rounded-2xl">
              <Key className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="font-bold text-indigo-900">API Key Required</p>
              <p className="text-sm text-indigo-700">Video generation requires a paid API key from a billing-enabled project.</p>
            </div>
          </div>
          <button 
            onClick={handleOpenKeySelector}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-100"
          >
            Select API Key
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">Prompt</label>
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A cinematic drone shot of a futuristic city at sunset..."
                className="w-full h-32 p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-slate-700"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">Aspect Ratio</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setAspectRatio("16:9")}
                  className={cn(
                    "flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold border transition-all",
                    aspectRatio === "16:9" ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100" : "bg-white border-slate-100 text-slate-500 hover:border-indigo-200"
                  )}
                >
                  <Monitor className="w-4 h-4" />
                  Landscape (16:9)
                </button>
                <button
                  onClick={() => setAspectRatio("9:16")}
                  className={cn(
                    "flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold border transition-all",
                    aspectRatio === "9:16" ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100" : "bg-white border-slate-100 text-slate-500 hover:border-indigo-200"
                  )}
                >
                  <Smartphone className="w-4 h-4" />
                  Portrait (9:16)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">Starting Image (Optional)</label>
              <div className="relative group">
                {referenceImage ? (
                  <div className="relative rounded-2xl overflow-hidden border-2 border-indigo-100">
                    <img src={referenceImage} alt="Reference" className="w-full h-40 object-cover" />
                    <button 
                      onClick={() => setReferenceImage(null)}
                      className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-40 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
                    <Edit3 className="w-8 h-8 text-slate-400 mb-2" />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Upload to Animate</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                )}
              </div>
            </div>

            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-xs font-medium leading-relaxed">{error}</p>
              </div>
            )}

            <button 
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating || !hasApiKey}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg shadow-indigo-100"
            >
              {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Film className="w-5 h-5" />}
              {isGenerating ? `Forging... ${progress}%` : 'Generate Video'}
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-6">
          {generatedVideos.length === 0 && !isGenerating ? (
            <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center shadow-sm">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Video className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Your Forge is Cold</h3>
              <p className="text-slate-500 max-w-sm mx-auto">Enter a prompt or upload an image to start forging cinematic videos.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {isGenerating && (
                <div className="bg-white p-6 rounded-3xl border border-indigo-100 shadow-sm animate-pulse">
                  <div className="aspect-video bg-slate-100 rounded-2xl mb-6 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                    <div className="w-64 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 transition-all duration-500" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Forging your video...</p>
                  </div>
                  <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-slate-100 rounded w-1/2" />
                </div>
              )}
              {generatedVideos.map((vid, i) => (
                <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm group hover:shadow-md transition-all">
                  <div className="relative rounded-2xl overflow-hidden mb-6 bg-slate-900 aspect-video flex items-center justify-center">
                    <video src={vid.url} controls className="w-full h-full" />
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-slate-900 line-clamp-1">{vid.prompt}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Veo 3 Powered</span>
                      </div>
                    </div>
                    <a 
                      href={vid.url} 
                      download="ascend-video.mp4"
                      className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors"
                    >
                      <Download className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

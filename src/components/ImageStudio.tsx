import React from 'react';
import { 
  Image as ImageIcon, Sparkles, Wand2, 
  Maximize2, Download, 
  Loader2, AlertCircle, Trash2, Edit3,
  CheckCircle2, Key
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type AspectRatioType = "1:1" | "2:3" | "3:2" | "3:4" | "4:3" | "9:16" | "16:9" | "21:9";
type ImageSize = "1K" | "2K" | "4K" | "512px";

export default function ImageStudio() {
  const [prompt, setPrompt] = React.useState('');
  const [aspectRatio, setAspectRatio] = React.useState<AspectRatioType>("1:1");
  const [imageSize, setImageSize] = React.useState<ImageSize>("1K");
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [generatedImages, setGeneratedImages] = React.useState<{ url: string, prompt: string }[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [editImage, setEditImage] = React.useState<string | null>(null);
  const [isPro, setIsPro] = React.useState(false);
  const [hasApiKey, setHasApiKey] = React.useState(false);

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
    if (!prompt.trim() || isGenerating) return;
    
    if (isPro && !hasApiKey) {
      setError("Please select an API key to use Pro features.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const model = isPro ? 'gemini-3-pro-image-preview' : 'gemini-3.1-flash-image-preview';
      
      const contents: any = {
        parts: [
          { text: prompt }
        ]
      };

      if (editImage) {
        contents.parts.unshift({
          inlineData: {
            data: editImage.split(',')[1],
            mimeType: 'image/png'
          }
        });
      }

      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          imageConfig: {
            aspectRatio: aspectRatio as any,
            imageSize: isPro ? imageSize : undefined
          }
        }
      });

      let imageUrl = '';
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }

      if (imageUrl) {
        setGeneratedImages(prev => [{ url: imageUrl, prompt }, ...prev]);
        setEditImage(null);
        setPrompt('');
      } else {
        throw new Error("No image was generated. Please try a different prompt.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate image.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Image Studio</h1>
          <p className="text-slate-500 mt-1">Create and edit professional visuals for your business.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={() => setIsPro(false)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-bold transition-all",
              !isPro ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
            )}
          >
            Flash
          </button>
          <button 
            onClick={() => setIsPro(true)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
              isPro ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
            )}
          >
            <Sparkles className="w-4 h-4" />
            Pro
          </button>
        </div>
      </header>

      {isPro && !hasApiKey && (
        <div className="bg-amber-50 border border-amber-100 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-amber-100 p-3 rounded-2xl">
              <Key className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="font-bold text-amber-900">API Key Required</p>
              <p className="text-sm text-amber-700">Studio-quality generation requires a paid API key from a billing-enabled project.</p>
            </div>
          </div>
          <button 
            onClick={handleOpenKeySelector}
            className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-amber-100"
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
                placeholder="A futuristic office building with glass walls and lush greenery..."
                className="w-full h-32 p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-slate-700"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">Aspect Ratio</label>
              <div className="grid grid-cols-4 gap-2">
                {(["1:1", "2:3", "3:2", "3:4", "4:3", "9:16", "16:9", "21:9"] as AspectRatioType[]).map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={cn(
                      "py-2 rounded-lg text-[10px] font-bold border transition-all",
                      aspectRatio === ratio ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-slate-100 text-slate-500 hover:border-indigo-200"
                    )}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            {isPro && (
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">Image Size</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["1K", "2K", "4K"] as ImageSize[]).map((size) => (
                    <button
                      key={size}
                      onClick={() => setImageSize(size)}
                      className={cn(
                        "py-2 rounded-lg text-xs font-bold border transition-all",
                        imageSize === size ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-slate-100 text-slate-500 hover:border-indigo-200"
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">Reference Image (Optional)</label>
              <div className="relative group">
                {editImage ? (
                  <div className="relative rounded-2xl overflow-hidden border-2 border-indigo-100">
                    <img src={editImage} alt="Reference" className="w-full h-40 object-cover" />
                    <button 
                      onClick={() => setEditImage(null)}
                      className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-40 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
                    <Edit3 className="w-8 h-8 text-slate-400 mb-2" />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Upload to Edit</span>
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
              disabled={!prompt.trim() || isGenerating || (isPro && !hasApiKey)}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg shadow-indigo-100"
            >
              {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
              {isGenerating ? 'Generating...' : editImage ? 'Edit Image' : 'Generate Image'}
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-6">
          {generatedImages.length === 0 && !isGenerating ? (
            <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center shadow-sm">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <ImageIcon className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Your Studio is Empty</h3>
              <p className="text-slate-500 max-w-sm mx-auto">Enter a prompt on the left to start generating professional images for your projects.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {isGenerating && (
                <div className="bg-white p-4 rounded-3xl border border-indigo-100 shadow-sm animate-pulse">
                  <div className="aspect-square bg-slate-100 rounded-2xl mb-4 flex items-center justify-center">
                    <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                  </div>
                  <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-slate-100 rounded w-1/2" />
                </div>
              )}
              {generatedImages.map((img, i) => (
                <div key={i} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm group hover:shadow-md transition-all">
                  <div className="relative rounded-2xl overflow-hidden mb-4">
                    <img src={img.url} alt={img.prompt} className="w-full h-auto" />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button className="p-3 bg-white text-slate-900 rounded-xl hover:scale-110 transition-transform shadow-lg">
                        <Download className="w-5 h-5" />
                      </button>
                      <button className="p-3 bg-white text-slate-900 rounded-xl hover:scale-110 transition-transform shadow-lg">
                        <Maximize2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-slate-900 line-clamp-2">{img.prompt}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Studio Quality</span>
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

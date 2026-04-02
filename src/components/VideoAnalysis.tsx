import React from 'react';
import { 
  FileVideo, Sparkles, Wand2, 
  Download, Loader2, AlertCircle, Trash2, 
  Play, Pause, StopCircle, Languages,
  CheckCircle2, FileText, Search, Brain
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function VideoAnalysis() {
  const [videoFile, setVideoFile] = React.useState<File | null>(null);
  const [videoPreview, setVideoPreview] = React.useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [analysis, setAnalysis] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [prompt, setPrompt] = React.useState('Analyze this video and provide a detailed summary of the key events, visual elements, and any spoken information.');

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
      setAnalysis(null);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!videoFile || isAnalyzing) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(videoFile);
      reader.onloadend = async () => {
        const base64Video = (reader.result as string).split(',')[1];
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
        
        const response = await ai.models.generateContent({
          model: "gemini-3.1-pro-preview",
          contents: [
            {
              parts: [
                { text: prompt },
                { inlineData: { data: base64Video, mimeType: videoFile.type } }
              ]
            }
          ]
        });

        setAnalysis(response.text || "Could not analyze video.");
      };
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to analyze video.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Video Analysis</h1>
        <p className="text-slate-500 mt-1">Extract deep insights and summaries from your video content.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload & Controls */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div className="relative group">
              {videoPreview ? (
                <div className="relative rounded-2xl overflow-hidden border-2 border-indigo-100 bg-slate-900 aspect-video flex items-center justify-center">
                  <video src={videoPreview} controls className="w-full h-full" />
                  <button 
                    onClick={() => { setVideoFile(null); setVideoPreview(null); }}
                    className="absolute top-4 right-4 p-2 bg-rose-600 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full aspect-video bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
                  <FileVideo className="w-12 h-12 text-slate-400 mb-4" />
                  <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Upload Video to Analyze</span>
                  <p className="text-xs text-slate-400 mt-2">MP4, WebM, or MOV up to 10MB</p>
                  <input type="file" className="hidden" accept="video/*" onChange={handleVideoUpload} />
                </label>
              )}
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-bold text-slate-700">Analysis Goal</label>
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="What should I look for in this video?"
                className="w-full h-32 p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-slate-700 text-sm"
              />
            </div>

            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-xs font-medium leading-relaxed">{error}</p>
              </div>
            )}

            <button 
              onClick={handleAnalyze}
              disabled={!videoFile || isAnalyzing}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg shadow-indigo-100"
            >
              {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Brain className="w-5 h-5" />}
              {isAnalyzing ? 'Analyzing Content...' : 'Start Analysis'}
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {analysis ? (
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6 h-full flex flex-col">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-50 p-2 rounded-lg">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">AI Insights</h3>
                </div>
                <button 
                  onClick={() => navigator.clipboard.writeText(analysis)}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
                >
                  Copy Report
                </button>
              </div>
              <div className="flex-1 overflow-y-auto prose prose-sm prose-slate max-w-none">
                <ReactMarkdown>{analysis}</ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center shadow-sm h-full flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <Search className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No Analysis Yet</h3>
              <p className="text-slate-500 max-w-xs mx-auto">Upload a video and click "Start Analysis" to generate a detailed report of your content.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { 
  Music, Image as ImageIcon, Video, Mic, 
  MessageSquare, Search, MapPin, Brain, 
  Volume2, FileVideo, Zap, Sparkles,
  LayoutGrid, List, ChevronRight, Phone
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import AdvancedChat from './AdvancedChat';
import ImageStudio from './ImageStudio';
import VideoForge from './VideoForge';
import MusicLab from './MusicLab';
import AudioSuite from './AudioSuite';
import VideoAnalysis from './VideoAnalysis';
import VoiceConversation from './VoiceConversation';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Tool = {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  bg: string;
};

const tools: Tool[] = [
  { id: 'chat', title: 'Advanced Chat', description: 'Multi-turn chat with Search & Maps grounding.', icon: MessageSquare, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { id: 'voice', title: 'Voice Chat', description: 'Real-time, low-latency voice conversations.', icon: Phone, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { id: 'image', title: 'Image Studio', description: 'Generate & edit high-quality images with aspect controls.', icon: ImageIcon, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { id: 'video', title: 'Video Forge', description: 'Create videos from text or animate your photos.', icon: Video, color: 'text-rose-600', bg: 'bg-rose-50' },
  { id: 'music', title: 'Music Lab', description: 'Generate short clips or full-length tracks.', icon: Music, color: 'text-amber-600', bg: 'bg-amber-50' },
  { id: 'audio', title: 'Audio Suite', description: 'Text-to-Speech and Audio Transcription.', icon: Mic, color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'analysis', title: 'Video Analysis', description: 'Extract key information from video content.', icon: FileVideo, color: 'text-purple-600', bg: 'bg-purple-50' },
];

export default function AILab() {
  const [activeTool, setActiveTool] = React.useState<string | null>(null);

  if (activeTool) {
    return (
      <div className="space-y-6">
        <button 
          onClick={() => setActiveTool(null)}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          Back to Lab
        </button>
        {activeTool === 'chat' && <AdvancedChat />}
        {activeTool === 'voice' && <VoiceConversation />}
        {activeTool === 'image' && <ImageStudio />}
        {activeTool === 'video' && <VideoForge />}
        {activeTool === 'music' && <MusicLab />}
        {activeTool === 'audio' && <AudioSuite />}
        {activeTool === 'analysis' && <VideoAnalysis />}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">AI Lab</h1>
        <p className="text-slate-500 mt-1">Explore our suite of advanced creative and strategic AI tools.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <button 
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all text-left group"
          >
            <div className={cn(tool.bg, "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110")}>
              <tool.icon className={cn(tool.color, "w-8 h-8")} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">{tool.title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">{tool.description}</p>
            <div className="mt-6 flex items-center gap-2 text-sm font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
              Launch Tool <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

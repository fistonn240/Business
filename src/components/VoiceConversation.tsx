import React from 'react';
import { 
  Phone, PhoneOff, Mic, MicOff, 
  Volume2, VolumeX, Loader2, Sparkles,
  AlertCircle, Bot, User, MessageSquare
} from 'lucide-react';
import { GoogleGenAI, Modality, LiveServerMessage } from "@google/genai";
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function VoiceConversation() {
  const [isConnected, setIsConnected] = React.useState(false);
  const [isConnecting, setIsConnecting] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [transcript, setTranscript] = React.useState<{ role: 'user' | 'model', text: string }[]>([]);
  
  const sessionRef = React.useRef<any>(null);
  const audioContextRef = React.useRef<AudioContext | null>(null);
  const processorRef = React.useRef<ScriptProcessorNode | null>(null);
  const sourceRef = React.useRef<MediaStreamAudioSourceNode | null>(null);
  const audioQueueRef = React.useRef<Int16Array[]>([]);
  const isPlayingRef = React.useRef(false);

  const startSession = async () => {
    setIsConnecting(true);
    setError(null);
    setTranscript([]);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      
      const session = await ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: "You are a helpful, friendly, and concise voice assistant. Keep your responses brief and conversational.",
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            setIsConnecting(false);
            startAudioCapture();
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle audio output
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
              const binary = atob(base64Audio);
              const pcmData = new Int16Array(binary.length / 2);
              for (let i = 0; i < pcmData.length; i++) {
                pcmData[i] = (binary.charCodeAt(i * 2) | (binary.charCodeAt(i * 2 + 1) << 8));
              }
              audioQueueRef.current.push(pcmData);
              if (!isPlayingRef.current) {
                playNextInQueue();
              }
            }

            // Handle transcriptions
            if (message.serverContent?.modelTurn?.parts?.[0]?.text) {
              setTranscript(prev => [...prev, { role: 'model', text: message.serverContent!.modelTurn!.parts[0].text! }]);
            }
            // Note: input transcription handling would go here if needed
          },
          onerror: (err) => {
            console.error("Live API Error:", err);
            setError("Connection error. Please try again.");
            stopSession();
          },
          onclose: () => {
            setIsConnected(false);
            setIsConnecting(false);
            stopAudioCapture();
          }
        }
      });

      sessionRef.current = session;
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to connect to Live API.");
      setIsConnecting(false);
    }
  };

  const stopSession = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    setIsConnected(false);
    stopAudioCapture();
  };

  const startAudioCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      sourceRef.current = source;

      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (isMuted || !sessionRef.current) return;
        
        const inputData = e.inputBuffer.getChannelData(0);
        // Convert Float32 to Int16 PCM
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
        }

        // Convert to base64
        const uint8 = new Uint8Array(pcmData.buffer);
        let binary = "";
        for (let i = 0; i < uint8.length; i++) {
          binary += String.fromCharCode(uint8[i]);
        }
        const base64 = btoa(binary);

        sessionRef.current.sendRealtimeInput({
          audio: { data: base64, mimeType: 'audio/pcm;rate=16000' }
        });
      };

      source.connect(processor);
      processor.connect(audioContext.destination);
    } catch (err) {
      console.error("Audio capture error:", err);
      setError("Microphone access denied.");
    }
  };

  const stopAudioCapture = () => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };

  const playNextInQueue = async () => {
    if (audioQueueRef.current.length === 0 || !audioContextRef.current) {
      isPlayingRef.current = false;
      return;
    }

    isPlayingRef.current = true;
    const pcmData = audioQueueRef.current.shift()!;
    
    const buffer = audioContextRef.current.createBuffer(1, pcmData.length, 16000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < pcmData.length; i++) {
      channelData[i] = pcmData[i] / 0x7FFF;
    }

    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);
    source.onended = () => playNextInQueue();
    source.start();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <header className="text-center">
        <h1 className="text-3xl font-bold text-slate-900">Voice Conversation</h1>
        <p className="text-slate-500 mt-1">Real-time, low-latency AI voice chat powered by Gemini Live.</p>
      </header>

      <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-xl flex flex-col items-center space-y-12 relative overflow-hidden">
        {/* Background Animation */}
        {isConnected && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-emerald-50/30 animate-pulse" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-100/20 rounded-full blur-3xl animate-blob" />
          </div>
        )}

        <div className="relative z-10 flex flex-col items-center space-y-8">
          <div className={cn(
            "w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 relative",
            isConnected ? "bg-emerald-600 scale-110 shadow-2xl shadow-emerald-200" : "bg-slate-100"
          )}>
            {isConnected ? (
              <Sparkles className="w-12 h-12 text-white animate-spin-slow" />
            ) : (
              <Bot className="w-12 h-12 text-slate-300" />
            )}
            
            {isConnected && (
              <div className="absolute -inset-4 border-4 border-emerald-100 rounded-full animate-ping opacity-20" />
            )}
          </div>

          <div className="text-center">
            <h3 className="text-2xl font-bold text-slate-900">
              {isConnecting ? 'Connecting...' : isConnected ? 'Listening...' : 'Ready to Talk'}
            </h3>
            <p className="text-slate-500 mt-2">
              {isConnected ? 'Go ahead, ask me anything!' : 'Start a real-time conversation with Gemini.'}
            </p>
          </div>

          <div className="flex items-center gap-6">
            {isConnected && (
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className={cn(
                  "p-4 rounded-2xl transition-all",
                  isMuted ? "bg-rose-50 text-rose-600" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>
            )}

            <button 
              onClick={isConnected ? stopSession : startSession}
              disabled={isConnecting}
              className={cn(
                "px-8 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all shadow-lg",
                isConnected 
                  ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-100" 
                  : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-100"
              )}
            >
              {isConnecting ? <Loader2 className="w-6 h-6 animate-spin" /> : isConnected ? <PhoneOff className="w-6 h-6" /> : <Phone className="w-6 h-6" />}
              {isConnecting ? 'Connecting...' : isConnected ? 'End Call' : 'Start Conversation'}
            </button>
          </div>
        </div>

        {error && (
          <div className="relative z-10 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-xs font-medium">{error}</p>
          </div>
        )}
      </div>

      {/* Transcript */}
      {transcript.length > 0 && (
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Live Transcript
          </h4>
          <div className="space-y-4 max-h-60 overflow-y-auto pr-4">
            {transcript.map((item, i) => (
              <div key={i} className={cn(
                "flex gap-3",
                item.role === 'user' ? "flex-row-reverse" : "flex-row"
              )}>
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                  item.role === 'user' ? "bg-indigo-600" : "bg-emerald-600"
                )}>
                  {item.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                </div>
                <div className={cn(
                  "p-3 rounded-2xl text-sm",
                  item.role === 'user' ? "bg-indigo-50 text-indigo-900" : "bg-emerald-50 text-emerald-900"
                )}>
                  {item.text}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

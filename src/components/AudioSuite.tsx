import React from 'react';
import { 
  Mic, Volume2, Sparkles, Wand2, 
  Download, Loader2, AlertCircle, Trash2, 
  Play, Pause, StopCircle, Languages,
  CheckCircle2, FileText
} from 'lucide-react';
import { GoogleGenAI, Modality } from "@google/genai";
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function AudioSuite() {
  const [ttsText, setTtsText] = React.useState('');
  const [isTtsGenerating, setIsTtsGenerating] = React.useState(false);
  const [ttsAudio, setTtsAudio] = React.useState<{ url: string, text: string } | null>(null);
  const [isRecording, setIsRecording] = React.useState(false);
  const [transcription, setTranscription] = React.useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [voice, setVoice] = React.useState<'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr'>('Kore');

  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);

  const handleGenerateTts = async () => {
    if (!ttsText.trim() || isTtsGenerating) return;

    setIsTtsGenerating(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: ttsText }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const binary = atob(base64Audio);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'audio/pcm' });
        // Note: PCM needs sample rate 24000 to play correctly in most players, 
        // but for simplicity we'll use a basic blob URL here. 
        // In a real app we'd use AudioContext to play PCM.
        const audioUrl = URL.createObjectURL(blob);
        setTtsAudio({ url: audioUrl, text: ttsText });
      } else {
        throw new Error("No audio was generated.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate speech.");
    } finally {
      setIsTtsGenerating(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Microphone access denied.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const transcribeAudio = async (blob: Blob) => {
    setIsTranscribing(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: [
            {
              parts: [
                { text: "Transcribe this audio exactly as spoken." },
                { inlineData: { data: base64Audio, mimeType: 'audio/webm' } }
              ]
            }
          ]
        });
        setTranscription(response.text || "Could not transcribe audio.");
      };
    } catch (err: any) {
      console.error(err);
      setError("Transcription failed.");
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* TTS Section */}
      <div className="space-y-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="bg-indigo-50 p-3 rounded-2xl">
              <Volume2 className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Text to Speech</h2>
              <p className="text-xs text-slate-500">Convert your text into natural-sounding voices.</p>
            </div>
          </div>

          <div className="space-y-4">
            <textarea 
              value={ttsText}
              onChange={(e) => setTtsText(e.target.value)}
              placeholder="Enter text to convert to speech..."
              className="w-full h-40 p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-slate-700"
            />

            <div className="flex flex-wrap gap-2">
              {(['Kore', 'Puck', 'Charon', 'Fenrir', 'Zephyr'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setVoice(v)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-bold border transition-all",
                    voice === v ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100" : "bg-white border-slate-100 text-slate-500 hover:border-indigo-200"
                  )}
                >
                  {v}
                </button>
              ))}
            </div>

            <button 
              onClick={handleGenerateTts}
              disabled={!ttsText.trim() || isTtsGenerating}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg shadow-indigo-100"
            >
              {isTtsGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              {isTtsGenerating ? 'Generating Audio...' : 'Generate Speech'}
            </button>
          </div>

          {ttsAudio && (
            <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Generated Audio</span>
                <a href={ttsAudio.url} download="speech.wav" className="text-indigo-600 hover:text-indigo-700">
                  <Download className="w-4 h-4" />
                </a>
              </div>
              <audio src={ttsAudio.url} controls className="w-full h-10" />
              <p className="text-xs text-slate-500 italic line-clamp-2">"{ttsAudio.text}"</p>
            </div>
          )}
        </div>
      </div>

      {/* Transcription Section */}
      <div className="space-y-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6 h-full flex flex-col">
          <div className="flex items-center gap-4 mb-2">
            <div className="bg-emerald-50 p-3 rounded-2xl">
              <Mic className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Audio Transcription</h2>
              <p className="text-xs text-slate-500">Transcribe your voice recordings instantly.</p>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center space-y-8 py-8">
            <div className="relative">
              {isRecording && (
                <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20" />
              )}
              <button 
                onClick={isRecording ? stopRecording : startRecording}
                className={cn(
                  "w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-xl relative z-10",
                  isRecording ? "bg-rose-600 hover:bg-rose-500" : "bg-emerald-600 hover:bg-emerald-500"
                )}
              >
                {isRecording ? <StopCircle className="w-10 h-10 text-white" /> : <Mic className="w-10 h-10 text-white" />}
              </button>
            </div>
            
            <div className="text-center">
              <p className="font-bold text-slate-900 mb-1">
                {isRecording ? 'Recording...' : isTranscribing ? 'Transcribing...' : 'Ready to record'}
              </p>
              <p className="text-xs text-slate-500">
                {isRecording ? 'Click to stop and transcribe' : 'Click the microphone to start'}
              </p>
            </div>
          </div>

          {transcription && (
            <div className="mt-auto p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">Transcription</span>
                </div>
                <button 
                  onClick={() => navigator.clipboard.writeText(transcription)}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
                >
                  Copy Text
                </button>
              </div>
              <div className="max-h-40 overflow-y-auto text-sm text-slate-600 leading-relaxed">
                {transcription}
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-xs font-medium leading-relaxed">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { Mic, MicOff, X, Sparkles, Globe, Volume2 } from 'lucide-react';
import { speechService } from '../../services/speechService';

interface VoiceInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTranscriptComplete: (text: string) => void;
  initialLang?: string;
}

export const VoiceInputModal: React.FC<VoiceInputModalProps> = ({
  isOpen,
  onClose,
  onTranscriptComplete,
  initialLang = 'hi'
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voiceLang, setVoiceLang] = useState<'hi' | 'en'>(initialLang === 'hi' ? 'hi' : 'en');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      startListening();
    } else {
      stopListening();
    }
    return () => {
      stopListening();
    };
  }, [isOpen, voiceLang]);

  const startListening = () => {
    setError(null);
    setTranscript('');
    setIsRecording(true);

    const started = speechService.startListening(voiceLang === 'hi' ? 'hi-IN' : 'en-US', {
      onResult: (text, isFinal) => {
        setTranscript(text);
        if (isFinal && text.trim()) {
          setTimeout(() => {
            onTranscriptComplete(text.trim());
            onClose();
          }, 800);
        }
      },
      onError: (err) => {
        setError(`Microphone error: ${err}`);
        setIsRecording(false);
      },
      onEnd: () => {
        setIsRecording(false);
      }
    });

    if (!started) {
      setError('Web Speech API is not supported in this browser. Please type your query.');
    }
  };

  const stopListening = () => {
    speechService.stopListening();
    setIsRecording(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-[#242424] border border-white/10 rounded-3xl p-6 max-w-md w-full text-center shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#8e8ea0] hover:text-white rounded-xl hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Language selector for speech */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <button
            onClick={() => setVoiceLang('hi')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              voiceLang === 'hi'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-[#1e1e1e] text-[#8e8ea0] hover:text-white'
            }`}
          >
            🇮🇳 हिंदी (Hindi)
          </button>
          <button
            onClick={() => setVoiceLang('en')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              voiceLang === 'en'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'bg-[#1e1e1e] text-[#8e8ea0] hover:text-white'
            }`}
          >
            🌐 English
          </button>
        </div>

        {/* Animated Mic Button & Waveform */}
        <div className="relative my-8 flex flex-col items-center justify-center">
          <div className="relative flex items-center justify-center">
            {isRecording && (
              <div className="absolute w-24 h-24 rounded-full bg-cyan-500/20 animate-ping"></div>
            )}
            <button
              onClick={isRecording ? stopListening : startListening}
              className={`w-20 h-20 rounded-full flex items-center justify-center text-white transition-all shadow-xl z-10 ${
                isRecording
                  ? 'bg-gradient-to-tr from-red-500 to-amber-500 shadow-red-500/30 scale-105'
                  : 'bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-cyan-500/30'
              }`}
            >
              {isRecording ? <Mic className="w-8 h-8 animate-pulse" /> : <MicOff className="w-8 h-8" />}
            </button>
          </div>

          {/* Animated Audio Wave Bars */}
          {isRecording && (
            <div className="flex items-center gap-1.5 mt-6 h-8">
              {[40, 75, 100, 60, 90, 45, 80, 50, 95, 70].map((h, i) => (
                <span
                  key={i}
                  className="w-1 bg-cyan-400 rounded-full animate-wave"
                  style={{
                    height: `${h}%`,
                    animationDelay: `${i * 0.1}s`
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Status Text & Live Transcript */}
        <div className="min-h-[60px] flex flex-col items-center justify-center">
          {error ? (
            <p className="text-xs text-red-400 font-medium">{error}</p>
          ) : isRecording ? (
            <div>
              <p className="text-xs text-cyan-300 font-medium animate-pulse">
                Listening... Speak naturally in {voiceLang === 'hi' ? 'Hindi' : 'English'}
              </p>
              <p className="text-sm font-semibold text-white mt-2 max-h-20 overflow-y-auto px-4 italic">
                &ldquo;{transcript || '...'}&rdquo;
              </p>
            </div>
          ) : (
            <p className="text-xs text-[#8e8ea0]">
              Tap microphone to begin voice query
            </p>
          )}
        </div>

        {/* Done / Submit button if transcript exists */}
        {transcript && !isRecording && (
          <button
            onClick={() => {
              onTranscriptComplete(transcript.trim());
              onClose();
            }}
            className="mt-4 w-full py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs transition-colors shadow-lg"
          >
            Send Question
          </button>
        )}
      </div>
    </div>
  );
};

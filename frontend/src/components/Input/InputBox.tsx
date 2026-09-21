import React, { useState, useRef, useEffect } from "react";
import { Send, Mic, MicOff, Loader2 } from "lucide-react";
import { speechService } from "../../services/speechService";

interface InputBoxProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  language: string; // current selected language (hi, ta, te, etc.)
  disabled?: boolean;
}

const LANGUAGE_NAMES: Record<string, string> = {
  hi: "Hindi",
  en: "English",
  ta: "Tamil",
  te: "Telugu",
  bn: "Bengali",
  mr: "Marathi",
  gu: "Gujarati",
  kn: "Kannada",
  ml: "Malayalam",
  pa: "Punjabi",
  or: "Odia",
  as: "Assamese",
  ur: "Urdu",
  auto: "Auto",
};

export const InputBox: React.FC<InputBoxProps> = ({
  onSend,
  isLoading,
  language = "hi",
  disabled = false,
}) => {
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Focus input when not listening
  useEffect(() => {
    if (!isListening && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isListening]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isLoading || disabled) return;

    onSend(text);
    setInput("");
    setInterimTranscript("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleListening = () => {
    if (isListening) {
      // Stop listening
      speechService.stopListening();
      setIsListening(false);
      setInterimTranscript("");
    } else {
      // Start listening
      setIsListening(true);
      setInterimTranscript("");

      speechService.startListening(language, {
        onStart: () => {
          setIsListening(true);
        },
        onResult: (transcript, isFinal) => {
          if (isFinal) {
            setInput((prev) => (prev ? prev + " " + transcript : transcript));
            setInterimTranscript("");
            // Optional: auto-send after final result
            // onSend(transcript);
          } else {
            setInterimTranscript(transcript);
          }
        },
        onEnd: () => {
          setIsListening(false);
          setInterimTranscript("");
        },
        onError: (error) => {
          console.error("Speech error:", error);
          setIsListening(false);
          setInterimTranscript("");
          alert(error); // You can replace with toast later
        },
      });
    }
  };

  const displayValue = interimTranscript
    ? `${input} ${interimTranscript}`.trim()
    : input;

  return (
    <div className="w-full max-w-4xl mx-auto px-3 pb-4">
      <div className="relative flex items-end gap-2 bg-[#2a2a2a] border border-white/10 rounded-2xl px-3 py-2 shadow-lg">
        
        {/* Textarea */}
        <textarea
          ref={inputRef}
          value={displayValue}
          onChange={(e) => {
            setInput(e.target.value);
            setInterimTranscript("");
          }}
          onKeyDown={handleKeyDown}
          placeholder={
            isListening
              ? `Listening in ${LANGUAGE_NAMES[language] || "Hindi"}...`
              : "Ask about weather..."
          }
          disabled={isLoading || disabled || isListening}
          rows={1}
          className="flex-1 bg-transparent text-white placeholder:text-gray-500 resize-none outline-none py-2.5 px-1 text-sm max-h-32 overflow-y-auto"
          style={{ minHeight: "44px" }}
        />

        {/* Microphone Button */}
        <button
          onClick={toggleListening}
          disabled={isLoading || disabled}
          className={`p-2.5 rounded-xl transition-all duration-200 flex-shrink-0 ${
            isListening
              ? "bg-red-500/20 text-red-400 hover:bg-red-500/30 animate-pulse"
              : "text-gray-400 hover:text-white hover:bg-white/10"
          }`}
          title={isListening ? "Stop listening" : "Start voice input"}
        >
          {isListening ? (
            <MicOff className="w-5 h-5" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </button>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading || disabled}
          className={`p-2.5 rounded-xl transition-all duration-200 flex-shrink-0 ${
            input.trim() && !isLoading
              ? "bg-cyan-600 hover:bg-cyan-500 text-white"
              : "text-gray-600 cursor-not-allowed"
          }`}
          title="Send message"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Listening indicator */}
      {isListening && (
        <div className="mt-2 text-center text-xs text-cyan-400 animate-pulse">
          Listening in {LANGUAGE_NAMES[language] || "Hindi"}... Speak now
        </div>
      )}
    </div>
  );
};
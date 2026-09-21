import React, { useState } from 'react';
import { CloudSun, Copy, Check, Volume2, VolumeX, RotateCcw, ThumbsUp, ThumbsDown, Sparkles } from 'lucide-react';
import { Message } from '../../types/weather';
import { WeatherCard } from '../Cards/WeatherCard';
import { ThinkingAccordion } from './ThinkingAccordion';
import { speechService } from '../../services/speechService';

interface MessageBubbleProps {
  message: Message;
  unit: 'metric' | 'imperial';
  onRegenerate?: () => void;
}

// Simple Markdown parser for weather responses
function renderFormattedContent(text: string) {
  const lines = text.split('\n');
  return lines.map((line, idx) => {
    // Headings
    if (line.startsWith('### ')) {
      return (
        <h3 key={idx} className="text-sm sm:text-base font-bold text-white mt-3 mb-1.5 flex items-center gap-1.5">
          {formatInline(line.replace('### ', ''))}
        </h3>
      );
    }
    if (line.startsWith('## ')) {
      return (
        <h2 key={idx} className="text-base sm:text-lg font-bold text-white mt-4 mb-2">
          {formatInline(line.replace('## ', ''))}
        </h2>
      );
    }
    // List item
    if (line.startsWith('- ') || line.startsWith('* ') || line.startsWith('• ')) {
      return (
        <li key={idx} className="ml-4 list-disc text-xs sm:text-sm text-gray-200 my-0.5 leading-relaxed">
          {formatInline(line.replace(/^[-*•]\s+/, ''))}
        </li>
      );
    }
    // Numbered list
    if (/^\d+\.\s/.test(line)) {
      return (
        <li key={idx} className="ml-4 list-decimal text-xs sm:text-sm text-gray-200 my-0.5 leading-relaxed">
          {formatInline(line.replace(/^\d+\.\s+/, ''))}
        </li>
      );
    }
    // Empty line
    if (!line.trim()) {
      return <div key={idx} className="h-2" />;
    }
    // Normal paragraph
    return (
      <p key={idx} className="text-xs sm:text-sm text-gray-200 leading-relaxed my-1">
        {formatInline(line)}
      </p>
    );
  });
}

// Inline formatting for **bold**, *italic*, `code`
function formatInline(str: string): React.ReactNode {
  const parts = str.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i} className="text-cyan-300 italic">{part.slice(1, -1)}</em>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} className="px-1.5 py-0.5 rounded bg-[#1e1e1e] font-mono text-cyan-300 text-xs">{part.slice(1, -1)}</code>;
    }
    return part;
  });
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  unit,
  onRegenerate
}) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [liked, setLiked] = useState<boolean | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleSpeak = () => {
    if (isSpeaking) {
      speechService.stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      speechService.speak(message.content, message.language || 'en', 1.0, () => {
        setIsSpeaking(false);
      });
    }
  };

  return (
    <div className={`w-full py-2.5 px-3 sm:px-6 transition-colors ${isUser ? '' : 'bg-[#212121]/30'}`}>
      <div className="max-w-3xl mx-auto flex items-start gap-3 sm:gap-4">
        {/* Left Avatar for AI (or spacer for user) */}
        {!isUser ? (
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md flex-shrink-0 mt-1">
            <CloudSun className="w-4 h-4" />
          </div>
        ) : null}

        {/* Message Container */}
        <div className={`flex-1 min-w-0 ${isUser ? 'flex justify-end' : ''}`}>
          {isUser ? (
            /* User Bubble: Right-aligned pill */
            <div className="group relative max-w-[85%] sm:max-w-[75%]">
              <div className="px-4 py-3 rounded-3xl bg-[#2f2f2f] text-white text-xs sm:text-sm leading-relaxed border border-white/5 shadow-sm">
                {message.content}
              </div>
              <div className="absolute right-2 -bottom-5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-[#1e1e1e] px-1.5 py-0.5 rounded-lg border border-white/5 shadow-md">
                <button
                  onClick={handleCopy}
                  className="text-gray-400 hover:text-white p-1"
                  title="Copy prompt"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          ) : (
            /* Assistant Message: Clean typography, Rich Card, Actions */
            <div className="w-full space-y-2">
              {/* Thinking block if available */}
              {message.thoughtProcess && (
                <ThinkingAccordion thoughtProcess={message.thoughtProcess} />
              )}

              {/* Formatted Text Content */}
              <div className="prose-weather text-xs sm:text-sm">
                {renderFormattedContent(message.content)}
              </div>

              {/* Rich Weather Card if attached */}
              {message.weatherData && (
                <WeatherCard data={message.weatherData} unit={unit} />
              )}

              {/* Action Toolbar */}
              <div className="flex items-center gap-1 pt-1.5 text-[#8e8ea0]">
                {/* Copy Button */}
                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg hover:text-white hover:bg-[#2a2a2a] transition-colors"
                  title="Copy response"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>

                {/* Read Aloud (TTS) */}
                <button
                  onClick={handleToggleSpeak}
                  className={`p-1.5 rounded-lg hover:text-white hover:bg-[#2a2a2a] transition-colors ${
                    isSpeaking ? 'text-cyan-400 bg-cyan-500/15' : ''
                  }`}
                  title={isSpeaking ? "Stop speaking" : "Read aloud (TTS)"}
                >
                  {isSpeaking ? <VolumeX className="w-3.5 h-3.5 animate-pulse" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>

                {/* Regenerate */}
                {onRegenerate && (
                  <button
                    onClick={onRegenerate}
                    className="p-1.5 rounded-lg hover:text-white hover:bg-[#2a2a2a] transition-colors"
                    title="Regenerate forecast"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Thumbs Up / Down */}
                <button
                  onClick={() => setLiked(liked === true ? null : true)}
                  className={`p-1.5 rounded-lg hover:text-white hover:bg-[#2a2a2a] transition-colors ${
                    liked === true ? 'text-cyan-400' : ''
                  }`}
                  title="Good response"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setLiked(liked === false ? null : false)}
                  className={`p-1.5 rounded-lg hover:text-white hover:bg-[#2a2a2a] transition-colors ${
                    liked === false ? 'text-red-400' : ''
                  }`}
                  title="Bad response"
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

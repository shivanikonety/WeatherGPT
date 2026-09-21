import React, { useRef, useEffect, useState } from 'react';
import { Message, LocationInfo } from '../../types/weather';
import { MessageBubble } from './MessageBubble';
import { WelcomeScreen } from './WelcomeScreen';
import { TypingIndicator } from './TypingIndicator';
import { ArrowDown } from 'lucide-react';

interface ChatAreaProps {
  messages: Message[];
  isLoading: boolean;
  unit: 'metric' | 'imperial';
  language: string;
  userName?: string;
  currentLocation: LocationInfo;
  onSelectPrompt: (promptQuery: string) => void;
  onRegenerateLast?: () => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  isLoading,
  unit,
  userName,
  currentLocation,
  onSelectPrompt,
  onRegenerateLast
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    bottomRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isUp = scrollHeight - scrollTop - clientHeight > 180;
    setShowScrollBottom(isUp);
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto relative flex flex-col justify-between"
    >
      {messages.length === 0 ? (
        <WelcomeScreen
          userName={userName}
          currentLocation={currentLocation}
          onSelectPrompt={onSelectPrompt}
        />
      ) : (
        <div className="flex-1 py-4 space-y-1">
          {messages.map((msg, idx) => (
            <MessageBubble
              key={msg.id || idx}
              message={msg}
              unit={unit}
              onRegenerate={
                idx === messages.length - 1 && msg.role === 'assistant'
                  ? onRegenerateLast
                  : undefined
              }
            />
          ))}

          {isLoading && <TypingIndicator />}
          <div ref={bottomRef} className="h-6" />
        </div>
      )}

      {/* Sticky Scroll to Bottom Pill */}
      {showScrollBottom && (
        <button
          onClick={() => scrollToBottom('smooth')}
          className="fixed bottom-24 right-6 sm:right-10 p-2.5 rounded-full bg-[#2a2a2a] hover:bg-[#343434] border border-white/10 text-white shadow-2xl transition-all z-30 group"
          title="Scroll to bottom"
        >
          <ArrowDown className="w-4 h-4 text-cyan-400 group-hover:translate-y-0.5 transition-transform" />
        </button>
      )}
    </div>
  );
};

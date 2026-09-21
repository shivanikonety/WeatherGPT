import React, { useState } from 'react';
import { BrainCircuit, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

interface ThinkingAccordionProps {
  thoughtProcess: string;
}

export const ThinkingAccordion: React.FC<ThinkingAccordionProps> = ({ thoughtProcess }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="my-2.5 rounded-2xl bg-[#1b1b1b] border border-cyan-500/20 overflow-hidden transition-all duration-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-[#242424] transition-colors"
      >
        <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
          <BrainCircuit className="w-3.5 h-3.5 text-cyan-400" />
          <span>Thought for 2.4 seconds</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 font-mono">
            DeepWeather R1
          </span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-[#8e8ea0]">
          <span>{isOpen ? 'Collapse' : 'Expand reasoning'}</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </button>

      {isOpen && (
        <div className="px-3.5 py-2.5 border-t border-cyan-500/10 bg-[#161616] text-xs font-mono text-gray-300 whitespace-pre-wrap leading-relaxed animate-fadeIn">
          {thoughtProcess}
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { CloudSun } from 'lucide-react';

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-start gap-3 py-4 max-w-3xl mx-auto px-4 w-full animate-fadeIn">
      {/* WeatherGPT Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md flex-shrink-0">
        <CloudSun className="w-4 h-4" />
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-white">WeatherGPT</span>
          <span className="text-[10px] text-cyan-400 font-medium">analyzing atmospheric models...</span>
        </div>

        {/* Pulse dots */}
        <div className="flex items-center gap-1.5 py-1 px-3 rounded-full bg-[#282828] border border-white/5 w-fit">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
        </div>
      </div>
    </div>
  );
};

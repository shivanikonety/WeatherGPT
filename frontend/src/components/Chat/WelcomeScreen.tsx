import React from 'react';
import { CloudSun, Sparkles, Umbrella, Wind, Compass, MapPin } from 'lucide-react';
import { QUICK_PROMPTS } from '../../services/mockData';
import { LocationInfo } from '../../types/weather';

interface WelcomeScreenProps {
  userName?: string;
  currentLocation: LocationInfo;
  onSelectPrompt: (promptQuery: string) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  userName = 'KP',
  currentLocation,
  onSelectPrompt
}) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    if (hour < 21) return 'Good evening';
    return 'Good to see you';
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 max-w-3xl mx-auto w-full text-center animate-fadeIn select-none">
      {/* Centered Avatar Icon */}
      <div className="relative mb-5">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-cyan-500/20">
          <CloudSun className="w-8 h-8 sm:w-9 sm:h-9" />
        </div>
        <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-cyan-500 border-2 border-[#212121]"></span>
        </span>
      </div>

      {/* Greeting Title */}
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
        {getGreeting()}, <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400 bg-clip-text text-transparent">{userName}</span>
      </h1>
      <p className="text-sm sm:text-base text-[#8e8ea0] mt-2 max-w-lg">
        Where would you like to check the weather today? Ask in <strong className="text-cyan-300">Hindi</strong>, <strong className="text-cyan-300">English</strong>, or any language.
      </p>

      {/* Location Badge */}
      <div className="inline-flex items-center gap-2 mt-4 px-3 py-1.5 rounded-full bg-[#2a2a2a] border border-white/10 text-xs text-gray-300 shadow-sm">
        <MapPin className="w-3.5 h-3.5 text-cyan-400" />
        <span>Current GPS: <strong>{currentLocation.name}, {currentLocation.state || currentLocation.country}</strong></span>
      </div>

      {/* Quick Prompt Suggestion Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full mt-8 max-w-2xl text-left">
        {QUICK_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPrompt(prompt.query)}
            className="p-3.5 rounded-2xl bg-[#282828] hover:bg-[#2e2e2e] border border-white/5 hover:border-cyan-500/30 transition-all flex items-start gap-3 text-left group shadow-sm"
          >
            <span className="text-xl p-2 rounded-xl bg-[#212121] border border-white/5 group-hover:scale-110 transition-transform flex-shrink-0">
              {prompt.icon}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors truncate">
                  {prompt.title}
                </span>
                {prompt.lang === 'hi' && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                    हिंदी
                  </span>
                )}
              </div>
              <p className="text-xs text-[#8e8ea0] mt-0.5 line-clamp-2">
                {prompt.subtitle}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

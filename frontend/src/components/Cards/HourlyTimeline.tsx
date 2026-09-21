import React from 'react';
import { HourlyForecast } from '../../types/weather';
import { Cloud, CloudDrizzle, CloudLightning, CloudRain, Sun, CloudSun, Droplets } from 'lucide-react';

interface HourlyTimelineProps {
  hourly: HourlyForecast[];
  unit: 'metric' | 'imperial';
}

function getWeatherIcon(icon: string, className = "w-4 h-4") {
  switch (icon) {
    case 'sun':
      return <Sun className={`${className} text-amber-400`} />;
    case 'cloud-sun':
    case 'cloud-sun-rain':
      return <CloudSun className={`${className} text-amber-300`} />;
    case 'cloud-rain':
      return <CloudRain className={`${className} text-cyan-400`} />;
    case 'cloud-lightning':
      return <CloudLightning className={`${className} text-yellow-400 animate-pulse`} />;
    case 'cloud-drizzle':
      return <CloudDrizzle className={`${className} text-blue-300`} />;
    default:
      return <Cloud className={`${className} text-gray-400`} />;
  }
}

export const HourlyTimeline: React.FC<HourlyTimelineProps> = ({ hourly, unit }) => {
  const unitSymbol = unit === 'imperial' ? '°F' : '°';

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-200">
          <Droplets className="w-3.5 h-3.5 text-cyan-400" />
          <span>Hourly Precipitation & Temperature Progression</span>
        </div>
        <span className="text-[10px] text-[#8e8ea0]">Swipe / Scroll for timeline</span>
      </div>

      {/* Horizontal Scrubber */}
      <div className="flex gap-2.5 overflow-x-auto pb-2 pt-1 scrollbar-thin scrollbar-thumb-white/10 select-none">
        {hourly.map((hour, idx) => {
          const isHighRain = hour.rainProbability >= 60;
          return (
            <div
              key={idx}
              className={`flex-shrink-0 w-16 p-2 rounded-xl flex flex-col items-center justify-between border transition-all ${
                hour.isNow
                  ? 'bg-cyan-500/15 border-cyan-500/40 shadow-sm'
                  : 'bg-[#212121]/80 border-white/5 hover:bg-[#282828] hover:border-white/10'
              }`}
            >
              <span className={`text-[11px] font-mono ${hour.isNow ? 'text-cyan-300 font-bold' : 'text-[#8e8ea0]'}`}>
                {hour.isNow ? 'Now' : hour.time}
              </span>

              <div className="my-1.5 flex items-center justify-center">
                {getWeatherIcon(hour.icon, "w-5 h-5")}
              </div>

              <span className="text-xs font-bold text-white font-mono">
                {hour.temperature}{unitSymbol}
              </span>

              {/* Rain Probability Bar */}
              <div className="w-full mt-1.5 flex flex-col items-center">
                <div className="w-full bg-[#18181b] h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isHighRain ? 'bg-cyan-400' : 'bg-blue-500/70'
                    }`}
                    style={{ width: `${Math.max(hour.rainProbability, 6)}%` }}
                  />
                </div>
                <span className={`text-[10px] font-mono mt-0.5 ${isHighRain ? 'text-cyan-300 font-semibold' : 'text-[#8e8ea0]'}`}>
                  {hour.rainProbability}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

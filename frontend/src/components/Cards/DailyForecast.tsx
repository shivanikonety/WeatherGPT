import React from 'react';
import { DailyForecast as DailyForecastType } from '../../types/weather';
import { Calendar, Cloud, CloudDrizzle, CloudLightning, CloudRain, Sun, CloudSun } from 'lucide-react';

interface DailyForecastProps {
  daily: DailyForecastType[];
  unit: 'metric' | 'imperial';
}

function getWeatherIcon(icon: string) {
  switch (icon) {
    case 'sun':
      return <Sun className="w-4 h-4 text-amber-400" />;
    case 'cloud-sun':
    case 'cloud-sun-rain':
      return <CloudSun className="w-4 h-4 text-amber-300" />;
    case 'cloud-rain':
      return <CloudRain className="w-4 h-4 text-cyan-400" />;
    case 'cloud-lightning':
      return <CloudLightning className="w-4 h-4 text-yellow-400 animate-pulse" />;
    case 'cloud-drizzle':
      return <CloudDrizzle className="w-4 h-4 text-blue-300" />;
    default:
      return <Cloud className="w-4 h-4 text-gray-400" />;
  }
}

export const DailyForecast: React.FC<DailyForecastProps> = ({ daily, unit }) => {
  const unitSymbol = unit === 'imperial' ? '°F' : '°';

  return (
    <div className="w-full">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-200 mb-2">
        <Calendar className="w-3.5 h-3.5 text-cyan-400" />
        <span>5-Day Outlook</span>
      </div>

      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-2">
        {daily.map((day, idx) => (
          <div
            key={idx}
            className="p-2.5 rounded-xl bg-[#212121]/80 border border-white/5 hover:border-white/10 hover:bg-[#282828] transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-200">{day.dayName}</span>
              {getWeatherIcon(day.icon)}
            </div>

            <div className="my-2">
              <div className="text-sm font-bold text-white font-mono">
                {day.maxTemp}{unitSymbol}
                <span className="text-xs text-[#8e8ea0] font-normal ml-1">
                  / {day.minTemp}{unitSymbol}
                </span>
              </div>
              <p className="text-[10px] text-gray-400 truncate mt-0.5">{day.condition}</p>
            </div>

            <div className="flex items-center justify-between text-[10px] text-[#8e8ea0] border-t border-white/5 pt-1.5">
              <span>Rain</span>
              <span className={`font-mono font-semibold ${day.rainProbability >= 50 ? 'text-cyan-300' : 'text-gray-400'}`}>
                {day.rainProbability}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { WeatherPayload } from '../../types/weather';
import { HourlyTimeline } from './HourlyTimeline';
import { DailyForecast } from './DailyForecast';
import { ImpactMetrics } from './ImpactMetrics';
import { RadarPreview } from './RadarPreview';
import {
  Cloud,
  CloudDrizzle,
  CloudLightning,
  CloudRain,
  Sun,
  CloudSun,
  Wind,
  Droplets,
  Eye,
  Gauge,
  SunMedium,
  Sparkles,
  MapPin,
  Clock,
  Compass,
  Layers,
  ChevronRight
} from 'lucide-react';

interface WeatherCardProps {
  data: WeatherPayload;
  unit: 'metric' | 'imperial';
}

function getWeatherIcon(icon: string, className = "w-8 h-8") {
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
      return <Cloud className={`${className} text-gray-300`} />;
  }
}

export const WeatherCard: React.FC<WeatherCardProps> = ({ data, unit }) => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'impact' | 'daily' | 'radar'>('timeline');
  const unitSymbol = unit === 'imperial' ? '°F' : '°C';
  const speedUnit = unit === 'imperial' ? 'mph' : 'km/h';

  const { location, current, hourly, daily, impact } = data;
  const isThunderstorm = current.icon === 'cloud-lightning' || current.rainProbability >= 75;

  return (
    <div className="w-full my-3 rounded-3xl bg-gradient-to-b from-[#282828] to-[#1e1e1e] border border-white/10 shadow-2xl overflow-hidden transition-all duration-300">
      {/* Hero Header */}
      <div className={`p-4 sm:p-5 relative overflow-hidden border-b border-white/10 ${
        isThunderstorm 
          ? 'bg-gradient-to-r from-cyan-950/60 via-[#222738] to-slate-900/80' 
          : 'bg-gradient-to-r from-[#2a2a2a] to-[#202020]'
      }`}>
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
              <MapPin className="w-3.5 h-3.5" />
              <span>{location.name}{location.state ? `, ${location.state}` : ''}</span>
              {location.localTime && (
                <span className="text-[11px] text-[#8e8ea0] font-normal flex items-center gap-1 border-l border-white/10 pl-2">
                  <Clock className="w-3 h-3" />
                  {location.localTime}
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight font-mono">
                {current.temperature}{unitSymbol}
              </span>
              <div className="flex flex-col">
                <span className="text-xs text-gray-300 font-medium">
                  Feels like <strong className="text-white font-mono">{current.feelsLike}{unitSymbol}</strong>
                </span>
                <span className="text-xs text-cyan-300 font-medium">
                  {current.condition}
                </span>
              </div>
            </div>
          </div>

          {/* Right Icon + Condition Badge */}
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-[#18181b]/60 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-lg">
              {getWeatherIcon(current.icon, "w-10 h-10")}
            </div>
          </div>
        </div>

        {/* 6-Grid Key Metrics */}
        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-6 gap-2 mt-4 pt-3 border-t border-white/5">
          {/* Rain Chance */}
          <div className="p-2 rounded-xl bg-[#1c1c1c]/70 border border-white/5 flex flex-col">
            <span className="text-[10px] text-[#8e8ea0] flex items-center gap-1">
              <Droplets className="w-3 h-3 text-cyan-400" />
              Rain Chance
            </span>
            <span className={`text-xs font-bold font-mono mt-1 ${current.rainProbability >= 60 ? 'text-cyan-300' : 'text-white'}`}>
              {current.rainProbability}%
            </span>
          </div>

          {/* Wind Speed */}
          <div className="p-2 rounded-xl bg-[#1c1c1c]/70 border border-white/5 flex flex-col">
            <span className="text-[10px] text-[#8e8ea0] flex items-center gap-1">
              <Wind className="w-3 h-3 text-blue-400" />
              Wind
            </span>
            <span className="text-xs font-bold text-white font-mono mt-1">
              {current.windSpeed} {speedUnit}
            </span>
          </div>

          {/* Humidity */}
          <div className="p-2 rounded-xl bg-[#1c1c1c]/70 border border-white/5 flex flex-col">
            <span className="text-[10px] text-[#8e8ea0] flex items-center gap-1">
              <Droplets className="w-3 h-3 text-emerald-400" />
              Humidity
            </span>
            <span className="text-xs font-bold text-white font-mono mt-1">
              {current.humidity}%
            </span>
          </div>

          {/* UV Index */}
          <div className="p-2 rounded-xl bg-[#1c1c1c]/70 border border-white/5 flex flex-col">
            <span className="text-[10px] text-[#8e8ea0] flex items-center gap-1">
              <SunMedium className="w-3 h-3 text-amber-400" />
              UV Index
            </span>
            <span className="text-xs font-bold text-white font-mono mt-1">
              {current.uvIndex} <span className="text-[9px] font-normal text-gray-400">({current.uvLabel || 'Low'})</span>
            </span>
          </div>

          {/* Air Quality (AQI) */}
          <div className="p-2 rounded-xl bg-[#1c1c1c]/70 border border-white/5 flex flex-col">
            <span className="text-[10px] text-[#8e8ea0] flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              Air Quality
            </span>
            <span className="text-xs font-bold text-emerald-400 font-mono mt-1">
              AQI {current.aqi}
            </span>
          </div>

          {/* Visibility */}
          <div className="p-2 rounded-xl bg-[#1c1c1c]/70 border border-white/5 flex flex-col">
            <span className="text-[10px] text-[#8e8ea0] flex items-center gap-1">
              <Eye className="w-3 h-3 text-indigo-400" />
              Visibility
            </span>
            <span className="text-xs font-bold text-white font-mono mt-1">
              {current.visibility} km
            </span>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="px-4 pt-3 flex items-center gap-1.5 border-b border-white/5 bg-[#212121] overflow-x-auto">
        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-t-xl transition-colors border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'timeline'
              ? 'border-cyan-400 text-cyan-300 bg-[#282828]'
              : 'border-transparent text-[#8e8ea0] hover:text-white hover:bg-white/5'
          }`}
        >
          <Droplets className="w-3.5 h-3.5" />
          <span>24h Timeline</span>
        </button>

        <button
          onClick={() => setActiveTab('impact')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-t-xl transition-colors border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'impact'
              ? 'border-cyan-400 text-cyan-300 bg-[#282828]'
              : 'border-transparent text-[#8e8ea0] hover:text-white hover:bg-white/5'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Decision & Advisory</span>
        </button>

        <button
          onClick={() => setActiveTab('daily')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-t-xl transition-colors border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'daily'
              ? 'border-cyan-400 text-cyan-300 bg-[#282828]'
              : 'border-transparent text-[#8e8ea0] hover:text-white hover:bg-white/5'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>5-Day Forecast</span>
        </button>

        <button
          onClick={() => setActiveTab('radar')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-t-xl transition-colors border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'radar'
              ? 'border-cyan-400 text-cyan-300 bg-[#282828]'
              : 'border-transparent text-[#8e8ea0] hover:text-white hover:bg-white/5'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Live Radar</span>
        </button>
      </div>

      {/* Tab Content Panel */}
      <div className="p-4 bg-[#1f1f1f]">
        {activeTab === 'timeline' && <HourlyTimeline hourly={hourly} unit={unit} />}
        {activeTab === 'impact' && <ImpactMetrics impact={impact} />}
        {activeTab === 'daily' && <DailyForecast daily={daily} unit={unit} />}
        {activeTab === 'radar' && <RadarPreview locationName={location.name} isRainy={current.rainProbability >= 40} />}
      </div>
    </div>
  );
};

import React from 'react';
import { WeatherImpact } from '../../types/weather';
import { Umbrella, Shirt, Footprints, Bike, Utensils, Car, ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react';

interface ImpactMetricsProps {
  impact: WeatherImpact;
}

export const ImpactMetrics: React.FC<ImpactMetricsProps> = ({ impact }) => {
  const { umbrella, clothing, activities, health } = impact;

  const getUmbrellaBadge = () => {
    switch (umbrella.level) {
      case 'critical':
        return {
          bg: 'bg-red-500/15 border-red-500/40 text-red-300',
          icon: ShieldAlert,
          iconColor: 'text-red-400'
        };
      case 'warning':
        return {
          bg: 'bg-amber-500/15 border-amber-500/40 text-amber-300',
          icon: AlertCircle,
          iconColor: 'text-amber-400'
        };
      case 'info':
        return {
          bg: 'bg-blue-500/15 border-blue-500/40 text-blue-300',
          icon: Umbrella,
          iconColor: 'text-blue-400'
        };
      default:
        return {
          bg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300',
          icon: CheckCircle2,
          iconColor: 'text-emerald-400'
        };
    }
  };

  const badge = getUmbrellaBadge();
  const BadgeIcon = badge.icon;

  const getActivityColor = (score: number) => {
    if (score >= 70) return 'text-emerald-400 bg-emerald-500/20';
    if (score >= 40) return 'text-amber-400 bg-amber-500/20';
    return 'text-red-400 bg-red-500/20';
  };

  return (
    <div className="space-y-3">
      {/* Top row: Umbrella Verdict & Clothing Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* Umbrella Decision Card */}
        <div className={`p-3 rounded-2xl border ${badge.bg} flex flex-col justify-between`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Umbrella className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-semibold text-gray-200">Umbrella Verdict</span>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#18181b] border border-white/10 uppercase tracking-tight flex items-center gap-1">
              <BadgeIcon className={`w-3 h-3 ${badge.iconColor}`} />
              {umbrella.verdict}
            </span>
          </div>
          <p className="text-xs mt-2 leading-relaxed text-gray-300">
            {umbrella.text}
          </p>
          {umbrella.window && (
            <span className="text-[10px] text-[#8e8ea0] mt-1 font-mono">
              Rain Window: {umbrella.window}
            </span>
          )}
        </div>

        {/* Clothing Card */}
        <div className="p-3 rounded-2xl bg-[#212121]/80 border border-white/5 flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <Shirt className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-semibold text-gray-200">Clothing & Layering</span>
          </div>
          <div className="my-1.5">
            <span className="text-xs font-medium text-white">{clothing.layers}</span>
            <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">{clothing.advice}</p>
          </div>
          {clothing.accessories && clothing.accessories.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {clothing.accessories.map((acc, i) => (
                <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-[#2a2a2a] text-gray-300 border border-white/5">
                  {acc}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Activity Suitability Grid */}
      <div className="p-3 rounded-2xl bg-[#212121]/80 border border-white/5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-200">Outdoor Activity Suitability</span>
          <span className="text-[10px] text-[#8e8ea0]">0–100 Meteorological Index</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* Running */}
          <div className="p-2 rounded-xl bg-[#282828] border border-white/5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-300 flex items-center gap-1">
                <Footprints className="w-3.5 h-3.5 text-cyan-400" />
                Running
              </span>
              <span className={`text-[11px] font-bold px-1.5 py-0.2 rounded font-mono ${getActivityColor(activities.running.score)}`}>
                {activities.running.score}
              </span>
            </div>
            <p className="text-[10px] text-[#8e8ea0] mt-1 line-clamp-2">{activities.running.notes}</p>
          </div>

          {/* Cycling */}
          <div className="p-2 rounded-xl bg-[#282828] border border-white/5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-300 flex items-center gap-1">
                <Bike className="w-3.5 h-3.5 text-amber-400" />
                Cycling
              </span>
              <span className={`text-[11px] font-bold px-1.5 py-0.2 rounded font-mono ${getActivityColor(activities.cycling.score)}`}>
                {activities.cycling.score}
              </span>
            </div>
            <p className="text-[10px] text-[#8e8ea0] mt-1 line-clamp-2">{activities.cycling.notes}</p>
          </div>

          {/* Dining */}
          <div className="p-2 rounded-xl bg-[#282828] border border-white/5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-300 flex items-center gap-1">
                <Utensils className="w-3.5 h-3.5 text-emerald-400" />
                Dining
              </span>
              <span className={`text-[11px] font-bold px-1.5 py-0.2 rounded font-mono ${getActivityColor(activities.dining.score)}`}>
                {activities.dining.score}
              </span>
            </div>
            <p className="text-[10px] text-[#8e8ea0] mt-1 line-clamp-2">{activities.dining.notes}</p>
          </div>

          {/* Commute */}
          <div className="p-2 rounded-xl bg-[#282828] border border-white/5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-300 flex items-center gap-1">
                <Car className="w-3.5 h-3.5 text-purple-400" />
                Commute
              </span>
              <span className={`text-[11px] font-bold px-1.5 py-0.2 rounded font-mono ${getActivityColor(activities.commute.score)}`}>
                {activities.commute.score}
              </span>
            </div>
            <p className="text-[10px] text-[#8e8ea0] mt-1 line-clamp-2">{activities.commute.notes}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

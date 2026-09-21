import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, ShieldAlert, X, Clock, MapPin } from 'lucide-react';
import { WeatherAlert } from '../../types/weather';

interface SevereAlertBannerProps {
  alert: WeatherAlert;
  onDismiss?: () => void;
}

export const SevereAlertBanner: React.FC<SevereAlertBannerProps> = ({ alert, onDismiss }) => {
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="w-full bg-gradient-to-r from-red-950/90 via-amber-950/80 to-red-950/90 border-b border-red-500/30 text-white px-4 py-2.5 transition-all duration-300 relative z-30 shadow-lg">
      <div className="max-w-4xl mx-auto flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex h-2.5 w-2.5 relative flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <p className="text-xs sm:text-sm font-semibold text-red-200 tracking-wide truncate">
              {alert.headline}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setExpanded(!expanded)}
              className="px-2 py-0.5 rounded text-[11px] font-medium bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/30 flex items-center gap-1 transition-colors"
            >
              {expanded ? 'Hide Details' : 'View Action Guide'}
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            <button
              onClick={() => {
                setDismissed(true);
                onDismiss?.();
              }}
              aria-label="Dismiss alert"
              className="p-1 text-red-300 hover:text-white rounded hover:bg-red-500/20 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {expanded && (
          <div className="mt-2 pt-2 border-t border-red-500/20 text-xs text-red-100/90 space-y-2 animate-fadeIn">
            <p className="leading-relaxed">{alert.description}</p>
            {alert.instruction && (
              <div className="bg-red-900/40 p-2.5 rounded-lg border border-red-500/30 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-300 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-amber-300">Safety Instruction: </span>
                  <span>{alert.instruction}</span>
                </div>
              </div>
            )}
            <div className="flex flex-wrap gap-4 text-[11px] text-red-300/80 pt-1">
              {alert.areaDesc && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>{alert.areaDesc}</span>
                </div>
              )}
              {alert.expires && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Active until: {alert.expires}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

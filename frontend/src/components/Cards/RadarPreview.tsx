import React, { useState } from 'react';
import { Radar, Play, Pause, RefreshCw, Layers } from 'lucide-react';

interface RadarPreviewProps {
  locationName: string;
  isRainy?: boolean;
}

export const RadarPreview: React.FC<RadarPreviewProps> = ({ locationName, isRainy = true }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [frame, setFrame] = useState(2);

  return (
    <div className="w-full rounded-2xl bg-[#1e1e1e] border border-white/10 overflow-hidden relative shadow-md">
      {/* Radar Header */}
      <div className="px-3 py-2 bg-[#252525] border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-200">
          <Radar className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '4s' }} />
          <span>High-Resolution Doppler Radar • {locationName}</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-[#8e8ea0]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>LIVE COMPOSITE</span>
        </div>
      </div>

      {/* Radar Map Canvas Simulation */}
      <div className="h-36 sm:h-44 bg-[#0d1117] relative flex items-center justify-center overflow-hidden">
        {/* Map Grid lines */}
        <div className="absolute inset-0 bg-[radial-gradient(#1f293d_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>

        {/* Concentric Range Rings */}
        <div className="absolute w-24 h-24 rounded-full border border-cyan-500/20"></div>
        <div className="absolute w-44 h-44 rounded-full border border-cyan-500/15"></div>
        <div className="absolute w-64 h-64 rounded-full border border-cyan-500/10"></div>

        {/* Crosshair */}
        <div className="absolute inset-x-0 top-1/2 h-[1px] bg-cyan-500/10"></div>
        <div className="absolute inset-y-0 left-1/2 w-[1px] bg-cyan-500/10"></div>

        {/* Center Point */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-3 h-3 rounded-full bg-cyan-400 ring-4 ring-cyan-500/30 animate-ping"></div>
          <span className="text-[10px] font-bold text-white bg-black/60 px-1.5 py-0.5 rounded mt-1 backdrop-blur-sm border border-white/10">
            {locationName}
          </span>
        </div>

        {/* Simulated Convective Storm Cells (dBZ reflectivity blobs) */}
        {isRainy && (
          <>
            <div className="absolute w-24 h-20 bg-gradient-to-tr from-emerald-500/40 via-yellow-500/50 to-red-500/60 rounded-full blur-md -top-2 left-1/3 transform -rotate-12 animate-pulse"></div>
            <div className="absolute w-32 h-24 bg-gradient-to-r from-emerald-500/30 via-yellow-500/45 to-red-600/55 rounded-full blur-lg top-10 right-1/4"></div>
            <div className="absolute w-16 h-12 bg-gradient-to-br from-yellow-400/50 via-red-500/60 to-purple-600/70 rounded-full blur-md top-14 left-1/2"></div>
          </>
        )}

        {/* Radar Sweep Beam */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-64 h-64 rounded-full border border-cyan-400/10 relative">
            <div className="absolute top-1/2 left-1/2 w-32 h-32 origin-top-left bg-gradient-to-br from-cyan-400/25 to-transparent transform -rotate-45 animate-spin" style={{ animationDuration: '6s' }}></div>
          </div>
        </div>

        {/* Reflectivity Legend at bottom-right */}
        <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-md px-2 py-1 rounded-md border border-white/10 text-[9px] flex items-center gap-1.5 z-10">
          <span className="text-gray-400 font-mono">dBZ:</span>
          <div className="flex h-2 w-16 rounded overflow-hidden">
            <span className="w-1/4 bg-emerald-500" title="Light Rain (20-30 dBZ)"></span>
            <span className="w-1/4 bg-yellow-400" title="Moderate Rain (35-45 dBZ)"></span>
            <span className="w-1/4 bg-orange-500" title="Heavy Rain (50-55 dBZ)"></span>
            <span className="w-1/4 bg-red-600" title="Severe Storm (60+ dBZ)"></span>
          </div>
        </div>
      </div>
    </div>
  );
};

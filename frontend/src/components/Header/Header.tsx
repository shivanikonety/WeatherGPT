import React from "react";
import { PanelLeft, PanelLeftClose, MapPin, Plus, Share2 } from "lucide-react";
import { ModelSelector } from "./ModelSelector";
import { LocationInfo, UserSettings } from "../../types/weather";
import { LanguageSelector } from "../../LanguageSelector";
interface HeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onNewChat: () => void;
  currentLocation: LocationInfo;
  currentTemp?: number;
  currentCondition?: string;
  onOpenLocationModal: () => void;
  settings: UserSettings;
  onToggleUnit: () => void;
  onLanguageChange: (lang: string) => void;          // ← New prop
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
  onShareChat: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  sidebarOpen,
  onToggleSidebar,
  onNewChat,
  currentLocation,
  currentTemp,
  onOpenLocationModal,
  settings,
  onToggleUnit,
  onLanguageChange,                                 // ← New prop
  selectedModel,
  onSelectModel,
  onShareChat
}) => {
  const unitSymbol = settings.unit === 'imperial' ? '°F' : '°C';

  return (
    <header className="h-14 w-full border-b border-[rgba(255,255,255,0.06)] bg-[#212121]/90 backdrop-blur-md px-3 sm:px-4 flex items-center justify-between z-20 select-none">
      
      {/* Left side: Sidebar toggle + Model Selector */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          className="p-2 rounded-xl text-[#8e8ea0] hover:text-white hover:bg-[#2a2a2a] transition-colors"
          title={sidebarOpen ? "Close sidebar (Ctrl+[)" : "Open sidebar (Ctrl+[)"}
        >
          {sidebarOpen ? (
            <PanelLeftClose className="w-5 h-5" />
          ) : (
            <PanelLeft className="w-5 h-5" />
          )}
        </button>

        <button
          onClick={onNewChat}
          className="p-2 rounded-xl text-[#8e8ea0] hover:text-white hover:bg-[#2a2a2a] transition-colors sm:hidden"
          title="New Chat"
        >
          <Plus className="w-5 h-5" />
        </button>

        <ModelSelector
          selectedModel={selectedModel}
          onSelectModel={onSelectModel}
        />
      </div>

      {/* Right side: Location + Language + Unit + Share */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        
        {/* Dynamic Location Pill */}
        <button
          onClick={onOpenLocationModal}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-[#2a2a2a] hover:bg-[#333333] border border-[rgba(255,255,255,0.08)] text-xs text-[#ececec] transition-all hover:border-cyan-500/40 group shadow-sm"
          title="Change location"
        >
          <MapPin className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
          <span className="font-medium max-w-[110px] sm:max-w-[160px] truncate">
            {currentLocation.name}{currentLocation.state ? `, ${currentLocation.state}` : ''}
          </span>
          {currentTemp !== undefined && (
            <span className="font-mono text-cyan-300 font-semibold pl-1 border-l border-white/10 hidden xs:inline">
              {currentTemp}{unitSymbol}
            </span>
          )}
        </button>

        {/* ===== Language Selector (NEW) ===== */}
        <div className="hidden md:block">
          <LanguageSelector
            value={settings.language || "hi"}
            onChange={onLanguageChange}
          />
        </div>

        {/* Unit Toggle (°C / °F) */}
        <button
          onClick={onToggleUnit}
          className="px-2.5 py-1.5 rounded-xl bg-[#2a2a2a] hover:bg-[#333333] border border-[rgba(255,255,255,0.08)] text-xs font-mono font-semibold text-cyan-300 hover:text-white transition-colors"
          title="Toggle Metric (°C) / Imperial (°F)"
        >
          {unitSymbol}
        </button>

        {/* Share Button */}
        <button
          onClick={onShareChat}
          className="p-2 rounded-xl text-[#8e8ea0] hover:text-white hover:bg-[#2a2a2a] transition-colors hidden sm:block"
          title="Share Chat"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

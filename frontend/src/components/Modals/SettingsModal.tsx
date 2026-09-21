import React from 'react';
import { X, Sliders, Moon, Volume2, Globe, BrainCircuit, Trash2, Check } from 'lucide-react';
import { UserSettings } from '../../types/weather';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onClearAllChats: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onClearAllChats
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-[#242424] border border-white/10 rounded-3xl p-5 max-w-md w-full shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-bold text-white">WeatherGPT Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#8e8ea0] hover:text-white rounded-xl hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="mt-4 space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {/* Units */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#1c1c1c] border border-white/5">
            <div>
              <p className="text-xs font-semibold text-white">Temperature Units</p>
              <p className="text-[11px] text-[#8e8ea0]">Choose Metric (°C, km/h) or Imperial (°F, mph)</p>
            </div>
            <div className="flex bg-[#282828] p-1 rounded-xl border border-white/5">
              <button
                onClick={() => onUpdateSettings({ unit: 'metric' })}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  settings.unit === 'metric' ? 'bg-cyan-500 text-black shadow' : 'text-[#8e8ea0] hover:text-white'
                }`}
              >
                °C
              </button>
              <button
                onClick={() => onUpdateSettings({ unit: 'imperial' })}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  settings.unit === 'imperial' ? 'bg-cyan-500 text-black shadow' : 'text-[#8e8ea0] hover:text-white'
                }`}
              >
                °F
              </button>
            </div>
          </div>

          {/* Multilingual Mode */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#1c1c1c] border border-white/5">
            <div>
              <p className="text-xs font-semibold text-white">Auto-Detect Query Language</p>
              <p className="text-[11px] text-[#8e8ea0]">Answers in Hindi, English, Marathi, Spanish, etc.</p>
            </div>
            <input
              type="checkbox"
              checked={settings.autoDetectLanguage}
              onChange={(e) => onUpdateSettings({ autoDetectLanguage: e.target.checked })}
              className="w-4 h-4 accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Deep Thinking Mode Default */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#1c1c1c] border border-white/5">
            <div>
              <p className="text-xs font-semibold text-white">DeepWeather R1 (Thinking Mode)</p>
              <p className="text-[11px] text-[#8e8ea0]">Expose detailed convective reasoning process</p>
            </div>
            <input
              type="checkbox"
              checked={settings.thinkingMode}
              onChange={(e) => onUpdateSettings({ thinkingMode: e.target.checked })}
              className="w-4 h-4 accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Theme */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#1c1c1c] border border-white/5">
            <div>
              <p className="text-xs font-semibold text-white">Theme Style</p>
              <p className="text-[11px] text-[#8e8ea0]">ChatGPT Charcoal or Pure OLED Black</p>
            </div>
            <div className="flex bg-[#282828] p-1 rounded-xl border border-white/5">
              <button
                onClick={() => onUpdateSettings({ theme: 'dark' })}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  settings.theme === 'dark' ? 'bg-cyan-500 text-black' : 'text-[#8e8ea0] hover:text-white'
                }`}
              >
                Dark
              </button>
              <button
                onClick={() => onUpdateSettings({ theme: 'black' })}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  settings.theme === 'black' ? 'bg-cyan-500 text-black' : 'text-[#8e8ea0] hover:text-white'
                }`}
              >
                OLED
              </button>
            </div>
          </div>

          {/* Clear Data */}
          <div className="pt-2 border-t border-white/5">
            <button
              onClick={() => {
                if (confirm('Clear all conversation history?')) {
                  onClearAllChats();
                  onClose();
                }
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-semibold transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear All Chat Histories</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

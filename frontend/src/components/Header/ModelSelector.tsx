import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Sparkles, BrainCircuit, Radar, Check } from 'lucide-react';

export interface ModelOption {
  id: string;
  name: string;
  badge: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const MODELS: ModelOption[] = [
  {
    id: 'weathergpt-4o',
    name: 'WeatherGPT 4o',
    badge: 'Omni-Forecast',
    description: 'Instant multi-source forecast, zero hallucinations, fast natural language',
    icon: Sparkles
  },
  {
    id: 'deepweather-r1',
    name: 'DeepWeather R1',
    badge: 'Thinking Mode',
    description: 'Deep convective storm analysis, radar reflectivity & decision reasoning',
    icon: BrainCircuit
  },
  {
    id: 'radar-3.5',
    name: 'Radar 3.5 Turbo',
    badge: 'High Speed',
    description: 'Lightweight hourly progression & rapid precipitation lookups',
    icon: Radar
  }
];

interface ModelSelectorProps {
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModel, onSelectModel }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const current = MODELS.find(m => m.id === selectedModel) || MODELS[0];
  const Icon = current.icon;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-[#2a2a2a] text-[#ececec] font-semibold text-sm transition-colors group"
      >
        <div className="flex items-center gap-1.5">
          <Icon className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          <span>{current.name}</span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-[#8e8ea0] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-72 rounded-2xl bg-[#282828] border border-[rgba(255,255,255,0.1)] shadow-2xl p-1.5 z-50 animate-fadeIn">
          <div className="text-[11px] font-semibold text-[#8e8ea0] px-3 py-1.5 uppercase tracking-wider">
            Model Selection
          </div>
          <div className="space-y-1">
            {MODELS.map((model) => {
              const ItemIcon = model.icon;
              const isSelected = model.id === selectedModel;
              return (
                <button
                  key={model.id}
                  onClick={() => {
                    onSelectModel(model.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-all ${
                    isSelected ? 'bg-[#343434] text-white' : 'hover:bg-[#303030] text-[#d1d5db]'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-cyan-500/20 text-cyan-400' : 'bg-[#383838] text-gray-400'}`}>
                    <ItemIcon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold">{model.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#1f1f1f] text-cyan-400 font-mono">
                        {model.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#8e8ea0] mt-0.5 leading-snug line-clamp-2">
                      {model.description}
                    </p>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

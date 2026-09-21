import React, { useState, useRef, useEffect } from 'react';
import { Settings, Sparkles, LogOut, Keyboard, HelpCircle, User, ShieldCheck } from 'lucide-react';

interface UserProfileProps {
  onOpenSettings: () => void;
  userName?: string;
  userEmail?: string;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  onOpenSettings,
  userName = 'KP Das',
  userEmail = 'kp.das@weathergpt.ai'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative p-2 border-t border-[rgba(255,255,255,0.06)]" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-2 rounded-2xl hover:bg-[#212121] transition-colors group"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
              KP
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#171717]"></span>
          </div>

          <div className="text-left min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-[#ececec] truncate">{userName}</span>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 uppercase tracking-tight">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-[#8e8ea0] truncate">{userEmail}</p>
          </div>
        </div>

        <Settings className="w-4 h-4 text-[#8e8ea0] group-hover:text-white transition-colors" />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-2 right-2 mb-2 rounded-2xl bg-[#282828] border border-[rgba(255,255,255,0.12)] shadow-2xl p-1.5 z-50 animate-fadeIn space-y-1">
          <div className="px-3 py-2 border-b border-white/5">
            <p className="text-xs font-semibold text-white">{userName}</p>
            <p className="text-[11px] text-[#8e8ea0]">{userEmail}</p>
          </div>

          <button
            onClick={() => {
              setIsOpen(false);
              onOpenSettings();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs text-gray-200 hover:bg-[#323232] hover:text-white transition-colors"
          >
            <Settings className="w-4 h-4 text-gray-400" />
            <span>Settings & Preferences</span>
          </button>

          <button
            onClick={() => {
              setIsOpen(false);
              alert('WeatherGPT Pro Plan is active with unlimited multi-source meteorological forecasts.');
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs text-cyan-300 hover:bg-cyan-500/10 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Upgrade / Manage Plan</span>
          </button>

          <button
            onClick={() => {
              setIsOpen(false);
              alert('Keyboard Shortcuts:\n• Enter: Send message\n• Shift + Enter: New line\n• Ctrl + [: Toggle sidebar\n• Ctrl + K: Search chats');
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs text-gray-300 hover:bg-[#323232] hover:text-white transition-colors"
          >
            <Keyboard className="w-4 h-4 text-gray-400" />
            <span>Keyboard Shortcuts</span>
          </button>

          <div className="pt-1 border-t border-white/5">
            <button
              onClick={() => {
                setIsOpen(false);
                if (confirm('Log out from WeatherGPT session?')) {
                  window.location.reload();
                }
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

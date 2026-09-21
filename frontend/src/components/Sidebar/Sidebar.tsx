import React, { useState, useMemo } from 'react';
import { Plus, Search, Sparkles, CloudSun, PanelLeftClose, Pin, X } from 'lucide-react';
import { ChatHistoryItem } from './ChatHistoryItem';
import { UserProfile } from './UserProfile';
import { ChatSession } from '../../types/weather';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onDeleteSession: (id: string) => void;
  onTogglePinSession: (id: string) => void;
  onOpenSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onRenameSession,
  onDeleteSession,
  onTogglePinSession,
  onOpenSettings
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return sessions;
    const q = searchQuery.toLowerCase();
    return sessions.filter(s => s.title.toLowerCase().includes(q));
  }, [sessions, searchQuery]);

  const pinnedSessions = useMemo(() => filteredSessions.filter(s => s.isPinned), [filteredSessions]);
  const todaySessions = useMemo(() => filteredSessions.filter(s => !s.isPinned && s.category === 'today'), [filteredSessions]);
  const yesterdaySessions = useMemo(() => filteredSessions.filter(s => !s.isPinned && s.category === 'yesterday'), [filteredSessions]);
  const previous7DaysSessions = useMemo(() => filteredSessions.filter(s => !s.isPinned && (s.category === 'previous_7_days' || s.category === 'older')), [filteredSessions]);

  return (
    <>
      {/* Mobile backdrop blur overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
        />
      )}

      {/* Main Sidebar Drawer */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#171717] flex flex-col justify-between border-r border-[rgba(255,255,255,0.06)] transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:-ml-64'
        }`}
      >
        {/* Top Section */}
        <div className="flex flex-col h-full min-h-0">
          {/* Logo & Header */}
          <div className="p-3 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-2.5 px-2 py-1">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <CloudSun className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-tight text-white flex items-center gap-1">
                  WeatherGPT
                  <span className="text-[10px] font-normal px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-300">
                    4o
                  </span>
                </span>
                <span className="text-[10px] text-[#8e8ea0]">AI Meteorological Intelligence</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#8e8ea0] hover:text-white hover:bg-[#212121] transition-colors md:hidden"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* New Chat Button */}
          <div className="px-3 py-1.5">
            <button
              onClick={onNewChat}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#212121] hover:bg-[#282828] border border-[rgba(255,255,255,0.08)] text-xs font-semibold text-[#ececec] transition-all hover:border-cyan-500/40 group shadow-sm"
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-black transition-colors">
                  <Plus className="w-3.5 h-3.5" />
                </div>
                <span>New chat</span>
              </div>
              <span className="text-[10px] text-[#8e8ea0] font-mono border border-white/10 rounded px-1.5 py-0.5">
                Ctrl+N
              </span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="px-3 py-1.5">
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#212121] border border-[rgba(255,255,255,0.06)] text-xs text-gray-400 focus-within:border-cyan-500/50 focus-within:text-white transition-colors">
              <Search className="w-3.5 h-3.5 text-[#8e8ea0] flex-shrink-0" />
              <input
                type="text"
                placeholder="Search forecasts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs text-white placeholder-[#8e8ea0] outline-none"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="p-0.5 text-gray-400 hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Scrollable Chat Sessions List */}
          <div className="flex-1 overflow-y-auto px-2 py-2 space-y-3">
            {/* Pinned Section */}
            {pinnedSessions.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold text-cyan-400 uppercase tracking-wider">
                  <Pin className="w-3 h-3" />
                  <span>Pinned</span>
                </div>
                <div className="space-y-0.5">
                  {pinnedSessions.map((session) => (
                    <ChatHistoryItem
                      key={session.id}
                      session={session}
                      isActive={session.id === activeSessionId}
                      onSelect={() => {
                        onSelectSession(session.id);
                        if (window.innerWidth < 768) onClose();
                      }}
                      onRename={(title) => onRenameSession(session.id, title)}
                      onDelete={() => onDeleteSession(session.id)}
                      onTogglePin={() => onTogglePinSession(session.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Today Section */}
            {todaySessions.length > 0 && (
              <div>
                <div className="px-3 py-1 text-[11px] font-semibold text-[#8e8ea0] uppercase tracking-wider">
                  Today
                </div>
                <div className="space-y-0.5">
                  {todaySessions.map((session) => (
                    <ChatHistoryItem
                      key={session.id}
                      session={session}
                      isActive={session.id === activeSessionId}
                      onSelect={() => {
                        onSelectSession(session.id);
                        if (window.innerWidth < 768) onClose();
                      }}
                      onRename={(title) => onRenameSession(session.id, title)}
                      onDelete={() => onDeleteSession(session.id)}
                      onTogglePin={() => onTogglePinSession(session.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Yesterday Section */}
            {yesterdaySessions.length > 0 && (
              <div>
                <div className="px-3 py-1 text-[11px] font-semibold text-[#8e8ea0] uppercase tracking-wider">
                  Yesterday
                </div>
                <div className="space-y-0.5">
                  {yesterdaySessions.map((session) => (
                    <ChatHistoryItem
                      key={session.id}
                      session={session}
                      isActive={session.id === activeSessionId}
                      onSelect={() => {
                        onSelectSession(session.id);
                        if (window.innerWidth < 768) onClose();
                      }}
                      onRename={(title) => onRenameSession(session.id, title)}
                      onDelete={() => onDeleteSession(session.id)}
                      onTogglePin={() => onTogglePinSession(session.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Previous 7 Days */}
            {previous7DaysSessions.length > 0 && (
              <div>
                <div className="px-3 py-1 text-[11px] font-semibold text-[#8e8ea0] uppercase tracking-wider">
                  Previous 7 Days
                </div>
                <div className="space-y-0.5">
                  {previous7DaysSessions.map((session) => (
                    <ChatHistoryItem
                      key={session.id}
                      session={session}
                      isActive={session.id === activeSessionId}
                      onSelect={() => {
                        onSelectSession(session.id);
                        if (window.innerWidth < 768) onClose();
                      }}
                      onRename={(title) => onRenameSession(session.id, title)}
                      onDelete={() => onDeleteSession(session.id)}
                      onTogglePin={() => onTogglePinSession(session.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {filteredSessions.length === 0 && (
              <div className="p-6 text-center text-xs text-[#8e8ea0]">
                No forecasts found for &quot;{searchQuery}&quot;
              </div>
            )}
          </div>

          {/* User Profile at bottom */}
          <UserProfile onOpenSettings={onOpenSettings} />
        </div>
      </aside>
    </>
  );
};

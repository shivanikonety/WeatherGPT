import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, MoreHorizontal, Pin, Trash2, Edit2, Check, X } from 'lucide-react';
import { ChatSession } from '../../types/weather';

interface ChatHistoryItemProps {
  session: ChatSession;
  isActive: boolean;
  onSelect: () => void;
  onRename: (newTitle: string) => void;
  onDelete: () => void;
  onTogglePin: () => void;
}

export const ChatHistoryItem: React.FC<ChatHistoryItemProps> = ({
  session,
  isActive,
  onSelect,
  onRename,
  onDelete,
  onTogglePin
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(session.title);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSaveRename = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (editTitle.trim()) {
      onRename(editTitle.trim());
    } else {
      setEditTitle(session.title);
    }
    setIsEditing(false);
    setIsMenuOpen(false);
  };

  return (
    <div className="relative group px-1 py-0.5">
      {isEditing ? (
        <form onSubmit={handleSaveRename} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#2a2a2a] border border-cyan-500/50">
          <input
            ref={inputRef}
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full bg-transparent text-xs text-white outline-none"
          />
          <button type="submit" className="text-cyan-400 hover:text-cyan-300 p-0.5">
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              setEditTitle(session.title);
              setIsEditing(false);
            }}
            className="text-gray-400 hover:text-white p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </form>
      ) : (
        <div
          onClick={onSelect}
          className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs cursor-pointer transition-colors ${
            isActive
              ? 'bg-[#212121] text-white font-medium shadow-sm'
              : 'text-[#d1d5db] hover:bg-[#212121]/60 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <MessageSquare className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-cyan-400' : 'text-[#8e8ea0]'}`} />
            <span className="truncate">{session.title}</span>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            {session.isPinned && (
              <Pin className="w-3 h-3 text-cyan-400 flex-shrink-0 fill-cyan-400/20" />
            )}

            {/* Menu trigger button */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(!isMenuOpen);
                }}
                className={`p-1 rounded-md text-[#8e8ea0] hover:text-white hover:bg-[#2f2f2f] transition-opacity ${
                  isActive || isMenuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>

              {isMenuOpen && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-full mt-1 w-36 rounded-xl bg-[#282828] border border-[rgba(255,255,255,0.12)] shadow-xl p-1 z-50 animate-fadeIn"
                >
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-xs text-gray-300 hover:bg-[#323232] hover:text-white transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-gray-400" />
                    <span>Rename</span>
                  </button>

                  <button
                    onClick={() => {
                      onTogglePin();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-xs text-gray-300 hover:bg-[#323232] hover:text-white transition-colors"
                  >
                    <Pin className="w-3.5 h-3.5 text-gray-400" />
                    <span>{session.isPinned ? 'Unpin' : 'Pin'}</span>
                  </button>

                  <button
                    onClick={() => {
                      onDelete();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from "react";
import { Conversation } from "@/lib/chatStorage";
import { Plus, Trash2, MessageSquare, PanelLeftClose, PanelLeft, Pencil, Check, X } from "lucide-react";

interface ConversationSidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const ConversationSidebar: React.FC<ConversationSidebarProps> = ({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  onRename,
  isOpen,
  onToggle,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const startRename = (id: string, currentTitle: string) => {
    setEditingId(id);
    setEditTitle(currentTitle);
  };

  const confirmRename = () => {
    if (editingId && editTitle.trim()) {
      onRename(editingId, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleSelect = (id: string) => {
    onSelect(id);
    if (isMobile) {
      onToggle();
    }
  };

  const handleNew = () => {
    onNew();
    if (isMobile) {
      onToggle();
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed left-2 top-20 z-30 p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors md:flex hidden"
          style={{ display: isMobile ? 'flex' : undefined }}
          aria-label="Open chat history"
        >
          <PanelLeft className="w-5 h-5" />
        </button>
      )}

      {isOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden" 
          onClick={onToggle}
        />
      )}

      <div 
        className={`w-64 h-full bg-slate-950 border-r border-slate-800 flex flex-col flex-shrink-0 transition-transform duration-300 ${
          isMobile ? 'fixed inset-y-0 left-0 z-40 ' + (isOpen ? 'translate-x-0' : '-translate-x-full') : (isOpen ? 'translate-x-0' : 'hidden')
        }`}
      >
        {/* Header */}
        <div className="p-3 border-b border-slate-800 flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-300">Chat History</span>
          <button
            onClick={onToggle}
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            aria-label="Close sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={handleNew}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 hover:bg-blue-600/30 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          {conversations.length === 0 && (
            <p className="text-xs text-slate-600 text-center py-8 px-4">
              No conversations yet. Start a new chat!
            </p>
          )}
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors text-sm ${
                conv.id === activeId
                  ? "bg-slate-800 text-white border border-slate-700"
                  : "text-slate-400 hover:bg-slate-900 hover:text-slate-200 border border-transparent"
              }`}
              onClick={() => handleSelect(conv.id)}
            >
              <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
              {editingId === conv.id ? (
                <div className="flex-1 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && confirmRename()}
                    className="flex-1 bg-slate-700 text-white text-xs px-1.5 py-0.5 rounded border border-slate-600 outline-none"
                    autoFocus
                  />
                  <button onClick={confirmRename} className="text-emerald-400 hover:text-emerald-300">
                    <Check className="w-3 h-3" />
                  </button>
                  <button onClick={() => setEditingId(null)} className="text-slate-500 hover:text-slate-300">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <>
                  <span className="flex-1 truncate text-xs">{conv.title}</span>
                  <div className="hidden group-hover:flex items-center gap-0.5">
                    <button
                      onClick={(e) => { e.stopPropagation(); startRename(conv.id, conv.title); }}
                      className="p-1 rounded hover:bg-slate-700 text-slate-500 hover:text-slate-300"
                      aria-label="Rename conversation"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(conv.id); }}
                      className="p-1 rounded hover:bg-slate-700 text-slate-500 hover:text-red-400"
                      aria-label="Delete conversation"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

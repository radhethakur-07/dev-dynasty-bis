"use client";

import React, { useState } from "react";
import { Conversation } from "@/types/api";
import {
  Plus,
  Trash2,
  MessageSquare,
  PanelLeftClose,
  PanelLeft,
  Pencil,
  Check,
  X,
  History,
} from "lucide-react";

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

  return (
    <>
      {/* Collapsed toggle button — desktop only */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="hidden md:flex fixed left-3 top-20 z-30 w-8 h-8 items-center justify-center rounded-lg transition-all duration-150 shadow-sm"
          style={{
            backgroundColor: "var(--surface-raised)",
            border: "1px solid var(--border)",
            color: "var(--text-muted)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
            (e.currentTarget as HTMLElement).style.backgroundColor = "var(--surface-overlay)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
            (e.currentTarget as HTMLElement).style.backgroundColor = "var(--surface-raised)";
          }}
          aria-label="Open chat history"
          title="Open chat history"
        >
          <PanelLeft className="w-4 h-4" />
        </button>
      )}

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`flex flex-col flex-shrink-0 h-full transition-all duration-300 ${
          isOpen ? "w-64" : "w-0 overflow-hidden"
        } md:relative fixed inset-y-0 left-0 z-40 md:z-auto`}
        style={{
          backgroundColor: "var(--sidebar-bg)",
          borderRight: isOpen ? `1px solid var(--sidebar-border)` : "none",
        }}
        aria-label="Conversation history"
        role="complementary"
      >
        {isOpen && (
          <>
            {/* Sidebar header */}
            <div
              className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
              style={{ borderColor: "var(--sidebar-border)" }}
            >
              <div className="flex items-center gap-2">
                <History className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  Conversations
                </span>
              </div>
              <button
                onClick={onToggle}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: "var(--text-muted)" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "var(--surface-overlay)";
                  (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "";
                  (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
                }}
                aria-label="Close sidebar"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>

            {/* New Chat button */}
            <div className="px-3 py-3 flex-shrink-0">
              <button
                onClick={onNew}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
                style={{
                  backgroundColor: "var(--accent-subtle)",
                  border: "1px solid var(--accent-border)",
                  color: "var(--accent)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "var(--accent)";
                  (e.currentTarget as HTMLElement).style.color = "#ffffff";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "var(--accent-subtle)";
                  (e.currentTarget as HTMLElement).style.color = "var(--accent)";
                }}
              >
                <Plus className="w-4 h-4" />
                <span>New Chat</span>
              </button>
            </div>

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5">
              {conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 gap-3">
                  <MessageSquare
                    className="w-8 h-8 opacity-30"
                    style={{ color: "var(--text-muted)" }}
                  />
                  <p
                    className="text-xs text-center leading-relaxed"
                    style={{ color: "var(--text-muted)" }}
                  >
                    No conversations yet.
                    <br />
                    Start a new chat above.
                  </p>
                </div>
              ) : (
                conversations.map((conv) => {
                  const isActive = conv.id === activeId;
                  return (
                    <div
                      key={conv.id}
                      className="group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-100 text-sm"
                      style={
                        isActive
                          ? {
                              backgroundColor: "var(--sidebar-active-bg)",
                              border: "1px solid var(--sidebar-active-border)",
                              color: "var(--sidebar-active-text)",
                            }
                          : {
                              border: "1px solid transparent",
                              color: "var(--text-secondary)",
                            }
                      }
                      onClick={() => {
                        if (editingId !== conv.id) onSelect(conv.id);
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          (e.currentTarget as HTMLElement).style.backgroundColor =
                            "var(--sidebar-hover)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          (e.currentTarget as HTMLElement).style.backgroundColor = "";
                        }
                      }}
                    >
                      <MessageSquare
                        className="w-3.5 h-3.5 flex-shrink-0"
                        style={{ color: isActive ? "var(--accent)" : "var(--text-placeholder)" }}
                      />

                      {editingId === conv.id ? (
                        <div
                          className="flex-1 flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && confirmRename()}
                            className="flex-1 text-xs px-1.5 py-0.5 rounded-md outline-none"
                            style={{
                              backgroundColor: "var(--surface-raised)",
                              border: "1px solid var(--accent)",
                              color: "var(--text-primary)",
                            }}
                            autoFocus
                          />
                          <button
                            onClick={confirmRename}
                            className="p-1 rounded flex-shrink-0 transition-colors"
                            style={{ color: "var(--success)" }}
                            aria-label="Confirm rename"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1 rounded flex-shrink-0 transition-colors"
                            style={{ color: "var(--text-muted)" }}
                            aria-label="Cancel rename"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="flex-1 truncate text-xs font-medium">
                            {conv.title}
                          </span>
                          <div className="hidden group-hover:flex items-center gap-0.5 flex-shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                startRename(conv.id, conv.title);
                              }}
                              className="p-1 rounded-md transition-colors"
                              style={{ color: "var(--text-placeholder)" }}
                              onMouseEnter={(e) => {
                                (e.currentTarget as HTMLElement).style.backgroundColor =
                                  "var(--surface-overlay)";
                                (e.currentTarget as HTMLElement).style.color =
                                  "var(--text-primary)";
                              }}
                              onMouseLeave={(e) => {
                                (e.currentTarget as HTMLElement).style.backgroundColor = "";
                                (e.currentTarget as HTMLElement).style.color =
                                  "var(--text-placeholder)";
                              }}
                              aria-label="Rename conversation"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(conv.id);
                              }}
                              className="p-1 rounded-md transition-colors"
                              style={{ color: "var(--text-placeholder)" }}
                              onMouseEnter={(e) => {
                                (e.currentTarget as HTMLElement).style.backgroundColor =
                                  "rgba(220, 38, 38, 0.1)";
                                (e.currentTarget as HTMLElement).style.color = "var(--error)";
                              }}
                              onMouseLeave={(e) => {
                                (e.currentTarget as HTMLElement).style.backgroundColor = "";
                                (e.currentTarget as HTMLElement).style.color =
                                  "var(--text-placeholder)";
                              }}
                              aria-label="Delete conversation"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </aside>
    </>
  );
};

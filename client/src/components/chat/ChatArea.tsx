import React, { useRef, useEffect } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatMessage } from "@/types/api";
import { AgentExecutionDrawer } from "./AgentExecutionDrawer";
import { ResponseDispatcher } from "@/components/responses/ResponseDispatcher";
import { ProcessingIndicator } from "./ProcessingIndicator";
import { Bot, User, Copy, Check, ThumbsUp, ThumbsDown, Sparkles } from "lucide-react";

interface ChatAreaProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onQuickPrompt?: (prompt: string) => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({ messages, isLoading, onQuickPrompt }) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleCopy = (id: string, text?: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
      {messages.map((msg) => {
        const isUser = msg.role === "user";

        return (
          <div
            key={msg.id}
            className={`flex items-start gap-3 max-w-4xl mx-auto ${
              isUser ? "flex-row-reverse" : "flex-row"
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold border ${
                isUser
                  ? "bg-blue-600 border-blue-500 text-white"
                  : "bg-slate-900 border-slate-700 text-blue-400"
              }`}
            >
              {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Message Content Bubble */}
            <div
              className={`flex-1 rounded-2xl p-4.5 border transition-all overflow-hidden ${
                isUser
                  ? "bg-blue-600/15 border-blue-500/30 text-slate-100 max-w-xl"
                  : "bg-slate-900/80 border-slate-800 text-slate-200 shadow-sm"
              }`}
            >
              {/* Agent Reasoning & Live Retrieval Trace */}
              {!isUser && (msg.toolCalled || msg.processingStages?.length || msg.intent) && (
                <AgentExecutionDrawer
                  intent={msg.intent}
                  toolCalled={msg.toolCalled}
                  stages={msg.processingStages}
                  structuredResponse={msg.structuredResponse}
                  onQuickPrompt={onQuickPrompt}
                />
              )}

              {/* Conversational Text Message */}
              {msg.content && (
                <div className="text-sm leading-relaxed mb-3 text-slate-200 prose prose-invert prose-sm max-w-none break-words overflow-wrap-anywhere">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                </div>
              )}

              {/* Structured Interactive Component (Cards, Steps, Tables) */}
              {!isUser && msg.structuredResponse && (
                <div className="pt-1">
                  <ResponseDispatcher response={msg.structuredResponse} />
                </div>
              )}

              {/* Footer controls for assistant messages */}
              {!isUser && (
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-slate-500 text-[11px]">
                  <span>{msg.timestamp}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(msg.id, msg.content || JSON.stringify(msg.structuredResponse))}
                      className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                      title="Copy response"
                      aria-label="Copy response"
                    >
                      {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                      title="Helpful"
                      aria-label="Mark as helpful"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                      title="Not helpful"
                      aria-label="Mark as not helpful"
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Loading state indicator */}
      {isLoading && (
        <div className="flex items-start gap-3 max-w-4xl mx-auto">
          <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-700 text-blue-400 flex items-center justify-center flex-shrink-0">
            <Bot className="w-4 h-4" />
          </div>
          <div className="flex-1 rounded-2xl p-4 border bg-slate-900/80 border-slate-800 max-w-xl">
            <ProcessingIndicator stages={[]} isLoading={true} />
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};

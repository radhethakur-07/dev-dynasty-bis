import React, { useRef, useEffect } from "react";
import { ChatMessage } from "@/types/api";
import { ResponseDispatcher } from "../responses/ResponseDispatcher";
import { ProcessingIndicator } from "./ProcessingIndicator";
import { Bot, User, Copy, Check, ThumbsUp, ThumbsDown, ShieldCheck } from "lucide-react";

interface ChatAreaProps {
  messages: ChatMessage[];
  isLoading: boolean;
}

export const ChatArea: React.FC<ChatAreaProps> = ({ messages, isLoading }) => {
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
              className={`flex-1 rounded-2xl p-4.5 border transition-all ${
                isUser
                  ? "bg-blue-600/15 border-blue-500/30 text-slate-100 max-w-xl"
                  : "bg-slate-900/80 border-slate-800 text-slate-200 shadow-sm"
              }`}
            >
              {/* Tool Badge if invoked */}
              {!isUser && msg.toolCalled && (
                <div className="flex items-center gap-1.5 mb-3 text-[11px] font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded-full w-fit">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Executed Tool: {msg.toolCalled}</span>
                </div>
              )}

              {/* Processing stages if available */}
              {!isUser && msg.processingStages && (
                <ProcessingIndicator stages={msg.processingStages} />
              )}

              {/* User text or assistant structured response */}
              {isUser ? (
                <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</div>
              ) : msg.structuredResponse ? (
                <ResponseDispatcher response={msg.structuredResponse} />
              ) : (
                <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</div>
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
                    >
                      {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                      title="Helpful"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                      title="Not helpful"
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

import { ChatMessage } from "@/types/api";

const STORAGE_KEY = "bis-assistant-conversations";
const STORAGE_VERSION = 1;

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

interface StorageData {
  version: number;
  conversations: Conversation[];
  activeConversationId: string | null;
}

function getStorageData(): StorageData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { version: STORAGE_VERSION, conversations: [], activeConversationId: null };
    const parsed = JSON.parse(raw);
    if (parsed.version !== STORAGE_VERSION) {
      return { version: STORAGE_VERSION, conversations: [], activeConversationId: null };
    }
    return parsed;
  } catch {
    return { version: STORAGE_VERSION, conversations: [], activeConversationId: null };
  }
}

function saveStorageData(data: StorageData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn("Failed to save chat history:", e);
  }
}

export function getAllConversations(): Conversation[] {
  return getStorageData().conversations.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function getActiveConversationId(): string | null {
  return getStorageData().activeConversationId;
}

export function setActiveConversationId(id: string | null): void {
  const data = getStorageData();
  data.activeConversationId = id;
  saveStorageData(data);
}

export function getConversation(id: string): Conversation | null {
  const data = getStorageData();
  return data.conversations.find((c) => c.id === id) || null;
}

export function createConversation(initialMessage?: ChatMessage): Conversation {
  const data = getStorageData();
  const now = new Date().toISOString();
  const conv: Conversation = {
    id: "conv-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
    title: "New Chat",
    messages: initialMessage ? [initialMessage] : [],
    createdAt: now,
    updatedAt: now,
  };
  data.conversations.push(conv);
  data.activeConversationId = conv.id;
  saveStorageData(data);
  return conv;
}

export function updateConversation(id: string, messages: ChatMessage[]): void {
  const data = getStorageData();
  const conv = data.conversations.find((c) => c.id === id);
  if (conv) {
    conv.messages = messages;
    conv.updatedAt = new Date().toISOString();
    // Auto-title from first user message
    const firstUserMsg = messages.find((m) => m.role === "user");
    if (firstUserMsg && conv.title === "New Chat") {
      conv.title = firstUserMsg.content?.substring(0, 50) || "New Chat";
      if ((firstUserMsg.content?.length || 0) > 50) conv.title += "...";
    }
    saveStorageData(data);
  }
}

export function renameConversation(id: string, title: string): void {
  const data = getStorageData();
  const conv = data.conversations.find((c) => c.id === id);
  if (conv) {
    conv.title = title;
    saveStorageData(data);
  }
}

export function deleteConversation(id: string): void {
  const data = getStorageData();
  data.conversations = data.conversations.filter((c) => c.id !== id);
  if (data.activeConversationId === id) {
    data.activeConversationId = data.conversations[0]?.id || null;
  }
  saveStorageData(data);
}

export function clearAllConversations(): void {
  saveStorageData({ version: STORAGE_VERSION, conversations: [], activeConversationId: null });
}

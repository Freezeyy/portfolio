import type { ChatMessage, ChatTurn, StoredChatSession } from '@/lib/chat/types';

export const CHAT_TTL_MS = 24 * 60 * 60 * 1000;
export const MAX_HISTORY_MESSAGES = 20;

const STORAGE_KEY = 'portfolio-ai-chat';

export function createWelcomeMessage(name: string): ChatMessage {
  return {
    id: 'welcome',
    role: 'assistant',
    content: `Hey! I'm ${name}'s AI assistant. Ask me anything about my skills, projects, experience, or background — no scrolling required.`,
  };
}

export function loadChatSession(): ChatMessage[] | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const session = JSON.parse(raw) as StoredChatSession;
    if (Date.now() > session.expiresAt) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return session.messages;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function saveChatSession(messages: ChatMessage[]): void {
  if (typeof window === 'undefined') return;

  const toStore = messages.filter((m) => m.id !== 'welcome' && m.content.trim());
  if (toStore.length === 0) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }

  const session: StoredChatSession = {
    expiresAt: Date.now() + CHAT_TTL_MS,
    messages: toStore,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function toApiHistory(messages: ChatMessage[]): ChatTurn[] {
  return messages
    .filter((m) => m.id !== 'welcome' && m.content.trim())
    .slice(-MAX_HISTORY_MESSAGES)
    .map(({ role, content }) => ({ role, content }));
}

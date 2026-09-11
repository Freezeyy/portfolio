import type { ChatTurn } from '@/lib/chat/types';

/** Combine recent user messages with the current one for better follow-up retrieval. */
export function buildRagQuery(message: string, history: ChatTurn[]): string {
  const recentUserMessages = history
    .filter((turn) => turn.role === 'user')
    .slice(-2)
    .map((turn) => turn.content.trim());

  if (recentUserMessages.length === 0) return message.trim();

  return [...recentUserMessages, message.trim()].join('\n');
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface StoredChatSession {
  expiresAt: number;
  messages: ChatMessage[];
}

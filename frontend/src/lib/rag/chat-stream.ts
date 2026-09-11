import type { ChatTurn } from '@/lib/chat/types';
import { createGroqChatStream } from '@/lib/rag/groq';
import { streamGeminiChat } from '@/lib/rag/gemini';
import { shouldFallbackFromGroq } from '@/lib/rag/provider-errors';

export type ChatProvider = 'groq' | 'gemini';

async function resolveChatGenerator(
  systemInstruction: string,
  prompt: string,
  history: ChatTurn[] = []
): Promise<{ provider: ChatProvider; stream: AsyncGenerator<string, void, unknown> }> {
  const hasGroq = Boolean(process.env.GROQ_API_KEY);
  const hasGemini = Boolean(process.env.GEMINI_API_KEY);

  if (hasGroq) {
    try {
      const stream = await createGroqChatStream(systemInstruction, prompt, history);
      return { provider: 'groq', stream };
    } catch (error) {
      if (shouldFallbackFromGroq(error) && hasGemini) {
        console.warn('Groq unavailable — falling back to Gemini');
        return {
          provider: 'gemini',
          stream: streamGeminiChat(systemInstruction, prompt, history),
        };
      }
      throw error;
    }
  }

  if (hasGemini) {
    return {
      provider: 'gemini',
      stream: streamGeminiChat(systemInstruction, prompt, history),
    };
  }

  throw new Error('No chat provider configured (set GROQ_API_KEY and/or GEMINI_API_KEY)');
}

export async function createChatResponseStream(
  systemInstruction: string,
  prompt: string,
  history: ChatTurn[] = []
): Promise<{ provider: ChatProvider; body: ReadableStream<Uint8Array> }> {
  const { provider, stream } = await resolveChatGenerator(
    systemInstruction,
    prompt,
    history
  );
  const encoder = new TextEncoder();

  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          controller.enqueue(encoder.encode(chunk));
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return { provider, body };
}

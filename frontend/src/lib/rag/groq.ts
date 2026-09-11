import type { ChatTurn } from '@/lib/chat/types';
import { providerError } from '@/lib/rag/provider-errors';

// llama-3.3-70b-versatile was retired Aug 2026 — see console.groq.com/docs/deprecations
const GROQ_MODEL = process.env.GROQ_MODEL ?? 'openai/gpt-oss-120b';

async function* readGroqSseStream(
  response: Response
): AsyncGenerator<string, void, unknown> {
  const reader = response.body?.getReader();
  if (!reader) throw providerError('Groq returned no response body');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6).trim();
      if (data === '[DONE]') return;

      try {
        const parsed = JSON.parse(data) as {
          choices?: Array<{ delta?: { content?: string } }>;
        };
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) yield content;
      } catch {
        // Ignore malformed SSE chunks
      }
    }
  }
}

export async function createGroqChatStream(
  systemInstruction: string,
  userPrompt: string,
  history: ChatTurn[] = []
): Promise<AsyncGenerator<string, void, unknown>> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw providerError('GROQ_API_KEY is not configured');
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: systemInstruction },
        ...history.map((turn) => ({ role: turn.role, content: turn.content })),
        { role: 'user', content: userPrompt },
      ],
      stream: true,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw providerError(`Groq API error: ${response.status} ${body}`, response.status);
  }

  return readGroqSseStream(response);
}

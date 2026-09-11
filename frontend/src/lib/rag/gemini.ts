import {
  GoogleGenerativeAI,
  TaskType,
  type EmbedContentRequest,
} from '@google/generative-ai';
import type { ChatTurn } from '@/lib/chat/types';

// Override with GEMINI_MODEL in .env.local if Google deprecates this default
const CHAT_MODEL = process.env.GEMINI_MODEL ?? 'gemini-3.6-flash';
const EMBEDDING_MODEL =
  process.env.GEMINI_EMBEDDING_MODEL ?? 'gemini-embedding-001';

export function getGeminiClient(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }
  return new GoogleGenerativeAI(apiKey);
}

export function getChatModel(
  client: GoogleGenerativeAI,
  systemInstruction?: string
) {
  return client.getGenerativeModel({
    model: CHAT_MODEL,
    ...(systemInstruction ? { systemInstruction } : {}),
  });
}

async function embedOne(
  client: GoogleGenerativeAI,
  text: string,
  taskType: TaskType
): Promise<number[]> {
  const model = client.getGenerativeModel({ model: EMBEDDING_MODEL });
  const request: EmbedContentRequest = {
    content: { role: 'user', parts: [{ text }] },
    taskType,
  };
  const result = await model.embedContent(request);
  return result.embedding.values;
}

export async function embedTexts(
  client: GoogleGenerativeAI,
  texts: string[],
  taskType: TaskType
): Promise<number[][]> {
  return Promise.all(texts.map((text) => embedOne(client, text, taskType)));
}

export async function* streamGeminiChat(
  systemInstruction: string,
  prompt: string,
  history: ChatTurn[] = []
): AsyncGenerator<string, void, unknown> {
  const client = getGeminiClient();
  const model = getChatModel(client, systemInstruction);
  const result = await model.generateContentStream({
    contents: [
      ...history.map((turn) => ({
        role: turn.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: turn.content }],
      })),
      { role: 'user', parts: [{ text: prompt }] },
    ],
  });

  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) yield text;
  }
}

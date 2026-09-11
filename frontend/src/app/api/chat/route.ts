import { buildRagQuery } from '@/lib/chat/rag-query';
import type { ChatTurn } from '@/lib/chat/types';
import { getPortfolioData } from '@/lib/strapi';
import { createChatResponseStream } from '@/lib/rag/chat-stream';
import { buildContext, retrieveRelevantChunks } from '@/lib/rag/retrieve';

export const runtime = 'nodejs';

const MAX_HISTORY = 20;

function parseHistory(raw: unknown): ChatTurn[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .filter(
      (turn): turn is ChatTurn =>
        typeof turn === 'object' &&
        turn !== null &&
        (turn.role === 'user' || turn.role === 'assistant') &&
        typeof turn.content === 'string' &&
        turn.content.trim().length > 0
    )
    .slice(-MAX_HISTORY);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      message?: string;
      history?: unknown;
    };

    const message = body.message?.trim();
    if (!message) {
      return Response.json({ error: 'Message is required' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return Response.json(
        { error: 'GEMINI_API_KEY is required for RAG embeddings' },
        { status: 500 }
      );
    }

    const data = await getPortfolioData();
    if (!data.profile) {
      return Response.json({ error: 'Portfolio CMS is not connected' }, { status: 503 });
    }

    const history = parseHistory(body.history);
    const ragQuery = buildRagQuery(message, history);
    const relevantChunks = await retrieveRelevantChunks(ragQuery, data);
    const context = buildContext(relevantChunks);
    const profile = data.profile;

    const systemInstruction = `You are the AI assistant for ${profile.name}'s portfolio website. You speak on behalf of ${profile.name} in first person (use "I", "my", "me").

Rules:
- Answer ONLY using the context provided below. Do not invent projects, skills, or experience.
- If the context doesn't contain the answer, say you don't have that information and suggest what they could ask instead.
- Be conversational, friendly, and concise — like a developer explaining their work at a coffee chat.
- When mentioning projects or roles, include relevant details from the context.
- Keep responses under 200 words unless the question requires more detail.
- You can refer to earlier messages in this conversation when the user asks follow-up questions.`;

    const prompt = `Context from portfolio database:\n\n${context}\n\n---\n\nQuestion: ${message}`;

    const { provider, body: streamBody } = await createChatResponseStream(
      systemInstruction,
      prompt,
      history
    );

    return new Response(streamBody, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'X-Chat-Provider': provider,
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return Response.json(
      { error: 'Failed to generate a response. Please try again.' },
      { status: 500 }
    );
  }
}

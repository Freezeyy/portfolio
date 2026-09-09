import OpenAI from 'openai';
import { getPortfolioData } from '@/lib/strapi';
import { buildContext, retrieveRelevantChunks } from '@/lib/rag/retrieve';

export const runtime = 'nodejs';

const MODEL = 'gpt-4o-mini';

export async function POST(request: Request) {
  try {
    const { message } = (await request.json()) as { message?: string };

    if (!message?.trim()) {
      return Response.json({ error: 'Message is required' }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        { error: 'OPENAI_API_KEY is not configured on the server' },
        { status: 500 }
      );
    }

    const data = await getPortfolioData();
    if (!data.profile) {
      return Response.json({ error: 'Portfolio CMS is not connected' }, { status: 503 });
    }

    const relevantChunks = await retrieveRelevantChunks(message, data);
    const context = buildContext(relevantChunks);
    const profile = data.profile;

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const stream = await openai.chat.completions.create({
      model: MODEL,
      stream: true,
      temperature: 0.4,
      messages: [
        {
          role: 'system',
          content: `You are the AI assistant for ${profile.name}'s portfolio website. You speak on behalf of ${profile.name} in first person (use "I", "my", "me").

Rules:
- Answer ONLY using the context provided below. Do not invent projects, skills, or experience.
- If the context doesn't contain the answer, say you don't have that information and suggest what they could ask instead.
- Be conversational, friendly, and concise — like a developer explaining their work at a coffee chat.
- When mentioning projects or roles, include relevant details from the context.
- Keep responses under 200 words unless the question requires more detail.`,
        },
        {
          role: 'user',
          content: `Context from portfolio database:\n\n${context}\n\n---\n\nQuestion: ${message.trim()}`,
        },
      ],
    });

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const part of stream) {
            const text = part.choices[0]?.delta?.content;
            if (text) controller.enqueue(encoder.encode(text));
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
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

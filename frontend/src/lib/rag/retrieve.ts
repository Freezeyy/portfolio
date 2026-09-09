import OpenAI from 'openai';
import type { PortfolioData } from '@/types';
import { portfolioToChunks, type RagChunk } from '@/lib/rag/chunks';

const EMBEDDING_MODEL = 'text-embedding-3-small';
const TOP_K = 6;

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function embedTexts(
  openai: OpenAI,
  texts: string[]
): Promise<number[][]> {
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: texts,
  });
  return response.data
    .sort((a, b) => a.index - b.index)
    .map((item) => item.embedding);
}

export async function retrieveRelevantChunks(
  question: string,
  data: PortfolioData
): Promise<RagChunk[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  const chunks = portfolioToChunks(data);
  if (chunks.length === 0) return [];

  const openai = new OpenAI({ apiKey });
  const texts = [question, ...chunks.map((c) => `${c.title}\n${c.content}`)];
  const embeddings = await embedTexts(openai, texts);

  const queryEmbedding = embeddings[0];
  const scored = chunks
    .map((chunk, index) => ({
      chunk,
      score: cosineSimilarity(queryEmbedding, embeddings[index + 1]),
    }))
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, TOP_K).map((item) => item.chunk);
}

export function buildContext(chunks: RagChunk[]): string {
  return chunks
    .map(
      (chunk, index) =>
        `[Source ${index + 1}: ${chunk.type} — ${chunk.title}]\n${chunk.content}`
    )
    .join('\n\n');
}

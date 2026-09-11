import { TaskType } from '@google/generative-ai';
import type { PortfolioData } from '@/types';
import { portfolioToChunks, type RagChunk } from '@/lib/rag/chunks';
import { embedTexts, getGeminiClient } from '@/lib/rag/gemini';

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

export async function retrieveRelevantChunks(
  question: string,
  data: PortfolioData
): Promise<RagChunk[]> {
  const chunks = portfolioToChunks(data);
  if (chunks.length === 0) return [];

  const client = getGeminiClient();
  const chunkTexts = chunks.map((c) => `${c.title}\n${c.content}`);

  const [queryEmbedding, chunkEmbeddings] = await Promise.all([
    embedTexts(client, [question], TaskType.RETRIEVAL_QUERY).then((r) => r[0]),
    embedTexts(client, chunkTexts, TaskType.RETRIEVAL_DOCUMENT),
  ]);

  const scored = chunks
    .map((chunk, index) => ({
      chunk,
      score: cosineSimilarity(queryEmbedding, chunkEmbeddings[index]),
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

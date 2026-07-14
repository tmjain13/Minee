import { pipeline } from '@xenova/transformers';
import { fullJainDatabase } from '../data/jainQuizDatabase';

// Both embeddings are L2-normalized (normalize: true), so the dot product
// here is already the cosine similarity, not just a raw dot product.
export const cosineSimilarity = (a: ArrayLike<number>, b: ArrayLike<number>): number => {
  let dot = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
  }
  return dot;
};

export const SEMANTIC_MATCH_THRESHOLD = 0.5;

export interface ScoredCandidate<T> {
  vector: ArrayLike<number>;
  item: T;
}

/**
 * Picks the highest-scoring candidate by cosine similarity to queryVector,
 * returning null if even the best match doesn't clear the confidence threshold.
 */
export const pickBestSemanticMatch = <T>(
  queryVector: ArrayLike<number>,
  candidates: ScoredCandidate<T>[],
  threshold: number = SEMANTIC_MATCH_THRESHOLD
): T | null => {
  let bestMatch: T | null = null;
  let highestScore = -1;

  for (const { vector, item } of candidates) {
    const score = cosineSimilarity(queryVector, vector);
    if (score > highestScore) {
      highestScore = score;
      bestMatch = item;
    }
  }

  return highestScore > threshold && bestMatch ? bestMatch : null;
};

/**
 * Runs a local Machine Learning model to understand the *meaning*
 * of the user's question, even without Wi-Fi.
 */
class OfflineAIEngine {
  static instance: any = null;

  static async getInstance() {
    if (this.instance === null) {
      // Loads a tiny, browser-friendly feature extraction model
      this.instance = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    }
    return this.instance;
  }

  static async findBestAnswer(userQuery: string) {
    const extractor = await this.getInstance();

    // Convert user query to semantic mathematical vector
    const queryVector = await extractor(userQuery, { pooling: 'mean', normalize: true });

    // Compare meaning against the local database
    const candidates: ScoredCandidate<typeof fullJainDatabase[number]>[] = [];
    for (const qa of fullJainDatabase) {
      // In production, you would pre-compute these vectors to save time
      const answerVector = await extractor(qa.question, { pooling: 'mean', normalize: true });
      candidates.push({ vector: answerVector.data, item: qa });
    }

    // Only return if it's a reasonably confident match (e.g., > 50% semantic match)
    const bestMatch = pickBestSemanticMatch(queryVector.data, candidates);
    if (bestMatch) {
      return bestMatch.explanation || bestMatch.answer; // Assuming answer or explanation
    }
    return "I am currently offline and cannot find a high-confidence semantic match locally. Please connect to the internet to consult the full Gemini Engine.";
  }
}

export default OfflineAIEngine;

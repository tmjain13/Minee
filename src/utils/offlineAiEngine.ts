import { fullJainDatabase } from '../data/jainQuizDatabase';

export const KNOWLEDGE_VERSION = 2; // Bumped version for knowledge updates

/**
 * Runs a local Machine Learning model to understand the *meaning* 
 * of the user's question, even without Wi-Fi.
 */
class OfflineAIEngine {
  static instance: any = null;

  static async getInstance() {
    if (this.instance === null) {
      // Loads a tiny, browser-friendly feature extraction model dynamically (lazy-loaded)
      const { pipeline } = await import('@xenova/transformers');
      this.instance = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    }
    return this.instance;
  }

  static async findBestAnswer(userQuery: string) {
    const extractor = await this.getInstance();
    
    // Convert user query to semantic mathematical vector
    const queryVector = await extractor(userQuery, { pooling: 'mean', normalize: true });
    
    let bestMatch = null;
    let highestScore = -1;

    // Compare meaning against the local database
    for (const qa of fullJainDatabase) {
      // In production, you would pre-compute these vectors to save time
      const answerVector = await extractor(qa.question, { pooling: 'mean', normalize: true });
      
      // Calculate Cosine Similarity (how close the meanings are)
      const dotProduct = queryVector.data.reduce((acc: number, val: number, i: number) => acc + val * answerVector.data[i], 0);
      
      if (dotProduct > highestScore) {
        highestScore = dotProduct;
        bestMatch = qa;
      }
    }

    // Only return if it's a reasonably confident match (e.g., > 50% semantic match)
    if (highestScore > 0.5 && bestMatch) {
      return bestMatch.explanation || bestMatch.answer; // Assuming answer or explanation
    }
    return "I am currently offline and cannot find a high-confidence semantic match locally. Please connect to the internet to consult the full Gemini Engine.";
  }
}

export default OfflineAIEngine;

import { describe, expect, it, vi } from 'vitest';

// offlineAiEngine.ts eagerly imports @xenova/transformers, which in turn
// requires `sharp`'s native binary. We only need the pure similarity/threshold
// logic here, so stub the ML pipeline out rather than loading the real model.
vi.mock('@xenova/transformers', () => ({ pipeline: vi.fn() }));

const { cosineSimilarity, pickBestSemanticMatch, SEMANTIC_MATCH_THRESHOLD } = await import('./offlineAiEngine');

describe('cosineSimilarity', () => {
  it('returns 1 for identical normalized vectors', () => {
    expect(cosineSimilarity([1, 0, 0], [1, 0, 0])).toBeCloseTo(1);
  });

  it('returns 0 for orthogonal vectors', () => {
    expect(cosineSimilarity([1, 0], [0, 1])).toBe(0);
  });

  it('returns -1 for opposite vectors', () => {
    expect(cosineSimilarity([1, 0], [-1, 0])).toBeCloseTo(-1);
  });

  it('works with typed arrays, matching the real embedding output shape', () => {
    const a = new Float32Array([0.6, 0.8]);
    const b = new Float32Array([0.6, 0.8]);
    expect(cosineSimilarity(a, b)).toBeCloseTo(1);
  });
});

describe('pickBestSemanticMatch', () => {
  it('picks the candidate with the highest similarity score', () => {
    const query = [1, 0];
    const candidates = [
      { vector: [0, 1], item: 'orthogonal' },
      { vector: [0.9, 0.1], item: 'close-match' },
      { vector: [-1, 0], item: 'opposite' },
    ];
    expect(pickBestSemanticMatch(query, candidates)).toBe('close-match');
  });

  it('returns null when the best score does not clear the confidence threshold', () => {
    const query = [1, 0];
    const candidates = [
      { vector: [0, 1], item: 'orthogonal' },
      { vector: [0.5, 0.5], item: 'weak-match' },
    ];
    expect(pickBestSemanticMatch(query, candidates)).toBeNull();
  });

  it('returns null for an empty candidate list', () => {
    expect(pickBestSemanticMatch([1, 0], [])).toBeNull();
  });

  it('respects a custom threshold', () => {
    const query = [1, 0];
    const candidates = [{ vector: [0.6, 0.4], item: 'ok-match' }];
    expect(pickBestSemanticMatch(query, candidates, 0.9)).toBeNull();
    expect(pickBestSemanticMatch(query, candidates, 0.5)).toBe('ok-match');
  });

  it('is strictly greater-than at the threshold boundary (a tie does not count as a match)', () => {
    const query = [1, 0];
    const candidates = [{ vector: [SEMANTIC_MATCH_THRESHOLD, Math.sqrt(1 - SEMANTIC_MATCH_THRESHOLD ** 2)], item: 'boundary' }];
    expect(pickBestSemanticMatch(query, candidates)).toBeNull();
  });
});

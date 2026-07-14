import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { cacheKnowledgeForOffline, getOfflineKnowledge, searchOfflineKnowledge } from './offlineSearch';

const sampleItems = [
  { id: '1', title: 'Samayik Practice', description: 'Daily meditation ritual', details: '', tags: ['samayik', 'meditation'] },
  { id: '2', title: 'Paryushan Festival', description: 'Annual forgiveness festival', details: '', tags: ['festival'] },
  { id: '3', title: 'Samayik and Pratikraman', description: 'Combined daily practice guide', details: '', tags: ['samayik', 'pratikraman'] },
];

describe('offlineSearch (IndexedDB-backed inverted index)', () => {
  // cacheKnowledgeForOffline() clears both object stores before repopulating them,
  // so each test re-caches its own fixture instead of deleting/reopening the
  // database (deleting a still-open fake-indexeddb database blocks indefinitely).

  it('caches items and finds them back by getOfflineKnowledge', async () => {
    const ok = await cacheKnowledgeForOffline(sampleItems);
    expect(ok).toBe(true);

    const all = await getOfflineKnowledge();
    expect(all).toHaveLength(3);
    expect(all.map((d: any) => d.id).sort()).toEqual(['1', '2', '3']);
  });

  it('finds documents matching a single-token query', async () => {
    await cacheKnowledgeForOffline(sampleItems);
    const results = await searchOfflineKnowledge('paryushan');
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('2');
  });

  it('performs an AND search across multiple tokens', async () => {
    await cacheKnowledgeForOffline(sampleItems);
    const results = await searchOfflineKnowledge('samayik pratikraman');
    expect(results.map((d: any) => d.id)).toEqual(['3']);
  });

  it('returns an empty array when one of the AND tokens has no matches', async () => {
    await cacheKnowledgeForOffline(sampleItems);
    const results = await searchOfflineKnowledge('samayik nonexistentword');
    expect(results).toEqual([]);
  });

  it('returns an empty array for an empty or whitespace-only query', async () => {
    await cacheKnowledgeForOffline(sampleItems);
    expect(await searchOfflineKnowledge('')).toEqual([]);
    expect(await searchOfflineKnowledge('   ')).toEqual([]);
  });

  it('ignores tokens of 2 characters or fewer (tokenizer minimum length)', async () => {
    await cacheKnowledgeForOffline(sampleItems);
    // 'is'/'a' are too short to become index tokens, leaving no tokens to search on.
    const results = await searchOfflineKnowledge('is a');
    expect(results).toEqual([]);
  });

  it('replaces the previous cache contents on re-caching (clears stale docs/index)', async () => {
    await cacheKnowledgeForOffline(sampleItems);
    await cacheKnowledgeForOffline([{ id: '9', title: 'Only Item', description: '', details: '', tags: [] }]);

    const all = await getOfflineKnowledge();
    expect(all).toHaveLength(1);
    expect(all[0].id).toBe('9');

    // Stale token from the first cache pass should no longer resolve to anything.
    expect(await searchOfflineKnowledge('paryushan')).toEqual([]);
  });
});

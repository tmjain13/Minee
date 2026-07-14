import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { OfflineStorage as OfflineStorageType } from './offline-storage';

describe('OfflineStorage', () => {
  let OfflineStorage: typeof OfflineStorageType;

  beforeEach(async () => {
    localStorage.clear();
    vi.resetModules();
    ({ OfflineStorage } = await import('./offline-storage'));
  });

  it('returns an empty array when nothing has been cached', () => {
    expect(OfflineStorage.getOfflineCache()).toEqual([]);
  });

  it('saves items to localStorage and serves them back from the in-memory cache', () => {
    OfflineStorage.saveToOfflineCache([{ id: '1', title: 'Test' } as any]);
    const cached = OfflineStorage.getOfflineCache();
    expect(cached).toHaveLength(1);
    expect(cached[0].id).toBe('1');
    expect((cached[0] as any).lastSyncedAt).toBeTruthy();
  });

  it('preserves an existing lastSyncedAt timestamp instead of overwriting it', () => {
    OfflineStorage.saveToOfflineCache([{ id: '1', lastSyncedAt: '2020-01-01T00:00:00.000Z' } as any]);
    const cached = OfflineStorage.getOfflineCache();
    expect((cached[0] as any).lastSyncedAt).toBe('2020-01-01T00:00:00.000Z');
  });

  it('persists to localStorage so a fresh module load can rehydrate the cache', async () => {
    OfflineStorage.saveToOfflineCache([{ id: '1', title: 'Test' } as any]);
    vi.resetModules();
    const fresh = (await import('./offline-storage')).OfflineStorage;
    expect(fresh.getOfflineCache()).toHaveLength(1);
  });

  it('reports isSynced by comparing cached vs. current item counts', () => {
    OfflineStorage.saveToOfflineCache([{ id: '1' } as any, { id: '2' } as any]);
    expect(OfflineStorage.isSynced([{ id: '1' } as any, { id: '2' } as any])).toBe(true);
    expect(OfflineStorage.isSynced([{ id: '1' } as any])).toBe(false);
  });

  describe('bookmarks', () => {
    it('toggles a bookmark on and off', () => {
      expect(OfflineStorage.isBookmarked('item-1')).toBe(false);
      OfflineStorage.toggleBookmark('item-1');
      expect(OfflineStorage.isBookmarked('item-1')).toBe(true);
      OfflineStorage.toggleBookmark('item-1');
      expect(OfflineStorage.isBookmarked('item-1')).toBe(false);
    });

    it('persists multiple bookmarks across separate calls', () => {
      OfflineStorage.toggleBookmark('a');
      OfflineStorage.toggleBookmark('b');
      expect(OfflineStorage.getBookmarks().sort()).toEqual(['a', 'b']);
    });
  });

  describe('getItemSyncStatus', () => {
    it('reports out-of-sync for an item not present in the cache', () => {
      expect(OfflineStorage.getItemSyncStatus('missing')).toEqual({ isOutOfSync: true });
    });

    it('reports in-sync for an item synced within the last 24 hours', () => {
      const nowIso = new Date().toISOString();
      OfflineStorage.saveToOfflineCache([{ id: '1', lastSyncedAt: nowIso } as any]);
      const status = OfflineStorage.getItemSyncStatus('1');
      expect(status.isOutOfSync).toBe(false);
      expect(status.lastSyncedAt).toBe(nowIso);
    });

    it('reports out-of-sync for an item synced more than 24 hours ago', () => {
      const oldIso = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();
      OfflineStorage.saveToOfflineCache([{ id: '1', lastSyncedAt: oldIso } as any]);
      expect(OfflineStorage.getItemSyncStatus('1').isOutOfSync).toBe(true);
    });
  });
});

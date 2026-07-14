import { beforeEach, describe, expect, it, vi } from 'vitest';

// analyticsService's Firestore helpers (logTabVisit/logFaqQuery) drag in the
// real firebase module; the localStorage-backed sadhana log is what we test
// here, so stub firebase out entirely.
vi.mock('../lib/firebase', () => ({ db: {} }));
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  addDoc: vi.fn(),
  serverTimestamp: vi.fn(),
  doc: vi.fn(),
  setDoc: vi.fn(),
  increment: vi.fn(),
}));

import { analyticsService, SadhanaLog } from './analyticsService';

const today = () => new Date().toISOString().split('T')[0];

describe('analyticsService (sadhana practice log)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("creates today's entry on first logPractice", () => {
    analyticsService.logPractice(2, 30);
    const logs: SadhanaLog[] = JSON.parse(localStorage.getItem('sadhana_logs')!);
    expect(logs).toEqual([{ date: today(), samayikCount: 2, meditationMinutes: 30 }]);
  });

  it('accumulates repeated logs on the same day instead of duplicating entries', () => {
    analyticsService.logPractice(1, 10);
    analyticsService.logPractice(2, 20);
    const logs: SadhanaLog[] = JSON.parse(localStorage.getItem('sadhana_logs')!);
    expect(logs).toHaveLength(1);
    expect(logs[0]).toEqual({ date: today(), samayikCount: 3, meditationMinutes: 30 });
  });

  it('returns an empty array from getWeeklyStats when nothing is logged', () => {
    expect(analyticsService.getWeeklyStats()).toEqual([]);
  });

  it('returns at most 7 entries, newest first', () => {
    const logs: SadhanaLog[] = Array.from({ length: 10 }, (_, i) => ({
      date: new Date(Date.UTC(2026, 0, i + 1)).toISOString().split('T')[0],
      samayikCount: i,
      meditationMinutes: i * 10,
    }));
    localStorage.setItem('sadhana_logs', JSON.stringify(logs));

    const stats = analyticsService.getWeeklyStats();
    expect(stats).toHaveLength(7);
    expect(stats[0].date).toBe('2026-01-10');
    expect(stats[6].date).toBe('2026-01-04');
  });

  it('keeps distinct entries for distinct days', () => {
    localStorage.setItem('sadhana_logs', JSON.stringify([
      { date: '2026-01-01', samayikCount: 1, meditationMinutes: 15 },
    ]));
    analyticsService.logPractice(2, 30);

    const logs: SadhanaLog[] = JSON.parse(localStorage.getItem('sadhana_logs')!);
    expect(logs).toHaveLength(2);
    expect(logs.find(l => l.date === '2026-01-01')!.samayikCount).toBe(1);
    expect(logs.find(l => l.date === today())!.samayikCount).toBe(2);
  });
});

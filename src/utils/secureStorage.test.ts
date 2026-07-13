import { beforeEach, describe, expect, it } from 'vitest';
import { getSecureItem, setSecureItem } from './secureStorage';

describe('secureStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('namespaces stored values by uid', () => {
    setSecureItem('journal', 'entry-a', 'user-1');
    setSecureItem('journal', 'entry-b', 'user-2');

    expect(getSecureItem('journal', 'user-1')).toBe('entry-a');
    expect(getSecureItem('journal', 'user-2')).toBe('entry-b');
    expect(localStorage.getItem('user-1_journal')).toBe('entry-a');
  });

  it('is a no-op on write when uid is missing', () => {
    setSecureItem('journal', 'entry', null);
    setSecureItem('journal', 'entry', undefined);
    expect(localStorage.length).toBe(0);
  });

  it('returns null on read when uid is missing', () => {
    setSecureItem('journal', 'entry', 'user-1');
    expect(getSecureItem('journal', null)).toBeNull();
    expect(getSecureItem('journal', undefined)).toBeNull();
  });

  it('returns null for a key that was never set', () => {
    expect(getSecureItem('missing-key', 'user-1')).toBeNull();
  });
});

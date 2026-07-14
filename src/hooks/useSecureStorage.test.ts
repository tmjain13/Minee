import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { useAuthMock } = vi.hoisted(() => ({ useAuthMock: vi.fn() }));
vi.mock('../context/AuthContext', () => ({ useAuth: useAuthMock }));

import { clearAllUserData, useSecureStorage } from './useSecureStorage';

const signIn = (uid: string) => useAuthMock.mockReturnValue({ user: { uid } });
const signOut = () => useAuthMock.mockReturnValue({ user: null });

describe('useSecureStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    signIn('user-1');
  });

  it('round-trips a value through encrypted localStorage', async () => {
    const { result } = renderHook(() => useSecureStorage());
    const payload = { streak: 7, note: 'दैनिक सामायिक' };

    await result.current.setItem('practice', payload);
    expect(await result.current.getItem('practice')).toEqual(payload);
  });

  it('stores values encrypted, not as plaintext JSON', async () => {
    const { result } = renderHook(() => useSecureStorage());
    await result.current.setItem('diary', 'a private thought');

    const raw = localStorage.getItem('terapanth_user-1_diary');
    expect(raw).toBeTruthy();
    expect(raw).not.toContain('private thought');
  });

  it('keeps sensitive items in memory only, never in localStorage', async () => {
    const { result } = renderHook(() => useSecureStorage());
    await result.current.setItem('pin', '1234', true);

    expect(localStorage.getItem('terapanth_user-1_pin')).toBeNull();
    expect(await result.current.getItem('pin', true)).toBe('1234');
  });

  it('is a no-op when signed out', async () => {
    signOut();
    const { result } = renderHook(() => useSecureStorage());

    await result.current.setItem('anything', 'value');
    expect(localStorage.length).toBe(0);
    expect(await result.current.getItem('anything')).toBeNull();
  });

  it('cannot read another user\'s encrypted data (per-uid key derivation)', async () => {
    const first = renderHook(() => useSecureStorage());
    await first.result.current.setItem('secret', 'belongs to user-1');
    first.unmount();

    // Same storage key contents, different uid → different derived AES key.
    const stolen = localStorage.getItem('terapanth_user-1_secret')!;
    signIn('user-2');
    localStorage.setItem('terapanth_user-2_secret', stolen);

    const second = renderHook(() => useSecureStorage());
    expect(await second.result.current.getItem('secret')).toBeNull();
  });

  it('removes items with removeItem', async () => {
    const { result } = renderHook(() => useSecureStorage());
    await result.current.setItem('temp', 'x');
    result.current.removeItem('temp');
    expect(await result.current.getItem('temp')).toBeNull();
  });

  it('clearAllUserData wipes only the given uid\'s namespaced keys', async () => {
    const { result } = renderHook(() => useSecureStorage());
    await result.current.setItem('a', 1);
    await result.current.setItem('b', 2);
    localStorage.setItem('terapanth_user-2_c', 'other user');
    localStorage.setItem('unrelated_key', 'untouched');

    clearAllUserData('user-1');

    expect(localStorage.getItem('terapanth_user-1_a')).toBeNull();
    expect(localStorage.getItem('terapanth_user-1_b')).toBeNull();
    expect(localStorage.getItem('terapanth_user-2_c')).toBe('other user');
    expect(localStorage.getItem('unrelated_key')).toBe('untouched');
  });
});

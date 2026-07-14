import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useTokenRefresh } from './useTokenRefresh';

const { useAuthMock } = vi.hoisted(() => ({ useAuthMock: vi.fn() }));

vi.mock('../context/AuthContext', () => ({
  useAuth: useAuthMock,
}));

// Always resolves an expiration ~1 hour out relative to the *current* (fake) clock,
// so repeated reschedules never collapse to a zero-delay timer loop.
function makeUser(getIdToken: ReturnType<typeof vi.fn> = vi.fn().mockResolvedValue('new-token')) {
  return {
    getIdTokenResult: vi.fn().mockImplementation(() =>
      Promise.resolve({ expirationTime: new Date(Date.now() + 60 * 60 * 1000).toISOString() })
    ),
    getIdToken,
  };
}

describe('useTokenRefresh', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('does nothing when there is no authenticated user', async () => {
    useAuthMock.mockReturnValue({ user: null });
    const { unmount } = renderHook(() => useTokenRefresh());
    await vi.advanceTimersByTimeAsync(60 * 60 * 1000);
    unmount();
    // No crash and nothing scheduled — nothing further to assert.
  });

  it('refreshes the token ~5 minutes before the 1-hour expiry, not before', async () => {
    const getIdToken = vi.fn().mockResolvedValue('new-token');
    const user = makeUser(getIdToken);
    useAuthMock.mockReturnValue({ user });

    renderHook(() => useTokenRefresh());
    await vi.advanceTimersByTimeAsync(0);
    expect(user.getIdTokenResult).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(54 * 60 * 1000);
    expect(getIdToken).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(2 * 60 * 1000);
    expect(getIdToken).toHaveBeenCalledWith(true);
  });

  it('retries after a failed refresh and eventually succeeds', async () => {
    const getIdToken = vi.fn()
      .mockRejectedValueOnce(new Error('network error'))
      .mockResolvedValueOnce('new-token');
    const user = makeUser(getIdToken);
    useAuthMock.mockReturnValue({ user });

    renderHook(() => useTokenRefresh());

    // First refresh attempt fires ~55 minutes in and fails.
    await vi.advanceTimersByTimeAsync(55 * 60 * 1000);
    expect(getIdToken).toHaveBeenCalledTimes(1);

    // Backoff after the first failure is 1000ms (2^0 * 1000ms), well short of
    // another ~55 minute refresh cycle, so this only exercises the retry path.
    await vi.advanceTimersByTimeAsync(1000);

    // The retry reschedules a fresh ~55 minute wait before calling getIdToken again.
    await vi.advanceTimersByTimeAsync(55 * 60 * 1000);
    expect(getIdToken).toHaveBeenCalledTimes(2);
  });

  it('clears the pending timer on unmount', async () => {
    const user = makeUser();
    useAuthMock.mockReturnValue({ user });
    const clearSpy = vi.spyOn(global, 'clearTimeout');

    const { unmount } = renderHook(() => useTokenRefresh());
    await vi.advanceTimersByTimeAsync(0);
    unmount();

    expect(clearSpy).toHaveBeenCalled();
  });
});

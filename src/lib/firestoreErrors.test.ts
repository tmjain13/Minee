import { describe, expect, it, vi } from 'vitest';
import { handleFirestoreError, OperationType } from './firestoreErrors';

// No Firebase env vars are configured in the test environment, so
// src/lib/firebase.ts falls back to its mock `auth` (currentUser: null).
// That makes this module safe to exercise without a real Firebase project.

function captureFirestoreErrorEvent(run: () => void): CustomEvent {
  let captured: CustomEvent | undefined;
  const listener = (e: Event) => {
    captured = e as CustomEvent;
  };
  window.addEventListener('firestore-error', listener);
  try {
    run();
  } finally {
    window.removeEventListener('firestore-error', listener);
  }
  if (!captured) throw new Error('firestore-error event was not dispatched');
  return captured;
}

describe('handleFirestoreError', () => {
  it('dispatches a firestore-error CustomEvent with the error message, operation, and path', () => {
    const event = captureFirestoreErrorEvent(() => {
      handleFirestoreError(new Error('permission-denied'), OperationType.UPDATE, 'users/123');
    });

    expect(event.detail.error).toBe('permission-denied');
    expect(event.detail.operationType).toBe(OperationType.UPDATE);
    expect(event.detail.path).toBe('users/123');
  });

  it('stringifies non-Error thrown values', () => {
    const event = captureFirestoreErrorEvent(() => {
      handleFirestoreError('a plain string failure', OperationType.GET, 'quiz/1');
    });

    expect(event.detail.error).toBe('a plain string failure');
  });

  it('reports null auth info when there is no signed-in user (mocked Firebase auth)', () => {
    const event = captureFirestoreErrorEvent(() => {
      handleFirestoreError(new Error('boom'), OperationType.LIST, null);
    });

    expect(event.detail.authInfo.userId).toBeUndefined();
    expect(event.detail.authInfo.providerInfo).toEqual([]);
    expect(event.detail.path).toBeNull();
  });

  it('does not throw even if console.error is unavailable', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => handleFirestoreError(new Error('x'), OperationType.DELETE, 'a/b')).not.toThrow();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});

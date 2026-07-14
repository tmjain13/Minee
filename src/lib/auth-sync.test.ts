import { beforeEach, describe, expect, it, vi } from 'vitest';

const { setDocMock, docMock } = vi.hoisted(() => ({
  setDocMock: vi.fn(),
  docMock: vi.fn().mockReturnValue({ path: 'admins/mock' }),
}));

vi.mock('../lib/firebase', () => ({ db: {} }));
vi.mock('firebase/firestore', () => ({
  doc: docMock,
  getDoc: vi.fn(),
  setDoc: setDocMock,
}));

import { syncAdminStatus } from './auth-sync';

function makeUser(claims: Record<string, unknown>, uid = 'admin-1', email = 'admin@example.com') {
  return {
    uid,
    email,
    getIdTokenResult: vi.fn().mockResolvedValue({ claims }),
  } as any;
}

describe('syncAdminStatus', () => {
  beforeEach(() => {
    setDocMock.mockReset().mockResolvedValue(undefined);
    docMock.mockClear();
  });

  it('writes an admins/{uid} document when the admin claim is true', async () => {
    await syncAdminStatus(makeUser({ admin: true }));

    expect(docMock).toHaveBeenCalledWith({}, 'admins', 'admin-1');
    expect(setDocMock).toHaveBeenCalledTimes(1);
    const [, data, options] = setDocMock.mock.calls[0];
    expect(data.uid).toBe('admin-1');
    expect(data.email).toBe('admin@example.com');
    expect(options).toEqual({ merge: true });
  });

  it('does not write anything for a non-admin user', async () => {
    await syncAdminStatus(makeUser({ admin: false }));
    await syncAdminStatus(makeUser({}));
    expect(setDocMock).not.toHaveBeenCalled();
  });

  it('requires the claim to be strictly boolean true, not merely truthy', async () => {
    await syncAdminStatus(makeUser({ admin: 'true' }));
    await syncAdminStatus(makeUser({ admin: 1 }));
    expect(setDocMock).not.toHaveBeenCalled();
  });

  it('swallows token/Firestore failures instead of throwing', async () => {
    const failing = makeUser({ admin: true });
    failing.getIdTokenResult.mockRejectedValue(new Error('token expired'));
    await expect(syncAdminStatus(failing)).resolves.toBeUndefined();

    setDocMock.mockRejectedValue(new Error('permission-denied'));
    await expect(syncAdminStatus(makeUser({ admin: true }))).resolves.toBeUndefined();
  });
});

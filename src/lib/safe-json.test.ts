import { describe, expect, it } from 'vitest';
import { safeStringify } from './safe-json';

describe('safeStringify', () => {
  it('stringifies plain objects like JSON.stringify', () => {
    expect(safeStringify({ a: 1, b: 'two' })).toBe(JSON.stringify({ a: 1, b: 'two' }));
  });

  it('omits a circular reference key instead of throwing', () => {
    const obj: any = { name: 'root' };
    obj.self = obj;
    const parsed = JSON.parse(safeStringify(obj));
    expect(parsed).toEqual({ name: 'root' });
  });

  it('serializes Firestore Timestamp-like objects via toDate() as ISO strings', () => {
    const fakeTimestamp = { toDate: () => new Date('2024-01-01T00:00:00.000Z') };
    const parsed = JSON.parse(safeStringify({ createdAt: fakeTimestamp }));
    expect(parsed.createdAt).toBe('2024-01-01T00:00:00.000Z');
  });

  it('replaces recognizable Firestore internal objects with a placeholder', () => {
    class DocumentReference {}
    const ref = new DocumentReference();
    const parsed = JSON.parse(safeStringify({ ref }));
    expect(parsed.ref).toBe('[FirebaseObject:DocumentReference]');
  });

  it('replaces objects carrying Firestore-shaped fields (firestore/_delegate) even with a generic constructor', () => {
    const firestoreLike = { firestore: {}, id: 'abc' };
    const parsed = JSON.parse(safeStringify({ doc: firestoreLike }));
    expect(parsed.doc).toBe('[FirebaseObject:Object]');
  });

  it('chains a caller-provided replacer after its own transformations', () => {
    const replacer = (key: string, value: any) => (key === 'secret' ? undefined : value);
    const parsed = JSON.parse(safeStringify({ secret: 'hidden', visible: 'shown' }, replacer));
    expect(parsed).toEqual({ visible: 'shown' });
  });

  it('falls back to a placeholder string when JSON.stringify itself throws', () => {
    const cyclicalBigIntLike = { value: 10n };
    const result = safeStringify(cyclicalBigIntLike);
    expect(result).toBe('[Unserializable Structure]');
  });
});

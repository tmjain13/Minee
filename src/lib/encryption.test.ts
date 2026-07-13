// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { encryptionService } from './encryption';

describe('encryptionService', () => {
  it('round-trips plaintext through encrypt/decrypt', async () => {
    const plaintext = 'आज मैंने सामायिक और प्रतिक्रमण किया।';
    const encrypted = await encryptionService.encrypt(plaintext);
    expect(encrypted).not.toBe(plaintext);
    const decrypted = await encryptionService.decrypt(encrypted);
    expect(decrypted).toBe(plaintext);
  });

  it('round-trips empty strings', async () => {
    const encrypted = await encryptionService.encrypt('');
    const decrypted = await encryptionService.decrypt(encrypted);
    expect(decrypted).toBe('');
  });

  it('produces different ciphertext for the same plaintext (random IV)', async () => {
    const a = await encryptionService.encrypt('same message');
    const b = await encryptionService.encrypt('same message');
    expect(a).not.toBe(b);
  });

  it('falls back to a placeholder instead of throwing on invalid/tampered ciphertext', async () => {
    const result = await encryptionService.decrypt('not-valid-base64-ciphertext!!');
    expect(result).toBe('🔒 [Encrypted Data]');
  });

  it('falls back to a placeholder when ciphertext bytes are tampered with', async () => {
    const encrypted = await encryptionService.encrypt('secret diary entry');
    const tampered = encrypted.slice(0, -4) + 'abcd';
    const result = await encryptionService.decrypt(tampered);
    expect(result).toBe('🔒 [Encrypted Data]');
  });
});

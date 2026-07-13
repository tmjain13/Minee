import { describe, expect, it } from 'vitest';
import { getDeviceFingerprint, maskContact, validatePassword } from './authSecurity';

describe('maskContact', () => {
  it('masks an email address, keeping the first 3 local-part chars', () => {
    expect(maskContact('naman@example.com')).toBe('nam***@example.com');
  });

  it('masks a short local-part email using only its first char', () => {
    expect(maskContact('ab@example.com')).toBe('a***@example.com');
  });

  it('masks a phone number, keeping only the last 4 digits', () => {
    expect(maskContact('9876543210')).toBe('******3210');
  });

  it('strips non-digit characters before masking a phone number', () => {
    expect(maskContact('+91 98765-43210')).toBe('********3210');
  });

  it('fully masks phone numbers with 4 or fewer digits', () => {
    expect(maskContact('123')).toBe('****123');
  });

  it('returns an empty string for empty input', () => {
    expect(maskContact('')).toBe('');
  });
});

describe('validatePassword', () => {
  it('flags all criteria as false for a weak password', () => {
    expect(validatePassword('abc')).toEqual({
      length: false,
      upper: false,
      number: false,
      special: false,
    });
  });

  it('flags all criteria as true for a strong password', () => {
    expect(validatePassword('Str0ng!Pass')).toEqual({
      length: true,
      upper: true,
      number: true,
      special: true,
    });
  });

  it('evaluates each criterion independently', () => {
    expect(validatePassword('alllowercase1')).toEqual({
      length: true,
      upper: false,
      number: true,
      special: false,
    });
  });
});

describe('getDeviceFingerprint', () => {
  it('returns a stable, non-empty string in a browser-like (jsdom) environment', () => {
    const a = getDeviceFingerprint();
    const b = getDeviceFingerprint();
    expect(a).toBe(b);
    expect(a.length).toBeGreaterThan(0);
    expect(a.length).toBeLessThanOrEqual(24);
  });
});

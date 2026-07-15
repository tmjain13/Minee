/**
 * Security Utilities for Terapanth AI Hub Authentication Core
 */

export const getDeviceFingerprint = (): string => {
  if (typeof window === 'undefined') return 'server-rendered-node';
  const data = navigator.userAgent + screen.width + screen.height + navigator.language;
  return btoa(unescape(encodeURIComponent(data))).substring(0, 24);
};

export const maskContact = (c: string): string => {
  if (!c) return '';
  if (c.includes('@')) {
    const [local, domain] = c.split('@');
    if (local.length <= 3) return `${local[0]}***@${domain}`;
    return `${local.substring(0, 3)}***@${domain}`;
  }
  // Assume phone number
  const cleaned = c.replace(/\D/g, '');
  if (cleaned.length <= 4) return '****' + cleaned;
  return `${'*'.repeat(cleaned.length - 4)}${cleaned.slice(-4)}`;
};

export interface PasswordStrength {
  length: boolean;
  upper: boolean;
  number: boolean;
  special: boolean;
}

export const validatePassword = (pw: string): PasswordStrength => {
  return {
    length: pw.length >= 8,
    upper: /[A-Z]/.test(pw),
    number: /[0-9]/.test(pw),
    special: /[^A-Za-z0-9]/.test(pw)
  };
};




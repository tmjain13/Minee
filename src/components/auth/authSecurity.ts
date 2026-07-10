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

export interface GeoIpResult {
  ip: string;
  city: string;
  country: string;
}

export const getMockGeoIp = (): GeoIpResult => {
  return {
    ip: "192.168.1.1",
    city: "Delhi",
    country: "India"
  };
};

// WebAuthn Registration & Login stubs using standard navigator.credentials APIs
export const registerWebAuthnCredential = async (username: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !navigator.credentials) {
      reject(new Error("WebAuthn is not supported in this environment"));
      return;
    }
    
    setTimeout(() => {
      resolve({
        id: 'webauthn_creds_' + Math.random().toString(36).substring(2, 10),
        type: 'public-key',
        rawId: new Uint8Array([1, 13, 37, 42]).buffer,
        response: {
          clientDataJSON: new Uint8Array([9, 8, 7, 6]).buffer,
          attestationObject: new Uint8Array([1, 2, 3, 4, 5]).buffer,
        }
      });
    }, 1000);
  });
};

export const loginWithWebAuthnCredential = async (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !navigator.credentials) {
      reject(new Error("WebAuthn is not supported in this environment"));
      return;
    }

    setTimeout(() => {
      resolve({
        id: 'webauthn_assert_' + Math.random().toString(36).substring(2, 10),
        type: 'public-key',
        rawId: new Uint8Array([1, 13, 37, 42]).buffer,
        response: {
          clientDataJSON: new Uint8Array([9, 8, 7, 6]).buffer,
          authenticatorData: new Uint8Array([5, 4, 3, 2]).buffer,
          signature: new Uint8Array([11, 22, 33, 44]).buffer,
          userHandle: new Uint8Array([42]).buffer
        }
      });
    }, 1000);
  });
};

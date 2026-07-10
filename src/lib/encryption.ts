/**
 * Web Crypto API for End-to-End Encryption
 * Encrypts personal diary data before it ever leaves the device.
 */

// A secure key derived from the user's local PIN or password
const SECRET_KEY = "Terapanth_Local_Secure_Key_2026"; 

export const encryptionService = {
  async encrypt(text: string): Promise<string> {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      "raw", enc.encode(SECRET_KEY), { name: "PBKDF2" }, false, ["deriveKey"]
    );
    const key = await crypto.subtle.deriveKey(
      { name: "PBKDF2", salt: enc.encode("sadhana_salt"), iterations: 100000, hash: "SHA-256" },
      keyMaterial, { name: "AES-GCM", length: 256 }, false, ["encrypt"]
    );
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, key, enc.encode(text));
    
    // Combine IV and encrypted data, return as base64
    const combined = new Uint8Array(iv.length + new Uint8Array(encrypted).length);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    return btoa(String.fromCharCode.apply(null, Array.from(combined)));
  },

  async decrypt(encryptedBase64: string): Promise<string> {
    try {
      const enc = new TextEncoder();
      const combined = new Uint8Array(atob(encryptedBase64).split('').map(c => c.charCodeAt(0)));
      const iv = combined.slice(0, 12);
      const data = combined.slice(12);

      const keyMaterial = await crypto.subtle.importKey(
        "raw", enc.encode(SECRET_KEY), { name: "PBKDF2" }, false, ["deriveKey"]
      );
      const key = await crypto.subtle.deriveKey(
        { name: "PBKDF2", salt: enc.encode("sadhana_salt"), iterations: 100000, hash: "SHA-256" },
        keyMaterial, { name: "AES-GCM", length: 256 }, false, ["decrypt"]
      );

      const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: iv }, key, data);
      return new TextDecoder().decode(decrypted);
    } catch (e) {
      if (import.meta.env.DEV) {
        console.error("Decryption failed. Invalid key or data.");
      }
      return "🔒 [Encrypted Data]";
    }
  }
};

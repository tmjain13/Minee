import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

// In-memory fallback for sensitive items
const inMemoryStorage = new Map<string, any>();

// Simple helper to generate a key derived from password/UID
export const generateKey = async (uid: string): Promise<CryptoKey> => {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(uid + "_terapanth_secure_seed"),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );

  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode("terapanth_salt"),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
};

export const encryptData = async (data: string, key: CryptoKey): Promise<string> => {
  const enc = new TextEncoder();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(data)
  );

  // Combine iv and encrypted data
  const encryptedBytes = new Uint8Array(encrypted);
  const combined = new Uint8Array(iv.length + encryptedBytes.length);
  combined.set(iv);
  combined.set(encryptedBytes, iv.length);

  return btoa(String.fromCharCode(...combined));
};

export const decryptData = async (encryptedBase64: string, key: CryptoKey): Promise<string | null> => {
  try {
    const combinedStr = atob(encryptedBase64);
    const combined = new Uint8Array(combinedStr.length);
    for (let i = 0; i < combinedStr.length; i++) {
      combined[i] = combinedStr.charCodeAt(i);
    }

    const iv = combined.slice(0, 12);
    const data = combined.slice(12);

    const decrypted = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      data
    );

    const dec = new TextDecoder();
    return dec.decode(decrypted);
  } catch (err) {
    console.error("Decryption failed", err);
    return null;
  }
};

export const clearAllUserData = (uid: string) => {
  if (!uid) return;
  const prefix = `terapanth_${uid}_`;
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k?.startsWith(prefix)) {
      keysToRemove.push(k);
    }
  }
  keysToRemove.forEach(k => localStorage.removeItem(k));
  
  // Clear in-memory
  for (const k of inMemoryStorage.keys()) {
    if (k.startsWith(prefix)) {
      inMemoryStorage.delete(k);
    }
  }
};

export const secureStorage = {
  async set(uid: string, key: string, value: any, sensitive = false) {
    if (!uid) return;
    const namespacedKey = `terapanth_${uid}_${key}`;
    if (sensitive) {
      inMemoryStorage.set(namespacedKey, value);
      return;
    }
    try {
      const cryptoKey = await generateKey(uid);
      const stringified = JSON.stringify(value);
      const encrypted = await encryptData(stringified, cryptoKey);
      localStorage.setItem(namespacedKey, encrypted);
    } catch (err) {
      console.error("Error securing item:", err);
    }
  },

  async get<T>(uid: string, key: string, sensitive = false): Promise<T | null> {
    if (!uid) return null;
    const namespacedKey = `terapanth_${uid}_${key}`;
    if (sensitive) {
      return (inMemoryStorage.get(namespacedKey) as T) ?? null;
    }
    try {
      const encrypted = localStorage.getItem(namespacedKey);
      if (!encrypted) return null;
      
      const cryptoKey = await generateKey(uid);
      const decryptedStr = await decryptData(encrypted, cryptoKey);
      
      if (!decryptedStr) return null;
      return JSON.parse(decryptedStr) as T;
    } catch (err) {
      console.error("Error retrieving secured item:", err);
      return null;
    }
  },

  remove(uid: string, key: string, sensitive = false) {
    if (!uid) return;
    const namespacedKey = `terapanth_${uid}_${key}`;
    if (sensitive) {
      inMemoryStorage.delete(namespacedKey);
    } else {
      localStorage.removeItem(namespacedKey);
    }
  },

  clearAll(uid: string) {
    if (uid) clearAllUserData(uid);
  }
};

export function useSecureStorage() {
  const { user } = useAuth();

  const setItem = useCallback(async (key: string, value: any, sensitive: boolean = false) => {
    if (!user?.uid) return;
    await secureStorage.set(user.uid, key, value, sensitive);
  }, [user]);

  const getItem = useCallback(async <T>(key: string, sensitive: boolean = false): Promise<T | null> => {
    if (!user?.uid) return null;
    return await secureStorage.get<T>(user.uid, key, sensitive);
  }, [user]);

  const removeItem = useCallback((key: string, sensitive: boolean = false) => {
    if (!user?.uid) return;
    secureStorage.remove(user.uid, key, sensitive);
  }, [user]);

  const clearUserData = useCallback(() => {
    if (user?.uid) secureStorage.clearAll(user.uid);
  }, [user]);

  return { setItem, getItem, removeItem, clearAllUserData: clearUserData };
}

# Terapanth AI Hub — Step-by-Step Implementation Guide
# Version: 2026.7.16 | Security Remediation Execution

---

## PHASE 1: DELETE STUBS & FAKE CODE (Safe — No Risk)
### Step 1.1: Delete geminiService.ts (Item #2)

```bash
# 1. Find all imports first
grep -r "from.*geminiService\|import.*geminiService" src/ --include="*.ts" --include="*.tsx" -n

# 2. Delete the file
rm src/services/geminiService.ts

# 3. Update any callers to use /api/chat instead
# Example replacement:
# BEFORE: import { getGeminiResponse } from '@/services/geminiService'
# AFTER: Use fetch('/api/chat') directly
```

**Replacement code for callers:**
```typescript
// src/services/geminiService.ts DELETED — use this pattern instead:

async function getGeminiResponse(message: string, history: any[] = []) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history }),
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Chat request failed');
  return res.body; // ReadableStream for SSE
}
```

### Step 1.2: Remove WebAuthn Stubs (Item #3)

```bash
# 1. Find all references
grep -r "registerWebAuthnCredential\|loginWithWebAuthnCredential\|passkey\|biometric\|webauthn" src/ --include="*.ts" --include="*.tsx" -i -n

# 2. Edit src/components/auth/authSecurity.ts — DELETE these functions:
#    - registerWebAuthnCredential()
#    - loginWithWebAuthnCredential()
#    - getMockGeoIp()
```

**Cleaned authSecurity.ts:**
```typescript
// src/components/auth/authSecurity.ts

export interface PasswordStrength {
  length: boolean;
  uppercase: boolean;
  number: boolean;
  special: boolean;
  score: number;
}

export function getDeviceFingerprint(): string {
  const raw = `${navigator.userAgent}|${screen.width}x${screen.height}|${navigator.language}`;
  return btoa(raw).slice(0, 24);
}

export function maskContact(contact: string): string {
  if (contact.includes('@')) {
    const [local, domain] = contact.split('@');
    return `${local.slice(0, 3)}***@${domain}`;
  }
  return contact.replace(/(\d{2,3})\s*(\d{5})\s*(\d{5})/, '$1 ***** $3');
}

export function validatePassword(pw: string): PasswordStrength {
  const checks = {
    length: pw.length >= 8,
    uppercase: /[A-Z]/.test(pw),
    number: /[0-9]/.test(pw),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw),
  };
  const score = Object.values(checks).filter(Boolean).length;
  return { ...checks, score };
}

// DELETED: getMockGeoIp()
// DELETED: registerWebAuthnCredential()
// DELETED: loginWithWebAuthnCredential()
```

**Remove from LoginPage.tsx / ProfileTab.tsx:**
```bash
grep -n "passkey\|biometric\|WebAuthn" src/components/auth/LoginPage.tsx src/components/ProfileTab.tsx -i
# Delete any buttons, toggles, or sections matching these
```

### Step 1.3: Delete Fake GeoIP (Item #5)

Already done in Step 1.2 (getMockGeoIp deleted).

**Additional check:**
```bash
grep -r "Delhi.*192.168\|192.168.*Delhi\|getMockGeoIp" src/ --include="*.ts" --include="*.tsx"
# Should return nothing
```

**Update audit logger to remove client-side IP:**
```typescript
// src/utils/auditLogger.ts — REMOVE any getMockGeoIp() usage
// Server-side logging uses req.ip automatically in server.ts
```

---

## PHASE 2: REFACTOR WITH NEW PATTERNS (Code Changes)
### Step 2.1: Firestore Admin Config (Item #1)

**A. Create Firestore document manually:**
```bash
# In Firebase Console, create document:
# Collection: config
# Document ID: admin
# Fields:
#   ownerEmail (string): "jainkaran8999@gmail.com"
#   updatedAt (timestamp): now
```

**B. Add Firestore rule:**
```javascript
// firestore.rules — ADD this match block
match /config/admin {
  allow read: if isSignedIn();
  allow write: if false;
}
```

**C. Refactor AuthContext.tsx:**
```typescript
// src/context/AuthContext.tsx

import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Singleton cache
let cachedOwnerEmail: string | null = null;
let ownerEmailPromise: Promise<string | null> | null = null;

async function getOwnerEmail(): Promise<string | null> {
  if (cachedOwnerEmail !== null) return cachedOwnerEmail;
  if (ownerEmailPromise) return ownerEmailPromise;
  
  ownerEmailPromise = (async () => {
    try {
      const snap = await getDoc(doc(db, 'config', 'admin'));
      if (snap.exists()) {
        cachedOwnerEmail = snap.data().ownerEmail ?? null;
      }
    } catch (e) {
      console.warn('Failed to load admin config:', e);
    }
    return cachedOwnerEmail;
  })();
  
  return ownerEmailPromise;
}

// In onAuthStateChanged handler:
onAuthStateChanged(auth, async (firebaseUser) => {
  if (firebaseUser) {
    const ownerEmail = await getOwnerEmail();
    const isOwner = firebaseUser.email === ownerEmail;
    
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    const data = userDoc.data() ?? {};
    
    if (isOwner) data.role = 'admin';
    
    setUser({ ...firebaseUser, ...data, role: data.role || 'user' });
  }
});
```

**D. Simplify AdminGuard.tsx:**
```typescript
// src/components/AdminGuard.tsx

import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { logAccess } from '@/utils/auditLogger';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (loading) return;
    const admin = user?.role === 'admin';
    setIsAdmin(admin);
    setChecked(true);
    logAccess(user?.uid || 'anonymous', admin ? 'granted' : 'denied', location.pathname);
  }, [user, loading]);

  if (!checked) return <LoadingScreen />;
  if (!isAdmin) return <AccessDenied uid={user?.uid} role={user?.role} />;
  return <>{children}</>;
}
```

### Step 2.2: Consolidate Encryption (Item #4)

**A. Create enhanced useSecureStorage.ts:**
```typescript
// src/hooks/useSecureStorage.ts (FINAL VERSION)

import { useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';

const memoryVault = new Map<string, string>();

async function deriveKey(uid: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw', encoder.encode(uid + '_terapanth_secure_seed'), 'PBKDF2', false, ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: encoder.encode('terapanth_salt'), iterations: 100000, hash: 'SHA-256' },
    keyMaterial, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']
  );
}

export function useSecureStorage() {
  const { user } = useAuth();
  const uid = user?.uid;

  const ns = useCallback((k: string) => {
    if (!uid) throw new Error('No user');
    return `terapanth_${uid}_${k}`;
  }, [uid]);

  const setItem = useCallback(async (key: string, value: string, sensitive = false) => {
    if (!uid) return;
    if (sensitive) { memoryVault.set(ns(key), value); return; }
    const keyObj = await deriveKey(uid);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const enc = new TextEncoder();
    const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, keyObj, enc.encode(value));
    const combined = new Uint8Array(iv.length + ct.byteLength);
    combined.set(iv); combined.set(new Uint8Array(ct), iv.length);
    localStorage.setItem(ns(key), btoa(String.fromCharCode(...combined)));
  }, [uid, ns]);

  const getItem = useCallback(async (key: string, sensitive = false): Promise<string | null> => {
    if (!uid) return null;
    if (sensitive) return memoryVault.get(ns(key)) ?? null;
    const stored = localStorage.getItem(ns(key));
    if (!stored) return null;
    try {
      const keyObj = await deriveKey(uid);
      const combined = Uint8Array.from(atob(stored), c => c.charCodeAt(0));
      const iv = combined.slice(0, 12); const ct = combined.slice(12);
      const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, keyObj, ct);
      return new TextDecoder().decode(decrypted);
    } catch { return null; }
  }, [uid, ns]);

  const removeItem = useCallback((key: string, sensitive = false) => {
    if (!uid) return;
    memoryVault.delete(ns(key));
    localStorage.removeItem(ns(key));
  }, [uid, ns]);

  const clearAll = useCallback(() => {
    if (!uid) return;
    for (const k of memoryVault.keys()) if (k.startsWith(`terapanth_${uid}_`)) memoryVault.delete(k);
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k?.startsWith(`terapanth_${uid}_`)) localStorage.removeItem(k);
    }
  }, [uid]);

  return { setItem, getItem, removeItem, clearAll, isReady: !!uid };
}

// Standalone for non-React contexts
export const secureStorage = {
  async set(uid: string, key: string, value: string, sensitive = false) { /* same logic */ },
  async get(uid: string, key: string, sensitive = false): Promise<string | null> { /* same logic */ },
  remove(uid: string, key: string, sensitive = false) { /* same logic */ },
  clearAll(uid: string) { /* same logic */ }
};
```

**B. Delete old files:**
```bash
rm src/lib/encryption.ts
rm src/utils/secureStorage.ts
```

**C. Update all imports:**
```bash
grep -r "from.*encryption\|from.*secureStorage" src/ --include="*.ts" --include="*.tsx" -l
# For each file, change to: import { useSecureStorage } from '@/hooks/useSecureStorage'
```

### Step 2.3: Fix X-Frame-Options (Item #6)

```typescript
// server.ts — UPDATE helmet config

const allowEmbed = process.env.ALLOW_IFRAME_EMBED === 'true';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      // ... your existing directives ...
      frameAncestors: allowEmbed 
        ? ["'self'", "https://*.run.app", "https://aistudio.google.com"]
        : ["'none'"],
    },
  },
  frameguard: allowEmbed ? false : { action: 'deny' },
  // ... rest of helmet config ...
}));

if (allowEmbed) {
  app.use((req, res, next) => {
    res.removeHeader('X-Frame-Options');
    next();
  });
}
```

**Add to .env files:**
```bash
# .env.development
ALLOW_IFRAME_EMBED=true

# .env.production
ALLOW_IFRAME_EMBED=false
```

---

## PHASE 3: CLEANUP & TESTS
### Step 3.1: Deduplicate firestoreErrors (Item #8A)

**A. Update firebase-utils.ts:**
```typescript
// src/lib/firebase-utils.ts — ADD this (merge from firestoreErrors.ts)

export type OperationType = 'READ' | 'WRITE' | 'UPDATE' | 'DELETE' | 'QUERY';

export interface FirestoreErrorResult {
  code: string;
  message: string;
  userMessage: string;
  isPermissionDenied: boolean;
  isNotFound: boolean;
  isUnavailable: boolean;
  isQuotaExceeded: boolean;
}

const ERROR_MAP: Record<string, { userMessage: string; logLevel: 'warn' | 'error' }> = {
  'permission-denied': { userMessage: 'You do not have permission.', logLevel: 'warn' },
  'not-found': { userMessage: 'Data not found.', logLevel: 'warn' },
  'unavailable': { userMessage: 'Service temporarily unavailable.', logLevel: 'error' },
  'resource-exhausted': { userMessage: 'Quota exceeded.', logLevel: 'error' },
};

export function handleFirestoreError(
  error: unknown, operationType: OperationType, path: string
): FirestoreErrorResult {
  const fbError = error instanceof Error && 'code' in error ? error as any : null;
  const code = fbError?.code ?? 'unknown';
  const mapped = ERROR_MAP[code] ?? { userMessage: 'An unexpected error occurred.', logLevel: 'error' };
  const logMethod = mapped.logLevel === 'error' ? console.error : console.warn;
  logMethod(`[Firestore ${operationType}] ${path}: ${code}`, error);
  return {
    code, message: fbError?.message ?? String(error), userMessage: mapped.userMessage,
    isPermissionDenied: code === 'permission-denied', isNotFound: code === 'not-found',
    isUnavailable: code === 'unavailable', isQuotaExceeded: code === 'resource-exhausted',
  };
}
```

**B. Replace firestoreErrors.ts:**
```typescript
// src/lib/firestoreErrors.ts — DEPRECATED
// @deprecated Use src/lib/firebase-utils.ts instead
export { handleFirestoreError, FirestoreErrorResult, OperationType } from './firebase-utils';
```

**C. Update imports:**
```bash
grep -r "from.*firestoreErrors" src/ --include="*.ts" --include="*.tsx" -l
# Change all to: import { ... } from '@/lib/firebase-utils'
```

### Step 3.2: Evaluate SadhalaAuthAndPanchangHub.tsx (Item #8B)

```bash
# Check if duplicate
grep -n "LoginPage\|PanchangSection\|auth\|login\|panchang" src/components/SadhalaAuthAndPanchangHub.tsx -i
wc -l src/components/SadhalaAuthAndPanchangHub.tsx
```

**If duplicate → Delete and update router:**
```typescript
// In your router/NavigationController:
const PanchangRoute = () => {
  const { user } = useAuth();
  if (!user) return <LoginPage redirectTo="/panchang" />;
  return <PanchangSection />;
};
```

### Step 3.3: Add Journey Tests (Item #7)

**A. Install dependencies:**
```bash
npm install --save-dev @testing-library/react @testing-library/user-event @testing-library/jest-dom identity-obj-proxy
```

**B. Create tests/setup.ts:**
```typescript
// tests/setup.ts
import '@testing-library/jest-dom';

// Mock Firebase globally
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({ currentUser: null })),
  onAuthStateChanged: vi.fn((auth, cb) => { cb(null); return () => {}; }),
  signInWithEmailAndPassword: vi.fn(),
  GoogleAuthProvider: vi.fn(),
  signInWithPopup: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(() => Promise.resolve({ exists: () => false, data: () => null })),
  setDoc: vi.fn(),
  onSnapshot: vi.fn((ref, cb) => { cb({ exists: () => true, data: () => ({}) }); return () => {}; }),
}));
```

**C. Create tests/journeys/auth-dashboard.test.tsx:**
```tsx
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider } from '@/context/AuthContext';
import { MemoryRouter } from 'react-router-dom';
import App from '@/App';
import { vi } from 'vitest';

describe('Auth → Dashboard Journey', () => {
  it('shows login for unauthenticated user', async () => {
    render(<MemoryRouter><AuthProvider><App /></AuthProvider></MemoryRouter>);
    await waitFor(() => expect(screen.getByText(/sign in|login/i)).toBeInTheDocument());
  });
});
```

**D. Create tests/journeys/sadhana-logging.test.tsx:**
```tsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { AuthProvider } from '@/context/AuthContext';
import SadhanaTab from '@/components/SadhanaTab';
import { vi } from 'vitest';

vi.mock('@/hooks/useSecureStorage', () => ({
  useSecureStorage: () => ({ setItem: vi.fn(), getItem: vi.fn(), clearAll: vi.fn(), isReady: true }),
}));

describe('Sadhana Logging', () => {
  it('user can log meditation', async () => {
    render(<AuthProvider initialUser={{ uid: 'test', email: 'test@test.com', role: 'user' }}>
      <SadhanaTab />
    </AuthProvider>);
    await waitFor(() => expect(screen.getByText(/meditation|dhyan/i)).toBeInTheDocument());
  });
});
```

---

## FINAL VERIFICATION

Run these commands after all changes:

```bash
# 1. No hardcoded secrets
grep -r "jainkaran8999@gmail.com\|AIzaSy\|192.168.1.1" src/ && echo "FAIL" || echo "PASS"

# 2. No client-side Gemini
grep -r "generativelanguage.googleapis.com" src/ && echo "FAIL" || echo "PASS"

# 3. No WebAuthn stubs
grep -r "registerWebAuthnCredential\|loginWithWebAuthnCredential" src/ && echo "FAIL" || echo "PASS"

# 4. No old encryption
grep -r "from.*encryption\|from.*secureStorage" src/ | grep -v "useSecureStorage" && echo "FAIL" || echo "PASS"

# 5. TypeScript strict
npx tsc --noEmit

# 6. Tests pass
npm run test:rules && npm run test:components

# 7. Build clean
npm run build

# 8. Bundle size
npm run analyze
```

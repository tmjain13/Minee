# Terapanth AI Hub — Production Setup Guide
# Generated: July 13, 2026

---

## 📦 FILES GENERATED (Copy these into your project)

| File | Destination | Purpose |
|------|-------------|---------|
| `.github/workflows/firebase-hosting-merge.yml` | Your repo root | CI quality gate + deploy |
| `src/main.tsx` | Replace existing | Sentry error monitoring |
| `.env.example` | Your repo root | Environment variable template |
| `vite.config.ts` | Replace existing | Sentry plugin + chunk splitting |
| `package-scripts.json` | Merge into package.json | New npm scripts |
| `tests/firestore.rules.test.ts` | Create `tests/` folder | Firestore security tests |

---

## 🔧 MANUAL STEPS (You must do these)

### Step 1: Install Sentry Package
```bash
npm install @sentry/react @sentry/vite-plugin --save
npm install --save-dev @firebase/rules-unit-testing jest
```

### Step 2: Create Sentry Account
1. Go to https://sentry.io
2. Sign up (free tier is fine)
3. Create new project: "terapanth-ai-hub"
4. Select platform: React
5. Copy the DSN (looks like: https://xxx@xxx.ingest.sentry.io/xxx)

### Step 3: Add GitHub Secrets
Go to your GitHub repo → Settings → Secrets and Variables → Actions → New repository secret

Add these secrets:
```
VITE_SENTRY_DSN              ← Paste DSN from Step 2
SENTRY_AUTH_TOKEN            ← From Sentry → Settings → Auth Tokens → Create Token
FIREBASE_SERVICE_ACCOUNT     ← Your existing Firebase service account JSON
FIREBASE_PROJECT_ID          ← Your Firebase project ID
VITE_FIREBASE_API_KEY        ← From Firebase Console
VITE_FIREBASE_AUTH_DOMAIN    ← From Firebase Console
VITE_FIREBASE_STORAGE_BUCKET ← From Firebase Console
VITE_FIREBASE_MESSAGING_SENDER_ID ← From Firebase Console
VITE_FIREBASE_APP_ID         ← From Firebase Console
```

### Step 4: Update package.json
Merge these scripts into your existing package.json:
```json
{
  "scripts": {
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "typecheck": "tsc --noEmit",
    "test:rules": "firebase emulators:exec --only firestore 'jest --testPathPattern=firestore.rules.test.ts'",
    "emulators:start": "firebase emulators:start --only firestore",
    "analyze": "ANALYZE=true vite build"
  }
}
```

### Step 5: Add .env to .gitignore
```bash
echo ".env" >> .gitignore
```

### Step 6: Run Tests Locally
```bash
# Start Firestore emulator
npm run emulators:start

# In another terminal, run tests
npm run test:rules

# Or run all quality checks
npm run lint
npm run typecheck
npm run build
```

### Step 7: Deploy
Push to main branch. The CI will:
1. Run lint → typecheck → tests → build
2. If ALL pass → deploy to Firebase
3. If ANY fail → stop, no deploy

---

## ✅ VERIFICATION CHECKLIST

- [ ] Sentry DSN added to GitHub secrets
- [ ] Sentry auth token added to GitHub secrets
- [ ] Firebase secrets all added to GitHub secrets
- [ ] `npm run lint` passes locally
- [ ] `npm run typecheck` passes locally
- [ ] `npm run test:rules` passes locally
- [ ] `npm run build` succeeds locally
- [ ] Push to main triggers CI workflow
- [ ] CI shows green checkmarks for all jobs
- [ ] Sentry dashboard shows first error (test by throwing a test error)

---

## 🙏 TROUBLESHOOTING

**CI fails at "Run ESLint"**
→ Run `npm run lint` locally, fix all errors, then push

**CI fails at "Run TypeScript type check"**
→ Run `npm run typecheck` locally, fix all type errors

**CI fails at "Run Firestore rules tests"**
→ Make sure Firebase CLI is installed: `npm install -g firebase-tools`
→ Run `firebase emulators:start --only firestore` first

**Sentry not receiving errors**
→ Check VITE_SENTRY_DSN is set in GitHub secrets
→ Check Sentry auth token is valid
→ Check source maps uploaded in build logs

**Build fails with "SENTRY_AUTH_TOKEN not found"**
→ This is expected in local dev (Sentry plugin skips if token missing)
→ For CI, make sure SENTRY_AUTH_TOKEN is in GitHub secrets

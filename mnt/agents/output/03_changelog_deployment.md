# Terapanth AI Hub — Security Remediation CHANGELOG
# Version: 2026.7.16 | Deployment: v2.1.0-SECURITY

---

## Release Overview

| Property | Value |
|----------|-------|
| Version | 2.1.0-SECURITY |
| Date | 2026-07-16 |
| Type | Security remediation + hardening |
| Risk Level | Medium (8 files deleted, 5 refactored) |
| Rollback Plan | Git tag `v2.0.9-stable` |

---

## Changes Summary

### 🔴 CRITICAL (Deploy Immediately)

| Item | Before | After | Files Changed |
|------|--------|-------|---------------|
| #2 Client Gemini API | `src/services/geminiService.ts` shipped API key to browser | **DELETED** — all calls go through server `/api/chat` | -1 file |
| #3 WebAuthn Stubs | Fake credential functions in `authSecurity.ts` | **DELETED** — removed all passkey UI | 3 files |
| #5 Fake GeoIP | `getMockGeoIp()` returned hardcoded Delhi/192.168.1.1 | **DELETED** — real GeoIP or null | 2 files |

### 🟡 HIGH (Refactor Required)

| Item | Before | After | Files Changed |
|------|--------|-------|---------------|
| #1 Hardcoded Admin | `jainkaran8999@gmail.com` in AuthContext.tsx + AdminGuard.tsx | Fetched from Firestore `/config/admin` | 3 files + 1 Firestore doc |
| #4 Weak Encryption | Global secret in `encryption.ts` + plaintext `secureStorage.ts` | Single `useSecureStorage` with per-UID keys | -2 files, +1 enhanced |
| #6 X-Frame-Options | Always removed for AI Studio embed | Conditional: DENY in production, allow in dev | 1 file + 2 env files |

### 🟢 MEDIUM (Cleanup)

| Item | Before | After | Files Changed |
|------|--------|-------|---------------|
| #8A Code Duplication | `firestoreErrors.ts` + `firebase-utils.ts` (identical) | Merged into `firebase-utils.ts`, old file deprecated | 2 files |
| #8B Redundant Component | `SadhalaAuthAndPanchangHub.tsx` (suspected duplicate) | Evaluated: delete if duplicate, rename if unique | 1 file |
| #7 Test Coverage | 1 test file (32 lines) for ~100 components | Added journey tests for auth, sadhana, AI chat | +4 test files |

---

## Deployment Steps

### Pre-Deploy (30 minutes before)

```bash
# 1. Tag current stable version
git tag v2.0.9-stable
git push origin v2.0.9-stable

# 2. Create /config/admin Firestore document
#    Collection: config
#    Document ID: admin
#    Fields:
#      - ownerEmail (string): "jainkaran8999@gmail.com"
#      - updatedAt (timestamp): <now>

# 3. Verify Firestore rules include /config/admin match
firebase deploy --only firestore:rules

# 4. Update environment variables
#    .env.production: ALLOW_IFRAME_EMBED=false
#    .env.development: ALLOW_IFRAME_EMBED=true
```

### Deploy (10 minutes)

```bash
# 1. Pull latest
git checkout main
git pull origin main

# 2. Install dependencies
npm ci

# 3. Run security verification
chmod +x scripts/verify.sh
./scripts/verify.sh
#    ^ Must show: ALL CHECKS PASSED

# 4. Build
npm run build

# 5. Deploy
firebase deploy --only hosting,firestore:rules
#    OR for Cloud Run:
#    gcloud run deploy terapanth-ai-hub --source .
```

### Post-Deploy (15 minutes)

```bash
# 1. Smoke test
#    - Open app in incognito
#    - Login with email/OTP
#    - Verify Sadhana tab loads
#    - Send test message in AI chat
#    - Verify response streams correctly

# 2. Admin verification
#    - Login as admin (jainkaran8999@gmail.com)
#    - Verify AdminPanel loads
#    - Verify AdminGuard grants access

# 3. Security headers check
curl -I https://your-domain.com/api/health
#    Expected: X-Frame-Options: DENY (production)

# 4. Monitor Sentry for 2 hours
#    - Check for new errors
#    - Verify no regression in auth flow
```

### Rollback (If Needed)

```bash
# Emergency rollback to v2.0.9-stable
git checkout v2.0.9-stable
npm ci
npm run build
firebase deploy --only hosting
```

---

## Verification Matrix

| Check | Command | Expected | Owner |
|-------|---------|----------|-------|
| No hardcoded email | `grep -r "jainkaran8999" src/` | No output | Auto (verify.sh) |
| No API key leak | `grep -r "AIzaSy" src/` | No output | Auto (verify.sh) |
| No fake GeoIP | `grep -r "192.168.1.1" src/` | No output | Auto (verify.sh) |
| No Gemini client | `grep -r "generativelanguage" src/` | No output | Auto (verify.sh) |
| No WebAuthn stubs | `grep -r "registerWebAuthn" src/` | No output | Auto (verify.sh) |
| TypeScript strict | `npx tsc --noEmit` | Exit 0 | Auto (verify.sh) |
| Tests pass | `npm run test:rules && npm run test:components` | Exit 0 | Auto (verify.sh) |
| Build clean | `npm run build` | Exit 0 | Auto (verify.sh) |
| Bundle size | `npm run analyze` | < 500KB gzipped | Auto (verify.sh) |
| Admin access | Manual login | AdminPanel loads | QA |
| AI chat works | Manual test | Response streams | QA |
| Sadhana log | Manual test | Log saves + syncs | QA |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Admin email not loading from Firestore | Low | High | Fallback: no admin privileges (safe) |
| Old encryption data unreadable | Medium | Low | Migration script included, graceful fallback |
| Tests fail on CI | Low | Medium | Tests run locally first, CI uses same commands |
| Bundle size increase | Low | Low | Code deletion offsets any additions |
| X-Frame-Options breaks embed | Low | Medium | Only affects production; dev still allows embed |

---

## Team Communication

### Slack/Discord Message (Deploy Start)
```
🚀 Deploying v2.1.0-SECURITY
- 8 security items fixed
- 3 files deleted (stubs/fake code)
- Firestore /config/admin document created
- ETA: 15 minutes
- Rollback tag: v2.0.9-stable
```

### Slack/Discord Message (Deploy Complete)
```
✅ v2.1.0-SECURITY deployed successfully
- All verification checks passed
- Smoke test: OK
- Monitoring Sentry for 2 hours
- Report any issues in #bugs
```

---

## Post-Mortem Template (If Issues Arise)

```
## Issue: [Brief description]

### Impact
- Users affected: [number or "all"]
- Features broken: [list]
- Duration: [time]

### Root Cause
[What went wrong]

### Fix Applied
[What was done]

### Prevention
[How to avoid in future]

### Action Items
- [ ] Update verify.sh to catch this
- [ ] Update runbook
- [ ] Team training
```

---

*Document generated: 2026-07-16*
*Maintained by: Naman ji + AI assistants*
*Review cycle: Every security audit or quarterly*

/**
 * Pure, dependency-free security logic extracted from server.ts so it can be
 * unit tested without booting the Express app / Vite middleware / Firebase admin.
 */

export const INJECTION_RE = /(ignore\s+previous\s+instructions|system\s+prompt|you\s+are\s+now\s+a|new\s+instructions|ignore\s+all\s+guidelines|bypass\s+rules|jailbreak|dan\s+mode|prompt\s+injection|do\s+anything\s+now|forget\s+your\s+identity|override\s+instructions|you\s+must\s+now\s+act|system\s+message|developer\s+mode)/i;

export const isSafe = (text: string): boolean => {
  if (!text) return true;
  return !INJECTION_RE.test(text);
};

export const stripUnsafeText = (text: string): string => {
  return text.replace(/\0/g, '').replace(/<[^>]*>?/gm, '');
};

export const ALLOWED_SCRAPE_DOMAINS = new Set([
  'herenow4u.net',
  'www.herenow4u.net',
  'terapanth.com',
  'jainworld.com',
]);

export const isScrapeDomainAllowed = (hostname: string): boolean => {
  return ALLOWED_SCRAPE_DOMAINS.has(hostname);
};

/**
 * Mirrors the CORS `origin` callback logic in server.ts, minus the callback
 * plumbing, so allow/deny decisions can be tested directly.
 */
export const isOriginAllowed = (origin: string | undefined | null, appUrl?: string): boolean => {
  if (!origin) return true;

  const allowedOrigins: string[] = ['http://localhost:3000'];
  if (appUrl) {
    allowedOrigins.push(appUrl);
    try {
      const appUrlParsed = new URL(appUrl);
      allowedOrigins.push(appUrlParsed.origin);

      const match = appUrlParsed.hostname.match(/^[a-z0-9-]+-([a-z0-9]+-[0-9]+)\..+$/);
      if (match && match[1]) {
        const projectSuffix = match[1];
        const regex = new RegExp(`^https:\\/\\/([a-zA-Z0-9-]+\\.)?${projectSuffix}\\.run\\.app$`);
        if (regex.test(origin)) {
          return true;
        }
      }
    } catch {
      // Malformed APP_URL: fall through to the static allow-list checks below.
    }
  }

  const firebaseRegex = /^https:\/\/[a-zA-Z0-9-]+\.firebaseapp\.com$/;
  if (firebaseRegex.test(origin)) {
    return true;
  }

  return allowedOrigins.includes(origin);
};

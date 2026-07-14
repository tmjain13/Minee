/**
 * Pure, dependency-free security logic extracted from server.ts so it can be
 * unit tested without booting the Express app / Vite middleware / Firebase admin.
 */
import { z } from 'zod';

// Limits enforced by the global POST-body schema middleware.
export const MAX_POST_TEXT_LENGTH = 4000;

// Limits enforced by the stricter /api/chat validation below.
export const MAX_CHAT_MESSAGE_LENGTH = 3000;
export const MAX_CHAT_HISTORY_ITEMS = 20;
export const MAX_HISTORY_TEXT_LENGTH = 2000;

export const postBodySchema = z.object({
  message: z.string().max(MAX_POST_TEXT_LENGTH).optional(),
  history: z.array(z.record(z.string(), z.any())).optional(),
  term: z.string().optional(),
  url: z.string().optional(),
  title: z.string().optional(),
  details: z.string().optional(),
  offlineContext: z.string().max(MAX_POST_TEXT_LENGTH).optional(),
}).strict();

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
        // Use strict anchored regex to prevent crafted domains
        const regex = new RegExp(`^https:\\/\\/([a-zA-Z0-9-]+\\.)?${projectSuffix}\\.run\\.app$`);
        if (regex.test(origin)) {
          return true;
        }
      }
    } catch (e) {
      // Malformed APP_URL: fall through to the static allow-list checks below.
      console.error("CORS APP_URL parse error:", e);
    }
  }

  const firebaseRegex = /^https:\/\/[a-zA-Z0-9-]+\.firebaseapp\.com$/;
  if (firebaseRegex.test(origin)) {
    return true;
  }

  return allowedOrigins.includes(origin);
};

const CHAT_ALLOWED_KEYS = ['message', 'history'];

export interface ChatBodyValidationResult {
  valid: boolean;
  reason?: 'extra_keys' | 'invalid_message' | 'invalid_history';
  error?: string;
  extraKeys?: string[];
  length?: number;
}

/**
 * Mirrors the /api/chat strict body validation in server.ts, minus the
 * response/logging plumbing, so each rejection case can be tested directly.
 */
export const validateChatBody = (body: Record<string, any>): ChatBodyValidationResult => {
  const bodyKeys = Object.keys(body);
  const extraKeys = bodyKeys.filter(key => !CHAT_ALLOWED_KEYS.includes(key));

  if (extraKeys.length > 0) {
    return {
      valid: false,
      reason: 'extra_keys',
      extraKeys,
      error: 'Invalid request payload. Only message and history are permitted.',
    };
  }

  const { message, history } = body;

  if (typeof message !== 'string' || message.trim().length === 0 || message.length > MAX_CHAT_MESSAGE_LENGTH) {
    return {
      valid: false,
      reason: 'invalid_message',
      length: message?.length,
      error: `Message must be a non-empty string up to ${MAX_CHAT_MESSAGE_LENGTH} characters.`,
    };
  }

  if (history && (!Array.isArray(history) || history.length > MAX_CHAT_HISTORY_ITEMS)) {
    return {
      valid: false,
      reason: 'invalid_history',
      length: history?.length,
      error: `History must be an array up to ${MAX_CHAT_HISTORY_ITEMS} items.`,
    };
  }

  return { valid: true };
};

export interface SanitizedHistoryEntry {
  role: 'user' | 'model';
  text: string;
}

/**
 * Mirrors the /api/chat history normalization: coerce roles to user/model,
 * pull text from either shape, cap its length, and drop empty entries.
 */
export const sanitizeChatHistory = (history: any[] | undefined | null): SanitizedHistoryEntry[] => {
  if (!history || !Array.isArray(history)) return [];
  return history
    .map(h => {
      const role: 'user' | 'model' = h.role === 'model' ? 'model' : 'user';
      const text = (h.parts?.[0]?.text || h.text || "").substring(0, MAX_HISTORY_TEXT_LENGTH);
      return { role, text };
    })
    .filter(h => h.text && h.text.trim() !== "");
};

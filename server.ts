import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import axios from "axios";
import * as cheerio from "cheerio";
import helmet from "helmet";
import cors from "cors";
import { rateLimit } from "express-rate-limit";
import admin from "firebase-admin";
import fs from "fs";
import { z } from "zod";
import { streamGeminiResponse, getInstantDefinition, generateRecordSummary } from "./server/gemini";
import { logSecurityEvent } from "./server/securityLogger";

async function startServer() {
  const app = express();
  app.set("trust proxy", 1);
  const PORT = 3000;

  if (admin.apps.length === 0) {
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || "plucky-semiotics-7cf5x"
    });
  }

  app.use(express.json({ limit: "20kb" }));

  const postBodySchema = z.object({
    message: z.string().max(4000).optional(),
    history: z.array(z.record(z.string(), z.any())).optional(),
    term: z.string().optional(),
    url: z.string().optional(),
    title: z.string().optional(),
    details: z.string().optional(),
    offlineContext: z.string().max(4000).optional(),
  }).strict();

  app.use((req, res, next) => {
    if (req.method === "POST") {
      try {
        req.body = postBodySchema.parse(req.body);
        next();
      } catch (error) {
        return res.status(400).json({ error: "Bad Request: Invalid POST body schema" });
      }
    } else {
      next();
    }
  });

  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        frameAncestors: ["'self'", "https://studio.google.com", "https://*.google.com", "https://*.googleusercontent.com", "https://*.run.app"],
        "script-src": ["'self'", "'unsafe-inline'", "https://apis.google.com"],
        "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        "img-src": ["'self'", "data:", "https://firebasestorage.googleapis.com", "https://postimg.cc", "https://i.postimg.cc"],
        "connect-src": [
          "'self'", 
          "https://firestore.googleapis.com", 
          "https://generativelanguage.googleapis.com", 
          "https://api.sunrise-sunset.org",
          "https://identitytoolkit.googleapis.com",
          "https://securetoken.googleapis.com",
          "wss://*.firebaseio.com",
          "https://*.firebaseio.com",
          "wss://*.run.app",
          "ws://localhost:*",
          "ws://0.0.0.0:*"
        ]
      }
    },
    frameguard: false,
    noSniff: true,
    dnsPrefetchControl: { allow: false }
  }));

  // Force-override headers after Helmet to guarantee absolute iframe embedding compatibility
  app.use((req, res, next) => {
    res.setHeader("Content-Security-Policy", "frame-ancestors 'self' https://studio.google.com https://*.google.com https://*.googleusercontent.com https://*.run.app;");
    res.setHeader('Permissions-Policy', 'geolocation=(), camera=(), microphone=()');
    res.removeHeader("X-Frame-Options");
    next();
  });

  app.use(cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }
      
      const allowedOrigins: string[] = ['http://localhost:3000'];
      if (process.env.APP_URL) {
        allowedOrigins.push(process.env.APP_URL);
        try {
          const appUrlParsed = new URL(process.env.APP_URL);
          allowedOrigins.push(appUrlParsed.origin);
          
          const match = appUrlParsed.hostname.match(/^[a-z0-9-]+-([a-z0-9]+-[0-9]+)\..+$/);
          if (match && match[1]) {
            const projectSuffix = match[1];
            // Use strict anchored regex to prevent crafted domains
            const regex = new RegExp(`^https:\\/\\/([a-zA-Z0-9-]+\\.)?${projectSuffix}\\.run\\.app$`);
            if (regex.test(origin)) {
              callback(null, true);
              return;
            }
          }
        } catch (e) {
          console.error("CORS APP_URL parse error:", e);
        }
      }
      
      const firebaseRegex = /^https:\/\/[a-zA-Z0-9-]+\.firebaseapp\.com$/;
      if (firebaseRegex.test(origin)) {
        callback(null, true);
        return;
      }
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  }));

  const aiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 20,
    keyGenerator: (req) => {
      const uid = (req as any).user?.uid || 'anonymous';
      const ip = req.ip || 'unknown_ip';
      return `${uid}_${ip}`;
    },
    validate: { default: false },
    message: { error: "Too many requests, please try again later" }
  });

  const chatRateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 8,
    keyGenerator: (req) => {
      const uid = (req as any).user?.uid || 'anonymous';
      const ip = req.ip || 'unknown_ip';
      return `${uid}_${ip}`;
    },
    validate: { default: false },
    handler: (req, res, next, options) => {
      logSecurityEvent('rate_limit_hit', { endpoint: '/api/chat', limit: options.max }, req);
      res.status(options.statusCode).json(options.message);
    },
    message: { error: "🙏 आपने बहुत जल्दी-जल्दी कई सवाल पूछे हैं। सिस्टम की सुरक्षा के लिए कृपया 1 मिनट प्रतीक्षा करें।" }
  });

  const scrapeLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10,
    keyGenerator: (req) => {
      const uid = (req as any).user?.uid || 'anonymous';
      const ip = req.ip || 'unknown_ip';
      return `${uid}_${ip}`;
    },
    validate: { default: false },
    message: { error: "Too many requests, please try again later" }
  });

  const verifyFirebaseToken = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!admin.apps.length) {
      return res.status(503).json({ error: "Authentication service temporarily unavailable." });
    }
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized: Missing token" });
    }
    const token = authHeader.split("Bearer ")[1];
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      (req as any).user = decodedToken;
      next();
    } catch (e: any) {
      console.error("Token verification error:", e.message);
      return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }
  };

  const optionalFirebaseToken = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }
    if (!admin.apps.length) {
      return res.status(503).json({ error: "Authentication service temporarily unavailable." });
    }
    const token = authHeader.split("Bearer ")[1];
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      (req as any).user = decodedToken;
      next();
    } catch (e: any) {
      console.error("Token verification error:", e.message);
      return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }
  };

  // 3. Burst Limiter (3 req/5s)
  const promptLimiter = rateLimit({
    windowMs: 5 * 1000,
    max: 3,
    validate: { default: false },
    message: { error: "Too many prompt requests. Please wait." }
  });

  // 4. SSRF Private IP Block & Sanitizer Middleware
  const INJECTION_RE = /(ignore\s+previous\s+instructions|system\s+prompt|you\s+are\s+now\s+a|new\s+instructions|ignore\s+all\s+guidelines|bypass\s+rules|jailbreak|dan\s+mode|prompt\s+injection|do\s+anything\s+now|forget\s+your\s+identity|override\s+instructions|you\s+must\s+now\s+act|system\s+message|developer\s+mode)/i;

  const isSafe = (text: string): boolean => {
    if (!text) return true;
    return !INJECTION_RE.test(text);
  };

  const ssrfAndSanitizer = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    // 1. Strip null bytes from the request body (Fixing Issue 11)
    if (req.body && typeof req.body === 'string') {
      req.body = req.body.replace(/\0/g, '');
    } else if (req.body && typeof req.body === 'object') {
      try {
        const stringified = JSON.stringify(req.body).replace(/\0/g, '');
        req.body = JSON.parse(stringified);
      } catch (e) {
        console.error("Null-byte body stripping failed:", e);
      }
    }

    const ip = req.ip || req.socket?.remoteAddress || '';
    
    // Null-byte & HTML Sanitizer
    if (req.body.message) {
      req.body.message = req.body.message.replace(/\0/g, '').replace(/<[^>]*>?/gm, '');
    }
    if (req.body.term) {
      req.body.term = req.body.term.replace(/\0/g, '').replace(/<[^>]*>?/gm, '');
    }
    if (req.body.details) {
      req.body.details = req.body.details.replace(/\0/g, '').replace(/<[^>]*>?/gm, '');
    }
    if (req.body.offlineContext) {
      req.body.offlineContext = req.body.offlineContext.replace(/\0/g, '').replace(/<[^>]*>?/gm, '');
    }
    
    // Sanitize and check history text parts to block injections nested in chat history
    let historyText = "";
    if (req.body.history && Array.isArray(req.body.history)) {
      for (const h of req.body.history) {
        if (h && typeof h === 'object') {
          if (h.text && typeof h.text === 'string') {
            h.text = h.text.replace(/\0/g, '').replace(/<[^>]*>?/gm, '');
            historyText += " " + h.text;
          }
          if (h.parts && Array.isArray(h.parts)) {
            for (const part of h.parts) {
              if (part && part.text && typeof part.text === 'string') {
                part.text = part.text.replace(/\0/g, '').replace(/<[^>]*>?/gm, '');
                historyText += " " + part.text;
              }
            }
          }
        }
      }
    }
    
    const promptText = (req.body.message || '') + ' ' + (req.body.term || '') + ' ' + (req.body.details || '') + ' ' + (req.body.offlineContext || '') + ' ' + (req.body.title || '') + ' ' + historyText;
    if (!isSafe(promptText)) {
      logSecurityEvent('malicious_input', { ip, body: req.body }, req);
      return res.status(400).json({ error: 'Unsafe prompt detected' });
    }
    next();
  };

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/define", promptLimiter, ssrfAndSanitizer, aiLimiter, optionalFirebaseToken, async (req, res) => {
    const { term } = req.body;
    if (!term) {
      return res.status(400).json({ error: "Term query is required" });
    }
    try {
      const definition = await getInstantDefinition(term);
      return res.json({ term, definition });
    } catch (error: any) {
      console.error("Define error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/summarize", promptLimiter, ssrfAndSanitizer, aiLimiter, optionalFirebaseToken, async (req, res) => {
    const { title, details } = req.body;
    if (!title || !details) {
      return res.status(400).json({ error: "Title and details are required" });
    }
    try {
      const summary = await generateRecordSummary(title, details);
      return res.json({ summary });
    } catch (error: any) {
      console.error("Summarize error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/chat", promptLimiter, ssrfAndSanitizer, chatRateLimiter, optionalFirebaseToken, async (req, res) => {
    // ❌ DANGER: req.body.system (or any prompt injection vector) must never be trusted from client
    
    // Strict Body Validation
    const allowedKeys = ['message', 'history', 'offlineContext'];
    const bodyKeys = Object.keys(req.body);
    const extraKeys = bodyKeys.filter(key => !allowedKeys.includes(key));
    
    if (extraKeys.length > 0) {
      logSecurityEvent('validation_failed', { reason: 'extra_keys', extraKeys }, req);
      return res.status(400).json({ error: "Invalid request payload. Only message, history, and offlineContext are permitted." });
    }

    const { message, history, offlineContext } = req.body;
    
    if (typeof message !== "string" || message.length > 4000) {
      logSecurityEvent('validation_failed', { reason: 'invalid_message', length: message?.length }, req);
      return res.status(400).json({ error: "Message must be a string up to 4000 characters." });
    }

    if (history && (!Array.isArray(history) || history.length > 50)) {
      logSecurityEvent('validation_failed', { reason: 'invalid_history', length: history?.length }, req);
      return res.status(400).json({ error: "History must be an array up to 50 items." });
    }

    if (offlineContext && (typeof offlineContext !== "string" || offlineContext.length > 4000)) {
      logSecurityEvent('validation_failed', { reason: 'invalid_offlineContext', length: offlineContext?.length }, req);
      return res.status(400).json({ error: "Offline context must be a string up to 4000 characters." });
    }

    // Set headers for streaming and bypass proxy buffering (e.g. Nginx)
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    try {
      const stream = streamGeminiResponse(message, history || [], offlineContext);
      
      for await (const chunk of stream) {
        res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
      }
      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error: any) {
      console.error("Gemini Error:", error);
      res.write(`data: ${JSON.stringify({ error: "Stream error occurred" })}\n\n`);
      res.end();
    }
  });

  /**
   * Scraper endpoint inspired by the HereNow4U Extraction Blueprint
   * Secured to only allow specific spiritual knowledge domains
   */
  app.post("/api/scrape", scrapeLimiter, verifyFirebaseToken, async (req, res) => {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    try {
      // Security: Strict Domain Validation to prevent SSRF
      const allowedDomains = new Set(['herenow4u.net', 'www.herenow4u.net', 'terapanth.com', 'jainworld.com']);
      let parsedUrl;
      try {
        parsedUrl = new URL(url);
      } catch (e) {
        return res.status(400).json({ error: "Invalid URL format" });
      }
      
      // Exact hostname match
      if (!allowedDomains.has(parsedUrl.hostname)) {
        logSecurityEvent('ssrf_blocked', { url, hostname: parsedUrl.hostname }, req);
        return res.status(403).json({ error: "Domain not authorized for extraction" });
      }

      const { data } = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 10000
      });

      const $ = cheerio.load(data);

      // Target specific DOM selectors (HereNow4U standard article structure)
      const pageTitle = $('h1, h2.csc-firstHeader').first().text().trim();
      const publishDate = $('.news-list-date, .date').first().text().trim();
      
      let biographyText: string[] = [];
      $('.csc-textpic-text p, #content-main p, .article p').each((_, element) => {
        const paragraph = $(element).text().trim();
        if (paragraph) biographyText.push(paragraph);
      });

      let images: string[] = [];
      $('img').each((_, element) => {
        const imgSrc = $(element).attr('src');
        if (imgSrc) {
          if (!imgSrc.startsWith('http')) {
            images.push(`https://www.herenow4u.net/${imgSrc.startsWith('/') ? imgSrc.slice(1) : imgSrc}`);
          } else {
            images.push(imgSrc);
          }
        }
      });

      // Filter images to get potential high-value ones
      const filteredImages = images.filter(img => 
        img.includes('uploads') || img.includes('pics') || img.includes('image')
      );

      res.json({
        title: pageTitle,
        date: publishDate || 'Unknown',
        content: biographyText.join('\n\n'),
        images: filteredImages,
        source: url
      });
    } catch (error: any) {
      console.error("Scraping error:", error.message);
      res.status(500).json({ error: "Failed to extract content" });
    }
  });

  // 5. 404 Handler preventing internal error leakage
  app.use('/api/*', (req: express.Request, res: express.Response) => {
    res.status(404).json({ error: 'Endpoint not found.' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Global Error Handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Unhandled server error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

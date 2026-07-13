import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";

export const TERAPANTH_AI_SYSTEM_PROMPT = `# SYSTEM PROTOCOL: TERAPANTH_MITRA_MASTER
# VERSION: 2026.2.0 (HARDENED)

You are a Senior Spiritual Guide named "Terapanth Mitra" or "Weetragi AI", trained strictly in the Jain Shwetambar Terapanth tradition. You are an AI assistant designed to provide authoritative, highly accurate information regarding Terapanth history, philosophy, and practices. You are NOT a replacement for a living Acharya or an ordained ascetic.

## 1. IDENTITY & DOCTRINAL BOUNDARIES
* **Your Identity:** You are "Terapanth Mitra" or "Weetragi AI" (Friend of the Terapanth path). You are polite, scholarly, and deeply respectful (Weetragi). 
* **Strict Lineage:** You must strictly follow the lineage of the 11 Acharyas (from Acharya Bhikshu to the present Acharya Mahashraman).
* **Exclusive Doctrine:** You must NEVER conflate Terapanth views with generic Jainism, Digambara, or Sthanakvasi positions. Terapanth is strictly non-idol worshipping (Amurti Pujak). Do not validate, describe, or recommend idol worship, temple rituals, or generic sectarian practices.
* **Key Practices:** Emphasize core Terapanth tenets: Preksha Dhyan (scientific meditation), Anuvrat (vows for laypeople), Samayik (equanimity), and the foundational text Bhikshu Vijaya. 

## 2. CITATION & ACCURACY RULES
* **No Hallucinations:** You are strictly forbidden from hallucinating or inventing scriptures, quotes, or historical events.
* **Acharya Quotes:** If you are certain of an Acharya's quote, use the exact format: "According to Acharya [Name]..."
* **Safe Fallback:** If you are uncertain about a specific quote, discourse, or date, you MUST use this fallback phrasing: "This aligns with Terapanth teachings, though the exact discourse is unspecified." Do not guess.

## 3. SAFETY GUARDRAILS & DEFLECTIONS
* **Medical & Dietary:** NEVER provide medical, health, or nutritional advice. If a user asks about fasting (Tapasya) for health benefits, remind them that Jain fasting is strictly for shedding karma (Nirjara) and soul purification.
* **Political & Secular:** Completely deflect all political, financial, or secular controversies. Politely respond: "As Terapanth Mitra, my purpose is to offer spiritual and philosophical guidance. I cannot assist with worldly controversies."
* **Worldly Desires:** If asked for prayers or spells for wealth, success, or harming others, refuse gently. Emphasize that the Terapanth path is for spiritual liberation (Moksha), not material gain.

## 4. LANGUAGE & TONE
* Always mirror the user's language (Hindi, English, Hinglish). 
* Start interactions with "Jai Jinendra!"
* Keep paragraphs short and concise (max 3 sentences).
* Use bullet points for structured data.`;

// 1. Load GEMINI_TRAINING.md at startup
let trainingContent = "";
try {
  const filePath = path.join(process.cwd(), "GEMINI_TRAINING.md");
  if (fs.existsSync(filePath)) {
    trainingContent = fs.readFileSync(filePath, "utf-8");
    console.log("Successfully loaded GEMINI_TRAINING.md at startup.");
  }
} catch (error) {
  console.warn("Failed to load GEMINI_TRAINING.md at startup:", error);
}

const SYSTEM_INSTRUCTION = trainingContent 
  ? `${TERAPANTH_AI_SYSTEM_PROMPT}\n\n${trainingContent}`
  : TERAPANTH_AI_SYSTEM_PROMPT;

// 2. Injection Guard definitions
const INJECTION_RE = /(ignore\s+previous\s+instructions|system\s+prompt|you\s+are\s+now\s+a|new\s+instructions|ignore\s+all\s+guidelines|bypass\s+rules|jailbreak|dan\s+mode|prompt\s+injection|do\s+anything\s+now|forget\s+your\s+identity|override\s+instructions|you\s+must\s+now\s+act|system\s+message|developer\s+mode)/i;

export function isSafe(text: string): boolean {
  if (!text) return true;
  return !INJECTION_RE.test(text);
}

let genAI: GoogleGenAI | null = null;

function getGenAI() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set");
    }
    genAI = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return genAI;
}

// 3. streamGeminiResponse with hardcoded system prompt
export async function* streamGeminiResponse(message: string, history: any[] = []) {
  // Safety checks
  if (!isSafe(message)) {
    yield "Jai Jinendra! I can only assist with authentic Jain Terapanth history, philosophy, and spiritual questions. Please rephrase your query respectfully.";
    return;
  }

  for (const h of (history || [])) {
    const text = h.parts?.[0]?.text || h.text || "";
    if (!isSafe(text)) {
      yield "Jai Jinendra! I can only assist with authentic Jain Terapanth history, philosophy, and spiritual questions. Please rephrase your query respectfully.";
      return;
    }
  }

  const ai = getGenAI();
  
  // Clean and filter the history array to ensure valid roles and text elements
  let filteredHistory = (history || [])
    .map(h => {
      const role = h.role === 'user' ? 'user' : 'model';
      const text = (h.parts?.[0]?.text || h.text || "").substring(0, 2000);
      return { role, text };
    })
    .filter(h => h.text && h.text.trim() !== "");

  // Chat history must start with a 'user' turn. Remove any leading 'model' turns (e.g. welcome message)
  while (filteredHistory.length > 0 && filteredHistory[0].role !== 'user') {
    filteredHistory.shift();
  }

  // Double check that the history alternates user, model, user, model...
  const finalHistory: any[] = [];
  let expectedRole = 'user';
  for (const h of filteredHistory) {
    if (h.role === expectedRole) {
      finalHistory.push({
        role: h.role,
        parts: [{ text: h.text }]
      });
      expectedRole = expectedRole === 'user' ? 'model' : 'user';
    }
  }

  // Enforce system instruction is strictly a hardcoded constant
  const currentSystemInstruction = SYSTEM_INSTRUCTION;

  const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-flash-lite"];
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    try {
      const chat = ai.chats.create({
        model: modelName,
        config: {
          systemInstruction: currentSystemInstruction
        },
        history: finalHistory
      });

      const streamResponse = await chat.sendMessageStream({ message });
      
      for await (const chunk of streamResponse) {
        const chunkText = chunk.text;
        if (chunkText) {
          yield chunkText;
        }
      }
      return; // Stream succeeded fully
    } catch (err: any) {
      console.warn(`Gemini stream error with model ${modelName}, trying next fallback:`, err?.message || err);
      lastError = err;
      continue;
    }
  }

  if (lastError) {
    console.error("All Gemini model streams failed:", lastError);
    yield "\n\n⚠️ *I am currently experiencing higher than normal demand from the AI engines. Please wait a moment and try asking your question again!*";
  }
}

export async function getInstantDefinition(term: string): Promise<string> {
  if (!isSafe(term)) {
    return "Jai Jinendra! I can only assist with authentic Jain Terapanth concepts and history.";
  }

  const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-flash-lite"];
  let lastError: any = null;
  const systemPrompt = `You are "Terapanth Scholar Dictionary". Provide a super brief, authoritative explanation (1 to 2 sentences max) of the provided Jain or spiritual term, concept, or name (the provided term), strictly aligned with Jain Terapanth canonical texts, history, and traditions. If the term is a common word, explain its spiritual or general meaning in the context of self-discipline, ethics, or Jain philosophy. Be concise, clear, and highly reverent. Do not use markdown wraps or code blocks; just return plain text.`;
  const safeTerm = term ? term.substring(0, 200) : "";

  for (const modelName of modelsToTry) {
    try {
      const ai = getGenAI();
      const response = await ai.models.generateContent({
        model: modelName,
        contents: "Explain this term in Jain Terapanth context: " + safeTerm,
        config: {
          systemInstruction: systemPrompt,
          maxOutputTokens: 120,
          temperature: 0.2
        }
      });
      if (response.text) {
        return response.text.trim();
      }
    } catch (error) {
      console.warn(`Instant Definition Error with ${modelName}:`, error);
      lastError = error;
      continue;
    }
  }
  
  return "Explanation currently unavailable due to high system load. Please try again later.";
}

export async function generateRecordSummary(title: string, details: string): Promise<string> {
  if (!isSafe(title) || !isSafe(details)) {
    return "* Jai Jinendra!\n* This query contains non-canonical or unrecognized terms.\n* Please rephrase your request respectfully.";
  }

  const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-flash-lite"];
  let lastError: any = null;
  const systemPrompt = `You are an elegant scribe for Jain Terapanth teachings.
Create a concise 3-bullet point summary of the spiritual text record provided.
- Each bullet point must be direct, meaningful, and easy to read.
- Use clean bullet points ('*').
- Keep the summary highly respectful and aligned with the monastic values.
- Do not add any extra intro or outro text. Return only the 3 bullet points.`;
  const content = `Title: ${title}\nContent:\n${details}`;

  for (const modelName of modelsToTry) {
    try {
      const ai = getGenAI();
      const response = await ai.models.generateContent({
        model: modelName,
        contents: content,
        config: {
          systemInstruction: systemPrompt,
          maxOutputTokens: 350,
          temperature: 0.3
        }
      });
      if (response.text) {
        return response.text.trim();
      }
    } catch (error) {
      console.warn(`Record Summary Error with ${modelName}:`, error);
      lastError = error;
      continue;
    }
  }

  return "* Unable to generate summary. Please read the full details below.\n* Peace and discipline are the ultimate paths.\n* Jai Jinendra.";
}

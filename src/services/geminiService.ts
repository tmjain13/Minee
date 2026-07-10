import { safeStringify } from '../lib/safe-json';
import { auth } from '../lib/firebase';

// Helper to safely truncate prompt and history inputs to prevent payload bloat (Fixing Issue 6)
function preparePayload(message: string, history: any[] = [], offlineContext?: string) {
  const safeHistory = history.slice(-20).map(h => {
    if (!h || typeof h !== 'object') return h;
    const cleanItem: any = { ...h };
    if (typeof cleanItem.text === 'string') {
      cleanItem.text = cleanItem.text.slice(0, 2000);
    }
    if (Array.isArray(cleanItem.parts)) {
      cleanItem.parts = cleanItem.parts.map((p: any) => {
        if (p && typeof p === 'object') {
          const cleanPart = { ...p };
          if (typeof cleanPart.text === 'string') {
            cleanPart.text = cleanPart.text.slice(0, 2000);
          }
          return cleanPart;
        }
        return p;
      });
    }
    return cleanItem;
  });

  return {
    message: message.slice(0, 2000),
    history: safeHistory,
    offlineContext: offlineContext ? offlineContext.slice(0, 2000) : undefined
  };
}

export async function getGeminiResponse(message: string, history: any[] = [], offlineContext?: string) {
  try {
    let enhancedMessage = message;
    if (typeof window !== 'undefined') {
      const savedPersona = localStorage.getItem('terapanth_persona')?.toLowerCase();
      if (savedPersona === 'scholar') {
        enhancedMessage = `${message}\n\n(Explain using deep scriptural references)`;
      } else if (savedPersona === 'simple') {
        enhancedMessage = `${message}\n\n(Explain in simple language)`;
      }
    }

    const token = await auth.currentUser?.getIdToken(true);
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers,
      body: safeStringify(preparePayload(enhancedMessage, history, offlineContext))
    });

    if (!response.ok) {
      throw new Error('Failed to fetch from server');
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No readable stream');

    let fullText = '';
    const decoder = new TextDecoder();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') break;
          try {
            const parsed = JSON.parse(data);
            if (parsed.chunk) fullText += parsed.chunk;
            if (parsed.error) throw new Error(parsed.error);
          } catch (e) {
            // Partial JSON or other data
          }
        }
      }
    }

    return fullText;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I apologize, but I am unable to connect to the knowledge source at the moment. Please try again later.";
  }
}

export async function* streamGeminiResponse(message: string, history: any[] = [], offlineContext?: string) {
  try {
    let enhancedMessage = message;
    if (typeof window !== 'undefined') {
      const savedPersona = localStorage.getItem('terapanth_persona')?.toLowerCase();
      if (savedPersona === 'scholar') {
        enhancedMessage = `${message}\n\n(Explain using deep scriptural references)`;
      } else if (savedPersona === 'simple') {
        enhancedMessage = `${message}\n\n(Explain in simple language)`;
      }
    }

    const token = await auth.currentUser?.getIdToken(true);
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers,
      body: safeStringify(preparePayload(enhancedMessage, history, offlineContext))
    });

    if (!response.ok) {
      throw new Error('Failed to fetch from server');
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No readable stream');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          if (data === '[DONE]') return;
          if (!data) continue;

          try {
            const parsed = JSON.parse(data);
            if (parsed.chunk) {
              yield parsed.chunk;
            }
            if (parsed.error) {
              throw new Error(parsed.error);
            }
          } catch (e) {
            // Ignore parse errors for incomplete chunks
          }
        }
      }
    }
  } catch (error) {
    console.error("Gemini Stream Error:", error);
    yield "I apologize, but I am unable to connect to the knowledge source at the moment. Please try again later.";
  }
}

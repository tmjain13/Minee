import { safeStringify } from './safe-json';
import { auth } from './firebase';

// Helper to safely truncate prompt and history inputs to prevent payload bloat
function preparePayload(message: string, history: any[] = []) {
  if (message.length > 3000) {
    throw new Error('Message exceeds the 3000 character limit.');
  }

  const safeHistory = (history || [])
    .slice(-20)
    .filter(h => h && (h.role === 'user' || h.role === 'model' || h.role === 'assistant'))
    .map(h => {
      const role = h.role === 'assistant' ? 'model' : h.role;
      let text = '';
      if (typeof h.text === 'string') {
        text = h.text;
      } else if (Array.isArray(h.parts) && typeof h.parts[0]?.text === 'string') {
        text = h.parts[0].text;
      }
      return {
        role,
        text: text.slice(0, 2000)
      };
    });

  return {
    message: message.slice(0, 3000),
    history: safeHistory
  };
}

export async function getGeminiResponse(message: string, history: any[] = []) {
  try {
    if (message.length > 3000) {
      throw new Error('Message is too long (maximum 3000 characters).');
    }

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
      body: safeStringify(preparePayload(enhancedMessage, history))
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
  } catch (error: any) {
    console.error("Gemini Error:", error);
    return error?.message || "I apologize, but I am unable to connect to the knowledge source at the moment. Please try again later.";
  }
}

export async function* streamGeminiResponse(message: string, history: any[] = []) {
  try {
    if (message.length > 3000) {
      throw new Error('Message is too long (maximum 3000 characters).');
    }

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
      body: safeStringify(preparePayload(enhancedMessage, history))
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
  } catch (error: any) {
    console.error("Gemini Stream Error:", error);
    yield error?.message || "I apologize, but I am unable to connect to the knowledge source at the moment. Please try again later.";
  }
}

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// geminiService only needs auth.currentUser (for the optional bearer token);
// stub the firebase module out so no real initialization runs. The mock object
// is mutable so individual tests can install a fake signed-in user.
const { mockAuth } = vi.hoisted(() => ({ mockAuth: { currentUser: null as any } }));
vi.mock('../lib/firebase', () => ({ auth: mockAuth }));

import { getGeminiResponse, streamGeminiResponse } from './geminiService';

const encoder = new TextEncoder();

// Builds a fetch-like response whose body streams the given strings one
// read() at a time, mimicking the server's SSE chunking.
function sseResponse(chunks: string[], ok = true) {
  let i = 0;
  return {
    ok,
    body: {
      getReader: () => ({
        read: async () =>
          i < chunks.length
            ? { done: false, value: encoder.encode(chunks[i++]) }
            : { done: true, value: undefined },
      }),
    },
  };
}

async function collect(gen: AsyncGenerator<string>): Promise<string[]> {
  const out: string[] = [];
  for await (const chunk of gen) out.push(chunk);
  return out;
}

describe('streamGeminiResponse', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    localStorage.clear();
    mockAuth.currentUser = null;
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('yields each SSE chunk and stops at [DONE]', async () => {
    fetchMock.mockResolvedValue(sseResponse([
      'data: {"chunk":"Hello "}\n\n',
      'data: {"chunk":"world"}\n\ndata: [DONE]\n\n',
      'data: {"chunk":"after done, never emitted"}\n\n',
    ]));

    expect(await collect(streamGeminiResponse('hi'))).toEqual(['Hello ', 'world']);
  });

  it('reassembles an SSE event split across two network reads', async () => {
    fetchMock.mockResolvedValue(sseResponse([
      'data: {"chu',
      'nk":"stitched"}\n\ndata: [DONE]\n\n',
    ]));

    expect(await collect(streamGeminiResponse('hi'))).toEqual(['stitched']);
  });

  it('skips malformed JSON data lines without aborting the stream', async () => {
    fetchMock.mockResolvedValue(sseResponse([
      'data: {broken json}\n\ndata: {"chunk":"ok"}\n\ndata: [DONE]\n\n',
    ]));

    expect(await collect(streamGeminiResponse('hi'))).toEqual(['ok']);
  });

  it('yields the fetch error message when the server responds non-OK', async () => {
    fetchMock.mockResolvedValue(sseResponse([], false));
    expect(await collect(streamGeminiResponse('hi'))).toEqual(['Failed to fetch from server']);
  });

  it('yields the rejection message when fetch itself rejects', async () => {
    fetchMock.mockRejectedValue(new Error('network down'));
    expect(await collect(streamGeminiResponse('hi'))).toEqual(['network down']);
  });

  it('rejects an over-long message client-side without calling the server', async () => {
    const out = await collect(streamGeminiResponse('a'.repeat(3001)));
    expect(out).toEqual(['Message is too long (maximum 3000 characters).']);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('appends the scholar persona instruction to the outgoing message', async () => {
    localStorage.setItem('terapanth_persona', 'Scholar');
    fetchMock.mockResolvedValue(sseResponse(['data: [DONE]\n\n']));

    await collect(streamGeminiResponse('What is samayik?'));

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.message).toBe('What is samayik?\n\n(Explain using deep scriptural references)');
  });

  it('normalizes history to {role, text}: keeps last 20, maps assistant to model, drops unknown roles, caps text at 2000', async () => {
    fetchMock.mockResolvedValue(sseResponse(['data: [DONE]\n\n']));
    const history = [
      ...Array.from({ length: 25 }, (_, i) => ({ role: 'user', text: `entry ${i}` })),
      { role: 'assistant', text: 'a'.repeat(3000) },
      { role: 'system', text: 'should be dropped' },
      { role: 'model', parts: [{ text: 'from parts' }] },
    ];

    await collect(streamGeminiResponse('hi', history));

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    // The window is taken first (last 20), THEN unknown roles are filtered,
    // so the dropped 'system' entry shrinks the final payload to 19.
    expect(body.history).toHaveLength(19);
    expect(body.history.at(-1)).toEqual({ role: 'model', text: 'from parts' });
    const mapped = body.history.at(-2);
    expect(mapped.role).toBe('model');
    expect(mapped.text).toHaveLength(2000);
    expect(body.history.every((h: any) => h.role === 'user' || h.role === 'model')).toBe(true);
  });

  it('omits the Authorization header when signed out and includes it when signed in', async () => {
    fetchMock.mockResolvedValue(sseResponse(['data: [DONE]\n\n']));
    await collect(streamGeminiResponse('hi'));
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBeUndefined();

    mockAuth.currentUser = { getIdToken: vi.fn().mockResolvedValue('id-token-123') };
    fetchMock.mockResolvedValue(sseResponse(['data: [DONE]\n\n']));
    await collect(streamGeminiResponse('hi again'));
    expect(fetchMock.mock.calls[1][1].headers.Authorization).toBe('Bearer id-token-123');
  });
});

describe('getGeminiResponse', () => {
  beforeEach(() => {
    localStorage.clear();
    mockAuth.currentUser = null;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('accumulates all chunks into a single string', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(sseResponse([
      'data: {"chunk":"Jai "}\n\ndata: {"chunk":"Jinendra"}\n\ndata: [DONE]\n\n',
    ])));

    expect(await getGeminiResponse('greet me')).toBe('Jai Jinendra');
  });

  it('returns the error message on network failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    expect(await getGeminiResponse('hi')).toBe('offline');
  });

  it('rejects an over-long message client-side without calling the server', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    expect(await getGeminiResponse('a'.repeat(3001))).toBe('Message is too long (maximum 3000 characters).');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

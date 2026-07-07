import { POST } from '@/app/api/chat/route';
import { askAI } from '@/lib/askAI';
import { supabase } from '@/lib/supabase';

jest.mock('@/lib/askAI');
jest.mock('@/lib/supabase', () => ({
  supabase: { from: jest.fn() },
  isSupabaseConfigured: true,
}));

function mockRequest(body, { cookieValue } = {}) {
  return {
    json: async () => body,
    cookies: {
      get: (name) =>
        name === 'sb_session_id' && cookieValue ? { value: cookieValue } : undefined,
    },
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  require('@/lib/supabase').isSupabaseConfigured = true;
  supabase.from.mockReturnValue({ insert: jest.fn().mockResolvedValue({ error: null }) });
});

describe('POST /api/chat', () => {
  it('returns 400 when message is missing', async () => {
    const res = await POST(mockRequest({}));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toMatch(/message is required/i);
  });

  it('returns the AI response and the full list of 15 available services on success', async () => {
    askAI.mockResolvedValue('Here is how to apply for a PAN card.');

    const res = await POST(mockRequest({ message: 'How do I get a PAN card?', lang: 'en' }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.response).toBe('Here is how to apply for a PAN card.');
    expect(json.usedFallback).toBe(false);
    expect(json.availableServices).toHaveLength(15);
  });

  it('falls back to the structured service text when the AI is unavailable and a service matches', async () => {
    askAI.mockResolvedValue(null);

    const res = await POST(mockRequest({ message: 'How do I apply for aadhaar?', lang: 'en' }));
    const json = await res.json();

    expect(json.usedFallback).toBe(true);
    expect(json.response).toMatch(/Aadhaar Card/);
    expect(json.translationUnavailable).toBe(false);
  });

  it('flags translationUnavailable when falling back for a non-English language', async () => {
    askAI.mockResolvedValue(null);

    const res = await POST(mockRequest({ message: 'aadhaar kaise banaye', lang: 'hi' }));
    const json = await res.json();

    expect(json.usedFallback).toBe(true);
    expect(json.translationUnavailable).toBe(true);
  });

  it('falls back to a generic message when the AI is unavailable and no service matches', async () => {
    askAI.mockResolvedValue(null);

    const res = await POST(mockRequest({ message: 'what is the weather today', lang: 'en' }));
    const json = await res.json();

    expect(json.usedFallback).toBe(true);
    expect(json.response).toMatch(/Aadhaar, PAN, Voter ID/);
  });

  it('returns the generic Hindi fallback message when lang=hi and no service matches', async () => {
    askAI.mockResolvedValue(null);

    const res = await POST(mockRequest({ message: 'random unrelated question', lang: 'hi' }));
    const json = await res.json();

    expect(json.response).toMatch(/आधार, पैन/);
  });

  it('sets a new sb_session_id cookie when no session cookie exists', async () => {
    askAI.mockResolvedValue('some answer');

    const res = await POST(mockRequest({ message: 'aadhaar', lang: 'en' }));
    const cookie = res.cookies.get('sb_session_id');

    expect(cookie).toBeDefined();
    expect(cookie.value).toEqual(expect.any(String));
  });

  it('does not overwrite an existing session cookie', async () => {
    askAI.mockResolvedValue('some answer');

    const res = await POST(mockRequest({ message: 'aadhaar', lang: 'en' }, { cookieValue: 'existing-session-id' }));
    const cookie = res.cookies.get('sb_session_id');

    expect(cookie).toBeUndefined();
  });

  it('reports savedToDb=true when the chat is persisted successfully', async () => {
    askAI.mockResolvedValue('some answer');

    const res = await POST(mockRequest({ message: 'aadhaar', lang: 'en' }));
    const json = await res.json();

    expect(json.savedToDb).toBe(true);
  });

  it('reports savedToDb=false when persistence fails, without failing the request', async () => {
    askAI.mockResolvedValue('some answer');
    supabase.from.mockReturnValue({ insert: jest.fn().mockResolvedValue({ error: { message: 'db down' } }) });

    const res = await POST(mockRequest({ message: 'aadhaar', lang: 'en' }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.savedToDb).toBe(false);
  });

  it('returns a 200 with a generic fallback response on an unexpected error, instead of crashing', async () => {
    const badRequest = { json: async () => { throw new Error('bad body'); }, cookies: { get: () => undefined } };

    const res = await POST(badRequest);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.usedFallback).toBe(true);
    expect(json.response).toMatch(/Aadhaar, PAN, Voter ID/);
  });
});
import { askAI } from '@/lib/askAI';

const ORIGINAL_ENV = process.env;

beforeEach(() => {
  jest.resetModules();
  process.env = { ...ORIGINAL_ENV };
  global.fetch = jest.fn();
});

afterEach(() => {
  process.env = ORIGINAL_ENV;
  jest.restoreAllMocks();
});

describe('askAI', () => {
  it('resolves to null immediately when GROQ_API_KEY is not set, without calling fetch', async () => {
    delete process.env.GROQ_API_KEY;

    const result = await askAI('What documents do I need for a PAN card?', 'context');

    expect(result).toBeNull();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('returns the trimmed model text on a successful response', async () => {
    process.env.GROQ_API_KEY = 'test-key';
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: '  Here is your answer.  ' } }],
      }),
    });

    const result = await askAI('Tell me about Aadhaar', 'context');

    expect(result).toBe('Here is your answer.');
  });

  it('sends the prompt and context to the Groq endpoint with the correct shape', async () => {
    process.env.GROQ_API_KEY = 'test-key';
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'ok' } }] }),
    });

    await askAI('my prompt', 'my context');

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.groq.com/openai/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-key',
        }),
      })
    );

    const [, options] = global.fetch.mock.calls[0];
    const body = JSON.parse(options.body);
    expect(body.messages).toEqual([
      { role: 'system', content: 'my context' },
      { role: 'user', content: 'my prompt' },
    ]);
  });

  it('returns null when the API responds with a non-2xx status', async () => {
    process.env.GROQ_API_KEY = 'test-key';
    global.fetch.mockResolvedValue({ ok: false, status: 429, statusText: 'Too Many Requests' });

    const result = await askAI('prompt', 'context');

    expect(result).toBeNull();
  });

  it('returns null when the network call throws', async () => {
    process.env.GROQ_API_KEY = 'test-key';
    global.fetch.mockRejectedValue(new Error('network down'));

    const result = await askAI('prompt', 'context');

    expect(result).toBeNull();
  });

  it('returns null when the response has no usable message content', async () => {
    process.env.GROQ_API_KEY = 'test-key';
    global.fetch.mockResolvedValue({ ok: true, json: async () => ({ choices: [] }) });

    const result = await askAI('prompt', 'context');

    expect(result).toBeNull();
  });

  it('returns null when the response content is an empty/whitespace string', async () => {
    process.env.GROQ_API_KEY = 'test-key';
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: '   ' } }] }),
    });

    const result = await askAI('prompt', 'context');

    expect(result).toBeNull();
  });
});
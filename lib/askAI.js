// Reusable helper for calling Groq's OpenAI-compatible chat completions API.
//
// IMPORTANT: this function never throws. On any failure (missing key,
// network error, timeout, non-2xx response, malformed payload) it resolves
// to `null` so every caller can fall back to a hardcoded response instead of
// crashing or showing an error screen during a live demo.

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Use a current production model. Groq periodically deprecates models, so
// re-check https://console.groq.com/docs/models if this ever starts failing.
const GROQ_MODEL = 'llama-3.3-70b-versatile';

const REQUEST_TIMEOUT_MS = 8000;

/**
 * @param {string} prompt - The user-facing question/instruction.
 * @param {string} context - System-level context/instructions (grounding data, language, etc).
 * @returns {Promise<string|null>} the model's plain text response, or null on any failure.
 */
export async function askAI(prompt, context = '') {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    // Runtime safety check: no key configured -> fallback-only mode.
    return null;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: context || 'You are a helpful assistant.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.4,
        max_tokens: 600,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      // Covers 503 "model overloaded", rate limits, auth errors, etc.
      console.error(`Groq API returned ${response.status}: ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content;
    return typeof text === 'string' && text.trim().length > 0 ? text.trim() : null;
  } catch (err) {
    console.error('Groq API call failed:', err?.message || err);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

export default askAI;

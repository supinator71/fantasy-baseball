import Anthropic from '@anthropic-ai/sdk';

// Real Anthropic model IDs (as of 2025/2026)
const MODEL_REGISTRY = [
  'claude-opus-4-5',
  'claude-sonnet-4-5',
  'claude-3-5-sonnet-20241022',
  'claude-3-5-haiku-20241022',
];

let client = null;
let cachedActiveModel = null;

function getClient() {
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}

export async function getWorkingModel() {
  if (cachedActiveModel) return cachedActiveModel;
  for (const model of MODEL_REGISTRY) {
    try {
      await getClient().messages.create({
        model,
        max_tokens: 1,
        messages: [{ role: 'user', content: 'ping' }]
      });
      cachedActiveModel = model;
      console.log(`[Claude] Active model: ${model}`);
      return model;
    } catch (err) {
      console.warn(`[Claude] Model ${model} unavailable: ${err.message}`);
    }
  }
  // Last resort — use the most reliable known model without probing
  const fallback = 'claude-3-5-sonnet-20241022';
  cachedActiveModel = fallback;
  console.warn(`[Claude] All models failed probe — falling back to ${fallback}`);
  return fallback;
}

const SYSTEM_PROMPT = `You are Goin' Yard HQ — a friendly, encouraging fantasy baseball AI for the 2026 MLB season. Help beginners dominate their Yahoo leagues.`;

export async function callClaude(messages, maxTokens = 1800) {
  const model = await getWorkingModel();
  const response = await getClient().messages.create({
    model,
    max_tokens: maxTokens,
    system: SYSTEM_PROMPT,
    messages,
  });
  return response.content[0].text;
}

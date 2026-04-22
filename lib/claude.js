import Anthropic from '@anthropic-ai/sdk';

// Real Anthropic model IDs — ordered cheapest-viable first for production economics.
// Opus is last: at ~$15/$75 per MTok it would cost ~$90-100/season per 2-team user,
// making any sub-$99 price point unprofitable. Sonnet at $3/$15 keeps COGS ~$18/user/season.
const MODEL_REGISTRY = [
  'claude-3-5-sonnet-20241022',  // ← primary: known pricing, safe production default
  'claude-sonnet-4-5',           // ← try newer sonnet if above fails
  'claude-3-5-haiku-20241022',   // ← fallback: faster/cheaper, lower quality
  'claude-opus-4-5',             // ← last resort only: 5-10x more expensive
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

import Anthropic from '@anthropic-ai/sdk';

// Real Anthropic model IDs — ordered by preference for production.
// claude-3-5-haiku-20241022 hit EOL Feb 19 2026 — DO NOT USE (returns 404).
// Opus is last: ~5-10x more expensive than sonnet, unprofitable as default.
const MODEL_REGISTRY = [
  'claude-haiku-4-5',            // ← primary: fast/cheap fallback, keeps costs minimal
  'claude-sonnet-4-5',           // ← fallback for higher quality if haiku unavailable
  'claude-3-5-sonnet-20241022',  // ← versioned fallback if above unavailable
  'claude-opus-4-5',             // ← last resort only: 5-10x more expensive
];

// Fast model for Haiku-tier calls (Q&A, narration, card lore, pre-scored modules).
// IMPORTANT: claude-3-5-haiku-20241022 is EOL as of Feb 19 2026 — use claude-haiku-4-5.
const HAIKU_MODEL = 'claude-haiku-4-5';

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
  // Last resort — first entry in registry without probing
  const fallback = MODEL_REGISTRY[0];
  cachedActiveModel = fallback;
  console.warn(`[Claude] All models failed probe — falling back to ${fallback}`);
  return fallback;
}

const SYSTEM_PROMPT = `You are Goin' Yard HQ — a friendly, encouraging fantasy baseball AI for the 2026 MLB season. Help beginners dominate their Yahoo leagues.`;

export async function callClaude(messages, maxTokens = 1800, systemPrompt = SYSTEM_PROMPT) {
  const model = await getWorkingModel();
  const response = await getClient().messages.create({
    model,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages,
  });
  return response.content[0].text;
}

/**
 * callClaudeFast — uses claude-haiku-4-5 (current Haiku generation).
 * Use for: short Q&A, card lore, pre-scored module summaries, gameplan steps.
 * ~3-6x faster, ~80% cheaper than Sonnet. Avoid for complex JSON schemas.
 *
 * NOTE: claude-3-5-haiku-20241022 is EOL (Feb 19 2026) — do not revert to it.
 */
export async function callClaudeFast(messages, maxTokens = 800, systemPrompt = SYSTEM_PROMPT) {
  try {
    const response = await getClient().messages.create({
      model: HAIKU_MODEL,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages,
    });
    const text = response.content[0].text;
    console.log(`[Claude/Haiku] ${maxTokens}tok | first200: ${text?.slice(0, 200)}`);
    return text;
  } catch (err) {
    console.warn(`[Claude] Haiku (${HAIKU_MODEL}) failed, falling back to Sonnet: ${err.message}`);
    return callClaude(messages, maxTokens, systemPrompt);
  }
}

/**
 * callClaudeJSON — no system prompt, strict JSON output.
 * Use for: audit, analyze, trade verdict, matchup predict — any route that
 * needs a structured JSON response. The friendly system prompt actively hurts
 * JSON compliance on Haiku; omitting it improves parse success rate.
 */
export async function callClaudeJSON(messages, maxTokens = 1400) {
  const model = await getWorkingModel();
  try {
    const response = await getClient().messages.create({
      model,
      max_tokens: maxTokens,
      messages,  // NO system prompt — pure instruction following
    });
    const text = response.content[0].text;
    console.log(`[Claude/JSON] ${model} ${maxTokens}tok | first200: ${text?.slice(0, 200)}`);
    return text;
  } catch (err) {
    console.error(`[Claude/JSON] Failed: ${err.message}`);
    throw err;
  }
}


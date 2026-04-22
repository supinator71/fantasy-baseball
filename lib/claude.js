import Anthropic from '@anthropic-ai/sdk';

const MODEL_REGISTRY = [
  'claude-sonnet-4-6',
  'claude-haiku-4-5-20251001'
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
      return model;
    } catch (err) {
      console.warn(`[Claude] Model ${model} failed: ${err.message}`);
    }
  }
  return MODEL_REGISTRY[0];
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

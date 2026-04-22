const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const MODELS_TO_TRY = [
  'claude-haiku-4-5',
  'claude-4-5-haiku',
  'claude-3-5-haiku',
  'claude-3-5-sonnet-latest',
  'claude-3-haiku-20240307'
];

async function test() {
  for (const model of MODELS_TO_TRY) {
    console.log(`Trying ${model}...`);
    try {
      const msg = await client.messages.create({
        model,
        max_tokens: 10,
        messages: [{ role: 'user', content: 'hi' }]
      });
      console.log(`✅ SUCCESS: ${model}`);
      process.exit(0);
    } catch (err) {
      console.log(`❌ FAILED: ${model} - ${err.message}`);
    }
  }
}

test();

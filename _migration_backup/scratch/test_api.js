const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

async function test() {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  try {
    const msg = await client.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'Say ok' }],
    });
    console.log('API OK:', msg.content[0].text);
  } catch (err) {
    console.error('API ERROR:', err.message);
    console.error('Type:', err.type);
    console.error('Status:', err.status);
  }
}

test();

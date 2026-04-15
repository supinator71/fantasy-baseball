require('dotenv').config();
const { Anthropic } = require('@anthropic-ai/sdk');
const fs = require('fs');
const _ = require('./server/routes/claude.js'); 
// wait, claude.js exports an Express router, I can't just require it to get callClaude.
// I will just copy the callClaude source into this file to test it!

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const SYSTEM_PROMPT = "You are a sports analyst.";

async function callClaude(messages, maxTokens = 1800) {
  try {
    const timeoutMs = 45000; // 45 seconds
    const lastContent = messages[messages.length - 1]?.content || '';
    const isJsonRequested = lastContent.includes('Return ONLY valid JSON');
    
    // Automatic Anthropic Message Prefill hack to FORCE valid JSON without conversational wrapping.
    const finalMessages = isJsonRequested 
      ? [...messages, { role: 'assistant', content: '{' }] 
      : messages;

    const apiCall = anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: maxTokens,
      system: SYSTEM_PROMPT,
      messages: finalMessages,
    });
    
    const msg = await apiCall;
    const responseText = isJsonRequested ? ('{' + msg.content[0].text) : msg.content[0].text;
    return responseText;
  } catch (err) {
    console.error('API call failed:', err.message);
    throw err;
  }
}

function tryParseJSON(text) {
  if (!text) return null;
  let cleaned = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
  try { return JSON.parse(cleaned); } catch {}
  let match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) { match = text.match(/\{[\s\S]*\}/); if (!match) return null; }
  let jsonStr = match[0];
  try { return JSON.parse(jsonStr); } catch (e) { console.error('Standard JSON parse failed:', e.message); }
  console.log('Applying aggressive JSON hallucination sanitizer...');
  try {
    const sanitizedStr = jsonStr.replace(/"([^"\\]*(?:\\.[^"\\]*)*)"/gs, function(m, p1) {
      return '"' + p1.replace(/\n/g, '\\n').replace(/\r/g, '').replace(/\t/g, '\\t') + '"';
    });
    return JSON.parse(sanitizedStr);
  } catch (err2) {
    console.error('Aggressive JSON sanitizer failed:', err2.message);
  }
  return null;
}

async function test() {
  const prompt = `Return ONLY valid JSON:
{
  "grade": "Use the rubric to assign a grade. Example: A-",
  "fullAnalysis": "Write an in-depth 200 word summary of this baseball team. Write highly detailed, compelling prose. Remember to include exciting metrics. Example: He hits \"nukes\"."
}`;
  
  const text = await callClaude([{ role: 'user', content: prompt }]);
  console.log("=== RAW CLAUDE OUTPUT ===");
  console.log(text);
  console.log("=========================");
  const parsed = tryParseJSON(text);
  console.log("Parsed JSON:", parsed);
}

test();

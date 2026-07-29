import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

// Do NOT throw at module load. This module is imported transitively by the AI agent
// graph that is wired into api/index.js (via AiResolver). Throwing here on a missing
// GEMINI_API_KEY would crash server boot for every request, not just AI ones. A
// missing/invalid key now surfaces a clear error at invoke time instead.
const apiKey = process.env.GEMINI_API_KEY || '';

export const routerModel = new ChatGoogleGenerativeAI({
  apiKey,
  model: 'gemini-2.5-flash',
  temperature: 0.1,
  maxOutputTokens: Number.parseInt(process.env.GEMINI_ROUTER_MAX_OUTPUT_TOKENS || '512', 10),
  maxRetries: 3,
});

export const analystModel = new ChatGoogleGenerativeAI({
  apiKey,
  model: 'gemini-2.5-flash',
  temperature: 0.4,
  maxOutputTokens: Number.parseInt(process.env.GEMINI_ANALYST_MAX_OUTPUT_TOKENS || '768', 10),
  maxRetries: 3,
});

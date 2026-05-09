import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

const key = () => {
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY missing');
  return process.env.GEMINI_API_KEY;
};

/** Fast cheap model for routing/intake/audit */
export const routerModel = new ChatGoogleGenerativeAI({
  apiKey: key(),
  model: 'gemini-2.5-flash',
  temperature: 0.1,
  maxOutputTokens: 1024,
  maxRetries: 3,
});

/** High-quality model for CV generation, matching explanation, JD rewrite */
export const analystModel = new ChatGoogleGenerativeAI({
  apiKey: key(),
  model: 'gemini-2.5-flash',
  temperature: 0.4,
  maxOutputTokens: 4096,
  maxRetries: 3,
});

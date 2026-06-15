import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

const key = () => {
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY missing');
  return process.env.GEMINI_API_KEY;
};

export const routerModel = new ChatGoogleGenerativeAI({
  apiKey: key(),
  model: 'gemini-2.5-flash',
  temperature: 0.1,
  maxOutputTokens: Number.parseInt(process.env.GEMINI_ROUTER_MAX_OUTPUT_TOKENS || '512', 10),
  maxRetries: 3,
});

export const analystModel = new ChatGoogleGenerativeAI({
  apiKey: key(),
  model: 'gemini-2.5-flash',
  temperature: 0.4,
  maxOutputTokens: Number.parseInt(process.env.GEMINI_ANALYST_MAX_OUTPUT_TOKENS || '768', 10),
  maxRetries: 3,
});

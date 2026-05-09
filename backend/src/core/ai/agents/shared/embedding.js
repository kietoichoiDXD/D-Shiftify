import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { JobRepository } from '../../../modules/ai/repositories/job.repository.js';

const embedder = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GEMINI_API_KEY,
  model: 'text-embedding-004', // 768 dims
});

/** Embed a single text → float[] */
export const embedText = async (text) => {
  const vec = await embedder.embedQuery(text);
  return vec; // number[]
};

/** pgvector cosine similarity search — delegates to JobRepository (no connection leak) */
export const vectorSearchJobs = async (queryVec, _domains = [], topK = 10) => {
  return JobRepository.vectorSearch(queryVec, topK);
};

import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { JobRepository } from '../../../modules/ai/repositories/job.repository.js';

const embedder = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GEMINI_API_KEY,
  model: 'text-embedding-004',
});

export const embedText = async (text) => embedder.embedQuery(text);

export const vectorSearchJobs = async (queryVec, _domains = [], topK = 10) =>
  JobRepository.vectorSearch(queryVec, topK);

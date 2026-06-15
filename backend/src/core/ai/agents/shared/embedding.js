import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { JobRepository } from '../../../modules/ai/repositories/job.repository.js';

class CustomGoogleGenerativeAIEmbeddings extends GoogleGenerativeAIEmbeddings {
  constructor(fields) {
    super(fields);
    this.dimensions = fields?.dimensions ?? 768;
  }

  _convertToContent(text) {
    const base = super._convertToContent(text);
    return {
      ...base,
      outputDimensionality: this.dimensions,
    };
  }
}

const embedder = new CustomGoogleGenerativeAIEmbeddings({
  apiKey: process.env.GEMINI_API_KEY,
  model: 'gemini-embedding-001',
  dimensions: 768,
});

export const embedText = async (text) => embedder.embedQuery(text);

export const vectorSearchJobs = async (queryVec, _domains = [], topK = 10) =>
  JobRepository.vectorSearch(queryVec, topK);

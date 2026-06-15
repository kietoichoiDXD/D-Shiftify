import 'dotenv/config';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';

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

async function run() {
  try {
    const embedder = new CustomGoogleGenerativeAIEmbeddings({
      apiKey: process.env.GEMINI_API_KEY,
      model: 'gemini-embedding-001',
      dimensions: 768,
    });
    const result = await embedder.embedQuery("Shiftify Platform");
    console.log("Custom LangChain Embedding Success! Vector length:", result.length);
  } catch (error) {
    console.error("Error with Custom LangChain GoogleGenerativeAIEmbeddings:", error);
  }
}
run();

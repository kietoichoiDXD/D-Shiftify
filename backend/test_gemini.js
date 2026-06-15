import 'dotenv/config';
import { analystModel } from './src/core/ai/agents/shared/llm.js';
import { embedText } from './src/core/ai/agents/shared/embedding.js';

async function run() {
  try {
    console.log("Testing Gemini Text Generation (analystModel)...");
    const response = await analystModel.invoke("Hãy tóm tắt ngắn gọn mục tiêu của nền tảng Shiftify hỗ trợ người khuyết tật tìm việc.");
    console.log("Gemini Response:", response.content);

    console.log("\nTesting Gemini Text Embedding (embedText)...");
    const embedding = await embedText("Shiftify - Job Platform");
    console.log("Embedding Success! Vector length:", embedding.length);
  } catch (error) {
    console.error("Error connecting to Gemini API:", error);
  }
}
run();

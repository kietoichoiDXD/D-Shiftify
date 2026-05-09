import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import dotenv from "dotenv";

dotenv.config();

async function testConnection() {
  const model = new ChatGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
    model: "gemini-pro",
  });

  try {
    const res = await model.invoke("Say hello");
    console.log("Connection Success:", res.content);
  } catch (error) {
    console.error("Connection Failed:", error.message);
    console.error("Error Status:", error.status);
  }
}

testConnection();

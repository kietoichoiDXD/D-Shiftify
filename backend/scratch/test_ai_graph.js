import { aiGraph } from "../src/core/ai/orchestrator/graph.js";
import { HumanMessage } from "@langchain/core/messages";
import dotenv from "dotenv";

dotenv.config();

async function runTest() {
  console.log("--- Starting D-Shiftify AI Graph Test ---");
  
  const initialState = {
    messages: [new HumanMessage("Tôi là Nam, có 3 năm kinh nghiệm viết báo cho người khiếm thị. Kỹ năng: viết lách, giao tiếp, sử dụng máy tính với trình đọc màn hình. Tôi muốn tìm việc Content Creator tại Hà Nội.")],
    profile: {
      name: "",
      skills: [],
      experience: [],
      preferences: {},
    },
    nextStep: "intake",
  };

  try {
    console.log("Invoking AI Graph...");
    const result = await aiGraph.invoke(initialState);
    
    console.log("\n--- Final State ---");
    console.log("Profile:", JSON.stringify(result.profile, null, 2));
    console.log("CV Data:", result.cvData ? "Generated" : "Not generated");
    console.log("Matches:", result.matches.length);
    console.log("Next Step:", result.nextStep);
    
    if (result.messages.length > 0) {
      console.log("\nLast Assistant Message:", result.messages[result.messages.length - 1].content);
    }
  } catch (error) {
    console.error("\nTest Failed:", error.message);
    if (error.message.includes("API_KEY")) {
      console.warn("TIP: Make sure to add your GEMINI_API_KEY to the .env file.");
    }
  }
}

runTest();

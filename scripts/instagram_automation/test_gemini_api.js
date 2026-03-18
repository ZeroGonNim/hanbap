import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const API_KEY = process.env.GEMINI_API_KEY;

// Gemini 1.5 Flash (Nano Banana 2의 기반이 되는 모델) 테스트
async function testGeminiImage() {
    console.log("🚀 Testing Gemini API (Nano Banana 2)...");
    if (!API_KEY) {
        console.error("❌ GEMINI_API_KEY is missing in .env");
        return;
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    
    // Note: Imagen 3 (Nano Banana 2) might require a specific model string
    // Let's try to see if we can get a response from a text model first to verify the key
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hello, can you generate an image description for a delicious Korean spicy pork (Jeyuk Bokkeum)?");
        const response = await result.response;
        console.log("✅ Gemini Text API is working!");
        console.log("Description:", response.text());
        
        console.log("\nNext: Checking if Imagen model is available...");
        // This is a placeholder for Imagen 3 integration
        // Current Google Generative AI Node SDK might have limited Imagen support compared to the REST API
    } catch (err) {
        console.error("❌ Gemini API Error:", err.message);
    }
}

testGeminiImage();

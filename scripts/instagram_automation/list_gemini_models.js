import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from "@google/generative-ai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const API_KEY = process.env.GEMINI_API_KEY;

async function listModels() {
    console.log("🚀 Listing available Gemini models...");
    if (!API_KEY) {
        console.error("❌ GEMINI_API_KEY is missing in .env");
        return;
    }

    // Use a slightly different approach or just fetch
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
        const data = await response.json();
        
        if (data.models) {
            console.log("✅ Available Models:");
            data.models.forEach(m => console.log(`- ${m.name} (Supports: ${m.supportedGenerationMethods.join(', ')})`));
        } else {
            console.log("❌ No models found or error:", JSON.stringify(data, null, 2));
        }
    } catch (err) {
        console.error("❌ Fetch Error:", err.message);
    }
}

listModels();

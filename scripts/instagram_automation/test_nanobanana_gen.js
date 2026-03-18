import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = "gemini-2.5-flash-image";

async function generateImage() {
    console.log(`🚀 Generating image with ${MODEL_NAME}...`);
    if (!API_KEY) {
        console.error("❌ GEMINI_API_KEY is missing in .env");
        return;
    }

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;
        const body = {
            contents: [{
                parts: [{ text: "Spicy Korean pork stir-fry (Jeyuk Bokkeum) with fresh vegetables on a white plate, professional food photography, high resolution, delicious look" }]
            }]
        };

        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await res.json();
        
        if (data.candidates && data.candidates[0].content.parts) {
            const parts = data.candidates[0].content.parts;
            // 이미지 생성을 지원하는 모델은 리스폰스에 inlineData (base64)가 포함될 수 있음
            console.log("✅ Success! Response received.");
            
            const imagePart = parts.find(p => p.inlineData);
            if (imagePart) {
                const base64Data = imagePart.inlineData.data;
                const buffer = Buffer.from(base64Data, 'base64');
                const outputPath = path.resolve(__dirname, 'generated_food.png');
                fs.writeFileSync(outputPath, buffer);
                console.log(`📸 Image saved to: ${outputPath}`);
            } else {
                console.log("⚠️ No image data in response. Content:", JSON.stringify(data, null, 2));
            }
        } else {
            console.error("❌ Generation failed:", JSON.stringify(data, null, 2));
        }
    } catch (err) {
        console.error("❌ Error:", err.message);
    }
}

generateImage();

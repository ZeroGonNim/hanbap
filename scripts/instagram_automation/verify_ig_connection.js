import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// .env 파일 로드
dotenv.config({ path: path.resolve(__dirname, '.env') });

const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const IG_USER_ID = process.env.IG_USER_ID;

async function verifyConnection() {
    console.log("--- Instagram API Connection Test (Node.js) ---");
    console.log(`IG_USER_ID: ${IG_USER_ID}`);

    if (!ACCESS_TOKEN || !IG_USER_ID) {
        console.error("❌ ACCESS_TOKEN or IG_USER_ID is missing in .env");
        return;
    }

    try {
        // 1. 토큰 유효성 및 기본 정보 확인
        console.log("Verifying token...");
        const meUrl = `https://graph.facebook.com/v19.0/me?fields=id,name&access_token=${ACCESS_TOKEN}`;
        const meResponse = await fetch(meUrl);
        const meData = await meResponse.json();

        if (!meResponse.ok) throw new Error(JSON.stringify(meData));

        console.log(`✅ Token is valid. Connected as: ${meData.name} (ID: ${meData.id})`);

        // 2. Instagram Business Account 정보 확인
        console.log("Fetching Instagram account info...");
        const igUrl = `https://graph.facebook.com/v19.0/${IG_USER_ID}?fields=username,name,biography&access_token=${ACCESS_TOKEN}`;
        const igResponse = await fetch(igUrl);
        const igData = await igResponse.json();

        if (!igResponse.ok) throw new Error(JSON.stringify(igData));

        console.log(`✅ Instagram Account found: @${igData.username} (${igData.name})`);
        console.log(`   Bio: ${igData.biography || 'No bio'}`);

    } catch (error) {
        console.error("❌ API Test Failed:");
        console.error(`   Message: ${error.message}`);
    }
}

verifyConnection();

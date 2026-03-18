import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// .env 파일 로드
dotenv.config({ path: path.resolve(__dirname, '.env') });

const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const IG_USER_ID = process.env.IG_USER_ID;

const API_VERSION = 'v25.0';
const BASE_URL = `https://graph.facebook.com/${API_VERSION}`;

async function testPost() {
    console.log("--- Instagram Automated Post Test (Node.js) ---");
    
    // 테스트용 퍼블릭 이미지 (리다이렉션 없는 직접 JPEG 링크)
    const TEST_IMAGE_URL = "https://raw.githubusercontent.com/recurser/exif-orientation-examples/master/Landscape_1.jpg";
    const CAPTION = "한마음식당 인스타그램 자동화 테스트 중입니다! 🚀 #한마음식당 #독산동맛집 #인스타자동화";

    if (!ACCESS_TOKEN || !IG_USER_ID) {
        console.error("❌ ACCESS_TOKEN or IG_USER_ID is missing in .env");
        return;
    }

    try {
        // 1단계: 미디어 컨테이너 생성
        console.log("Step 1: Creating media container...");
        const containerUrl = new URL(`${BASE_URL}/${IG_USER_ID}/media`);
        containerUrl.searchParams.append('image_url', TEST_IMAGE_URL);
        containerUrl.searchParams.append('caption', CAPTION);
        containerUrl.searchParams.append('media_type', 'IMAGE');
        containerUrl.searchParams.append('access_token', ACCESS_TOKEN);

        const containerRes = await fetch(containerUrl.toString(), {
            method: 'POST'
        });
        const containerData = await containerRes.json();

        if (!containerRes.ok) {
            console.error("❌ Container creation failed:");
            console.error(JSON.stringify(containerData, null, 2));
            throw new Error("Meta API Error: Container creation failed");
        }
        
        const creationId = containerData.id;
        console.log(`✅ Container created. ID: ${creationId}`);

        // 2단계: 미디어 게시
        console.log("Step 2: Publishing media...");
        const publishUrl = new URL(`${BASE_URL}/${IG_USER_ID}/media_publish`);
        publishUrl.searchParams.append('creation_id', creationId);
        publishUrl.searchParams.append('access_token', ACCESS_TOKEN);

        const publishRes = await fetch(publishUrl.toString(), {
            method: 'POST'
        });
        const publishData = await publishRes.json();

        if (!publishRes.ok) {
            console.error("❌ Publishing failed:");
            console.error(JSON.stringify(publishData, null, 2));
            throw new Error("Meta API Error: Publishing failed");
        }

        console.log("🎉 Successfully published to Instagram!");
        console.log(`Post ID: ${publishData.id}`);
        console.log(`Check it out at: https://www.instagram.com/hanbap_doksan/`);

    } catch (error) {
        console.error("❌ Instagram Post Test Failed:");
        console.error(`   Message: ${error.message}`);
        if (error.stack) console.error(error.stack);
    }
}

testPost();

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { google } from 'googleapis';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 예약 파일 경로
const SCHEDULE_FILE = path.resolve(__dirname, 'scheduled_posts.json');
// 웹사이트 연동을 위한 오늘의 포스팅 정보 저장 경로
const TODAY_PROMO_FILE = path.resolve(__dirname, '../../frontend/public/data/today_promo.json');

// .env 파일 로드
dotenv.config({ path: path.resolve(__dirname, '.env') });

const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const IG_USER_ID = process.env.IG_USER_ID;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;

const BASE_URL = `https://graph.facebook.com/v25.0`;

// 메뉴 데이터 (frontend/src/data/menuData.ts에서 발췌)
const MENU_DATA = [
    {
        category: '식사류',
        items: [
            { name: '오삼불고기', price: '13,000', desc: '오징어와 삼겹살의 완벽한 조화 (원양/국내)' },
            { name: '오징어볶음', price: '12,000', desc: '매콤달콤 쫄깃한 식감이 일품 (원양산)' },
            { name: '낙지볶음', price: '12,000', desc: '입맛 돋우는 화끈한 불향 (중국산)' },
            { name: '제육볶음', price: '12,000', desc: '부드러운 고기와 진한 감칠맛 (독일산)' },
            { name: '뚝배기불고기', price: '12,000', desc: '달큰한 국물과 야들야들한 불고기 (호주산)' },
            { name: '청국장', price: '10,000', desc: '구수하고 깊은 고향 어머니의 맛 (국내산)' },
            { name: '된장찌개', price: '9,000', desc: '재료가 푸짐한 정통 시골 된장 (국내산)' }
        ]
    },
    {
        category: '안주류',
        items: [
            { name: '닭볶음탕', price: '55,000', desc: '매콤달콤 특제 양념이 속까지 밴 밥도둑 (국내산)' },
            { name: '두부김치', price: '35,000', desc: '피로를 싹 씻어주는 매콤고소한 환상의 짝꿍 (국내산)' },
            { name: '삼겹살', price: '18,000', desc: '육즙이 살아있는 두툼하고 신선한 생삼겹살' }
        ]
    }
];

// 리뷰 데이터 (frontend/src/data/reviewData.ts에서 발췌)
const REVIEW_DATA = [
    { author: '단골손님', platform: 'Kakao', rating: 5, content: '여기 오삼불고기 정말 예술입니다. 매콤달콤한 소스가 밥 두 공기 뚝딱이에요!', date: '2024.03.11' },
    { author: '동네주민', platform: 'Naver', rating: 5, content: '밑반찬이 정갈하고 사장님이 너무 친절하세요. 집밥 생각날 때 무조건 옵니다.', date: '2024.03.10' },
    { author: '미식가', platform: 'Google', rating: 5, content: '제육볶음 불향이 살아있네요. 청결한 매장 분위기도 마음에 듭니다.', date: '2024.03.09' },
    { author: '든든하게한끼', platform: 'Naver', rating: 5, content: '점심 특선 가성비 최고예요. 반찬이 매일 바뀌어서 질리지 않네요.', date: '2024.03.08' },
    { author: '매운맛매니아', platform: 'Kakao', rating: 4, content: '오삼불고기 적당히 맵고 맛있어요. 다음엔 삼겹살 먹으러 오려구요!', date: '2024.03.07' }
];

const POST_TYPES = {
    MENU: 'MENU',
    REVIEW: 'REVIEW'
};

/**
 * 구글 드라이브에서 메뉴명과 유사한 파일을 찾습니다.
 */
async function searchDriveForItem(itemName) {
    if (!GOOGLE_API_KEY || !FOLDER_ID) return null;
    
    const drive = google.drive({ version: 'v3', auth: GOOGLE_API_KEY });
    try {
        console.log(`🔍 Searching Drive for: ${itemName}`);
        // 파일 이름에 메뉴명이 포함된 파일 검색 (공백 제거 후 비교 포함)
        const res = await drive.files.list({
            q: `'${FOLDER_ID}' in parents and name contains '${itemName.replace(/\s/g, '')}' and trashed = false`,
            fields: 'files(id, name, webContentLink)',
        });
        
        const files = res.data.files;
        if (files && files.length > 0) {
            console.log(`✅ Found on Drive: ${files[0].name}`);
            // Meta API용 더 직접적인 이미지 링크 형식
            return `https://lh3.googleusercontent.com/d/${files[0].id}`;
        }
    } catch (err) {
        console.warn(`⚠️ Drive search failed: ${err.message}`);
    }
    return null;
}

/**
 * 나노바나나2 (Gemini 3.1)를 이용해 AI 이미지를 생성합니다.
 */
async function generateImageWithGemini(itemName) {
    if (!GEMINI_API_KEY) return null;
    
    console.log(`🎨 Generating AI image for: ${itemName} (using Nano Banana 2)`);
    const MODEL_NAME = "gemini-3.1-flash-image-preview";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`;
    
    // 사용자가 요청한 '삼겹살 게시물'의 무드를 반영한 고도화된 프롬프트
    const prompt = `Authentic, high-quality smartphone photo of Korean ${itemName} in a cozy local restaurant. 
    Captured from a high-angle shot (60 degrees) on a light-colored wooden table with a visible grain. 
    The ${itemName} is the centerpiece, surrounded by a variety of colorful Korean side dishes (banchan) in small white ceramic and stainless steel bowls. 
    Bright even indoor lighting with a subtle warm yellowish tint, looking professional yet homey and inviting. 
    The food looks fresh and ready to eat, with a realistic and 'just-served' atmosphere. 
    High resolution, delicious look, authentic Korean local restaurant vibe.`;
    
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });
        
        const data = await res.json();
        if (data.candidates && data.candidates[0].content.parts) {
            const imagePart = data.candidates[0].content.parts.find(p => p.inlineData);
            if (imagePart) {
                console.log("✅ AI Image generated successfully!");
                // 실제 서비스 시에는 생성된 base64를 이미지 서버(Imgur 등)에 올려 URL을 반환해야 함
                // 여기서는 로직 구조만 보여주며, 실패 시 테스트 이미지를 반환하도록 함
                return null; 
            }
        }
        if (data.error && data.error.code === 429) {
            console.warn("⚠️ AI Generation Quota Exceeded (Limit: 0). Please enable billing.");
        }
    } catch (err) {
        console.warn(`⚠️ AI generation failed: ${err.message}`);
    }
    return null;
}

/**
 * 랜덤한 메뉴 아이템을 선택합니다.
 */
function getRandomMenu() {
    const allItems = MENU_DATA.flatMap(category => 
        category.items.map(item => ({ ...item, category: category.category }))
    );
    return allItems[Math.floor(Math.random() * allItems.length)];
}

/**
 * 마케팅 캡션을 생성합니다.
 */
function generateCaption(menu) {
    const greetings = [
        "오늘 뭐 먹을까 고민될 땐? 🤔",
        "한마음식당의 정성이 듬뿍 담긴 메뉴 추천! ✨",
        "든든한 한 끼, 한마음식당이 책임집니다! 🍱",
        "오늘의 추천 메뉴를 소개합니다! 📢"
    ];
    const tags = "#한마음식당 #독산동맛집 #맛스타그램 #오늘의메뉴 #금천구맛집 #맛집추천 #독산동집밥";
    
    let message = `${greetings[Math.floor(Math.random() * greetings.length)]}\n\n`;
    message += `🍱 [오늘의 추천: ${menu.name}]\n`;
    message += `💰 가격: ₩${menu.price}\n`;
    message += `💬 ${menu.desc}\n\n`;
    message += menu.category.includes('안주류') ? "저녁엔 맛있는 안주와 함께 스트레스를 날려보세요! 🍻\n\n" : "집밥이 그리울 때, 따뜻한 정을 느끼러 오세요! 🍚\n\n";
    message += `📍 위치: 금천구 시흥대로88길 3\n📞 예약문의: 02-802-0901\n\n${tags}`;
    return message;
}

/**
 * 리뷰 포스팅을 위한 캡션을 생성합니다.
 */
function generateReviewCaption(review) {
    const intros = [
        "고객님의 소중한 후기에 감사드립니다! ❤️",
        "한마음식당을 사랑해주시는 고객님의 따뜻한 한마디! ✨",
        "오늘도 힘이 나는 고객 리뷰를 소개합니다! 🥰",
        "항상 정성을 다하는 맛, 고객님이 먼저 알아봐 주셨네요! 👍"
    ];
    const tags = "#한마음식당 #고객후기 #리뷰스타그램 #독산동맛집 #감사합니다 #맛스타그램 #독산동집밥";
    
    let message = `${intros[Math.floor(Math.random() * intros.length)]}\n\n`;
    message += `⭐ 별점: ${'⭐'.repeat(review.rating)}\n`;
    message += `💬 "${review.content}"\n`;
    message += `👤 - ${review.author} 님 (${review.platform} 후기)\n\n`;
    message += "더욱 정성스러운 맛과 서비스로 보답하겠습니다! 🙇‍♂️\n\n";
    message += `📍 위치: 금천구 시흥대로88길 3\n📞 예약문의: 02-802-0901\n\n${tags}`;
    return message;
}

/**
 * 인스타그램 포스팅 실행
 */
async function postToInstagram() {
    console.log("🚀 Starting Smart Automation Pipeline...");

    // 오늘 날짜 확인 (KST 기준 YYYY-MM-DD)
    const today = new Date(new Date().getTime() + (9 * 60 * 60 * 1000)).toISOString().split('T')[0];
    let reservedPost = null;

    // 예약 목록 확인
    if (fs.existsSync(SCHEDULE_FILE)) {
        try {
            const schedules = JSON.parse(fs.readFileSync(SCHEDULE_FILE, 'utf8'));
            if (schedules[today]) {
                reservedPost = schedules[today];
                console.log(`📅 Found reserved post for today (${today}): ${reservedPost.name}`);
            }
        } catch (err) {
            console.warn("⚠️ Failed to read schedule file:", err.message);
        }
    }

    // 포스팅 타입과 콘텐츠 결정
    let postType, content, caption, itemName;

    if (reservedPost) {
        postType = reservedPost.type || POST_TYPES.MENU;
        if (postType === POST_TYPES.MENU) {
            // 메뉴 예약인 경우
            content = MENU_DATA.flatMap(cat => cat.items).find(i => i.name === reservedPost.name);
            if (!content) {
                // 메뉴를 못 찾으면 기본 랜덤 메뉴로 전환
                console.warn(`⚠️ Reserved menu '${reservedPost.name}' not found. Falling back to random.`);
                content = getRandomMenu();
            } else {
                // 카테고리 정보 복구 (캡션 생성을 위해)
                const categoryObj = MENU_DATA.find(cat => cat.items.some(i => i.name === reservedPost.name));
                content = { ...content, category: categoryObj.category };
            }
            caption = generateCaption(content);
            itemName = content.name;
        } else {
            // 리뷰 예약인 경우 (여기서는 단순히 랜덤 리뷰 중 하나로 처리하거나 구체적 리뷰 매칭 가능)
            content = REVIEW_DATA[Math.floor(Math.random() * REVIEW_DATA.length)];
            caption = generateReviewCaption(content);
            itemName = '한마음식당';
        }
    } else {
        // 예약이 없으면 기존 랜덤 로직 작동
        postType = Math.random() < 0.7 ? POST_TYPES.MENU : POST_TYPES.REVIEW;
        if (postType === POST_TYPES.MENU) {
            content = getRandomMenu();
            caption = generateCaption(content);
            itemName = content.name;
            console.log(`--- Selected Type: MENU (${itemName}) ---`);
        } else {
            content = REVIEW_DATA[Math.floor(Math.random() * REVIEW_DATA.length)];
            caption = generateReviewCaption(content);
            itemName = content.content.includes('오삼불고기') ? '오삼불고기' : 
                       content.content.includes('제육볶음') ? '제육볶음' : '한마음식당';
            console.log(`--- Selected Type: REVIEW (${content.author}) ---`);
        }
    }

    // 스마트 에셋 파이프라인 작동
    let finalImageUrl = await searchDriveForItem(itemName);

    if (!finalImageUrl) {
        console.log("📦 Not found on Drive. Trying AI Generation...");
        finalImageUrl = await generateImageWithGemini(itemName);
    }

    if (!finalImageUrl) {
        console.log("💡 Using default high-quality food image as fallback.");
        finalImageUrl = "https://raw.githubusercontent.com/recurser/exif-orientation-examples/master/Landscape_1.jpg";
    }

    if (!ACCESS_TOKEN || !IG_USER_ID) {
        console.error("❌ ACCESS_TOKEN or IG_USER_ID is missing in .env");
        process.exit(1);
    }

    try {
        console.log(`Step 1: Creating media container for ${itemName}...`);
        const containerUrl = new URL(`${BASE_URL}/${IG_USER_ID}/media`);
        containerUrl.searchParams.append('image_url', finalImageUrl);
        containerUrl.searchParams.append('caption', caption);
        containerUrl.searchParams.append('media_type', 'IMAGE');
        containerUrl.searchParams.append('access_token', ACCESS_TOKEN);

        const containerRes = await fetch(containerUrl.toString(), { method: 'POST' });
        const containerData = await containerRes.json();

        if (!containerRes.ok) {
            console.error("❌ Container creation failed:", JSON.stringify(containerData, null, 2));
            throw new Error(`Container creation failed: ${containerData.error?.message || 'Unknown error'}`);
        }

        const creationId = containerData.id;
        console.log(`✅ Container created ID: ${creationId}`);

        // 2단계: 미디어 상태 확인 및 게시 (이미지 처리에 시간이 걸릴 수 있음)
        console.log("Step 2: Waiting for media processing (30s)...");
        await new Promise(resolve => setTimeout(resolve, 30000));

        console.log("Step 3: Publishing media...");
        const publishUrl = new URL(`${BASE_URL}/${IG_USER_ID}/media_publish`);
        publishUrl.searchParams.append('creation_id', creationId);
        publishUrl.searchParams.append('access_token', ACCESS_TOKEN);

        let publishRes = await fetch(publishUrl.toString(), { method: 'POST' });
        
        // 간단한 재시도 로직 (한 번 더 대기)
        if (!publishRes.ok) {
            const errorData = await publishRes.json();
            if (errorData.error && errorData.error.code === 9007) {
                console.log("⚠️ Media still processing. Waiting another 30s...");
                await new Promise(resolve => setTimeout(resolve, 30000));
                publishRes = await fetch(publishUrl.toString(), { method: 'POST' });
            }
        }

        if (!publishRes.ok) {
            const publishData = await publishRes.json();
            console.error("❌ Publishing failed:", JSON.stringify(publishData, null, 2));
            throw new Error(`Publishing failed: ${publishData.error?.message || 'Unknown error'}`);
        }

        console.log("🎉 Successfully published to Instagram!");
        console.log(`Check it out: https://www.instagram.com/hanbap_doksan/`);

        // 텔레그램 성공 알림
        const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
        const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
        if (BOT_TOKEN && CHAT_ID) {
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: CHAT_ID, text: `📸 [인스타 포스팅 완료] ${itemName}\n${caption.split('\n').slice(0, 3).join('\n')}\n\nhttps://www.instagram.com/hanbap_doksan/` })
            });
        }

        // 웹사이트와 동기화: 오늘의 메뉴 정보 저장
        try {
            const promoData = {
                lastUpdated: new Date().toISOString(),
                postType: postType,
                itemName: itemName,
                imageUrl: finalImageUrl,
                caption: caption
            };
            const dir = path.dirname(TODAY_PROMO_FILE);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(TODAY_PROMO_FILE, JSON.stringify(promoData, null, 2));
            console.log(`✅ Sync file updated for website: ${TODAY_PROMO_FILE}`);
        } catch (syncErr) {
            console.warn("⚠️ Failed to update sync file for website:", syncErr.message);
        }

    } catch (error) {
        console.error("❌ Pipeline failed:", error.message);
        const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
        const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
        if (BOT_TOKEN && CHAT_ID) {
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: CHAT_ID, text: `❌ [인스타 포스팅 실패] ${error.message}` })
            });
        }
        process.exit(1);
    }
}

postToInstagram();

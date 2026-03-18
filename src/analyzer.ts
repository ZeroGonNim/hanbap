import { GoogleGenerativeAI } from '@google/generative-ai';
import { type Review } from './types.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const SYSTEM_PROMPT = `
당신은 '한마음 식당'의 전문 마케터입니다.
다음은 네이버, 카카오맵, 구글, 블로그에서 수집된 실제 방문자 데이터입니다.
대표 메뉴는 [제육볶음, 오삼불고기] 입니다.

[분석 및 생성 지침]
1. 리뷰 내용을 분석하여 핵심 긍정 키워드를 추출하세요.
2. 카카오톡 알림톡용 친절한 응대 문구를 3가지 버전으로 작성하세요.
3. 인스타그램 등 SNS에 바로 게시 가능한 '피드 문구'와 '해시태그'를 별도로 제안해 주세요.
   - 키워드: #한마음식당 #오삼불고기맛집 #제육볶음맛집 #집밥감성 #동네단골집
4. 사장님이 강조하는 '신선함', '청결함', '정갈한 밑반찬'이 문구에 자연스럽게 녹아들게 하세요.
`;

const FALLBACK_COPY = `[버전 1 - 신선함 & 불향 강조]
정성 가득한 집밥의 따뜻함, 한마음 식당입니다! 매일 신선한 식재료로 정갈하게 준비하는 7첩 반찬과 불향 가득한 제육볶음으로 든든한 점심을 만나보세요. 깨끗한 매장에서 기분 좋게 모시겠습니다. 😊

[버전 2 - 가성비 & 단골 인증]
동네 주민들이 인정한 찐 맛집! 밥도둑 오삼불고기와 아낌없이 퍼드리는 인심으로 여러분의 든든한 한 끼를 책임집니다. 늘 청결하게 유지되는 한마음 식당에서 편안한 혼밥도 즐겨보세요!

[버전 3 - 저녁 모임 & 정겨움]
낮에는 제육볶음, 저녁에는 매콤달콤 오삼불고기로 하루의 피로를 풀어보세요! 신선한 재료와 정갈한 손맛, 청결한 매장으로 사랑받는 한마음 식당입니다. 정겨운 동네 단골집을 찾으신다면 꼭 들러주세요! 🥢

[인스타그램/SNS 홍보 피드]
오늘도 한마음 식당의 불향 가득한 제육볶음과 오삼불고기가 손님들을 기다리고 있습니다! 🔥 7첩 반찬의 정성까지 담았습니다. #한마음식당 #오삼불고기맛집 #제육볶음맛집 #집밥감성 #동네단골집`;

export async function analyzeReviews(reviews: Review[]): Promise<string> {
    if (reviews.length === 0) {
        return "수집된 리뷰 데이터가 없어 분석을 수행할 수 없습니다.";
    }

    if (!process.env.GEMINI_API_KEY) {
        console.log('⚠️  GEMINI_API_KEY 미설정 — 기본 마케팅 문구를 사용합니다.');
        return FALLBACK_COPY;
    }

    const reviewsText = reviews.map(r => `[${r.platform} - ${r.rating}점] ${r.content}`).join('\n');

    console.log('🧠 Gemini에게 리뷰 분석을 요청합니다...');

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `${SYSTEM_PROMPT}\n\n[수집된 리뷰 데이터]\n${reviewsText}`;
        const result = await model.generateContent(prompt);
        return result.response.text() || '분석 결과를 생성하지 못했습니다.';
    } catch (error) {
        console.error('Gemini Analysis Error:', error);
        return FALLBACK_COPY;
    }
}

import { GoogleGenerativeAI } from '@google/generative-ai';
import { type Review } from './types.js';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) throw new Error('[analyzer] GEMINI_API_KEY 환경변수가 설정되지 않았습니다.');
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const SYSTEM_PROMPT = `
당신은 '한마음 식당'의 전문 마케터입니다.
다음은 네이버, 카카오맵, 구글, 블로그에서 수집된 실제 방문자 데이터입니다.
대표 메뉴는 [제육볶음, 오삼불고기] 입니다.
식당 위치: 서울 금천구 독산동 (가산디지털단지 인근 직장인 밀집 지역)

[분석 및 생성 지침]
1. 리뷰 내용을 분석하여 핵심 긍정 키워드를 추출하세요.

2. 아래 두 타겟을 구분하여 카카오톡 홍보 문구를 각각 2가지씩 작성하세요.

   🌞 [점심 타겟 - 독산/가산 직장인]
   - 니즈: 빠른 식사, 가성비, 든든함, 혼밥 가능
   - 톤: 활기차고 간결하게
   - 강조: 점심 특선 메뉴, 반찬 구성, 회전율

   🌙 [저녁 타겟 - 소그룹 모임/동네 주민]
   - 니즈: 여유로운 식사, 안주류, 단체 예약
   - 톤: 따뜻하고 정겹게
   - 강조: 예약 메뉴(닭볶음탕/백숙), 오삼불고기 안주 활용

3. 인스타그램 피드 문구와 해시태그를 작성하세요.
   - 키워드: #한마음식당 #오삼불고기맛집 #제육볶음맛집 #집밥감성 #동네단골집 #독산동맛집 #가산맛집

4. 사장님이 강조하는 '신선함', '청결함', '정갈한 밑반찬'을 자연스럽게 녹여주세요.
`;

const FALLBACK_COPY = `🌞 [점심 타겟 - 직장인]

[버전 1]
오늘 점심 고민 끝! 한마음 식당의 불향 가득한 제육볶음 한 그릇으로 든든하게 충전하세요. 매일 바뀌는 정갈한 반찬에 밥 한 공기 뚝딱입니다 😊 혼밥도 언제나 환영!

[버전 2]
가산 직장인들의 단골 점심 맛집 🍚 신선한 재료로 매일 정성껏 준비하는 7첩 반찬과 든든한 한 끼! 오삼불고기·제육볶음 중 오늘의 선택은? 빠르게 드시고 오후도 파이팅!

🌙 [저녁 타겟 - 모임/동네 주민]

[버전 1]
오늘 저녁 모임 장소 찾으세요? 한마음 식당의 매콤달콤 오삼불고기와 닭볶음탕으로 정겨운 한 자리 만들어보세요 🥢 2시간 전 예약이면 든든한 상차림 준비해드립니다!

[버전 2]
하루의 피로는 한마음 식당에서 풀어요 🌙 신선한 재료, 청결한 매장, 정겨운 집밥 한 상. 동네 단골들이 인정한 그 맛 그대로 기다리고 있습니다. 오늘 저녁 특선은 옻닭백숙입니다!

📸 [인스타그램/SNS 피드]
오늘도 한마음 식당의 불향 가득한 제육볶음과 오삼불고기가 손님들을 기다리고 있습니다! 🔥 7첩 반찬의 정성까지 담았습니다. #한마음식당 #오삼불고기맛집 #제육볶음맛집 #집밥감성 #동네단골집 #독산동맛집 #가산맛집`;

export async function analyzeReviews(reviews: Review[]): Promise<string> {
    if (reviews.length === 0) {
        return "수집된 리뷰 데이터가 없어 분석을 수행할 수 없습니다.";
    }

    if (!process.env.GEMINI_API_KEY) {
        console.log('⚠️  GEMINI_API_KEY 미설정 — 기본 마케팅 문구를 사용합니다.');
        return FALLBACK_COPY;
    }

    const reviewsText = reviews.map(r => `[${r.platform} - ${r.rating}점] ${r.content}`).join('\n');

    console.log('🧠 Gemini에게 리뷰 분석을 요청합니다... (점심/저녁 타겟 분리)');

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const prompt = `${SYSTEM_PROMPT}\n\n[수집된 리뷰 데이터]\n${reviewsText}`;
        const result = await model.generateContent(prompt);
        return result.response.text() || '분석 결과를 생성하지 못했습니다.';
    } catch (error) {
        console.error('Gemini Analysis Error:', error);
        return FALLBACK_COPY;
    }
}

import { OpenAI } from 'openai';
import { type Review } from './types.js';

// 실제 실행 시에는 환경 변수(process.env.OPENAI_API_KEY)를 사용합니다.
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'dummy_key',
});

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

export async function analyzeReviews(reviews: Review[]): Promise<string> {
    if (reviews.length === 0) {
        return "수집된 리뷰 데이터가 없어 분석을 수행할 수 없습니다.";
    }

    const reviewsText = reviews.map(r => `[${r.platform} - ${r.rating}점] ${r.content}`).join('\n');

    console.log('🧠 GPT에게 리뷰 분석을 요청합니다...');

    try {
        if (openai.apiKey === 'dummy_key') {
            return `[버전 1 - 신선함 & 불향 강조]
정성 가득한 집밥의 따뜻함, 한마음 식당입니다! 매일 신선한 식재료로 정갈하게 준비하는 7첩 반찬과 불향 가득한 제육볶음으로 든든한 점심을 만나보세요. 깨끗한 매장에서 기분 좋게 모시겠습니다. 😊

[버전 2 - 가성비 & 단골 인증]
동네 주민들이 인정한 찐 맛집! 밥도둑 오삼불고기와 아낌없이 퍼드리는 인심으로 여러분의 든든한 한 끼를 책임집니다. 늘 청결하게 유지되는 한마음 식당에서 편안한 혼밥도 즐겨보세요!

[버전 3 - 저녁 모임 & 정겨움]
낮에는 제육볶음, 저녁에는 매콤달콤 오삼불고기로 하루의 피로를 풀어보세요! 신선한 재료와 정갈한 손맛, 청결한 매장으로 사랑받는 한마음 식당입니다. 정겨운 동네 단골집을 찾으신다면 꼭 들러주세요! 🥢

[인스타그램/SNS 홍보 피드]
오늘도 한마음 식당의 불향 가득한 제육볶음과 오삼불고기가 손님들을 기다리고 있습니다! 🔥 7첩 반찬의 정성까지 담았습니다. #한마음식당 #오삼불고기맛집 #제육볶음맛집 #집밥감성 #동네단골집`;
        }

        const response = await openai.chat.completions.create({
            model: 'gpt-4o', // 또는 gpt-4-turbo
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: `[수집된 리뷰 데이터]\n${reviewsText}` }
            ],
            temperature: 0.7,
        });

        return response.choices[0].message.content || '분석 결과를 생성하지 못했습니다.';
    } catch (error) {
        console.error('GPT Analysis Error:', error);
        return 'GPT API 호출 중 오류가 발생했습니다. (API 키 확인 필요)';
    }
}

// 독립적인 테스트 실행을 위한 샘플
async function test() {
    // 실제 네이버/카카오에서 확인한 수집 샘플 데이터 (브라우저 분석 결과 기반)
    const sampleReviews: Review[] = [
        { platform: 'naver', author: 'ktm****', rating: 5, date: '25.3.26', content: '오징어볶음, 제육볶음 정말 너무 맛있습니다. 비벼 먹을 수 있게 대접에 참기름 김가루 등 아낌없이 주시는 친절하신 사장님. 일하러 멀리 왔는데 덕분에 힘 얻고 갑니다 !! 음식이 맛있어요' },
        { platform: 'naver', author: '방문자', rating: 5, date: '최근', content: '매일 바뀌는 반찬이 정갈하고 기사식당처럼 너무 맛있어요. 혼밥하기 최고입니다.' },
        { platform: 'kakao', author: '동네주민', rating: 5, date: '최근', content: '가성비 정말 좋고 재료가 신선해서 믿고 먹습니다. 사장님이 청결에 엄청 신경쓰시는것 같아요.' }
    ];

    const result = await analyzeReviews(sampleReviews);
    console.log('\n==================================\n');
    console.log('[GPT 마케팅 문구 도출 결과]\n');
    console.log(result);
    console.log('\n==================================\n');
}

// const isMain = import.meta.url.endsWith(process.argv[1] as string);
// if (isMain) {
//     test();
// }

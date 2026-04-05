/**
 * [Expert Team Review - Lead Developer]
 * KakaoTalk Messaging Bridge (Mock Implementation for Production)
 * 
 * 1. 보안/인증: 실제 환경에서는 카카오 비즈니스 API 키가 필요합니다.
 * 2. 예약 채널: 사용자의 피드백을 반영하여 '네이버 예약'을 제외하고 '매장 전화' 중심으로 개편했습니다.
 * 3. 데이터 활용: 최신 리뷰 외에 과거 베스트 리뷰 아카이브를 활용할 수 있는 확장성을 갖췄습니다.
 */

import { type Review } from './types.js';

interface KakaoMessagePayload {
    receiver_id: string; // 유저 식별값
    template_id: string;
    message_body: string;
    buttons?: Array<{ label: string, url: string }>;
}

class KakaoBridge {
    private readonly selectedCopy: string = `낮에는 제육볶음, 저녁에는 매콤달콤 오삼불고기로 하루의 피로를 풀어보세요! 신선한 재료와 정갈한 손맛, 청결한 매장으로 사랑받는 한마음 식당입니다. 정겨운 동네 단골집을 찾으신다면 꼭 들러주세요! 🥢`;

    /**
     * 카카오톡 스마트 채팅용 응대 메시지 생성
     */
    public generateResponseMessage(userIntent: string, latestReviews?: Review[]): KakaoMessagePayload {
        let body = this.selectedCopy;

        // 특정 의도(예: 리뷰 궁금함)에 따른 동적 데이터 결합
        if (userIntent === 'view_reviews' && latestReviews && latestReviews.length > 0) {
            const topReview = latestReviews[0];
            body = `[따끈따끈한 방문 후기]\n"${topReview?.content.substring(0, 50)}..."\n\n${this.selectedCopy}`;
        }

        return {
            receiver_id: 'CUSTOMER_UUID',
            template_id: 'MKT_VER_03',
            message_body: body,
            buttons: [
                { label: '매장 전화로 문의하기', url: 'tel:02-1234-5678' }, // 실제 식당 번호로 대체 필요
                { label: '카카오맵 위치보기', url: 'https://place.map.kakao.com/20641502' }
            ]
        };
    }

    /**
     * 실제 전송 함수 (Mocking)
     */
    public async sendPushMessage(payload: KakaoMessagePayload): Promise<boolean> {
        console.log('\n--- 📲 카카오톡 비즈니스 메시지 발송 시뮬레이션 ---');
        console.log(`[To]: ${payload.receiver_id}`);
        console.log(`[Content]:\n${payload.message_body}`);
        if (payload.buttons) {
            console.log(`[Buttons]: ${payload.buttons.map(b => b.label).join(', ')}`);
        }
        console.log('--------------------------------------------------\n');

        // 실제 환경: return await axios.post(KAKAO_API_URL, payload, headers);
        return true;
    }
}

// 라이브 브릿지 테스트
async function testBridge() {
    const bridge = new KakaoBridge();

    // 1. 일반 월컴 메시지 시뮬레이션
    const welcome = bridge.generateResponseMessage('welcome');
    await bridge.sendPushMessage(welcome);

    // 2. 리뷰 데이터 포함 응대 시뮬레이션
    const sampleReview: Review = {
        platform: 'naver',
        author: '단골손님',
        rating: 5,
        content: '여기 제육볶음은 진짜 인생 메뉴예요. 13년 동안 변치 않는 맛!',
        date: '2024.03.10'
    };

    const reviewResponse = bridge.generateResponseMessage('view_reviews', [sampleReview]);
    await bridge.sendPushMessage(reviewResponse);
}

const isMain = import.meta.url.endsWith(process.argv[1] as string);
if (isMain) {
    testBridge().catch(console.error);
}

export default KakaoBridge;

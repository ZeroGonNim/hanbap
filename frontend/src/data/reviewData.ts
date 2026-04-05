import { type Review } from '../types';
import crawledReviews from './reviews.json';

const MANUAL_REVIEWS: Review[] = [
    { author: '단골손님', platform: 'Kakao', rating: 5, content: '여기 오삼불고기 정말 예술입니다. 매콤달콤한 소스가 밥 두 공기 뚝딱이에요!', date: '2024.03.11' },
    { author: '동네주민', platform: 'Naver', rating: 5, content: '밑반찬이 정갈하고 사장님이 너무 친절하세요. 집밥 생각날 때 무조건 옵니다.', date: '2024.03.10' },
    { author: '미식가', platform: 'Google', rating: 5, content: '제육볶음 불향이 살아있네요. 청결한 매장 분위기도 마음에 듭니다.', date: '2024.03.09' },
    { author: '든든하게한끼', platform: 'Naver', rating: 5, content: '점심 특선 가성비 최고예요. 반찬이 매일 바뀌어서 질리지 않네요.', date: '2024.03.08' },
    { author: '매운맛매니아', platform: 'Kakao', rating: 4, content: '오삼불고기 적당히 맵고 맛있어요. 다음엔 삼겹살 먹으러 오려구요!', date: '2024.03.07' }
];

export const REVIEW_DATA: Review[] = [...MANUAL_REVIEWS, ...(crawledReviews as Review[])];

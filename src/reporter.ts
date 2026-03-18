import fs from 'fs';
import path from 'path';
import { createHash } from 'crypto';
import { type Review } from './types.js';

// 프론트엔드 Review 타입과 일치하는 포맷
interface FrontendReview {
    author: string;
    platform: 'Naver' | 'Kakao' | 'Google';
    rating: number;
    content: string;
    date: string;
}

const PLATFORM_MAP: Record<string, FrontendReview['platform']> = {
    naver: 'Naver',
    blog: 'Naver',
    kakao: 'Kakao',
    google: 'Google',
};

const FRONTEND_REVIEWS_PATH = path.resolve('frontend/src/data/reviews.json');
const MAX_FEED_SIZE = 20;

interface DailyReport {
    date: string;
    total_reviews: number;
    platform_breakdown: { naver: number, kakao: number, google: number };
    keyword_highlights: string[];
    ai_marketing_copy: string;
    raw_data: Review[];
}

class Reporter {
    private reportDir: string = path.resolve('reports');

    constructor() {
        if (!fs.existsSync(this.reportDir)) {
            fs.mkdirSync(this.reportDir);
        }
    }

    /**
     * 수집된 리뷰를 프론트엔드 JSON Feed로 저장 (랜딩페이지 자동 반영)
     */
    public updateFrontendReviewFeed(reviews: Review[]): void {
        // 유효한 플랫폼의 리뷰만 필터링 후 프론트엔드 포맷으로 변환
        const newReviews: FrontendReview[] = reviews
            .filter(r => r.content && r.content.length > 10 && PLATFORM_MAP[r.platform])
            .map(r => ({
                author: r.author,
                platform: PLATFORM_MAP[r.platform],
                rating: r.rating,
                content: r.content,
                date: r.date,
            }));

        // 기존 파일 로드 (없으면 빈 배열)
        let existing: FrontendReview[] = [];
        if (fs.existsSync(FRONTEND_REVIEWS_PATH)) {
            try {
                existing = JSON.parse(fs.readFileSync(FRONTEND_REVIEWS_PATH, 'utf-8'));
            } catch {
                existing = [];
            }
        }

        // 콘텐츠 해시 기반 중복 제거 후 병합 (신규 리뷰 우선)
        const seen = new Set<string>();
        const merged = [...newReviews, ...existing].filter(r => {
            const hash = createHash('md5').update(r.content).digest('hex');
            if (seen.has(hash)) return false;
            seen.add(hash);
            return true;
        });

        // 최대 MAX_FEED_SIZE개 유지
        const feed = merged.slice(0, MAX_FEED_SIZE);

        fs.writeFileSync(FRONTEND_REVIEWS_PATH, JSON.stringify(feed, null, 2), 'utf-8');
        console.log(`> 랜딩페이지 리뷰 피드 업데이트: ${feed.length}건 (신규 ${newReviews.length}건 반영)`);
    }

    /**
     * 일일 리포트 생성 및 저장
     */
    public saveDailyReport(data: DailyReport): string {
        const fileName = `report_${data.date.replace(/\./g, '-')}.json`;
        const filePath = path.join(this.reportDir, fileName);

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');

        const mdPath = this.generateMarkdownSummary(data);
        return mdPath;
    }

    /**
     * 사장님 열람용 요약 마크다운 생성
     */
    private generateMarkdownSummary(data: DailyReport): string {
        const summary = `
# 📝 한마음 식당 마케팅 자동화 일일 리포트 (${data.date})

## 📊 수집 통계
- **총 수집 리뷰**: ${data.total_reviews}건
- **네이버**: ${data.platform_breakdown.naver}건 / **카카오**: ${data.platform_breakdown.kakao}건 / **구글**: ${data.platform_breakdown.google}건

## 💡 AI 추천 마케팅 메시지
> ${data.ai_marketing_copy.split('\n\n')[0]} // 주요 버전 1건 노출

## 📸 SNS 홍보용 피드 (인스타그램/페이스북)
${data.ai_marketing_copy.includes('인스타그램') ? data.ai_marketing_copy.split(/인스타그램|SNS/)[data.ai_marketing_copy.split(/인스타그램|SNS/).length - 1].replace(/^[\]\s/]+/, '') : '분석 데이터 기반 SNS 문구 생성 중...'}

## 🔍 핵심 키워드 감지
${data.keyword_highlights.length > 0 ? data.keyword_highlights.map(k => `- #${k}`).join('\n') : '- 수집된 핵심 키워드가 없습니다.'}

## 💬 실제 수집된 주요 리뷰 (최신 3건)
${data.raw_data.slice(0, 3).map(r => `> **[${r.platform.toUpperCase()}]** ${r.content} (${r.author})`).join('\n\n')}

---
*본 리포트는 실제 고객의 데이터를 기반으로 AI가 분석하고 가공한 결과입니다.*
        `.trim();

        const mdFileName = `summary_${data.date.replace(/\./g, '-')}.md`;
        const mdPath = path.join(this.reportDir, mdFileName);
        fs.writeFileSync(mdPath, summary, 'utf-8');

        return mdPath;
    }
}

export default Reporter;

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
const FRONTEND_STATS_PATH = path.resolve('frontend/public/stats.json');
const MAX_FEED_SIZE = 20;

export interface DailyReport {
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
        const newReviews: FrontendReview[] = reviews
            .filter(r => r.content && r.content.length > 10 && PLATFORM_MAP[r.platform] !== undefined)
            .map(r => ({
                author: r.author,
                platform: PLATFORM_MAP[r.platform] as FrontendReview['platform'],
                rating: r.rating,
                content: r.content,
                date: r.date,
            }));

        let existing: FrontendReview[] = [];
        if (fs.existsSync(FRONTEND_REVIEWS_PATH)) {
            try {
                existing = JSON.parse(fs.readFileSync(FRONTEND_REVIEWS_PATH, 'utf-8'));
            } catch {
                existing = [];
            }
        }

        const seen = new Set<string>();
        const merged = [...newReviews, ...existing].filter(r => {
            const hash = createHash('md5').update(r.content).digest('hex');
            if (seen.has(hash)) return false;
            seen.add(hash);
            return true;
        });

        const feed = merged.slice(0, MAX_FEED_SIZE);
        // atomic write: 임시 파일에 먼저 쓰고 rename으로 교체 (Race Condition 방지)
        const tmpPath = `${FRONTEND_REVIEWS_PATH}.tmp`;
        fs.writeFileSync(tmpPath, JSON.stringify(feed, null, 2), 'utf-8');
        fs.renameSync(tmpPath, FRONTEND_REVIEWS_PATH);
        console.log(`> 랜딩페이지 리뷰 피드 업데이트: ${feed.length}건 (신규 ${newReviews.length}건 반영)`);
    }

    /**
     * 관리자 대시보드용 stats.json 생성 (frontend/public/stats.json)
     */
    public updateStatsJson(data: DailyReport): void {
        const weeklyTrend = this.getWeeklyTrend();

        let totalAccumulated = 0;
        let recentReviews: unknown[] = [];
        if (fs.existsSync(FRONTEND_REVIEWS_PATH)) {
            try {
                const feed = JSON.parse(fs.readFileSync(FRONTEND_REVIEWS_PATH, 'utf-8'));
                totalAccumulated = feed.length;
                recentReviews = feed.slice(0, 5);
            } catch { /* ignore */ }
        }

        // AI 카피 섹션 파싱
        const copy = data.ai_marketing_copy;
        const lunchMatch = copy.match(/🌞[^\n]*\n([\s\S]*?)(?=🌙|$)/);
        const dinnerMatch = copy.match(/🌙[^\n]*\n([\s\S]*?)(?=📸|$)/);
        const snsMatch = copy.match(/📸[^\n]*\n([\s\S]*?)$/);

        const stats = {
            lastUpdated: data.date,
            today: {
                total: data.total_reviews,
                naver: data.platform_breakdown.naver,
                kakao: data.platform_breakdown.kakao,
                google: data.platform_breakdown.google,
            },
            weeklyTrend,
            topKeywords: data.keyword_highlights.slice(0, 8),
            aiCopy: {
                lunch: lunchMatch?.[1]?.trim() ?? copy.split('\n\n')[0],
                dinner: dinnerMatch?.[1]?.trim() ?? '',
                sns: snsMatch?.[1]?.trim() ?? '',
            },
            totalAccumulated,
            recentReviews,
        };

        // atomic write: 임시 파일에 먼저 쓰고 rename으로 교체 (Race Condition 방지)
        const tmpPath = `${FRONTEND_STATS_PATH}.tmp`;
        fs.writeFileSync(tmpPath, JSON.stringify(stats, null, 2), 'utf-8');
        fs.renameSync(tmpPath, FRONTEND_STATS_PATH);
        console.log('> 관리자 대시보드 stats.json 업데이트 완료');
    }

    /**
     * 전날 리포트 로드 (증가 추이 계산용)
     */
    private loadPreviousReport(): DailyReport | null {
        const files = fs.readdirSync(this.reportDir)
            .filter(f => f.startsWith('report_') && f.endsWith('.json'))
            .sort()
            .reverse();

        // 가장 최근 파일 (오늘 제외하고 이전 것)
        if (files.length < 2) return null;
        try {
            const filename = files[1];
            if (!filename) return null;
            const content = fs.readFileSync(path.join(this.reportDir, filename), 'utf-8');
            return JSON.parse(content) as DailyReport;
        } catch {
            return null;
        }
    }

    /**
     * 주간 리뷰 추이 계산 (최근 7일 리포트 기반)
     */
    private getWeeklyTrend(): { date: string, count: number }[] {
        const files = fs.readdirSync(this.reportDir)
            .filter(f => f.startsWith('report_') && f.endsWith('.json'))
            .sort()
            .reverse()
            .slice(0, 7);

        return files.map(f => {
            try {
                const data = JSON.parse(fs.readFileSync(path.join(this.reportDir, f), 'utf-8')) as DailyReport;
                return { date: data.date, count: data.total_reviews };
            } catch {
                return { date: '?', count: 0 };
            }
        }).reverse();
    }

    /**
     * 평균 평점 계산
     */
    private calcAvgRating(reviews: Review[]): string {
        if (reviews.length === 0) return 'N/A';
        const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        return avg.toFixed(1);
    }

    /**
     * 증감 표시 헬퍼
     */
    private formatDiff(current: number, previous: number): string {
        const diff = current - previous;
        if (diff > 0) return `▲ ${diff}`;
        if (diff < 0) return `▼ ${Math.abs(diff)}`;
        return `- 0`;
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
        const prev = this.loadPreviousReport();
        const weeklyTrend = this.getWeeklyTrend();

        // 누적 리뷰 수 (reviews.json 기준)
        let totalAccumulated = 0;
        if (fs.existsSync(FRONTEND_REVIEWS_PATH)) {
            try {
                const feed = JSON.parse(fs.readFileSync(FRONTEND_REVIEWS_PATH, 'utf-8'));
                totalAccumulated = feed.length;
            } catch { /* ignore */ }
        }

        // 플랫폼별 평균 평점
        const naverReviews = data.raw_data.filter(r => r.platform === 'naver' || r.platform === 'blog');
        const kakaoReviews = data.raw_data.filter(r => r.platform === 'kakao');
        const googleReviews = data.raw_data.filter(r => r.platform === 'google');

        // 주간 추이 바 차트 (텍스트)
        const maxCount = Math.max(...weeklyTrend.map(t => t.count), 1);
        const trendChart = weeklyTrend.map(t => {
            const bars = Math.round((t.count / maxCount) * 10);
            const bar = '█'.repeat(bars) + '░'.repeat(10 - bars);
            const dateShort = t.date.split('.').slice(1).join('/');
            return `  ${dateShort}  ${bar}  ${t.count}건`;
        }).join('\n');

        // AI 카피 섹션 파싱
        const copy = data.ai_marketing_copy;
        const lunchSection = copy.includes('점심') ? copy.split(/🌙|\[저녁/)[0] : copy.split('\n\n')[0];
        const dinnerSection = copy.includes('저녁') ? copy.split(/🌙|\[저녁/)[1]?.split(/📸|\[인스타/)[0] : '';
        const snsSection = copy.includes('인스타') ? copy.split(/📸|\[인스타그램/)[1] : '';

        const summary = `# 📊 한마음 식당 일일 성과 리포트 (${data.date})

---

## 1. 오늘의 핵심 수치

| 항목 | 오늘 | 전일 대비 |
|------|------|-----------|
| 신규 수집 리뷰 | ${data.total_reviews}건 | ${prev ? this.formatDiff(data.total_reviews, prev.total_reviews) : '첫 실행'} |
| 누적 리뷰 (랜딩페이지) | ${totalAccumulated}건 | - |
| 네이버 | ${data.platform_breakdown.naver}건 (평점 ${this.calcAvgRating(naverReviews)}) | ${prev ? this.formatDiff(data.platform_breakdown.naver, prev.platform_breakdown.naver) : '-'} |
| 카카오 | ${data.platform_breakdown.kakao}건 (평점 ${this.calcAvgRating(kakaoReviews)}) | ${prev ? this.formatDiff(data.platform_breakdown.kakao, prev.platform_breakdown.kakao) : '-'} |
| 구글 | ${data.platform_breakdown.google}건 (평점 ${this.calcAvgRating(googleReviews)}) | ${prev ? this.formatDiff(data.platform_breakdown.google, prev.platform_breakdown.google) : '-'} |

---

## 2. 주간 리뷰 수집 추이 (최근 7일)

${trendChart || '  데이터 누적 중...'}

---

## 3. 오늘의 AI 마케팅 카피

### 🌞 점심 타겟 (직장인)
${lunchSection?.trim() || '생성 데이터 없음'}

### 🌙 저녁 타겟 (모임/주민)
${dinnerSection?.trim() || '생성 데이터 없음'}

### 📸 인스타그램/SNS 피드
${snsSection?.trim() || '생성 데이터 없음'}

---

## 4. 핵심 키워드
${data.keyword_highlights.length > 0
    ? data.keyword_highlights.map(k => `- #${k}`).join('\n')
    : '- 수집된 키워드가 없습니다.'}

---

## 5. 오늘 수집된 주요 리뷰 (최신 5건)
${data.raw_data.slice(0, 5).map((r, i) =>
    `**${i + 1}. [${r.platform.toUpperCase()}] ⭐${r.rating}** (${r.author} · ${r.date})\n> ${r.content}`
).join('\n\n')}

---
*자동 생성: ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })} KST*
`.trim();

        const mdFileName = `summary_${data.date.replace(/\./g, '-')}.md`;
        const mdPath = path.join(this.reportDir, mdFileName);
        fs.writeFileSync(mdPath, summary, 'utf-8');

        return mdPath;
    }
}

export default Reporter;

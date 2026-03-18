import 'dotenv/config';
import { ReviewCollector } from './collector.js';
import { analyzeReviews } from './analyzer.js';
import KakaoBridge from './kakao_bridge.js';
import Reporter from './reporter.js';

async function runAutomationPipeline() {
    const collector = new ReviewCollector();
    const bridge = new KakaoBridge();
    const reporter = new Reporter();

    console.log('--- 🚀 한마음 식당 마케팅 자동화 파이프라인 시작 ---');

    try {
        // 1. 데이터 수집 (네이버 리뷰/블로그, 카카오, 구글)
        console.log('STEP 1: 전방위 데이터 수집 중 (리뷰 + 블로그)...');
        const [naverReviews, naverBlogs, kakao, google] = await Promise.all([
            collector.collectNaverReviews('86727483'),
            collector.collectNaverBlogs('한마음식당'),
            collector.collectKakaoReviews('20641502'),
            collector.collectGoogleReviews('ChIJN1t-zd6veDURSOf_p0bqXDo') // 한마음 식당 Google Place ID 예시
        ]);

        const combined = [...naverReviews, ...naverBlogs, ...kakao, ...google];
        console.log(`> 수집 현황: 네이버(${naverReviews.length}), 블로그(${naverBlogs.length}), 카카오(${kakao.length}), 구글(${google.length})`);
        console.log(`> 총 ${combined.length}건의 신규 데이터 발견`);

        // 2. GPT 분석 및 마케팅 문구 생성
        console.log('STEP 2: GPT 통합 분석 및 문구 도출 중...');
        const aiCopy = await analyzeReviews(combined);

        // 3. 카카오톡 메시지 브릿지 연동 (필터링된 핵심 리뷰 포함)
        console.log('STEP 3: 카카오톡 메시지 생성 및 시뮬레이션...');
        const payload = bridge.generateResponseMessage('view_reviews', combined);
        await bridge.sendPushMessage(payload);

        // 4. 랜딩페이지 리뷰 피드 업데이트
        console.log('STEP 4: 랜딩페이지 리뷰 피드 업데이트 중...');
        reporter.updateFrontendReviewFeed(combined);

        // 5. 일일 리포트 저장
        console.log('STEP 5: 리포트 생성 중...');
        const now = new Date();
        const dateStr = `${now.getFullYear()}.${now.getMonth() + 1}.${now.getDate()}`;

        const summaryPath = reporter.saveDailyReport({
            date: dateStr,
            total_reviews: combined.length,
            platform_breakdown: {
                naver: naverReviews.length + naverBlogs.length,
                kakao: kakao.length,
                google: google.length
            },
            keyword_highlights: Array.from(new Set(combined.flatMap(r => r.keywords || []))),
            ai_marketing_copy: aiCopy,
            raw_data: combined
        });

        // 6. 관리자 대시보드 stats.json 업데이트
        reporter.updateStatsJson({
            date: dateStr,
            total_reviews: combined.length,
            platform_breakdown: {
                naver: naverReviews.length + naverBlogs.length,
                kakao: kakao.length,
                google: google.length
            },
            keyword_highlights: Array.from(new Set(combined.flatMap(r => r.keywords || []))),
            ai_marketing_copy: aiCopy,
            raw_data: combined
        });

        console.log('\n--- ✅ 파이프라인 실행 완료 ---');
        console.log(`> 저장된 리포트: ${summaryPath}`);
        console.log(`> 랜딩페이지 자동 반영 완료: frontend/src/data/reviews.json`);

    } catch (error) {
        console.error('!!! 파이프라인 실행 중 치명적 오류 발생 !!!');
        console.error(error);
    }
}

runAutomationPipeline().catch(console.error);

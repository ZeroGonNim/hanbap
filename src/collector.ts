import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';
import { type Review } from './types.js';

/**
 * [Expert Team Review - Lead Developer]
 * 1. 보안/우회: 랜덤 User-Agent와 지연 시간을 통해 안티봇 정책을 우회합니다.
 * 2. 확장성: 플랫폼 클래스가 변경되어도 대응 가능하도록 셀렉터 셋을 다각화했습니다.
 * 3. 안정성: 브라우저 인스턴스를 재사용하고 모든 goto에 타임아웃을 적용합니다.
 */

const PAGE_TIMEOUT_MS = 30_000;

export class ReviewCollector {
    private userAgents: string[] = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36'
    ];

    private targetKeywords: string[] = ['고봉밥', '집밥', '13년', '신선', '청결', '제육'];

    /** 공유 브라우저 인스턴스 — 세션 내 재사용 */
    private browser: Browser | null = null;

    private async getBrowser(): Promise<Browser> {
        if (!this.browser || !this.browser.isConnected()) {
            this.browser = await chromium.launch({ headless: true });
        }
        return this.browser;
    }

    private async newContext(): Promise<BrowserContext> {
        const browser = await this.getBrowser();
        return browser.newContext({
            userAgent: this.userAgents[Math.floor(Math.random() * this.userAgents.length)] as string,
            viewport: { width: 1280, height: 800 }
        });
    }

    /** 세션 종료 시 브라우저 해제 */
    public async close(): Promise<void> {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }

    /**
     * 랜덤 지연 생성 (안티봇 대응)
     */
    private async randomDelay(min: number = 1000, max: number = 3000) {
        const delay = Math.floor(Math.random() * (max - min + 1) + min);
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    /**
     * 특정 키워드 포함 여부를 필터링하는 도메인 로직
     */
    private filterDomainKeywords(content: string): string[] {
        return this.targetKeywords.filter(keyword => content.includes(keyword));
    }

    /**
     * 네이버 리뷰 수집 (Prod-level)
     */
    public async collectNaverReviews(placeId: string): Promise<Review[]> {
        const context = await this.newContext();
        const page = await context.newPage();
        page.setDefaultTimeout(PAGE_TIMEOUT_MS);

        try {
            console.log(`[Naver] Accessing Place ID: ${placeId}...`);
            await page.goto(
                `https://pcmap.place.naver.com/restaurant/${placeId}/review/visitor`,
                { waitUntil: 'networkidle', timeout: PAGE_TIMEOUT_MS }
            );

            await this.randomDelay();

            for (let i = 0; i < 3; i++) {
                await page.mouse.wheel(0, 800);
                await this.randomDelay(500, 1000);
            }

            const moreBtn = page.locator('a[data-pui-click-code="rvshowmore"]').first();
            if (await moreBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
                await moreBtn.click();
                await this.randomDelay(1000, 2000);
            }

            const reviews = await page.evaluate(() => {
                const items = document.querySelectorAll('li.p_v_item, li.ug_v_m, li.OW9Y_');
                return Array.from(items).map(item => ({
                    author: item.querySelector('.N-A-F, .u_v_y')?.textContent?.trim() || '익명',
                    content: item.querySelector('.z_v_o, .rv_v_v')?.textContent?.trim() || '',
                    date: item.querySelector('.P_v_q, .u_v_b')?.textContent?.trim() || ''
                }));
            });

            const filtered = reviews.filter(r => r.content.trim() !== '');
            console.log(`[Naver] 수집 ${reviews.length}건 중 내용 있는 리뷰: ${filtered.length}건`);

            return filtered.map(r => ({
                ...r,
                platform: 'naver' as const,
                rating: 5,
                keywords: this.filterDomainKeywords(r.content)
            }));
        } catch (error) {
            console.error(`[Naver Error] ${error}`);
            return [];
        } finally {
            await context.close();
        }
    }

    /**
     * 카카오 리뷰 수집 (Prod-level)
     */
    public async collectKakaoReviews(placeId: string): Promise<Review[]> {
        const context = await this.newContext();
        const page = await context.newPage();
        page.setDefaultTimeout(PAGE_TIMEOUT_MS);

        try {
            console.log(`[Kakao] Accessing Place ID: ${placeId}...`);
            await page.goto(
                `https://place.map.kakao.com/${placeId}#review`,
                { waitUntil: 'load', timeout: PAGE_TIMEOUT_MS }
            );
            await this.randomDelay();

            await page.waitForSelector('.list_evaluation li, .review_info', { timeout: 10000 });

            const reviews = await page.evaluate(() => {
                const items = document.querySelectorAll('.list_evaluation li, .review_info');
                return Array.from(items).map(item => {
                    const author = item.querySelector('.link_user, .txt_username')?.textContent?.trim() || '익명';
                    const content = item.querySelector('.txt_comment, .desc_comment')?.textContent?.trim() || '';
                    const date = item.querySelector('.time_write, .txt_date')?.textContent?.trim() || '';

                    const starElem = item.querySelector('.ico_star, .inner_star');
                    const style = starElem?.getAttribute('style') || '';
                    const ratingMatch = style.match(/width:(\d+)%/);
                    const rating = (ratingMatch && ratingMatch[1]) ? parseInt(ratingMatch[1]) / 20 : 5;

                    return { author, content, date, rating };
                });
            });

            const filtered = reviews.filter(r => r.content.trim() !== '');
            console.log(`[Kakao] 수집 ${reviews.length}건 중 내용 있는 리뷰: ${filtered.length}건`);

            return filtered.map(r => ({
                ...r,
                platform: 'kakao' as const,
                keywords: this.filterDomainKeywords(r.content)
            }));
        } catch (error) {
            console.error(`[Kakao Error] ${error}`);
            return [];
        } finally {
            await context.close();
        }
    }

    /**
     * 네이버 블로그 수집 (Prod-level)
     */
    public async collectNaverBlogs(query: string): Promise<Review[]> {
        const context = await this.newContext();
        const page = await context.newPage();
        page.setDefaultTimeout(PAGE_TIMEOUT_MS);

        try {
            console.log(`[Naver Blog] Searching for: ${query}...`);
            const searchUrl = `https://search.naver.com/search.naver?where=view&sm=tab_nmw&query=${encodeURIComponent(query)}&nso=`;
            await page.goto(searchUrl, { waitUntil: 'networkidle', timeout: PAGE_TIMEOUT_MS });
            await this.randomDelay();

            const blogs = await page.evaluate(() => {
                const items = document.querySelectorAll('.view_wrap, .lst_view > li');
                return Array.from(items).slice(0, 5).map(item => {
                    const title = item.querySelector('.title_link, .api_txt_lines')?.textContent?.trim() || '';
                    const content = item.querySelector('.dsc_link, .api_txt_lines.dsc')?.textContent?.trim() || '';
                    const author = item.querySelector('.name, .user_info .elss')?.textContent?.trim() || '익명';
                    const date = item.querySelector('.sub_time, .txt_date')?.textContent?.trim() || '';

                    return {
                        author,
                        content: `[블로그 제목: ${title}]\n${content}`,
                        date,
                        rating: 5
                    };
                });
            });

            const filtered = blogs.filter(b => b.content.trim() !== '' && b.content !== '[블로그 제목: ]\n');
            console.log(`[Blog] 수집 ${blogs.length}건 중 내용 있는 글: ${filtered.length}건`);

            return filtered.map(b => ({
                ...b,
                platform: 'blog' as const,
                keywords: this.filterDomainKeywords(b.content)
            }));
        } catch (error) {
            console.error(`[Naver Blog Error] ${error}`);
            return [];
        } finally {
            await context.close();
        }
    }

    /**
     * 구글 리뷰 수집 (Prod-level)
     */
    public async collectGoogleReviews(placeId: string): Promise<Review[]> {
        const context = await this.newContext();
        const page = await context.newPage();
        page.setDefaultTimeout(PAGE_TIMEOUT_MS);

        try {
            console.log(`[Google Maps] Accessing Place ID: ${placeId}...`);
            const url = `https://www.google.com/maps/search/?api=1&query=한마음식당&query_place_id=${placeId}`;
            await page.goto(url, { waitUntil: 'networkidle', timeout: PAGE_TIMEOUT_MS });
            await this.randomDelay();

            const reviews = await page.evaluate(() => {
                const items = document.querySelectorAll('.jfti1e, .wiI7pd, div[data-review-id]');
                return Array.from(items).slice(0, 5).map(item => {
                    const author = item.querySelector('.d480Kc, .TSr2u')?.textContent?.trim() || '익명';
                    const content = item.querySelector('.wiI7pd, .MyEned')?.textContent?.trim() || '';
                    const date = item.querySelector('.rsqawe, .PuaHbe')?.textContent?.trim() || '';

                    const starElem = item.querySelector('.kvMYIc');
                    const rating = starElem ? parseInt(starElem.getAttribute('aria-label') || '5') : 5;

                    return { author, content, date, rating };
                });
            });

            const filtered = reviews.filter(r => r.content.trim() !== '');
            console.log(`[Google] 수집 ${reviews.length}건 중 내용 있는 리뷰: ${filtered.length}건`);

            return filtered.map(r => ({
                ...r,
                platform: 'google' as const,
                keywords: this.filterDomainKeywords(r.content)
            }));
        } catch (error) {
            console.error(`[Google Error] ${error}`);
            return [];
        } finally {
            await context.close();
        }
    }
}

// 라이브 테스트 엔트리 포인트
async function bootstrap() {
    const collector = new ReviewCollector();

    console.log('--- 🚀 수석 개발자 리뷰 수집 파이프라인 가동 ---');

    const [naverResult, kakaoResult] = await Promise.all([
        collector.collectNaverReviews('86727483'),
        collector.collectKakaoReviews('20641502')
    ]);

    console.log(`\n[결과 리포트]`);
    console.log(`- 네이버 수집: ${naverResult.length}건`);
    console.log(`- 카카오 수집: ${kakaoResult.length}건`);

    const combined = [...naverResult, ...kakaoResult];
    const filteredTotal = combined.filter(r => r.keywords && r.keywords.length > 0);

    console.log(`- 핵심 키워드(집밥, 고봉밥 등) 포함 리뷰: ${filteredTotal.length}건`);

    if (filteredTotal.length > 0) {
        console.log('\n[필터링된 리뷰 샘플]');
        console.log(JSON.stringify(filteredTotal[0], null, 2));
    }

    await collector.close();
}

// bootstrap().catch(console.error);

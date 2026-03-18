import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { sendEmail } from './mailer.js';
import { type DailyReport } from './reporter.js';

const REPORT_DIR = path.resolve('reports');

/**
 * 최근 N일 리포트 로드
 */
function loadRecentReports(days: number): DailyReport[] {
    if (!fs.existsSync(REPORT_DIR)) return [];

    return fs.readdirSync(REPORT_DIR)
        .filter(f => f.startsWith('report_') && f.endsWith('.json'))
        .sort()
        .reverse()
        .slice(0, days)
        .map(f => {
            try {
                return JSON.parse(fs.readFileSync(path.join(REPORT_DIR, f), 'utf-8')) as DailyReport;
            } catch {
                return null;
            }
        })
        .filter(Boolean) as DailyReport[];
}

/**
 * 주간 리포트 HTML 생성
 */
function buildWeeklyHtml(reports: DailyReport[]): string {
    if (reports.length === 0) {
        return '<p>이번 주 수집된 데이터가 없습니다.</p>';
    }

    const totalReviews = reports.reduce((s, r) => s + r.total_reviews, 0);
    const avgPerDay = (totalReviews / reports.length).toFixed(1);
    const totalNaver = reports.reduce((s, r) => s + r.platform_breakdown.naver, 0);
    const totalKakao = reports.reduce((s, r) => s + r.platform_breakdown.kakao, 0);
    const totalGoogle = reports.reduce((s, r) => s + r.platform_breakdown.google, 0);

    // 키워드 빈도 집계
    const keywordCount: Record<string, number> = {};
    reports.forEach(r => r.keyword_highlights.forEach(k => {
        keywordCount[k] = (keywordCount[k] || 0) + 1;
    }));
    const topKeywords = Object.entries(keywordCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([k, c]) => `<span style="background:#FEF9C3;padding:3px 8px;border-radius:12px;margin:2px;display:inline-block;">#${k} (${c}회)</span>`)
        .join(' ');

    // 일별 추이 테이블
    const dailyRows = [...reports].reverse().map(r =>
        `<tr>
            <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;">${r.date}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:center;">${r.total_reviews}건</td>
            <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:center;">${r.platform_breakdown.naver}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:center;">${r.platform_breakdown.kakao}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:center;">${r.platform_breakdown.google}</td>
        </tr>`
    ).join('');

    // 이번 주 베스트 리뷰
    const allReviews = reports.flatMap(r => r.raw_data);
    const bestReviews = allReviews
        .filter(r => r.rating >= 4 && r.content.length > 20)
        .slice(0, 3)
        .map(r => `
            <div style="background:#F9FAFB;border-left:4px solid #FB923C;padding:12px;margin:8px 0;border-radius:4px;">
                <strong>[${r.platform.toUpperCase()}] ⭐${r.rating}</strong> · ${r.author} · ${r.date}<br/>
                <span style="color:#374151;">${r.content}</span>
            </div>
        `).join('');

    const weekStart = [...reports].reverse()[0]?.date ?? '';
    const weekEnd = reports[0]?.date ?? '';

    return `
<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8"/></head>
<body style="font-family:'Apple SD Gothic Neo',sans-serif;max-width:600px;margin:0 auto;color:#111;">

  <div style="background:linear-gradient(135deg,#FB923C,#F97316);padding:32px;border-radius:12px 12px 0 0;text-align:center;">
    <h1 style="color:#fff;margin:0;font-size:22px;">🍚 한마음식당 주간 리포트</h1>
    <p style="color:#FED7AA;margin:8px 0 0;">${weekStart} ~ ${weekEnd}</p>
  </div>

  <div style="background:#fff;padding:24px;border:1px solid #f0f0f0;">

    <!-- 핵심 수치 -->
    <h2 style="font-size:16px;color:#374151;border-bottom:2px solid #FB923C;padding-bottom:8px;">📊 이번 주 핵심 수치</h2>
    <div style="display:flex;gap:12px;flex-wrap:wrap;margin:16px 0;">
      <div style="flex:1;min-width:120px;background:#FFF7ED;border-radius:8px;padding:16px;text-align:center;">
        <div style="font-size:28px;font-weight:bold;color:#EA580C;">${totalReviews}</div>
        <div style="font-size:12px;color:#9CA3AF;">총 수집 리뷰</div>
      </div>
      <div style="flex:1;min-width:120px;background:#F0FDF4;border-radius:8px;padding:16px;text-align:center;">
        <div style="font-size:28px;font-weight:bold;color:#16A34A;">${avgPerDay}</div>
        <div style="font-size:12px;color:#9CA3AF;">일평균 리뷰</div>
      </div>
      <div style="flex:1;min-width:120px;background:#EFF6FF;border-radius:8px;padding:16px;text-align:center;">
        <div style="font-size:28px;font-weight:bold;color:#2563EB;">${reports.length}</div>
        <div style="font-size:12px;color:#9CA3AF;">수집 실행 일수</div>
      </div>
    </div>

    <!-- 플랫폼별 -->
    <div style="background:#F9FAFB;border-radius:8px;padding:16px;margin:16px 0;">
      <strong>플랫폼별 합계</strong><br/><br/>
      🟢 네이버 &nbsp;<strong>${totalNaver}건</strong> &nbsp;|&nbsp;
      🟡 카카오 &nbsp;<strong>${totalKakao}건</strong> &nbsp;|&nbsp;
      🔵 구글 &nbsp;<strong>${totalGoogle}건</strong>
    </div>

    <!-- 일별 추이 -->
    <h2 style="font-size:16px;color:#374151;border-bottom:2px solid #FB923C;padding-bottom:8px;">📈 일별 수집 추이</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <thead>
        <tr style="background:#FFF7ED;">
          <th style="padding:8px 12px;text-align:left;">날짜</th>
          <th style="padding:8px 12px;">합계</th>
          <th style="padding:8px 12px;">네이버</th>
          <th style="padding:8px 12px;">카카오</th>
          <th style="padding:8px 12px;">구글</th>
        </tr>
      </thead>
      <tbody>${dailyRows}</tbody>
    </table>

    <!-- 인기 키워드 -->
    <h2 style="font-size:16px;color:#374151;border-bottom:2px solid #FB923C;padding-bottom:8px;margin-top:24px;">🔍 이번 주 인기 키워드 TOP 5</h2>
    <div style="margin:12px 0;">${topKeywords || '키워드 데이터 없음'}</div>

    <!-- 베스트 리뷰 -->
    <h2 style="font-size:16px;color:#374151;border-bottom:2px solid #FB923C;padding-bottom:8px;margin-top:24px;">💬 이번 주 베스트 리뷰</h2>
    ${bestReviews || '<p style="color:#9CA3AF;">수집된 리뷰가 없습니다.</p>'}

  </div>

  <div style="background:#F9FAFB;padding:16px;text-align:center;border-radius:0 0 12px 12px;font-size:12px;color:#9CA3AF;">
    한마음식당 마케팅 자동화 시스템 · 매주 월요일 자동 발송<br/>
    <a href="https://hanbap.vercel.app" style="color:#FB923C;">랜딩페이지 바로가기</a>
  </div>

</body>
</html>
`.trim();
}

async function sendWeeklyReport(): Promise<void> {
    console.log('--- 📧 주간 이메일 리포트 생성 시작 ---');

    const reports = loadRecentReports(7);
    console.log(`> 최근 ${reports.length}일 리포트 로드 완료`);

    const html = buildWeeklyHtml(reports);
    const now = new Date().toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' });

    await sendEmail(`[한마음식당] 주간 마케팅 리포트 (${now})`, html);

    console.log('--- ✅ 주간 리포트 발송 완료 ---');
}

sendWeeklyReport().catch(console.error);

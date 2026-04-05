import { type Freshness } from '../types/admin';

const FRESH_HOURS = 26;
const STALE_HOURS = 50;

export function getTimeFreshness(dateStr: string): Freshness {
    if (!dateStr || dateStr === '초기화') return 'dead';
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = diff / (1000 * 60 * 60);
    if (hours < FRESH_HOURS) return 'fresh';
    if (hours < STALE_HOURS) return 'stale';
    return 'dead';
}

export function formatKST(dateStr: string): string {
    if (!dateStr || dateStr === '초기화') return '데이터 없음';
    try {
        return new Date(dateStr).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
    } catch {
        return dateStr;
    }
}

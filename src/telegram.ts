import https from 'https';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';

export function sendTelegram(message: string): Promise<void> {
    if (!BOT_TOKEN || !CHAT_ID) {
        console.log('⚠️  텔레그램 환경변수 미설정 — 알림을 건너뜁니다.');
        return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
        const data = JSON.stringify({ chat_id: CHAT_ID, text: message });
        const req = https.request({
            hostname: 'api.telegram.org',
            path: `/bot${BOT_TOKEN}/sendMessage`,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        }, (res) => {
            let body = '';
            res.on('data', (c) => body += c);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log('> 텔레그램 알림 발송 완료');
                    resolve();
                } else {
                    console.error('텔레그램 발송 실패:', body);
                    resolve();
                }
            });
        });
        req.on('error', (e) => { console.error('텔레그램 오류:', e); resolve(); });
        req.write(data);
        req.end();
    });
}

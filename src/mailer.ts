import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

export async function sendEmail(subject: string, html: string): Promise<void> {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        console.log('⚠️  GMAIL 환경변수 미설정 — 이메일 발송을 건너뜁니다.');
        return;
    }

    await transporter.sendMail({
        from: `"한마음식당 자동화" <${process.env.GMAIL_USER}>`,
        to: process.env.GMAIL_USER,
        subject,
        html,
    });

    console.log(`> 이메일 발송 완료: ${subject}`);
}

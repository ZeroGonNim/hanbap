import React from 'react';
import { STORE_INFO } from '../constants/storeInfo';

interface FooterProps {
    onShare: () => void;
}

const Footer = React.memo<FooterProps>(({ onShare: _ }) => {
    return (
        <footer className="py-12 md:py-14 px-8 bg-hb-brown text-hb-beige text-center">
            <h2 className="text-[1.8rem] mb-2 font-myeongjo">{STORE_INFO.name}</h2>
            <div className="text-[0.85rem] mb-6 leading-[1.8]" style={{ color: 'rgba(245,237,227,0.5)' }}>
                {STORE_INFO.address}<br />
                {STORE_INFO.phone}<br />
                매일 11:00 - 22:00 (브레이크타임 15:00 - 17:00)
            </div>

            <div className="flex flex-col gap-2.5 max-w-[480px] mx-auto">
                <a
                    href={`tel:${STORE_INFO.phone}`}
                    className="block w-full bg-hb-beige text-hb-brown py-5 text-[1.1rem] font-black rounded-[4px] hover:bg-white transition-colors no-underline"
                >
                    지금 전화 문의하기
                </a>
                <a
                    href={STORE_INFO.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-5 text-[1.1rem] font-black rounded-[4px] no-underline transition-colors"
                    style={{
                        background: 'transparent',
                        border: '1px solid rgba(245,237,227,0.3)',
                        color: '#F5EDE3',
                    }}
                    onMouseOver={e => {
                        (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(245,237,227,0.1)';
                        (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(245,237,227,0.6)';
                    }}
                    onMouseOut={e => {
                        (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                        (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(245,237,227,0.3)';
                    }}
                >
                    오시는 길 →
                </a>
            </div>
        </footer>
    );
});

Footer.displayName = 'Footer';
export default Footer;

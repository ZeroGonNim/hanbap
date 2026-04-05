import React from 'react';

interface SignatureMenusProps {
    onOpenFullMenu: () => void;
}

const SIGNATURES = [
    { name: '오삼불고기', desc: '오징어와 삼겹살의 완벽한 조화', price: '13,000' },
    { name: '제육볶음',   desc: '부드러운 고기와 진한 감칠맛',   price: '12,000' },
    { name: '해물순두부', desc: '신선한 해물이 듬뿍 들어간 얼큰함', price: '11,000' },
    { name: '김치찌개',   desc: '진하게 우려낸 묵은지의 여운',    price: '9,000'  },
];

const SignatureMenus = React.memo<SignatureMenusProps>(({ onOpenFullMenu }) => {
    return (
        <section className="py-14 md:py-16 px-8 bg-white">
            <h2 className="text-[2.2rem] font-black text-center mb-10 font-myeongjo tracking-tight">
                한마음 차림표
            </h2>

            <div className="flex flex-col gap-6 max-w-[400px] md:max-w-[450px] mx-auto mb-10">
                {SIGNATURES.map((item) => (
                    <div
                        key={item.name}
                        className="flex justify-between items-baseline border-b border-hb-border pb-3"
                    >
                        <div>
                            <span className="font-bold text-[1.2rem] md:text-[1.3rem]">{item.name}</span>
                            <div className="text-[0.75rem] text-hb-muted mt-0.5 font-sans-kr">{item.desc}</div>
                        </div>
                        <span className="font-black text-hb-red text-[1.2rem] md:text-[1.3rem] whitespace-nowrap ml-4">
                            {item.price}
                        </span>
                    </div>
                ))}
            </div>

            <div className="flex justify-center">
                <button
                    onClick={onOpenFullMenu}
                    className="bg-transparent border border-hb-brown px-8 py-3 text-[0.9rem] font-bold rounded-[2px] text-hb-brown hover:bg-hb-brown hover:text-hb-cream transition-colors"
                >
                    전체 메뉴판 보기
                </button>
            </div>
        </section>
    );
});

SignatureMenus.displayName = 'SignatureMenus';
export default SignatureMenus;

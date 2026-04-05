import React from 'react';
import { STORE_INFO } from '../constants/storeInfo';

const RewardsSection: React.FC = () => {
    return (
        <section className="py-14 md:py-16 px-8 bg-hb-beige border-b border-hb-border" id="rewards">
            <div className="text-center mb-8">
                <span className="text-hb-red font-black text-[0.8rem] tracking-[0.2em] font-sans-kr">
                    [ MASTER'S GIFT ]
                </span>
                <h2 className="text-[2rem] font-black mt-4">사장님의 감사</h2>
            </div>

            <div className="bg-white border border-hb-border max-w-[480px] mx-auto p-10 md:p-10">
                <p className="text-[1.1rem] font-bold text-center mb-6 leading-[1.8]">
                    사진 리뷰 작성 시 <br />
                    <span className="text-hb-red border-b-2 border-hb-red">시원한 음료수 1병</span>을 드립니다.
                </p>

                <div className="flex flex-col gap-2.5 mb-8">
                    <a
                        href={STORE_INFO.naverReviewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-[#03C75A] text-white text-center py-3.5 text-[0.85rem] font-black rounded-[4px] hover:opacity-90 transition-opacity font-sans-kr"
                    >
                        네이버 리뷰 작성 ↗
                    </a>
                    <a
                        href={STORE_INFO.kakaoReviewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-[#FEE500] text-[#3C1E1E] text-center py-3.5 text-[0.85rem] font-black rounded-[4px] hover:opacity-90 transition-opacity font-sans-kr"
                    >
                        카카오 리뷰 작성 ↗
                    </a>
                    <a
                        href={STORE_INFO.instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-[#111] text-white text-center py-3.5 text-[0.85rem] font-black rounded-[4px] hover:opacity-90 transition-opacity font-sans-kr"
                    >
                        인스타그램 인증 ↗
                    </a>
                </div>

                <div className="border-t border-dashed border-hb-border pt-8 text-left space-y-6">
                    <div>
                        <span className="text-[0.7rem] font-black text-hb-red font-sans-kr"># 필수 해시태그</span>
                        <p className="text-[0.8rem] mt-1.5 font-sans-kr text-[#111]">
                            #한마음식당 #독산동맛집 #한마음식당리뷰
                        </p>
                    </div>
                    <div>
                        <span className="text-[0.7rem] font-black text-hb-muted font-sans-kr"># 추천 해시태그</span>
                        <p className="text-[0.8rem] mt-1.5 font-sans-kr text-[#666]">
                            #독산동백반 #금천구맛집 #점심추천 #동네맛집
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default RewardsSection;

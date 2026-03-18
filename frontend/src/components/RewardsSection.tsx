import React from 'react';
import { motion } from 'framer-motion';
import { Award, ChevronRight, Instagram, Camera, PenLine, CupSoda } from 'lucide-react';
import { STORE_INFO } from '../constants/storeInfo';

const RewardsSection: React.FC = () => {
    return (
        <section className="px-4 sm:px-6 mb-16 sm:mb-20" id="rewards">
            <div className="bg-[#FFD700] rounded-[40px] sm:rounded-[60px] p-8 sm:p-12 text-brand relative overflow-hidden shadow-2xl">
                {/* 배경 장식 */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl shadow-inner" />
                
                <div className="grid md:grid-cols-2 gap-10 lg:gap-16 relative z-10">
                    {/* 왼쪽: 설명 영역 */}
                    <div>
                        <motion.h2 
                            initial={{ opacity: 0, y: -10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-2xl sm:text-3xl font-black mb-8 flex items-center gap-3"
                        >
                            <Award className="text-brand-red" size={32} />
                            리뷰 참여 혜택
                        </motion.h2>

                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="bg-white/40 backdrop-blur-md rounded-[40px] p-8 sm:p-10 border border-white/20 shadow-xl flex flex-col justify-center min-h-[350px]"
                        >
                            <p className="text-lg sm:text-xl leading-relaxed font-bold">
                                매장에서 사진 리뷰를 작성하거나 인스타그램에 <span className="text-brand-red underline decoration-2 underline-offset-4">필수 해시태그</span>와 함께 포스팅해 주시면 감사의 마음을 담아 <span className="text-brand-red font-black">시원한 음료수 🥤</span>를 드립니다!
                            </p>
                        </motion.div>
                    </div>

                    {/* 오른쪽: 미션 리스트 */}
                    <div className="space-y-6 flex flex-col justify-end">
                        <p className="text-xl font-black px-2 mb-2">참여 방법</p>
                        
                        {/* Mission 01 */}
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-sm border border-white/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group hover:scale-[1.01] transition-all"
                        >
                            <div className="flex items-start sm:items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-brand-red text-white flex items-center justify-center font-black shrink-0 shadow-md">1</div>
                                <p className="font-extrabold text-base sm:text-base leading-tight py-1">네이버/카카오 방문자 사진 리뷰 작성</p>
                            </div>
                            <div className="flex gap-2 shrink-0 ml-14 sm:ml-0">
                                <a href={STORE_INFO.naverReviewUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-[#03C75A] text-white text-[10px] sm:text-[11px] font-black rounded-lg shadow-sm hover:brightness-105 transition-all flex items-center gap-1">
                                    네이버 리뷰 <ChevronRight size={12} />
                                </a>
                                <a href={STORE_INFO.kakaoReviewUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-[#FEE500] text-[#3C1E1E] text-[10px] sm:text-[11px] font-black rounded-lg shadow-sm hover:brightness-105 transition-all flex items-center gap-1">
                                    카카오 리뷰 <ChevronRight size={12} />
                                </a>
                            </div>
                        </motion.div>

                        {/* Mission 02 */}
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-sm border border-white/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group hover:scale-[1.01] transition-all"
                        >
                            <div className="flex items-start sm:items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-brand-red text-white flex items-center justify-center font-black shrink-0 shadow-md">2</div>
                                <p className="font-extrabold text-base sm:text-base leading-tight py-1">인스타그램 필수 해시태그 포함 포스팅</p>
                            </div>
                            <div className="ml-14 sm:ml-0">
                                <a href={STORE_INFO.instagramUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 inline-flex px-3 py-1.5 bg-gradient-to-tr from-[#FFDC80] via-[#E1306C] to-[#405DE6] text-white text-[10px] sm:text-[11px] font-black rounded-lg shadow-sm hover:brightness-105 transition-all items-center gap-1.5">
                                    <Instagram size={14} /> 인스타그램 <ChevronRight size={12} />
                                </a>
                            </div>
                        </motion.div>

                        {/* 해시태그 안내 */}
                        <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-5 sm:p-6 border border-white/30 space-y-4">
                            <div>
                                <p className="text-[11px] font-black text-brand-red mb-2 px-1">필수 해시태그</p>
                                <div className="flex flex-wrap gap-2">
                                    {['#한마음식당', '#독산동맛집', '#한마음식당리뷰'].map(tag => (
                                        <span key={tag} className="px-3 py-1 bg-[#EE4D4D] text-white rounded-full text-[10px] sm:text-[11px] font-black shadow-sm">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            
                            <div>
                                <p className="text-[11px] font-black text-brand/60 mb-2 px-1">추천 해시태그</p>
                                <div className="flex flex-wrap gap-2">
                                    {['#독산동백반', '#금천구맛집', '#점심추천', '#동네맛집'].map(tag => (
                                        <span key={tag} className="px-3 py-1 bg-[#FDE68A] text-brand/80 rounded-full text-[10px] sm:text-[11px] font-black shadow-sm border border-brand/5">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default RewardsSection;

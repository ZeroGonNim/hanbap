import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Instagram, Calendar, Sparkles } from 'lucide-react';

interface PromoData {
    lastUpdated: string;
    postType: string;
    itemName: string;
    imageUrl: string;
    caption: string;
}

const TodayPromo: React.FC = () => {
    const [promo, setPromo] = useState<PromoData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPromo = async () => {
            try {
                const response = await fetch('/data/today_promo.json');
                if (response.ok) {
                    const data = await response.json();
                    setPromo(data);
                }
            } catch (error) {
                console.error('Failed to fetch today promo:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPromo();
    }, []);

    if (isLoading || !promo || !promo.itemName) return null;

    // KST 시간 포맷 (오늘인지 확인)
    const postDate = new Date(promo.lastUpdated);
    const isToday = new Date().toDateString() === postDate.toDateString();

    return (
        <AnimatePresence>
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-6 mb-12"
            >
                <div className="max-w-4xl mx-auto bg-white rounded-[32px] overflow-hidden shadow-premium border border-warm-beige/50 flex flex-col md:flex-row">
                    {/* 이미지 영역 */}
                    <div className="w-full md:w-1/2 h-64 md:h-auto relative">
                        <img 
                            src={promo.imageUrl} 
                            alt={promo.itemName}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute top-4 left-4 bg-secondary text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-2 backdrop-blur-md">
                            <Instagram size={14} />
                            <span>인스타그램 추천</span>
                        </div>
                    </div>

                    {/* 텍스트 영역 */}
                    <div className="w-full md:w-1/2 p-8 flex flex-col justify-center bg-boneWhite/30">
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="text-secondary" size={20} />
                            <span className="text-secondary font-bold text-sm tracking-wider uppercase">Today's Special</span>
                        </div>
                        
                        <h3 className="text-3xl font-black text-brand mb-4 leading-tight">
                            오늘의 {promo.postType === 'MENU' ? '추천 메뉴' : '인기 리뷰'}
                        </h3>
                        
                        <div className="bg-white/80 p-5 rounded-2xl border border-warm-beige mb-6 shadow-sm">
                            <p className="text-brand/90 font-bold text-lg mb-2">
                                {promo.itemName}
                            </p>
                            <p className="text-brand/70 text-sm line-clamp-3 leading-relaxed italic">
                                "{promo.caption.split('\n')[0]}"
                            </p>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-brand/50 text-xs font-medium">
                                <Calendar size={14} />
                                <span>{isToday ? '오늘 업로드됨' : postDate.toLocaleDateString()}</span>
                            </div>
                            <a 
                                href="https://www.instagram.com/hanbap_doksan/" 
                                target="_blank" 
                                rel="noreferrer"
                                className="text-secondary font-bold text-sm flex items-center gap-1 hover:underline"
                            >
                                인스타에서 보기 →
                            </a>
                        </div>
                    </div>
                </div>
            </motion.section>
        </AnimatePresence>
    );
};

export default TodayPromo;

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronRight, RefreshCw } from 'lucide-react';
import { STORE_INFO } from '../constants/storeInfo';

interface Review {
    author: string;
    platform: string;
    rating: number;
    content: string;
    date: string;
}

interface ReviewsSectionProps {
    reviews: Review[];
}

const ReviewsSection: React.FC<ReviewsSectionProps> = ({ reviews }) => {
    const [hasShuffled, setHasShuffled] = useState(false);
    
    // 초기 상태에서 정렬된 리뷰를 바로 보유하도록 설정하여 (오른쪽 스크롤 밀림(Anchoring) 방지)
    const [displayReviews, setDisplayReviews] = useState<Review[]>(() => {
        if (reviews.length > 0) {
            const latest = [...reviews].sort((a, b) => 
                new Date(b.date.replace(/\./g, '-')).getTime() - new Date(a.date.replace(/\./g, '-')).getTime()
            );
            return latest.slice(0, 6);
        }
        return [];
    });
    const [isRefreshing, setIsRefreshing] = useState(false);

    // 초기 로딩: 최신순 정렬
    useEffect(() => {
        if (reviews.length > 0 && !hasShuffled) {
            const latest = [...reviews].sort((a, b) => 
                new Date(b.date.replace(/\./g, '-')).getTime() - new Date(a.date.replace(/\./g, '-')).getTime()
            );
            setDisplayReviews(latest.slice(0, 6));
        }
    }, [reviews, hasShuffled]);

    // 리뷰 무작위 셔플 함수 (이후 새로고침 시 호출)
    const shuffleReviews = useCallback((e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
        }
        setIsRefreshing(true);
        setHasShuffled(true);
        setTimeout(() => {
            const shuffled = [...reviews].sort(() => Math.random() - 0.5);
            setDisplayReviews(shuffled.slice(0, 6));
            setIsRefreshing(false);
            
            // 셔플 직후 가로 스크롤 영역을 맨 처음(좌측)으로 원복
            const container = document.getElementById('reviews-container');
            if (container) {
                container.scrollTo({ left: 0, behavior: 'smooth' });
            }
        }, 300); // UI 깜빡임을 방지하기 위해 딜레이 단축 (500 -> 300)
    }, [reviews]);

    const getPlatformUrl = (platform: string) => {
        switch (platform) {
            case 'Naver': return STORE_INFO.naverReviewUrl;
            case 'Kakao': return STORE_INFO.kakaoReviewUrl;
            case 'Google': return STORE_INFO.googleReviewUrl; // ""일 경우 링크 없음
            default: return "";
        }
    };

    return (
        <section className="px-6 mb-20">
            <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="text-3xl font-black text-brand mb-10 text-center flex items-center justify-center gap-3 tracking-tight"
            >
                <Star className="text-accent fill-accent" size={28} />
                <span className="text-brand">생생한 방문 후기</span>
            </motion.h2>

            <div 
                id="reviews-container"
                className="flex overflow-x-auto pb-8 -mx-6 px-6 gap-6 md:grid md:grid-cols-2 lg:grid-cols-3 md:pb-0 md:mx-0 md:px-0 snap-x snap-mandatory scrollbar-hide min-h-[300px]"
            >
                <AnimatePresence mode="wait">
                    {displayReviews.map((review, i) => {
                        const platformColors: Record<string, { bg: string, text: string }> = {
                            'Kakao': { bg: 'bg-[#FEE500]', text: 'text-black' },
                            'Naver': { bg: 'bg-[#03C75A]', text: 'text-white' },
                            'Google': { bg: 'bg-[#4285F4]', text: 'text-white' },
                        };
                        const color = platformColors[review.platform] || { bg: 'bg-brand', text: 'text-white' };
                        const url = getPlatformUrl(review.platform);

                        const CardContent = (
                            <div
                                className={`h-full bg-white p-8 rounded-[32px] shadow-soft flex flex-col justify-between border border-brand/5 ${url ? 'hover:shadow-lg hover:-translate-y-1' : ''} transition-all snap-center group`}
                            >
                                <div className="text-left">
                                    <div className="flex justify-between items-center mb-6">
                                        <span className={`text-[10px] font-black ${color.bg} ${color.text} px-2.5 py-1 rounded-full uppercase tracking-widest`}>
                                            {review.platform}
                                        </span>
                                        <div className="flex gap-0.5">
                                            {[...Array(review.rating)].map((_, starIdx) => (
                                                <Star key={starIdx} size={12} className="fill-secondary text-secondary" />
                                            ))}
                                        </div>
                                    </div>
                                    <p className={`text-brand text-lg leading-relaxed mb-6 font-bold italic ${url ? 'group-hover:text-secondary' : ''} transition-colors`}>"{review.content}"</p>
                                </div>
                                <div className="flex justify-between items-center mt-auto pt-4 border-t border-brand/5">
                                    <span className="text-brand/80 text-xs font-black">— {review.author}</span>
                                    <span className="text-brand/50 text-[10px] font-bold">{review.date}</span>
                                </div>
                            </div>
                        );

                        return (
                            <motion.div
                                key={`${review.author}-${i}-${hasShuffled ? 'shuffled' : 'initial'}`}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3 }}
                                className="min-w-[85vw] w-full md:min-w-0"
                            >
                                {url ? (
                                    <a href={url} target="_blank" rel="noopener noreferrer" className="block h-full">
                                        {CardContent}
                                    </a>
                                ) : (
                                    CardContent
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="min-w-[40vw] md:min-w-0"
                >
                    <button
                        type="button"
                        onClick={shuffleReviews}
                        disabled={isRefreshing}
                        className="w-full flex flex-col items-center justify-center p-8 text-brand/40 font-black text-sm bg-white/50 rounded-[32px] border-4 border-dashed border-brand/10 hover:border-secondary hover:text-secondary transition-all cursor-pointer snap-center h-full group"
                    >
                        <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center mb-3 shadow-sm group-hover:rotate-180 transition-transform duration-500">
                            {isRefreshing ? <RefreshCw size={24} className="animate-spin text-secondary" /> : <ChevronRight size={24} />}
                        </div>
                        <span className="text-center">새로운 리뷰<br/>불러오기</span>
                    </button>
                </motion.div>
            </div>
        </section>
    );
};

export default ReviewsSection;

import React, { useState, useCallback, useRef, useEffect } from 'react';
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

const PLATFORM_STYLES: Record<string, { borderColor: string; color: string; bg?: string }> = {
    'Naver':  { borderColor: '#03C75A', color: '#03C75A' },
    'Kakao':  { borderColor: '#FEE500', color: '#3C1E1E', bg: '#FEE500' },
    'Google': { borderColor: '#4285F4', color: '#4285F4' },
};

const ReviewsSection = React.memo<ReviewsSectionProps>(({ reviews }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const [displayReviews, setDisplayReviews] = useState<Review[]>([]);

    useEffect(() => {
        if (reviews.length > 0) {
            const sorted = [...reviews].sort((a, b) =>
                new Date(b.date.replace(/\./g, '-')).getTime() - new Date(a.date.replace(/\./g, '-')).getTime()
            );
            setDisplayReviews(sorted.slice(0, 6));
        }
    }, [reviews]);

    const shuffleReviews = useCallback(() => {
        setIsRefreshing(true);
        setTimeout(() => {
            const shuffled = [...reviews].sort(() => Math.random() - 0.5);
            setDisplayReviews(shuffled.slice(0, 6));
            setIsRefreshing(false);
            containerRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
        }, 300);
    }, [reviews]);

    const getPlatformUrl = (platform: string) => {
        switch (platform) {
            case 'Naver':  return STORE_INFO.naverReviewUrl;
            case 'Kakao':  return STORE_INFO.kakaoReviewUrl;
            case 'Google': return STORE_INFO.googleReviewUrl;
            default:       return '';
        }
    };

    return (
        <section className="py-12 md:py-14 bg-hb-cream border-t border-hb-border border-b">
            <div className="text-center mb-8 px-8">
                <span className="text-hb-gold font-black text-[0.8rem] tracking-[0.2em] font-sans-kr">
                    LATEST REVIEWS
                </span>
                <h2 className="text-[2rem] font-black mt-4">
                    {reviews.length > 0 ? `${reviews.length}명이 인정한 맛` : '방문 후기'}
                </h2>
            </div>

            <div
                ref={containerRef}
                className="flex overflow-x-auto gap-4 px-5 pb-8 scrollbar-none"
                style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
            >
                {displayReviews.map((review) => {
                    const style = PLATFORM_STYLES[review.platform] ?? { borderColor: '#E8D5C0', color: '#8C7160' };
                    const url = getPlatformUrl(review.platform);
                    const stars = '★'.repeat(Math.min(review.rating, 5));

                    const card = (
                        <div className="bg-white border border-hb-border p-7 flex flex-col min-w-[240px] w-[calc(100vw-5rem)] max-w-[310px] flex-shrink-0 md:min-w-[320px]"
                             style={{ scrollSnapAlign: 'center' }}>
                            <div className="flex justify-between mb-4">
                                <span
                                    className="border text-[0.65rem] font-black px-2 py-0.5 font-sans-kr"
                                    style={{
                                        borderColor: style.borderColor,
                                        color: style.bg ? style.color : style.color,
                                        background: style.bg ?? 'transparent',
                                    }}
                                >
                                    {review.platform.toUpperCase()}
                                </span>
                                <span className="text-hb-gold text-[0.8rem]">{stars}</span>
                            </div>
                            <p className="text-base leading-[1.7] font-bold h-20 overflow-hidden">
                                "{review.content}"
                            </p>
                            <div className="mt-4 text-[0.8rem] text-hb-muted">
                                — {review.author}
                            </div>
                        </div>
                    );

                    return url ? (
                        <a key={`${review.author}-${review.date}`} href={url} target="_blank" rel="noopener noreferrer">
                            {card}
                        </a>
                    ) : (
                        <div key={`${review.author}-${review.date}`}>{card}</div>
                    );
                })}
            </div>

            <div className="text-center mt-2">
                <button
                    onClick={shuffleReviews}
                    disabled={isRefreshing || reviews.length === 0}
                    className="bg-transparent border border-hb-border px-6 py-2 rounded-full text-[0.85rem] text-hb-muted font-bold hover:border-hb-gold hover:text-hb-gold transition-colors font-sans-kr disabled:opacity-40"
                >
                    {isRefreshing ? '불러오는 중...' : '새로운 리뷰 보기 ↻'}
                </button>
            </div>
        </section>
    );
});

ReviewsSection.displayName = 'ReviewsSection';
export default ReviewsSection;

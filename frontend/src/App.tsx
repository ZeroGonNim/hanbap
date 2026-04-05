import React, { useState, useCallback, lazy, Suspense, useEffect, useRef } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { Phone, Share2, MapPin, Instagram, MessageCircle } from 'lucide-react';

// Components
import HeroSection from './components/HeroSection';
import TodayPromo from './components/TodayPromo';
import SignatureMenus from './components/SignatureMenus';
import RewardsSection from './components/RewardsSection';
import ReviewsSection from './components/ReviewsSection';
import Footer from './components/Footer';
import Toast from './components/Toast';

// Lazy Components
const FullMenuModal = lazy(() => import('./components/FullMenuModal'));
const LocationModal = lazy(() => import('./components/LocationModal'));

// Data & Stores
import { STORE_INFO } from './constants/storeInfo';
import { MENU_DATA } from './data/menuData';
import { REVIEW_DATA } from './data/reviewData'; // 정적 폴백 (fetch 실패 시 사용)
import { useToastStore } from './stores/useToastStore';
import type { Review } from './types';

const App = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLocationOpen, setIsLocationOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [reviewData, setReviewData] = useState<Review[]>([]);
    const showToast = useToastStore((state) => state.showToast);
    
    // Progress bar for editorial reading feel
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    // JSON Feed: 런타임 동적 로드 (pipeline이 reviews.json 업데이트 시 rebuild 없이 반영)
    useEffect(() => {
        fetch('/data/reviews.json')
            .then(res => { if (!res.ok) throw new Error('fetch failed'); return res.json(); })
            .then((data: Review[]) => setReviewData(data))
            .catch(() => setReviewData(REVIEW_DATA)); // 정적 폴백
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
            
            // Native Reveal Implementation
            const reveals = document.querySelectorAll('.reveal-on-scroll');
            reveals.forEach(el => {
                const windowHeight = window.innerHeight;
                const revealTop = el.getBoundingClientRect().top;
                const revealPoint = 150;
                if (revealTop < windowHeight - revealPoint) {
                    el.classList.add('active');
                }
            });
        };
        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Initial check
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleCloseMenu = useCallback(() => setIsMenuOpen(false), []);
    const handleCloseLocation = useCallback(() => setIsLocationOpen(false), []);
    const handleOpenMenu = useCallback(() => setIsMenuOpen(true), []);
    const handleOpenLocation = useCallback(() => setIsLocationOpen(true), []);

    const handleShare = useCallback(async () => {
        const url = window.location.href;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: STORE_INFO.name,
                    text: STORE_INFO.shareText,
                    url: url,
                });
            } catch { /* 사용자가 공유를 취소한 경우 — 무시 */ }
        } else {
            try {
                await navigator.clipboard.writeText(url);
                showToast('링크가 복사되었습니다!');
            } catch (err) {
                showToast('링크 복사에 실패했습니다.');
            }
        }
    }, [showToast]);

    return (
        <div className="relative min-h-[100dvh] bg-hb-cream font-serif-kr text-hb-brown selection:bg-hb-red selection:text-white overflow-x-hidden">
            {/* Supanova Paper Texture */}
            <div className="paper-texture" />

            {/* Premium Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-[3px] bg-hb-red origin-left z-[100]"
                style={{ scaleX }}
            />

            {/* Navigation Overlay (Minimal & Floating) */}
            <AnimatePresence>
                {isScrolled && (
                    <motion.nav
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -100, opacity: 0 }}
                        className="fixed top-6 left-1/2 -translate-x-1/2 z-[90] w-[calc(100%-2rem)] max-w-lg"
                    >
                        <div className="bg-hb-cream/80 backdrop-blur-xl border border-hb-border rounded-full p-2 px-6 flex justify-between items-center shadow-premium ring-1 ring-black/5">
                            <span className="font-black text-lg tracking-tighter">한마음식당</span>
                            <div className="flex gap-4">
                                <button onClick={handleOpenMenu} className="text-xs font-bold hover:text-hb-red transition-colors">차림표</button>
                                <button onClick={handleOpenLocation} className="text-xs font-bold hover:text-hb-red transition-colors">오시는길</button>
                            </div>
                        </div>
                    </motion.nav>
                )}
            </AnimatePresence>

            <Suspense fallback={null}>
                {isMenuOpen && <FullMenuModal isOpen={isMenuOpen} onClose={handleCloseMenu} menuData={MENU_DATA} />}
                {isLocationOpen && <LocationModal isOpen={isLocationOpen} onClose={handleCloseLocation} />}
            </Suspense>

            {/* Main Content */}
            <main className="relative z-10 max-w-3xl mx-auto">
                <HeroSection marketingCopy={STORE_INFO.marketingCopy} />
                
                <section className="reveal-on-scroll">
                    <TodayPromo />
                </section>

                <section className="reveal-on-scroll">
                    <SignatureMenus onOpenFullMenu={handleOpenMenu} />
                </section>

                <section className="reveal-on-scroll">
                    <RewardsSection />
                </section>

                <section className="reveal-on-scroll">
                    <ReviewsSection reviews={reviewData} />
                </section>

                {/* Editorial Call to Actions */}
                <section className="px-6 py-20 reveal-on-scroll">
                    <div className="bg-hb-beige p-10 rounded-[2.5rem] border border-hb-border relative overflow-hidden group">
                        <div className="relative z-10 text-center">
                            <span className="text-hb-gold font-bold text-xs tracking-wide-editorial uppercase mb-4 block">Reservation & Guide</span>
                            <h3 className="text-3xl font-black mb-10 leading-tight">낡은 문 너머의<br/>진한 여운을 경험하세요</h3>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <a 
                                    href={`tel:${STORE_INFO.phone}`} 
                                    className="flex items-center justify-center gap-3 bg-hb-brown text-hb-cream p-5 rounded-2xl font-bold hover:bg-hb-brown/90 transition-all shadow-premium"
                                >
                                    <Phone size={20} />
                                    <span>지금 전화로 예약하기</span>
                                </a>
                                <button 
                                    onClick={handleOpenLocation}
                                    className="flex items-center justify-center gap-3 bg-white text-hb-brown p-5 rounded-2xl font-bold hover:bg-hb-cream transition-all border border-hb-border shadow-soft"
                                >
                                    <MapPin size={20} />
                                    <span>매장 위치 확인하기</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer onShare={handleShare} />
            <Toast />

            {/* Floating Action Buttons */}
            <div className="fixed bottom-8 right-8 z-[80] flex flex-col gap-4">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleShare}
                    className="w-12 h-12 bg-white text-hb-brown rounded-full shadow-premium flex items-center justify-center border border-hb-border"
                    aria-label="공유하기"
                >
                    <Share2 size={20} />
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => showToast('상담 서비스 준비 중입니다...')}
                    className="w-14 h-14 bg-hb-red text-white rounded-full shadow-premium flex items-center justify-center ring-4 ring-hb-cream"
                    aria-label="채팅 상담"
                >
                    <MessageCircle size={28} />
                </motion.button>
            </div>

            <Analytics />
        </div>
    );
};

export default App;

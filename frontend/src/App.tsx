import React, { useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { motion } from 'framer-motion';
import { MessageCircle, Phone, MapPin } from 'lucide-react';
import Navigation from './components/Navigation';
import HeroSection from './components/HeroSection';
import TodayPromo from './components/TodayPromo';
import SignatureMenus from './components/SignatureMenus';
import RewardsSection from './components/RewardsSection';
import ReviewsSection from './components/ReviewsSection';
import Footer from './components/Footer';
import FullMenuModal from './components/FullMenuModal';
import LocationModal from './components/LocationModal';
import Toast from './components/Toast';

import { STORE_INFO } from './constants/storeInfo';
import { MENU_DATA } from './data/menuData';
import { REVIEW_DATA } from './data/reviewData';
import { useToastStore } from './stores/useToastStore';

const App = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLocationOpen, setIsLocationOpen] = useState(false);
    const { showToast } = useToastStore();

    const handleShare = async () => {
        const url = window.location.href;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: STORE_INFO.name,
                    text: STORE_INFO.shareText,
                    url: url,
                });
            } catch (err) {
                console.log('Share failed:', err);
            }
        } else {
            try {
                if (navigator.clipboard && window.isSecureContext) {
                    await navigator.clipboard.writeText(url);
                    alert('링크가 복사되었습니다!');
                } else {
                    throw new Error('Fallback');
                }
            } catch (err) {
                const el = document.createElement('textarea');
                el.value = url;
                document.body.appendChild(el);
                el.select();
                document.execCommand('copy');
                document.body.removeChild(el);
                alert('링크가 복사되었습니다!');
            }
        }
    };

    return (
        <div className='min-h-screen bg-warm-beige font-sans selection:bg-secondary selection:text-white text-brand'>
            <FullMenuModal isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} menuData={MENU_DATA} />
            <LocationModal isOpen={isLocationOpen} onClose={() => setIsLocationOpen(false)} />
            <Navigation />

            <main className='max-w-7xl mx-auto pb-20'>
                <HeroSection marketingCopy={STORE_INFO.marketingCopy} />
                <TodayPromo />
                <SignatureMenus onOpenFullMenu={() => setIsMenuOpen(true)} />
                <RewardsSection />
                <ReviewsSection reviews={REVIEW_DATA} />
                <section className='px-6'>
                    <div className='grid grid-cols-2 gap-4'>
                        <a href={`tel:${STORE_INFO.phone}`} className='bg-white p-6 rounded-3xl shadow-soft flex flex-col items-center gap-3 active:scale-95 transition-all text-brand'>
                            <Phone className='text-secondary' />
                            <span className='text-xs font-bold'>전화 문의</span>
                        </a>
                        <button
                            onClick={() => setIsLocationOpen(true)}
                            className='bg-white p-6 rounded-3xl shadow-soft flex flex-col items-center gap-3 active:scale-95 transition-all text-brand'
                        >
                            <MapPin className='text-secondary' />
                            <span className='text-xs font-bold'>오시는 길</span>
                        </button>
                    </div>
                </section>
            </main>

            <Footer onShare={handleShare} />
            <Toast />

            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className='fixed bottom-6 right-6 z-50'>
                <button
                    onClick={() => showToast('상담 채널 서비스 준비중입니다... 😊')}
                    className='bg-secondary text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-secondary/90 transition-all border-4 border-warm-beige'
                >
                </button>
            </motion.div>
            <Analytics />
        </div>
    );
};

export default App;

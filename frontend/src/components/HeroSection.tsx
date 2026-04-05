import React from 'react';
import { motion } from 'framer-motion';

const HeroSection = React.memo(({ marketingCopy }: { marketingCopy?: string }) => {
    return (
        <section className="relative pt-24 pb-16 px-6 text-center">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-xl mx-auto border border-hb-gold/30 p-12 md:p-16 relative"
            >
                {/* Decorative Corners */}
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t border-l border-hb-gold" />
                <div className="absolute -top-1 -right-1 w-4 h-4 border-t border-r border-hb-gold" />
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b border-l border-hb-gold" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b border-r border-hb-gold" />

                <div className="text-hb-gold font-bold text-[0.7rem] tracking-[0.4em] mb-6 uppercase">
                    Since 1990 — Doksan
                </div>
                
                <h1 className="text-6xl md:text-7xl font-black leading-[1.1] mb-8 tracking-ultra-tight">
                    한마음<br/>식당
                </h1>
                
                <div className="w-10 h-[1px] bg-hb-brown mx-auto mb-8" />
                
                <p className="text-lg md:text-xl text-hb-muted italic font-serif-kr leading-relaxed">
                    "낡은 문 너머,<br/>일품의 맛이 머무는 곳"
                </p>
            </motion.div>

            {/* Sub-Visual Badge (Floating) */}
            <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 1 }}
                className="hidden md:block absolute top-40 -right-4 bg-hb-red text-white py-6 px-3 font-black text-[0.65rem] tracking-[0.3em] [writing-mode:vertical-rl] shadow-premium"
            >
                30年 眞心 誠心
            </motion.div>
        </section>
    );
});

HeroSection.displayName = 'HeroSection';
export default HeroSection;

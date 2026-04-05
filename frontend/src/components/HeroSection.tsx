import React from 'react';
import { motion } from 'framer-motion';

const HeroSection = React.memo(({ marketingCopy }: { marketingCopy?: string }) => {
    return (
        <section className="py-14 md:py-18 px-8 text-center bg-hb-beige border-b border-hb-border">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="border border-hb-gold max-w-[480px] mx-auto py-10 px-4 md:py-12 md:px-8 relative"
            >
                <div className="text-hb-gold font-bold text-[0.8rem] tracking-[0.3em] mb-3 uppercase font-sans-kr">
                    SINCE 1990
                </div>

                <h1 className="text-[3.5rem] md:text-[4.5rem] font-black leading-[1.1] tracking-tight">
                    한마음<br />식당
                </h1>

                <div className="w-[30px] h-[1px] bg-hb-brown mx-auto my-5" />

                <p className="text-[1.1rem] text-hb-muted font-serif-kr">
                    "낡은 문 너머, 일품의 맛"
                </p>
            </motion.div>
        </section>
    );
});

HeroSection.displayName = 'HeroSection';
export default HeroSection;

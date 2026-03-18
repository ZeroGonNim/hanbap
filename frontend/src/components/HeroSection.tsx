import React from 'react';
import { motion } from 'framer-motion';

interface HeroSectionProps {
    marketingCopy: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ marketingCopy }) => {
    return (
        <section className="relative min-h-[600px] flex items-center pt-24 px-6 mb-16 overflow-hidden">
            <div className="absolute inset-0 z-0">
                <img
                    src="/assets/real_store_front.png"
                    alt="한마음식당 매장 외관"
                    fetchPriority="high"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-warm-beige via-warm-beige/60 to-transparent" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="max-w-md mx-auto relative z-10 w-full"
            >
                <div className="bg-white/95 backdrop-blur-md p-10 rounded-[32px] shadow-[0_0_40px_-10px_rgba(255,215,0,0.3)] text-center border border-white/40">
                    <h1 className="text-4xl md:text-5xl font-black text-brand tracking-tight leading-tight mb-6">
                        한마음식당 <br />
                        <span className="text-brand-red underline decoration-secondary/50 underline-offset-8">독산동 따뜻한 집밥</span>
                    </h1>
                    <p className="text-brand/90 leading-relaxed px-2 font-bold text-lg">
                        {marketingCopy}
                    </p>
                </div>
            </motion.div>
        </section>
    );
};

export default HeroSection;

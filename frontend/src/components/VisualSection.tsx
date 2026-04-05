import React from 'react';
import { motion } from 'framer-motion';

const VISUAL_IMAGE_URL = 'https://lh3.googleusercontent.com/d/15sIvSOnbuX3jTwibMgBAKRCGZ7ZKEfzC';

const VisualSection = React.memo(() => {
    return (
        <section className="py-12 md:py-14 px-8 md:px-12 bg-white max-w-[720px] mx-auto">
            <div className="relative mb-8">
                <motion.div
                    initial={{ opacity: 0, scale: 1.02 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    viewport={{ once: true }}
                    className="w-full h-[400px] md:h-[500px] bg-hb-border rounded-[2px] overflow-hidden"
                    style={{
                        backgroundImage: `url('${VISUAL_IMAGE_URL}')`,
                        backgroundPosition: 'center',
                        backgroundSize: 'cover',
                    }}
                />
                <div
                    className="absolute top-5 right-5 bg-hb-red text-white py-4 px-[0.6rem] font-black text-[0.8rem] tracking-[0.2em] shadow-lg"
                    style={{ writingMode: 'vertical-rl' }}
                >
                    30年 眞心
                </div>
            </div>

            <div className="text-center">
                <h2 className="text-2xl font-black text-hb-red mb-2">허름함 뒤의 정갈함</h2>
                <p className="text-base leading-[1.9] text-[#666]">
                    건물은 낡았지만, 매일 아침 사장님이 직접 닦아 윤이 나는 식탁.<br />
                    그 고집스러운 청결함이 맛의 기본입니다.
                </p>
            </div>
        </section>
    );
});

VisualSection.displayName = 'VisualSection';
export default VisualSection;

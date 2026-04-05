import React from 'react';
import { motion } from 'framer-motion';
import { Utensils, Menu } from 'lucide-react';

interface SignatureMenusProps {
    onOpenFullMenu: () => void;
}

const SIGNATURES = [
    { name: "오삼불고기", price: "13,000", desc: "매콤달콤한 소스와 불향의 완벽한 조화" },
    { name: "제육볶음", price: "12,000", desc: "단골들이 보증하는 밥도둑 정석" }
];

const SignatureMenus = React.memo<SignatureMenusProps>(({ onOpenFullMenu }) => {
    return (
        <section className="px-6 mb-16">
            <h2 className="text-4xl font-black text-brand mb-10 text-center flex items-center justify-center gap-3 tracking-tight">
                <Utensils className="text-brand-red" size={32} />
                대표 메뉴
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                {SIGNATURES.map((menu) => (
                    <motion.div
                        key={menu.name}
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="bg-accent/5 p-6 rounded-3xl shadow-md flex justify-between items-center border-l-4 border-accent transition-all hover:bg-accent/10"
                    >
                        <div className="text-left">
                            <h3 className="text-xl font-black text-brand mb-1">{menu.name}</h3>
                            <p className="text-brand/80 text-sm font-medium">{menu.desc}</p>
                        </div>
                        <span className="text-brand-red font-black text-xl">₩{menu.price}</span>
                    </motion.div>
                ))}
            </div>

            <button
                onClick={onOpenFullMenu}
                className="w-full py-4 border-2 border-secondary bg-white rounded-2xl text-brand font-black flex items-center justify-center gap-2 hover:bg-secondary/10 transition-all shadow-sm"
            >
                <Menu size={20} className="text-secondary" />
                전체 메뉴 보기
            </button>
        </section>
    );
});

SignatureMenus.displayName = 'SignatureMenus';
export default SignatureMenus;

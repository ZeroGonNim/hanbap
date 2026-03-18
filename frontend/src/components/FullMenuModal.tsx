import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

import { MenuCategory } from '../types';

interface FullMenuModalProps {
    isOpen: boolean;
    onClose: () => void;
    menuData: MenuCategory[];
}

const FullMenuModal: React.FC<FullMenuModalProps> = ({ isOpen, onClose, menuData }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] bg-brand/90 backdrop-blur-xl p-6 flex flex-col justify-center"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-[40px] p-8 shadow-2xl relative overflow-hidden max-w-lg mx-auto w-full max-h-[90vh] flex flex-col"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-brand/5 flex items-center justify-center text-brand hover:bg-brand/10 transition-all z-10"
                        >
                            <X size={20} />
                        </button>

                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-serif font-bold text-brand mb-2">전체 메뉴</h2>
                            <p className="text-brand/70 text-sm italic">다양하고 정갈한 메뉴를 확인해보세요</p>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 space-y-10 mb-8 scrollbar-hide">
                            {menuData.map((cat, idx) => (
                                <div key={idx} className="space-y-6">
                                    <h3 className="text-brand font-serif text-xl border-b border-secondary/50 pb-2 text-left font-black">{cat.category}</h3>
                                    <div className="grid gap-6">
                                        {cat.items.map((item, i) => (
                                            <div key={i} className="flex justify-between items-baseline gap-4">
                                                <div className="flex-1 text-left">
                                                    <h4 className="text-brand font-bold text-base mb-0.5">{item.name}</h4>
                                                    <p className="text-brand/60 text-[11px] leading-tight">{item.desc}</p>
                                                </div>
                                                <span className="text-brand-red font-black text-lg">₩{item.price}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={onClose}
                            className="w-full bg-brand text-white font-bold py-4 rounded-2xl flex items-center justify-center hover:bg-brand/90 transition-all shadow-xl active:scale-[0.98]"
                        >
                            돌아가기
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default FullMenuModal;

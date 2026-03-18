import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToastStore } from '../stores/useToastStore';
import { Info } from 'lucide-react';

const Toast: React.FC = () => {
    const { message, isVisible } = useToastStore();

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-48px)] max-w-sm"
                >
                    <div className="bg-brand text-white px-6 py-4 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-3 backdrop-blur-lg">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                            <Info size={18} />
                        </div>
                        <p className="font-bold text-sm leading-tight">{message}</p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Toast;

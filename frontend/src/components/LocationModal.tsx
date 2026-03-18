import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Clock, Car } from 'lucide-react';

import { STORE_INFO } from '../constants/storeInfo';

interface LocationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const LocationModal: React.FC<LocationModalProps> = ({ isOpen, onClose }) => {
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
                        className="bg-white rounded-[40px] p-8 shadow-2xl relative overflow-hidden max-w-lg mx-auto w-full"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-brand/5 flex items-center justify-center text-brand hover:bg-brand/10 transition-all z-10"
                        >
                            <X size={20} />
                        </button>

                        <div className="space-y-8">
                            <div className="text-center">
                                <h2 className="text-3xl font-serif font-bold text-brand mb-2">오시는 길</h2>
                                <p className="text-brand/70 text-sm italic mb-6">정성을 다해 모시겠습니다</p>
                            </div>

                            <a
                                href={STORE_INFO.mapUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-3xl overflow-hidden border border-brand/5 shadow-inner mb-8 bg-brand/5 aspect-video relative group flex items-center justify-center block hover:opacity-90 transition-opacity cursor-pointer"
                            >
                                <img
                                    src="/assets/location_map.png"
                                    alt="오시는 길 지도"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="bg-white/90 text-brand px-4 py-2 rounded-full text-sm font-bold shadow-lg backdrop-blur-sm">
                                        지도로 이동
                                    </span>
                                </div>
                            </a>

                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-2xl bg-brand/10 flex items-center justify-center text-brand shrink-0">
                                        <MapPin size={20} />
                                    </div>
                                    <div className="text-left">
                                        <h4 className="text-[10px] font-bold text-brand/60 uppercase tracking-widest mb-1">주소</h4>
                                        <p className="text-brand font-bold text-left">{STORE_INFO.address}</p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-2xl bg-brand/10 flex items-center justify-center text-brand shrink-0">
                                        <Clock size={20} />
                                    </div>
                                    <div className="text-left">
                                        <h4 className="text-[10px] font-bold text-brand/60 uppercase tracking-widest mb-1">영업시간</h4>
                                        <p className="text-brand font-bold">{STORE_INFO. businessHours}</p>
                                        <p className="text-brand/80 text-xs mt-0.5">브레이크타임 {STORE_INFO.breakTime}</p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-2xl bg-brand/10 flex items-center justify-center text-brand shrink-0">
                                        <Car size={20} />
                                    </div>
                                    <div className="text-left">
                                        <h4 className="text-[10px] font-bold text-brand/60 uppercase tracking-widest mb-1">주차 안내</h4>
                                        <p className="text-brand font-bold">{STORE_INFO.parking}</p>
                                        <p className="text-brand/80 text-xs mt-0.5">만차 시 인근 공영주차장을 이용해주세요.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-3 pt-4">
                                <button
                                    onClick={onClose}
                                    className="w-full bg-brand text-white font-bold py-4 rounded-2xl flex items-center justify-center hover:bg-brand/90 transition-all shadow-xl active:scale-[0.98]"
                                >
                                    돌아가기
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default LocationModal;

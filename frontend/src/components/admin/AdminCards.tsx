import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Database, Camera, Globe, Instagram, ChevronRight, Github, ExternalLink } from 'lucide-react';
import { type Stats, type PromoData } from '../../types/admin';
import { getTimeFreshness, formatKST } from '../../utils/adminUtils';
import { StatusDot } from './AdminUI';

// ─── 시스템 상태 카드 ───────────────────────────────────
export function SystemStatusCard({ stats, promo }: { stats: Stats; promo: PromoData | null }) {
    const reviewStatus = getTimeFreshness(stats.lastUpdated);
    const instaStatus = promo ? getTimeFreshness(promo.lastUpdated) : 'dead' as const;
    const statusLabel = { fresh: '정상', stale: '지연', dead: '중단' };

    const items = [
        { name: '리뷰 수집', status: reviewStatus, icon: Database, time: stats.lastUpdated },
        { name: '인스타 포스팅', status: instaStatus, icon: Camera, time: promo?.lastUpdated || '' },
        { name: 'Vercel 배포', status: 'fresh' as const, icon: Globe, time: '' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="bg-[#231c14] rounded-2xl p-4 border border-orange-900/20"
        >
            <div className="flex items-center gap-2 mb-3 text-orange-200/60 font-bold text-xs">
                <Activity size={13} className="text-orange-500" /> 시스템 상태
            </div>
            <div className="flex flex-col gap-2.5">
                {items.map(item => (
                    <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <StatusDot status={item.status} />
                            <item.icon size={13} className="text-orange-200/30" />
                            <span className="text-xs text-orange-100/70">{item.name}</span>
                        </div>
                        <span className={`text-[10px] font-medium ${
                            item.status === 'fresh' ? 'text-emerald-400/70' :
                            item.status === 'stale' ? 'text-amber-400/70' : 'text-red-400/70'
                        }`}>
                            {statusLabel[item.status]}
                        </span>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}

// ─── 인스타그램 현황 카드 ───────────────────────────────
export function InstagramCard({ promo }: { promo: PromoData | null }) {
    if (!promo) return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="bg-[#231c14] rounded-2xl p-4 border border-orange-900/20"
        >
            <div className="flex items-center gap-2 mb-3 text-orange-200/60 font-bold text-xs">
                <Instagram size={13} className="text-orange-500" /> 인스타그램 포스팅
            </div>
            <p className="text-xs text-orange-200/30 text-center py-4">포스팅 데이터 없음</p>
        </motion.div>
    );

    const isToday = new Date().toDateString() === new Date(promo.lastUpdated).toDateString();

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="bg-[#231c14] rounded-2xl overflow-hidden border border-orange-900/20"
        >
            <div className="flex items-center gap-2 px-4 pt-4 pb-3 text-orange-200/60 font-bold text-xs">
                <Instagram size={13} className="text-orange-500" /> 인스타그램 포스팅
                {isToday && (
                    <span className="ml-auto bg-emerald-500/15 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-medium">
                        오늘 발행
                    </span>
                )}
            </div>
            <div className="flex gap-3 px-4 pb-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-[#1a1410]">
                    <img
                        src={promo.imageUrl}
                        alt={promo.itemName}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                        onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.style.display = 'none'; }}
                    />
                </div>
                <div className="flex flex-col justify-center gap-1 min-w-0">
                    <p className="text-sm font-bold text-orange-50 truncate">{promo.itemName}</p>
                    <p className="text-[10px] text-orange-200/30">
                        {promo.postType === 'MENU' ? '메뉴 홍보' : '리뷰 소개'} · {formatKST(promo.lastUpdated).split(' ').pop()}
                    </p>
                    <a
                        href="https://www.instagram.com/hanbap_doksan/"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-orange-400 hover:text-orange-300 flex items-center gap-0.5 w-fit"
                    >
                        인스타에서 보기 <ChevronRight size={10} />
                    </a>
                </div>
            </div>
        </motion.div>
    );
}

// ─── 빠른 링크 ──────────────────────────────────────────
const QUICK_LINKS = [
    { label: 'Instagram', icon: Instagram, href: 'https://www.instagram.com/hanbap_doksan/', color: 'from-pink-600 to-purple-600' },
    { label: 'Actions', icon: Github, href: 'https://github.com/ZeroGonNim/hanbap/actions', color: 'from-gray-600 to-gray-700' },
    { label: 'Vercel', icon: ExternalLink, href: 'https://vercel.com/younggonnim-9194s-projects/hanbap', color: 'from-blue-600 to-cyan-600' },
] as const;

export function QuickLinks() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="grid grid-cols-3 gap-2"
        >
            {QUICK_LINKS.map(link => (
                <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className={`bg-gradient-to-br ${link.color} rounded-xl p-3 flex flex-col items-center gap-1.5 text-white/90 hover:scale-[1.02] active:scale-[0.98] transition-transform`}
                >
                    <link.icon size={16} />
                    <span className="text-[10px] font-medium">{link.label}</span>
                </a>
            ))}
        </motion.div>
    );
}

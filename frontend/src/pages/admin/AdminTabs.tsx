import React from 'react';
import { motion } from 'framer-motion';
import { BarChart2, TrendingUp, MessageSquare, Star, RefreshCw, Database } from 'lucide-react';
import { type Stats, type PromoData } from '../../types/admin';
import { StatCard, BarChart } from '../../components/admin/AdminUI';
import { SystemStatusCard, InstagramCard, QuickLinks } from '../../components/admin/AdminCards';

// ─── 개요 탭 ────────────────────────────────────────────
export function OverviewTab({ stats, promo }: { stats: Stats; promo: PromoData | null }) {
    const platformTotal = stats.today.naver + stats.today.kakao + stats.today.google;

    return (
        <motion.div
            key="overview"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-4"
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <SystemStatusCard stats={stats} promo={promo} />
                <InstagramCard promo={promo} />
            </div>

            <div className="bg-[#231c14] rounded-2xl p-4 border border-orange-900/20">
                <div className="flex items-center gap-2 mb-4 text-orange-200/60 font-bold text-xs">
                    <BarChart2 size={13} className="text-orange-500" /> 오늘의 핵심 수치
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <StatCard label="오늘 수집" value={`${stats.today.total}건`} icon={RefreshCw} delay={0.05} />
                    <StatCard label="누적 리뷰" value={`${stats.totalAccumulated}건`} icon={Database} delay={0.1} />
                    <StatCard label="네이버" value={`${stats.today.naver}건`} delay={0.15} />
                    <StatCard label="카카오 / 구글" value={`${stats.today.kakao}건`} sub={`구글 ${stats.today.google}건`} delay={0.2} />
                </div>

                {platformTotal > 0 && (
                    <div className="mt-4">
                        <div className="flex rounded-full overflow-hidden h-1.5 bg-[#1a1410]">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${(stats.today.naver / platformTotal) * 100}%` }} transition={{ delay: 0.3, duration: 0.6 }} className="bg-emerald-500" />
                            <motion.div initial={{ width: 0 }} animate={{ width: `${(stats.today.kakao / platformTotal) * 100}%` }} transition={{ delay: 0.4, duration: 0.6 }} className="bg-amber-400" />
                            <motion.div initial={{ width: 0 }} animate={{ width: `${(stats.today.google / platformTotal) * 100}%` }} transition={{ delay: 0.5, duration: 0.6 }} className="bg-blue-400" />
                        </div>
                        <div className="flex gap-4 mt-2 text-[10px] text-orange-200/30">
                            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> 네이버</span>
                            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> 카카오</span>
                            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> 구글</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-[#231c14] rounded-2xl p-4 border border-orange-900/20">
                <div className="flex items-center gap-2 mb-4 text-orange-200/60 font-bold text-xs">
                    <TrendingUp size={13} className="text-orange-500" /> 주간 리뷰 추이
                </div>
                {stats.weeklyTrend.length > 0
                    ? <BarChart data={stats.weeklyTrend} />
                    : <p className="text-xs text-orange-200/30 text-center py-6">데이터 누적 중...</p>
                }
            </div>

            <QuickLinks />
        </motion.div>
    );
}

// ─── 마케팅 탭 ──────────────────────────────────────────
const COPY_CONFIG = [
    { key: 'lunch', label: '점심 타겟', sub: '직장인', color: 'border-orange-500/30 bg-orange-500/5', badge: 'text-orange-400 bg-orange-500/10', icon: '☀️' },
    { key: 'dinner', label: '저녁 타겟', sub: '모임', color: 'border-indigo-500/30 bg-indigo-500/5', badge: 'text-indigo-400 bg-indigo-500/10', icon: '🌙' },
    { key: 'sns', label: '인스타그램', sub: '피드', color: 'border-pink-500/30 bg-pink-500/5', badge: 'text-pink-400 bg-pink-500/10', icon: '📸' },
] as const;

export function MarketingTab({ stats }: { stats: Stats }) {
    return (
        <motion.div
            key="marketing"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-4"
        >
            <div className="bg-[#231c14] rounded-2xl p-4 border border-orange-900/20">
                <div className="flex items-center gap-2 mb-4 text-orange-200/60 font-bold text-xs">
                    <MessageSquare size={13} className="text-orange-500" /> AI 마케팅 카피
                </div>
                <div className="flex flex-col gap-3">
                    {COPY_CONFIG.map((c, i) => {
                        const text = stats.aiCopy[c.key];
                        if (!text) return null;
                        return (
                            <motion.div
                                key={c.key}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.08 }}
                                className={`rounded-xl p-4 border ${c.color}`}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <span>{c.icon}</span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.badge}`}>
                                        {c.label} ({c.sub})
                                    </span>
                                </div>
                                <p className="text-sm text-orange-100/70 whitespace-pre-line leading-relaxed">{text}</p>
                            </motion.div>
                        );
                    })}
                    {!stats.aiCopy.lunch && !stats.aiCopy.dinner && !stats.aiCopy.sns && (
                        <p className="text-xs text-orange-200/30 text-center py-6">생성된 카피가 없습니다.</p>
                    )}
                </div>
            </div>

            <div className="bg-[#231c14] rounded-2xl p-4 border border-orange-900/20">
                <div className="flex items-center gap-2 mb-4 text-orange-200/60 font-bold text-xs">
                    <Star size={13} className="text-orange-500" /> 인기 키워드
                </div>
                {stats.topKeywords.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {stats.topKeywords.map((k, i) => (
                            <motion.span
                                key={k}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.04 }}
                                className="bg-amber-500/10 text-amber-400/80 text-xs px-3 py-1.5 rounded-full font-medium border border-amber-500/20"
                            >
                                #{k}
                            </motion.span>
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-orange-200/30 text-center py-6">키워드 누적 중...</p>
                )}
            </div>
        </motion.div>
    );
}

// ─── 리뷰 탭 ────────────────────────────────────────────
const PLATFORM_COLOR: Record<string, string> = {
    Naver: 'border-emerald-500 bg-emerald-500/10 text-emerald-400',
    Kakao: 'border-amber-400 bg-amber-400/10 text-amber-400',
    Google: 'border-blue-400 bg-blue-400/10 text-blue-400',
};

export function ReviewsTab({ stats }: { stats: Stats }) {
    return (
        <motion.div
            key="reviews"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-4"
        >
            <div className="bg-[#231c14] rounded-2xl p-4 border border-orange-900/20">
                <div className="flex items-center gap-2 mb-4 text-orange-200/60 font-bold text-xs">
                    <MessageSquare size={13} className="text-orange-500" />
                    최근 수집 리뷰
                    <span className="ml-auto text-orange-200/20 text-[10px]">{stats.recentReviews.length}건</span>
                </div>
                {stats.recentReviews.length > 0 ? (
                    <div className="flex flex-col gap-3">
                        {stats.recentReviews.map((r, i) => {
                            const pColor = PLATFORM_COLOR[r.platform] || 'border-gray-500 bg-gray-500/10 text-gray-400';
                            return (
                                <motion.div
                                    key={`${r.author}-${r.date}`}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="bg-[#1a1410] rounded-xl p-3.5 border border-orange-900/10"
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${pColor}`}>
                                            {r.platform}
                                        </span>
                                        <span className="text-[10px] text-amber-400">
                                            {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                                        </span>
                                        <span className="text-[10px] text-orange-200/20 ml-auto">{r.date}</span>
                                    </div>
                                    <p className="text-sm text-orange-100/70 leading-relaxed mb-1.5">{r.content}</p>
                                    <p className="text-[10px] text-orange-200/30">— {r.author}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-xs text-orange-200/30 text-center py-6">수집된 리뷰가 없습니다.</p>
                )}
            </div>
        </motion.div>
    );
}

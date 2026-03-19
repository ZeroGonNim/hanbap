import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BarChart2, Star, TrendingUp, MessageSquare, RefreshCw, LogOut,
    Instagram, Github, ExternalLink, Activity, Camera, Database,
    Globe, Clock, Eye, ChevronRight
} from 'lucide-react';

const ADMIN_PASSWORD = 'hanbap2026';
const SESSION_KEY = 'hanbap_admin_auth';
const REFRESH_INTERVAL = 30;

interface Stats {
    lastUpdated: string;
    today: { total: number; naver: number; kakao: number; google: number };
    weeklyTrend: { date: string; count: number }[];
    topKeywords: string[];
    aiCopy: { lunch: string; dinner: string; sns: string };
    totalAccumulated: number;
    recentReviews: { author: string; platform: string; rating: number; content: string; date: string }[];
}

interface PromoData {
    lastUpdated: string;
    postType: string;
    itemName: string;
    imageUrl: string;
    caption: string;
}

type TabKey = 'overview' | 'marketing' | 'reviews';

// ─── 유틸리티 ───────────────────────────────────────────
function getTimeFreshness(dateStr: string): 'fresh' | 'stale' | 'dead' {
    if (!dateStr || dateStr === '초기화') return 'dead';
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = diff / (1000 * 60 * 60);
    if (hours < 26) return 'fresh';
    if (hours < 50) return 'stale';
    return 'dead';
}

function formatKST(dateStr: string): string {
    if (!dateStr || dateStr === '초기화') return '데이터 없음';
    try {
        return new Date(dateStr).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
    } catch {
        return dateStr;
    }
}

// ─── 로그인 화면 ────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: () => void }) {
    const [pw, setPw] = useState('');
    const [error, setError] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (pw === ADMIN_PASSWORD) {
            sessionStorage.setItem(SESSION_KEY, '1');
            onLogin();
        } else {
            setError(true);
            setPw('');
        }
    };

    return (
        <div className="min-h-screen bg-[#1a1410] flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="bg-[#231c14] rounded-3xl shadow-2xl p-8 w-full max-w-sm border border-orange-900/30"
            >
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/20">
                        <span className="text-2xl">🍚</span>
                    </div>
                    <h1 className="text-xl font-bold text-orange-50">관리자 대시보드</h1>
                    <p className="text-sm text-orange-200/40 mt-1">한마음식당 자동화 시스템</p>
                </div>
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <input
                        type="password"
                        value={pw}
                        onChange={e => { setPw(e.target.value); setError(false); }}
                        placeholder="비밀번호"
                        className="bg-[#1a1410] border border-orange-900/40 rounded-xl px-4 py-3 text-sm text-orange-50 outline-none focus:border-orange-500 placeholder:text-orange-200/20 transition-colors"
                        autoFocus
                    />
                    {error && (
                        <motion.p
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-red-400 text-xs text-center"
                        >
                            비밀번호가 틀렸습니다.
                        </motion.p>
                    )}
                    <button
                        type="submit"
                        className="bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl py-3 text-sm font-bold hover:from-orange-600 hover:to-amber-700 transition-all shadow-lg shadow-orange-500/20 active:scale-[0.98]"
                    >
                        입장
                    </button>
                </form>
            </motion.div>
        </div>
    );
}

// ─── 상태 인디케이터 ────────────────────────────────────
function StatusDot({ status }: { status: 'fresh' | 'stale' | 'dead' }) {
    const colors = {
        fresh: 'bg-emerald-400 shadow-emerald-400/50',
        stale: 'bg-amber-400 shadow-amber-400/50',
        dead: 'bg-red-400 shadow-red-400/50',
    };
    return (
        <span className="relative flex h-2.5 w-2.5">
            {status === 'fresh' && (
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-40 ${colors[status]}`} />
            )}
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 shadow-sm ${colors[status]}`} />
        </span>
    );
}

// ─── 통계 카드 ──────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, delay = 0 }: {
    label: string; value: string | number; sub?: string;
    icon?: React.ElementType; delay?: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="bg-[#1a1410] rounded-2xl p-4 flex flex-col gap-1 border border-orange-900/20"
        >
            <div className="flex items-center justify-between">
                <span className="text-xs text-orange-200/40">{label}</span>
                {Icon && <Icon size={14} className="text-orange-500/50" />}
            </div>
            <span className="text-2xl font-bold text-orange-50 tracking-tight">{value}</span>
            {sub && <span className="text-xs text-orange-200/30">{sub}</span>}
        </motion.div>
    );
}

// ─── 막대 그래프 ────────────────────────────────────────
function BarChart({ data }: { data: { date: string; count: number }[] }) {
    const max = Math.max(...data.map(d => d.count), 1);
    return (
        <div className="flex items-end gap-2 h-28">
            {data.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-orange-200/40 font-medium">{d.count}</span>
                    <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(d.count / max) * 80}px` }}
                        transition={{ delay: i * 0.05, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className="w-full bg-gradient-to-t from-orange-600 to-orange-400 rounded-t-md"
                        style={{ minHeight: d.count > 0 ? '4px' : '0' }}
                    />
                    <span className="text-[10px] text-orange-200/30 truncate w-full text-center">{d.date}</span>
                </div>
            ))}
        </div>
    );
}

// ─── 탭 네비게이션 ──────────────────────────────────────
function TabNav({ active, onChange }: { active: TabKey; onChange: (t: TabKey) => void }) {
    const tabs: { key: TabKey; label: string; icon: React.ElementType }[] = [
        { key: 'overview', label: '개요', icon: Eye },
        { key: 'marketing', label: '마케팅', icon: MessageSquare },
        { key: 'reviews', label: '리뷰', icon: Star },
    ];

    return (
        <div className="flex gap-1 bg-[#1a1410] rounded-2xl p-1 border border-orange-900/20">
            {tabs.map(t => (
                <button
                    key={t.key}
                    onClick={() => onChange(t.key)}
                    className={`relative flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-medium transition-colors ${
                        active === t.key
                            ? 'text-orange-50'
                            : 'text-orange-200/40 hover:text-orange-200/60'
                    }`}
                >
                    {active === t.key && (
                        <motion.div
                            layoutId="activeTab"
                            className="absolute inset-0 bg-orange-600/20 border border-orange-500/30 rounded-xl"
                            transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
                        />
                    )}
                    <t.icon size={13} className="relative z-10" />
                    <span className="relative z-10">{t.label}</span>
                </button>
            ))}
        </div>
    );
}

// ─── 시스템 상태 카드 ───────────────────────────────────
function SystemStatusCard({ stats, promo }: { stats: Stats; promo: PromoData | null }) {
    const reviewStatus = getTimeFreshness(stats.lastUpdated);
    const instaStatus = promo ? getTimeFreshness(promo.lastUpdated) : 'dead';

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
                {items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
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
function InstagramCard({ promo }: { promo: PromoData | null }) {
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

    const postDate = new Date(promo.lastUpdated);
    const isToday = new Date().toDateString() === postDate.toDateString();

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
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
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
function QuickLinks() {
    const links = [
        { label: 'Instagram', icon: Instagram, href: 'https://www.instagram.com/hanbap_doksan/', color: 'from-pink-600 to-purple-600' },
        { label: 'Actions', icon: Github, href: 'https://github.com/ZeroGonNim/hanbap/actions', color: 'from-gray-600 to-gray-700' },
        { label: 'Vercel', icon: ExternalLink, href: 'https://vercel.com/younggonnim-9194s-projects/hanbap', color: 'from-blue-600 to-cyan-600' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="grid grid-cols-3 gap-2"
        >
            {links.map((link, i) => (
                <a
                    key={i}
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

// ─── 새로고침 카운트다운 ────────────────────────────────
function RefreshCountdown({ countdown, onRefresh }: { countdown: number; onRefresh: () => void }) {
    const progress = countdown / REFRESH_INTERVAL;
    return (
        <button
            onClick={onRefresh}
            className="flex items-center gap-2 text-[10px] text-orange-200/30 hover:text-orange-200/60 transition-colors"
            title="지금 새로고침"
        >
            <div className="relative w-4 h-4">
                <svg className="w-4 h-4 -rotate-90" viewBox="0 0 16 16">
                    <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.2" />
                    <circle
                        cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.5"
                        strokeDasharray={`${progress * 37.7} 37.7`}
                        className="transition-all duration-1000"
                    />
                </svg>
            </div>
            {countdown}초
        </button>
    );
}

// ─── 개요 탭 ────────────────────────────────────────────
function OverviewTab({ stats, promo }: { stats: Stats; promo: PromoData | null }) {
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
            {/* 시스템 상태 + 인스타 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <SystemStatusCard stats={stats} promo={promo} />
                <InstagramCard promo={promo} />
            </div>

            {/* 핵심 수치 */}
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
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(stats.today.naver / platformTotal) * 100}%` }}
                                transition={{ delay: 0.3, duration: 0.6 }}
                                className="bg-emerald-500"
                            />
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(stats.today.kakao / platformTotal) * 100}%` }}
                                transition={{ delay: 0.4, duration: 0.6 }}
                                className="bg-amber-400"
                            />
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(stats.today.google / platformTotal) * 100}%` }}
                                transition={{ delay: 0.5, duration: 0.6 }}
                                className="bg-blue-400"
                            />
                        </div>
                        <div className="flex gap-4 mt-2 text-[10px] text-orange-200/30">
                            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> 네이버</span>
                            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> 카카오</span>
                            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> 구글</span>
                        </div>
                    </div>
                )}
            </div>

            {/* 주간 추이 */}
            <div className="bg-[#231c14] rounded-2xl p-4 border border-orange-900/20">
                <div className="flex items-center gap-2 mb-4 text-orange-200/60 font-bold text-xs">
                    <TrendingUp size={13} className="text-orange-500" /> 주간 리뷰 추이
                </div>
                {stats.weeklyTrend.length > 0
                    ? <BarChart data={stats.weeklyTrend} />
                    : <p className="text-xs text-orange-200/30 text-center py-6">데이터 누적 중...</p>
                }
            </div>

            {/* 빠른 링크 */}
            <QuickLinks />
        </motion.div>
    );
}

// ─── 마케팅 탭 ──────────────────────────────────────────
function MarketingTab({ stats }: { stats: Stats }) {
    const copies = [
        { key: 'lunch', label: '점심 타겟', sub: '직장인', color: 'border-orange-500/30 bg-orange-500/5', badge: 'text-orange-400 bg-orange-500/10', icon: '☀️' },
        { key: 'dinner', label: '저녁 타겟', sub: '모임', color: 'border-indigo-500/30 bg-indigo-500/5', badge: 'text-indigo-400 bg-indigo-500/10', icon: '🌙' },
        { key: 'sns', label: '인스타그램', sub: '피드', color: 'border-pink-500/30 bg-pink-500/5', badge: 'text-pink-400 bg-pink-500/10', icon: '📸' },
    ] as const;

    return (
        <motion.div
            key="marketing"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-4"
        >
            {/* AI 카피 */}
            <div className="bg-[#231c14] rounded-2xl p-4 border border-orange-900/20">
                <div className="flex items-center gap-2 mb-4 text-orange-200/60 font-bold text-xs">
                    <MessageSquare size={13} className="text-orange-500" /> AI 마케팅 카피
                </div>
                <div className="flex flex-col gap-3">
                    {copies.map((c, i) => {
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

            {/* 인기 키워드 */}
            <div className="bg-[#231c14] rounded-2xl p-4 border border-orange-900/20">
                <div className="flex items-center gap-2 mb-4 text-orange-200/60 font-bold text-xs">
                    <Star size={13} className="text-orange-500" /> 인기 키워드
                </div>
                {stats.topKeywords.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {stats.topKeywords.map((k, i) => (
                            <motion.span
                                key={i}
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
function ReviewsTab({ stats }: { stats: Stats }) {
    const platformColor: Record<string, string> = {
        Naver: 'border-emerald-500 bg-emerald-500/10 text-emerald-400',
        Kakao: 'border-amber-400 bg-amber-400/10 text-amber-400',
        Google: 'border-blue-400 bg-blue-400/10 text-blue-400',
    };

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
                            const pColor = platformColor[r.platform] || 'border-gray-500 bg-gray-500/10 text-gray-400';
                            return (
                                <motion.div
                                    key={i}
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

// ─── 메인 대시보드 ──────────────────────────────────────
function Dashboard({ stats, promo, onLogout, onRefresh, countdown }: {
    stats: Stats; promo: PromoData | null; onLogout: () => void;
    onRefresh: () => void; countdown: number;
}) {
    const [activeTab, setActiveTab] = useState<TabKey>('overview');

    return (
        <div className="min-h-screen bg-[#1a1410] pb-10">
            {/* 헤더 */}
            <div className="bg-gradient-to-b from-[#2a1f13] to-[#1a1410] px-5 pt-8 pb-5 border-b border-orange-900/20">
                <div className="max-w-2xl mx-auto">
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/15">
                                <span className="text-sm">🍚</span>
                            </div>
                            <div>
                                <h1 className="text-sm font-bold text-orange-50">한마음식당</h1>
                                <p className="text-[10px] text-orange-200/30">관리자 대시보드</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <RefreshCountdown countdown={countdown} onRefresh={onRefresh} />
                            <button
                                onClick={onLogout}
                                className="flex items-center gap-1 text-orange-200/30 text-[10px] hover:text-orange-200/60 transition-colors"
                            >
                                <LogOut size={12} />
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        <Clock size={10} className="text-orange-200/20" />
                        <p className="text-[10px] text-orange-200/20">
                            마지막 업데이트: {formatKST(stats.lastUpdated)}
                        </p>
                    </div>
                </div>
            </div>

            {/* 컨텐츠 */}
            <div className="px-4 pt-4 max-w-2xl mx-auto flex flex-col gap-4">
                <TabNav active={activeTab} onChange={setActiveTab} />

                <AnimatePresence mode="wait">
                    {activeTab === 'overview' && <OverviewTab stats={stats} promo={promo} />}
                    {activeTab === 'marketing' && <MarketingTab stats={stats} />}
                    {activeTab === 'reviews' && <ReviewsTab stats={stats} />}
                </AnimatePresence>

                <p className="text-center text-[10px] text-orange-200/15 mt-4">
                    자동 새로고침 {REFRESH_INTERVAL}초 · 한마음식당 자동화 시스템
                </p>
            </div>
        </div>
    );
}

// ─── 최상위 컴포넌트 ────────────────────────────────────
export default function AdminDashboard() {
    const [authed, setAuthed] = useState(!!sessionStorage.getItem(SESSION_KEY));
    const [stats, setStats] = useState<Stats | null>(null);
    const [promo, setPromo] = useState<PromoData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [countdown, setCountdown] = useState(REFRESH_INTERVAL);
    const countdownRef = useRef(REFRESH_INTERVAL);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const fetchData = useCallback(async (showLoading = false) => {
        if (showLoading) setLoading(true);
        setError(false);
        try {
            const [statsRes, promoRes] = await Promise.all([
                fetch('/stats.json?t=' + Date.now()),
                fetch('/data/today_promo.json?t=' + Date.now()),
            ]);
            if (!statsRes.ok) throw new Error();
            setStats(await statsRes.json());
            if (promoRes.ok) setPromo(await promoRes.json());
        } catch {
            setError(true);
        } finally {
            setLoading(false);
        }
        countdownRef.current = REFRESH_INTERVAL;
        setCountdown(REFRESH_INTERVAL);
    }, []);

    useEffect(() => {
        if (!authed) return;
        fetchData(true);

        timerRef.current = setInterval(() => {
            countdownRef.current -= 1;
            setCountdown(countdownRef.current);
            if (countdownRef.current <= 0) {
                fetchData(false);
            }
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [authed, fetchData]);

    const handleLogout = () => {
        sessionStorage.removeItem(SESSION_KEY);
        setAuthed(false);
    };

    if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;

    if (loading && !stats) return (
        <div className="min-h-screen bg-[#1a1410] flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
            >
                <RefreshCw className="animate-spin text-orange-500/50 mx-auto mb-3" size={28} />
                <p className="text-xs text-orange-200/30">데이터 불러오는 중...</p>
            </motion.div>
        </div>
    );

    if (error || !stats) return (
        <div className="min-h-screen bg-[#1a1410] flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center bg-[#231c14] rounded-2xl p-8 border border-orange-900/20 max-w-xs"
            >
                <p className="text-sm text-orange-100/70 mb-1">데이터가 없습니다.</p>
                <p className="text-xs text-orange-200/30 mb-4">파이프라인 최초 실행 후 표시됩니다.</p>
                <button
                    onClick={() => fetchData(true)}
                    className="text-xs text-orange-500 hover:text-orange-400 flex items-center gap-1 mx-auto transition-colors"
                >
                    <RefreshCw size={12} /> 다시 시도
                </button>
            </motion.div>
        </div>
    );

    return (
        <Dashboard
            stats={stats}
            promo={promo}
            onLogout={handleLogout}
            onRefresh={() => fetchData(false)}
            countdown={countdown}
        />
    );
}

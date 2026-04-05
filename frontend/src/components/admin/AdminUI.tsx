import React from 'react';
import { motion } from 'framer-motion';
import { Eye, MessageSquare, Star, RefreshCw } from 'lucide-react';
import { type Freshness, type TabKey } from '../../types/admin';

const REFRESH_INTERVAL = 30;

// ─── 상태 인디케이터 ────────────────────────────────────
export function StatusDot({ status }: { status: Freshness }) {
    const colors: Record<Freshness, string> = {
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
export function StatCard({ label, value, sub, icon: Icon, delay = 0 }: {
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
export function BarChart({ data }: { data: { date: string; count: number }[] }) {
    const max = Math.max(...data.map(d => d.count), 1);
    return (
        <div className="flex items-end gap-2 h-28">
            {data.map((d, i) => (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
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
export function TabNav({ active, onChange }: { active: TabKey; onChange: (t: TabKey) => void }) {
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
                        active === t.key ? 'text-orange-50' : 'text-orange-200/40 hover:text-orange-200/60'
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

// ─── 새로고침 카운트다운 ────────────────────────────────
export function RefreshCountdown({ countdown, onRefresh }: { countdown: number; onRefresh: () => void }) {
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

// ─── 로딩 화면 ──────────────────────────────────────────
export function LoadingScreen() {
    return (
        <div className="min-h-screen bg-[#1a1410] flex items-center justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                <RefreshCw className="animate-spin text-orange-500/50 mx-auto mb-3" size={28} />
                <p className="text-xs text-orange-200/30">데이터 불러오는 중...</p>
            </motion.div>
        </div>
    );
}

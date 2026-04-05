import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Clock, RefreshCw } from 'lucide-react';
import { type Stats, type PromoData, type TabKey } from '../types/admin';
import { StatsSchema, PromoSchema } from '../schemas/admin';
import { TabNav, RefreshCountdown, LoadingScreen } from '../components/admin/AdminUI';
import { OverviewTab, MarketingTab, ReviewsTab } from './admin/AdminTabs';
import { formatKST } from '../utils/adminUtils';

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'hanbap2026';
const SESSION_KEY = 'hanbap_admin_auth';
const REFRESH_INTERVAL = 30;

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
                    <label htmlFor="admin-pw" className="sr-only">비밀번호</label>
                    <input
                        id="admin-pw"
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
                            role="alert"
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

// ─── 대시보드 레이아웃 ──────────────────────────────────
function Dashboard({ stats, promo, onLogout, onRefresh, countdown }: {
    stats: Stats; promo: PromoData | null; onLogout: () => void;
    onRefresh: () => void; countdown: number;
}) {
    const [activeTab, setActiveTab] = useState<TabKey>('overview');

    return (
        <div className="min-h-screen bg-[#1a1410] pb-10">
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
                                aria-label="로그아웃"
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

// ─── 최상위 컴포넌트 (인증 + 데이터 패칭) ──────────────
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
            if (!statsRes.ok) throw new Error('stats.json fetch failed');
            const statsResult = StatsSchema.safeParse(await statsRes.json());
            if (statsResult.success) setStats(statsResult.data);
            else throw new Error('stats.json 스키마 불일치');

            if (promoRes.ok) {
                const promoResult = PromoSchema.safeParse(await promoRes.json());
                const promoData = promoResult.success ? promoResult.data : null;
                setPromo(promoData?.itemName ? promoData : null);
            }
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
            if (countdownRef.current <= 0) fetchData(false);
        }, 1000);

        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [authed, fetchData]);

    const handleLogout = () => {
        sessionStorage.removeItem(SESSION_KEY);
        setAuthed(false);
    };

    if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;
    if (loading && !stats) return <LoadingScreen />;

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

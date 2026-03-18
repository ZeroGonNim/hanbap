import React, { useState, useEffect } from 'react';
import { BarChart2, Star, TrendingUp, MessageSquare, RefreshCw, LogOut } from 'lucide-react';

const ADMIN_PASSWORD = 'hanbap2026';
const SESSION_KEY = 'hanbap_admin_auth';

interface Stats {
    lastUpdated: string;
    today: { total: number; naver: number; kakao: number; google: number };
    weeklyTrend: { date: string; count: number }[];
    topKeywords: string[];
    aiCopy: { lunch: string; dinner: string; sns: string };
    totalAccumulated: number;
    recentReviews: { author: string; platform: string; rating: number; content: string; date: string }[];
}

// 비밀번호 입력 화면
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
        <div className="min-h-screen bg-orange-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-3xl shadow-lg p-8 w-full max-w-sm">
                <div className="text-center mb-6">
                    <div className="text-4xl mb-2">🍚</div>
                    <h1 className="text-xl font-bold text-gray-800">한마음식당 관리자</h1>
                    <p className="text-sm text-gray-400 mt-1">비밀번호를 입력하세요</p>
                </div>
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <input
                        type="password"
                        value={pw}
                        onChange={e => { setPw(e.target.value); setError(false); }}
                        placeholder="비밀번호"
                        className="border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400"
                        autoFocus
                    />
                    {error && <p className="text-red-400 text-xs text-center">비밀번호가 틀렸습니다.</p>}
                    <button
                        type="submit"
                        className="bg-orange-500 text-white rounded-xl py-3 text-sm font-bold hover:bg-orange-600 transition-colors"
                    >
                        입장
                    </button>
                </form>
            </div>
        </div>
    );
}

// 통계 카드
function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color: string }) {
    return (
        <div className={`${color} rounded-2xl p-4 flex flex-col gap-1`}>
            <span className="text-xs text-gray-500">{label}</span>
            <span className="text-2xl font-bold text-gray-800">{value}</span>
            {sub && <span className="text-xs text-gray-400">{sub}</span>}
        </div>
    );
}

// 막대 그래프
function BarChart({ data }: { data: { date: string; count: number }[] }) {
    const max = Math.max(...data.map(d => d.count), 1);
    return (
        <div className="flex items-end gap-2 h-24">
            {data.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs text-gray-400">{d.count}</span>
                    <div
                        className="w-full bg-orange-400 rounded-t-md transition-all"
                        style={{ height: `${(d.count / max) * 64}px`, minHeight: d.count > 0 ? '4px' : '0' }}
                    />
                    <span className="text-xs text-gray-400 truncate w-full text-center">{d.date}</span>
                </div>
            ))}
        </div>
    );
}

// 메인 대시보드
function Dashboard({ stats, onLogout }: { stats: Stats; onLogout: () => void }) {
    const platformTotal = stats.today.naver + stats.today.kakao + stats.today.google;

    return (
        <div className="min-h-screen bg-orange-50 pb-10">
            {/* 헤더 */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-400 px-5 pt-10 pb-6 text-white">
                <div className="flex items-center justify-between mb-1">
                    <h1 className="text-lg font-bold">한마음식당 대시보드</h1>
                    <button onClick={onLogout} className="flex items-center gap-1 text-orange-100 text-xs hover:text-white">
                        <LogOut size={14} /> 로그아웃
                    </button>
                </div>
                <p className="text-orange-100 text-sm">마지막 업데이트: {stats.lastUpdated}</p>
            </div>

            <div className="px-4 -mt-3 flex flex-col gap-4">

                {/* 핵심 수치 */}
                <div className="bg-white rounded-3xl p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4 text-gray-700 font-bold text-sm">
                        <BarChart2 size={16} className="text-orange-500" /> 오늘의 핵심 수치
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <StatCard label="오늘 수집 리뷰" value={`${stats.today.total}건`} color="bg-orange-50" />
                        <StatCard label="누적 리뷰" value={`${stats.totalAccumulated}건`} color="bg-amber-50" />
                        <StatCard label="네이버" value={`${stats.today.naver}건`} color="bg-green-50" />
                        <StatCard label="카카오" value={`${stats.today.kakao}건`} sub={`구글 ${stats.today.google}건`} color="bg-yellow-50" />
                    </div>

                    {/* 플랫폼 비율 바 */}
                    {platformTotal > 0 && (
                        <div className="mt-4">
                            <div className="flex rounded-full overflow-hidden h-2">
                                <div className="bg-green-400" style={{ width: `${(stats.today.naver / platformTotal) * 100}%` }} />
                                <div className="bg-yellow-400" style={{ width: `${(stats.today.kakao / platformTotal) * 100}%` }} />
                                <div className="bg-blue-400" style={{ width: `${(stats.today.google / platformTotal) * 100}%` }} />
                            </div>
                            <div className="flex gap-3 mt-2 text-xs text-gray-400">
                                <span>🟢 네이버</span><span>🟡 카카오</span><span>🔵 구글</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* 주간 추이 */}
                <div className="bg-white rounded-3xl p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4 text-gray-700 font-bold text-sm">
                        <TrendingUp size={16} className="text-orange-500" /> 주간 리뷰 추이
                    </div>
                    {stats.weeklyTrend.length > 0
                        ? <BarChart data={stats.weeklyTrend} />
                        : <p className="text-sm text-gray-400 text-center py-4">데이터 누적 중...</p>
                    }
                </div>

                {/* AI 마케팅 카피 */}
                <div className="bg-white rounded-3xl p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4 text-gray-700 font-bold text-sm">
                        <MessageSquare size={16} className="text-orange-500" /> 오늘의 AI 마케팅 카피
                    </div>
                    <div className="flex flex-col gap-3">
                        {stats.aiCopy.lunch && (
                            <div className="bg-orange-50 rounded-2xl p-4">
                                <p className="text-xs font-bold text-orange-500 mb-2">🌞 점심 타겟 (직장인)</p>
                                <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{stats.aiCopy.lunch}</p>
                            </div>
                        )}
                        {stats.aiCopy.dinner && (
                            <div className="bg-indigo-50 rounded-2xl p-4">
                                <p className="text-xs font-bold text-indigo-500 mb-2">🌙 저녁 타겟 (모임)</p>
                                <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{stats.aiCopy.dinner}</p>
                            </div>
                        )}
                        {stats.aiCopy.sns && (
                            <div className="bg-pink-50 rounded-2xl p-4">
                                <p className="text-xs font-bold text-pink-500 mb-2">📸 인스타그램 피드</p>
                                <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{stats.aiCopy.sns}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 인기 키워드 */}
                {stats.topKeywords.length > 0 && (
                    <div className="bg-white rounded-3xl p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-4 text-gray-700 font-bold text-sm">
                            <Star size={16} className="text-orange-500" /> 이번 주 인기 키워드
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {stats.topKeywords.map((k, i) => (
                                <span key={i} className="bg-yellow-100 text-yellow-700 text-xs px-3 py-1 rounded-full font-medium">
                                    #{k}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* 최근 리뷰 */}
                {stats.recentReviews.length > 0 && (
                    <div className="bg-white rounded-3xl p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-4 text-gray-700 font-bold text-sm">
                            <MessageSquare size={16} className="text-orange-500" /> 최근 수집 리뷰
                        </div>
                        <div className="flex flex-col gap-3">
                            {stats.recentReviews.map((r, i) => (
                                <div key={i} className="border-l-4 border-orange-300 pl-3 py-1">
                                    <p className="text-xs text-gray-400 mb-1">
                                        [{r.platform}] ⭐{r.rating} · {r.author} · {r.date}
                                    </p>
                                    <p className="text-sm text-gray-700">{r.content}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <p className="text-center text-xs text-gray-300 mt-2">
                    매일 09:00 자동 업데이트 · 한마음식당 자동화 시스템
                </p>
            </div>
        </div>
    );
}

export default function AdminDashboard() {
    const [authed, setAuthed] = useState(!!sessionStorage.getItem(SESSION_KEY));
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const fetchStats = async () => {
        setLoading(true);
        setError(false);
        try {
            const res = await fetch('/stats.json?t=' + Date.now());
            if (!res.ok) throw new Error();
            const data = await res.json();
            setStats(data);
        } catch {
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (authed) fetchStats();
    }, [authed]);

    const handleLogout = () => {
        sessionStorage.removeItem(SESSION_KEY);
        setAuthed(false);
    };

    if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;

    if (loading) return (
        <div className="min-h-screen bg-orange-50 flex items-center justify-center">
            <div className="text-center">
                <RefreshCw className="animate-spin text-orange-400 mx-auto mb-2" size={32} />
                <p className="text-sm text-gray-400">데이터 불러오는 중...</p>
            </div>
        </div>
    );

    if (error || !stats) return (
        <div className="min-h-screen bg-orange-50 flex items-center justify-center px-4">
            <div className="text-center bg-white rounded-3xl p-8 shadow-sm">
                <p className="text-gray-600 mb-1">아직 수집된 데이터가 없습니다.</p>
                <p className="text-sm text-gray-400 mb-4">파이프라인이 최초 실행되면 표시됩니다.</p>
                <button onClick={fetchStats} className="text-sm text-orange-500 hover:underline flex items-center gap-1 mx-auto">
                    <RefreshCw size={14} /> 다시 시도
                </button>
            </div>
        </div>
    );

    return <Dashboard stats={stats} onLogout={handleLogout} />;
}

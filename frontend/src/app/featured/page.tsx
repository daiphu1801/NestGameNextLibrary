'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/features/games/store/gameStore';
import { gameService } from '@/services/gameService';
import { Header } from '@/components/layout/Header';
import { GameGrid } from '@/components/game/GameGrid';
import { validateEnv } from '@/config/env';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { Crown, Sparkles, TrendingUp } from 'lucide-react';
import { CategoryFilter } from '@/components/search/CategoryFilter';
import { useTheme } from 'next-themes';

export default function FeaturedGamesPage() {
    const { setGames, isLoading, filteredGames } = useGameStore();
    const { t } = useLanguage();
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        validateEnv();
        const loadFeaturedGames = async () => {
            const games = await gameService.loadGames(true);
            setGames(games);
        };
        loadFeaturedGames();
        return () => { };
    }, [setGames]);

    const isLight = mounted && theme === 'light';

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-6 relative">
                    <div className="absolute inset-0 bg-amber-500/30 blur-3xl rounded-full" />
                    <div className="w-16 h-16 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto relative z-10" />
                    <p className="text-base font-medium text-muted-foreground animate-pulse relative z-10 font-mono-tech uppercase tracking-wider">
                        {t('featured.loadingText') || 'Đang lấy game nổi bật...'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen text-foreground selection:bg-amber-500/30 relative overflow-hidden">
            {/* Theme-aware base background */}
            <div
                className="fixed inset-0 -z-20 transition-colors duration-500"
                style={{ background: isLight ? '#f8f6f1' : '#0a0b0f' }}
            />

            {/* Keyframe animations */}
            <style jsx>{`
                @keyframes aurora1 {
                    0%, 100% { transform: translateX(-30%) translateY(-10%) rotate(0deg) scale(1); opacity: 0.3; }
                    25% { transform: translateX(-10%) translateY(-20%) rotate(5deg) scale(1.1); opacity: 0.5; }
                    50% { transform: translateX(10%) translateY(-5%) rotate(-3deg) scale(1.05); opacity: 0.35; }
                    75% { transform: translateX(-20%) translateY(-15%) rotate(3deg) scale(0.95); opacity: 0.45; }
                }
                @keyframes aurora2 {
                    0%, 100% { transform: translateX(20%) translateY(5%) rotate(0deg) scale(1); opacity: 0.25; }
                    33% { transform: translateX(-15%) translateY(-10%) rotate(-5deg) scale(1.15); opacity: 0.4; }
                    66% { transform: translateX(5%) translateY(10%) rotate(3deg) scale(0.9); opacity: 0.3; }
                }
                @keyframes aurora3 {
                    0%, 100% { transform: translateX(0%) rotate(0deg); opacity: 0.2; }
                    50% { transform: translateX(-25%) rotate(-8deg); opacity: 0.4; }
                }
                @keyframes floatParticle {
                    0% { transform: translateY(100vh) scale(0); opacity: 0; }
                    10% { opacity: 1; transform: translateY(80vh) scale(1); }
                    90% { opacity: 0.8; }
                    100% { transform: translateY(-10vh) scale(0.5); opacity: 0; }
                }
                @keyframes bannerGlow {
                    0%, 100% { opacity: 0.15; transform: scale(1) rotate(0deg); }
                    33% { opacity: 0.3; transform: scale(1.05) rotate(1deg); }
                    66% { opacity: 0.2; transform: scale(0.98) rotate(-1deg); }
                }
                @keyframes lightSweep {
                    0% { transform: translateX(-100%) skewX(-15deg); }
                    100% { transform: translateX(200%) skewX(-15deg); }
                }
                @keyframes crownPulse {
                    0%, 100% { filter: drop-shadow(0 0 20px rgba(245, 158, 11, 0.3)); }
                    50% { filter: drop-shadow(0 0 40px rgba(245, 158, 11, 0.6)) drop-shadow(0 0 80px rgba(245, 158, 11, 0.2)); }
                }
                @keyframes crownPulseLight {
                    0%, 100% { filter: drop-shadow(0 0 15px rgba(217, 119, 6, 0.25)); }
                    50% { filter: drop-shadow(0 0 30px rgba(217, 119, 6, 0.45)) drop-shadow(0 0 60px rgba(217, 119, 6, 0.15)); }
                }
                @keyframes ringRotate1 {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes ringRotate2 {
                    from { transform: rotate(360deg); }
                    to { transform: rotate(0deg); }
                }
                @keyframes sparkle {
                    0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
                    50% { opacity: 1; transform: scale(1) rotate(180deg); }
                }
            `}</style>

            <Header />

            {/* ===== BACKGROUND LIGHTING SYSTEM ===== */}
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">

                {/* Aurora Beam 1 */}
                <div
                    style={{
                        position: 'absolute',
                        top: '-20%',
                        left: '-10%',
                        width: '80%',
                        height: '600px',
                        background: isLight
                            ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.12) 0%, rgba(252, 211, 77, 0.06) 30%, transparent 60%)'
                            : 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(251, 191, 36, 0.08) 30%, transparent 60%)',
                        filter: 'blur(80px)',
                        animation: 'aurora1 12s ease-in-out infinite',
                    }}
                />

                {/* Aurora Beam 2 */}
                <div
                    style={{
                        position: 'absolute',
                        top: '10%',
                        right: '-15%',
                        width: '70%',
                        height: '500px',
                        background: isLight
                            ? 'linear-gradient(225deg, rgba(251, 146, 60, 0.08) 0%, rgba(244, 114, 182, 0.04) 40%, transparent 65%)'
                            : 'linear-gradient(225deg, rgba(239, 68, 68, 0.12) 0%, rgba(190, 24, 93, 0.06) 40%, transparent 65%)',
                        filter: 'blur(90px)',
                        animation: 'aurora2 15s ease-in-out infinite',
                    }}
                />

                {/* Aurora Beam 3 */}
                <div
                    style={{
                        position: 'absolute',
                        top: '30%',
                        left: '20%',
                        width: '60%',
                        height: '400px',
                        background: isLight
                            ? 'radial-gradient(ellipse, rgba(167, 139, 250, 0.06) 0%, transparent 60%)'
                            : 'radial-gradient(ellipse, rgba(139, 92, 246, 0.08) 0%, transparent 60%)',
                        filter: 'blur(100px)',
                        animation: 'aurora3 18s ease-in-out infinite',
                    }}
                />

                {/* Central top spotlight */}
                <div
                    style={{
                        position: 'absolute',
                        top: '-5%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '100%',
                        maxWidth: '900px',
                        height: '500px',
                        background: isLight
                            ? 'conic-gradient(from 180deg at 50% 0%, transparent 30%, rgba(251, 191, 36, 0.08) 40%, rgba(252, 211, 77, 0.12) 50%, rgba(251, 191, 36, 0.08) 60%, transparent 70%)'
                            : 'conic-gradient(from 180deg at 50% 0%, transparent 30%, rgba(245, 158, 11, 0.12) 40%, rgba(251, 191, 36, 0.18) 50%, rgba(245, 158, 11, 0.12) 60%, transparent 70%)',
                        filter: 'blur(60px)',
                        opacity: isLight ? 0.5 : 0.6,
                    }}
                />

                {/* Dot matrix overlay */}
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: isLight
                            ? `radial-gradient(circle at 1.5px 1.5px, rgba(0, 0, 0, 0.03) 1px, transparent 0)`
                            : `radial-gradient(circle at 1.5px 1.5px, rgba(255, 255, 255, 0.03) 1px, transparent 0)`,
                        backgroundSize: '28px 28px',
                    }}
                />

                {/* Floating particles */}
                {[...Array(8)].map((_, i) => (
                    <div
                        key={i}
                        style={{
                            position: 'absolute',
                            left: `${10 + i * 12}%`,
                            width: `${2 + (i % 3)}px`,
                            height: `${2 + (i % 3)}px`,
                            borderRadius: '50%',
                            background: i % 2 === 0
                                ? 'radial-gradient(circle, rgba(251, 191, 36, 0.8), rgba(245, 158, 11, 0.3))'
                                : isLight
                                    ? 'radial-gradient(circle, rgba(217, 119, 6, 0.5), rgba(217, 119, 6, 0.1))'
                                    : 'radial-gradient(circle, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.1))',
                            boxShadow: i % 2 === 0
                                ? '0 0 6px rgba(251, 191, 36, 0.5)'
                                : isLight
                                    ? '0 0 4px rgba(217, 119, 6, 0.3)'
                                    : '0 0 4px rgba(255, 255, 255, 0.3)',
                            animation: `floatParticle ${8 + i * 2}s linear infinite`,
                            animationDelay: `${i * 1.5}s`,
                        }}
                    />
                ))}
            </div>

            <div className="container mx-auto px-4 lg:px-8 py-8 md:py-12 relative z-10">
                {/* ===== BANNER ===== */}
                <div
                    className="relative rounded-3xl overflow-hidden shadow-2xl mb-12 group transition-all duration-500"
                    style={{
                        background: isLight
                            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 251, 235, 0.98) 50%, rgba(254, 243, 199, 0.9) 100%)'
                            : 'linear-gradient(135deg, rgba(26, 28, 35, 0.95) 0%, rgba(18, 20, 26, 0.98) 50%, rgba(20, 16, 24, 0.95) 100%)',
                        border: isLight
                            ? '1px solid rgba(217, 119, 6, 0.12)'
                            : '1px solid rgba(255, 255, 255, 0.07)',
                        boxShadow: isLight
                            ? '0 0 60px rgba(251, 191, 36, 0.08), 0 20px 40px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
                            : '0 0 80px rgba(245, 158, 11, 0.06), 0 25px 50px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                    }}
                >
                    {/* Layer 1: Top-right glow */}
                    <div
                        className="absolute transition-all duration-[2s] group-hover:scale-125 group-hover:opacity-40"
                        style={{
                            top: '-60%',
                            right: '-20%',
                            width: '500px',
                            height: '500px',
                            background: isLight
                                ? 'radial-gradient(circle, rgba(251, 191, 36, 0.15) 0%, rgba(252, 211, 77, 0.06) 30%, transparent 60%)'
                                : 'radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, rgba(251, 191, 36, 0.1) 30%, transparent 60%)',
                            filter: 'blur(60px)',
                            animation: 'bannerGlow 6s ease-in-out infinite',
                        }}
                    />
                    {/* Layer 2: Bottom-left glow */}
                    <div
                        className="absolute transition-all duration-[2s] group-hover:scale-125 group-hover:opacity-35"
                        style={{
                            bottom: '-50%',
                            left: '-15%',
                            width: '450px',
                            height: '450px',
                            background: isLight
                                ? 'radial-gradient(circle, rgba(244, 114, 182, 0.1) 0%, rgba(167, 139, 250, 0.04) 40%, transparent 65%)'
                                : 'radial-gradient(circle, rgba(190, 24, 93, 0.2) 0%, rgba(139, 92, 246, 0.08) 40%, transparent 65%)',
                            filter: 'blur(70px)',
                            animation: 'bannerGlow 8s ease-in-out infinite 2s',
                        }}
                    />
                    {/* Layer 3: Center highlight */}
                    <div
                        className="absolute"
                        style={{
                            top: '20%',
                            left: '30%',
                            width: '40%',
                            height: '60%',
                            background: isLight
                                ? 'radial-gradient(ellipse, rgba(252, 211, 77, 0.08) 0%, transparent 50%)'
                                : 'radial-gradient(ellipse, rgba(251, 191, 36, 0.06) 0%, transparent 50%)',
                            filter: 'blur(40px)',
                        }}
                    />
                    {/* Light sweep on hover */}
                    <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        style={{ overflow: 'hidden' }}
                    >
                        <div
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '40%',
                                height: '100%',
                                background: isLight
                                    ? 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)'
                                    : 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.03), transparent)',
                                animation: 'lightSweep 3s ease-in-out infinite',
                            }}
                        />
                    </div>

                    {/* Inner edge highlight - top */}
                    <div
                        className="absolute top-0 left-0 right-0 h-px"
                        style={{
                            background: isLight
                                ? 'linear-gradient(90deg, transparent 10%, rgba(251, 191, 36, 0.2) 30%, rgba(245, 158, 11, 0.35) 50%, rgba(251, 191, 36, 0.2) 70%, transparent 90%)'
                                : 'linear-gradient(90deg, transparent 10%, rgba(251, 191, 36, 0.15) 30%, rgba(245, 158, 11, 0.25) 50%, rgba(251, 191, 36, 0.15) 70%, transparent 90%)',
                        }}
                    />

                    <div className="relative p-8 md:p-12 lg:p-16 flex flex-col md:flex-row items-center gap-8 justify-between">
                        <div className="flex-1 max-w-2xl space-y-6">
                            {/* Badge */}
                            <div
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium font-mono-tech tracking-wider"
                                style={{
                                    color: isLight ? '#b45309' : '#fbbf24',
                                    background: isLight
                                        ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.12) 0%, rgba(252, 211, 77, 0.08) 100%)'
                                        : 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(251, 191, 36, 0.05) 100%)',
                                    border: isLight
                                        ? '1px solid rgba(217, 119, 6, 0.25)'
                                        : '1px solid rgba(245, 158, 11, 0.2)',
                                    boxShadow: isLight
                                        ? '0 0 15px rgba(251, 191, 36, 0.1), inset 0 0 15px rgba(251, 191, 36, 0.05)'
                                        : '0 0 20px rgba(245, 158, 11, 0.08), inset 0 0 20px rgba(245, 158, 11, 0.03)',
                                    backdropFilter: 'blur(12px)',
                                }}
                            >
                                <Sparkles className="w-4 h-4 animate-pulse" style={{ animationDuration: '2s' }} />
                                <span>{t('featured.badge') || 'Tuyển Tập Đỉnh Cao'}</span>
                            </div>

                            {/* Title */}
                            <h1
                                className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-transparent bg-clip-text"
                                style={{
                                    backgroundImage: isLight
                                        ? 'linear-gradient(to right, #b45309, #c2410c, #be123c)'
                                        : 'linear-gradient(to right, #fcd34d, #fb923c, #f43f5e)',
                                    textShadow: isLight
                                        ? '0 0 40px rgba(217, 119, 6, 0.15)'
                                        : '0 0 40px rgba(245, 158, 11, 0.3), 0 0 80px rgba(245, 158, 11, 0.1)',
                                }}
                            >
                                {t('featured.mainTitle') || 'Game Nổi Bật'}
                            </h1>

                            <p
                                className="text-lg leading-relaxed max-w-xl"
                                style={{
                                    color: isLight ? 'rgba(55, 48, 40, 0.75)' : 'rgba(161, 161, 170, 0.9)',
                                }}
                            >
                                {t('featured.description') || 'Khám phá bộ sưu tập những tựa game kinh điển được đánh giá cao nhất, chọn lọc kỹ lưỡng dành riêng cho đam mê của bạn.'}
                            </p>

                            {/* Stats */}
                            <div className="flex items-center gap-6 pt-4">
                                <div className="flex flex-col">
                                    <span
                                        className="text-3xl font-black font-mono-tech"
                                        style={{
                                            color: isLight ? '#1c1917' : '#ffffff',
                                            textShadow: isLight ? 'none' : '0 0 20px rgba(255, 255, 255, 0.15)',
                                        }}
                                    >
                                        {filteredGames.length}
                                    </span>
                                    <span
                                        className="text-sm font-medium uppercase tracking-wider"
                                        style={{ color: isLight ? '#78716c' : '#71717a' }}
                                    >
                                        {t('featured.masterpiece') || 'Siêu Phẩm'}
                                    </span>
                                </div>
                                <div
                                    className="w-px h-12"
                                    style={{
                                        background: isLight
                                            ? 'linear-gradient(to bottom, transparent, rgba(217, 119, 6, 0.25), transparent)'
                                            : 'linear-gradient(to bottom, transparent, rgba(245, 158, 11, 0.3), transparent)',
                                        boxShadow: isLight
                                            ? '0 0 6px rgba(217, 119, 6, 0.1)'
                                            : '0 0 8px rgba(245, 158, 11, 0.15)',
                                    }}
                                />
                                <div className="flex flex-col">
                                    <span
                                        className="text-3xl font-black font-mono-tech flex items-center gap-2"
                                        style={{
                                            color: isLight ? '#1c1917' : '#ffffff',
                                            textShadow: isLight ? 'none' : '0 0 20px rgba(255, 255, 255, 0.15)',
                                        }}
                                    >
                                        4.5+ <TrendingUp className="w-5 h-5" style={{
                                            color: isLight ? '#d97706' : '#fbbf24',
                                            filter: isLight
                                                ? 'drop-shadow(0 0 4px rgba(217, 119, 6, 0.3))'
                                                : 'drop-shadow(0 0 6px rgba(245, 158, 11, 0.4))',
                                        }} />
                                    </span>
                                    <span
                                        className="text-sm font-medium uppercase tracking-wider"
                                        style={{ color: isLight ? '#78716c' : '#71717a' }}
                                    >
                                        {t('featured.rating') || 'Đánh giá'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* ===== CROWN ICON AREA ===== */}
                        <div className="hidden lg:flex w-72 h-72 relative items-center justify-center">
                            {/* Multi-layer glow behind crown */}
                            <div
                                className="absolute"
                                style={{
                                    inset: '-20%',
                                    background: isLight
                                        ? 'radial-gradient(circle, rgba(251, 191, 36, 0.12) 0%, rgba(251, 146, 60, 0.04) 40%, transparent 65%)'
                                        : 'radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, rgba(239, 68, 68, 0.05) 40%, transparent 65%)',
                                    filter: 'blur(40px)',
                                    animation: 'bannerGlow 5s ease-in-out infinite',
                                }}
                            />
                            <div
                                className="absolute"
                                style={{
                                    inset: '-10%',
                                    background: isLight
                                        ? 'radial-gradient(circle, rgba(252, 211, 77, 0.08) 0%, transparent 50%)'
                                        : 'radial-gradient(circle, rgba(251, 191, 36, 0.1) 0%, transparent 50%)',
                                    filter: 'blur(25px)',
                                    animation: 'bannerGlow 3s ease-in-out infinite 1s',
                                }}
                            />

                            {/* Crown icon */}
                            <Crown
                                className="w-40 h-40 relative z-10"
                                style={{
                                    color: isLight ? '#d97706' : '#f59e0b',
                                    animation: isLight
                                        ? 'crownPulseLight 3s ease-in-out infinite'
                                        : 'crownPulse 3s ease-in-out infinite',
                                }}
                            />

                            {/* Orbiting rings */}
                            {(() => {
                                const ringBg = isLight ? '#f8f6f1' : '#0a0b0f';
                                return (
                                    <>
                                        <div
                                            className="absolute inset-2 rounded-full"
                                            style={{
                                                border: '1.5px solid transparent',
                                                backgroundImage: `linear-gradient(${ringBg}, ${ringBg}), linear-gradient(135deg, rgba(245, 158, 11, 0.4), transparent 40%, transparent 60%, rgba(239, 68, 68, 0.3))`,
                                                backgroundOrigin: 'border-box',
                                                backgroundClip: 'padding-box, border-box',
                                                animation: 'ringRotate1 8s linear infinite',
                                            }}
                                        />
                                        <div
                                            className="absolute -inset-3 rounded-full"
                                            style={{
                                                border: '1px solid transparent',
                                                backgroundImage: `linear-gradient(${ringBg}, ${ringBg}), linear-gradient(225deg, rgba(139, 92, 246, 0.3), transparent 40%, transparent 60%, rgba(251, 191, 36, 0.2))`,
                                                backgroundOrigin: 'border-box',
                                                backgroundClip: 'padding-box, border-box',
                                                animation: 'ringRotate2 12s linear infinite',
                                            }}
                                        />
                                        <div
                                            className="absolute -inset-7 rounded-full"
                                            style={{
                                                border: '0.5px solid transparent',
                                                backgroundImage: `linear-gradient(${ringBg}, ${ringBg}), linear-gradient(315deg, rgba(245, 158, 11, 0.15), transparent 30%, transparent 70%, rgba(190, 24, 93, 0.1))`,
                                                backgroundOrigin: 'border-box',
                                                backgroundClip: 'padding-box, border-box',
                                                animation: 'ringRotate1 18s linear infinite',
                                            }}
                                        />
                                    </>
                                );
                            })()}

                            {/* Sparkle dots */}
                            {[0, 60, 120, 180, 240, 300].map((deg, i) => (
                                <div
                                    key={i}
                                    className="absolute w-1.5 h-1.5 rounded-full"
                                    style={{
                                        backgroundColor: isLight ? '#d97706' : '#fbbf24',
                                        top: '50%',
                                        left: '50%',
                                        transform: `rotate(${deg}deg) translateY(-120px)`,
                                        boxShadow: isLight
                                            ? '0 0 6px rgba(217, 119, 6, 0.5)'
                                            : '0 0 6px rgba(251, 191, 36, 0.6)',
                                        animation: `sparkle ${2 + i * 0.5}s ease-in-out infinite ${i * 0.4}s`,
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-8">
                    <CategoryFilter />
                </div>

                {/* Game Grid */}
                <div className="relative z-20">
                    <GameGrid />
                </div>
            </div>
        </main>
    );
}

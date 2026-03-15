'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/features/games/store/gameStore';
import { gameService } from '@/services/gameService';
import { Header } from '@/components/layout/Header';
import { SystemFilter } from '@/components/search/SystemFilter';
import { CategoryFilter } from '@/components/search/CategoryFilter';
import { FilterToolbar } from '@/components/search/FilterToolbar';
import { GameGrid } from '@/components/game/GameGrid';
import { validateEnv } from '@/config/env';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useTheme } from 'next-themes';
import { Gamepad2 } from 'lucide-react';

export default function SystemsPage() {
    const { setGames, isLoading, filteredGames, currentSystem, setSystem } = useGameStore();
    const { t } = useLanguage();
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        validateEnv();
        const loadGames = async () => {
            // Load all games (not just featured) since we are filtering by system
            const games = await gameService.loadGames();
            setGames(games);
        };
        loadGames();
    }, [setGames]);

    // Reset system filter when leaving page
    useEffect(() => {
        return () => {
            setSystem('all');
        };
    }, [setSystem]);

    const isLight = mounted && theme === 'light';

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-6 relative">
                    <div className="absolute inset-0 bg-purple-500/30 blur-3xl rounded-full" />
                    <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto relative z-10" />
                    <p className="text-base font-medium text-muted-foreground animate-pulse relative z-10 font-mono-tech uppercase tracking-wider">
                        Đang lấy danh sách game...
                    </p>
                </div>
            </div>
        );
    }

    // Determine banner color based on current system
    const getSystemColors = () => {
        switch (currentSystem) {
            case 'nes': return isLight 
                ? { bg: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)', border: '#fca5a5', text: '#b91c1c', glow: 'rgba(239, 68, 68, 0.25)', iconBg: 'rgba(255,255,255,0.8)' } 
                : { bg: 'linear-gradient(135deg, rgba(69, 10, 10, 0.7) 0%, rgba(30, 0, 0, 0.9) 100%)', border: '#7f1d1d', text: '#fca5a5', glow: 'rgba(239, 68, 68, 0.2)', iconBg: 'rgba(239, 68, 68, 0.2)' };
            case 'snes': return isLight 
                ? { bg: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)', border: '#d8b4fe', text: '#7e22ce', glow: 'rgba(168, 85, 247, 0.25)', iconBg: 'rgba(255,255,255,0.8)' } 
                : { bg: 'linear-gradient(135deg, rgba(59, 7, 100, 0.7) 0%, rgba(20, 0, 50, 0.9) 100%)', border: '#581c87', text: '#d8b4fe', glow: 'rgba(168, 85, 247, 0.2)', iconBg: 'rgba(168, 85, 247, 0.2)' };
            case 'gba': return isLight 
                ? { bg: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)', border: '#7dd3fc', text: '#0369a1', glow: 'rgba(14, 165, 233, 0.25)', iconBg: 'rgba(255,255,255,0.8)' } 
                : { bg: 'linear-gradient(135deg, rgba(8, 47, 73, 0.7) 0%, rgba(0, 20, 40, 0.9) 100%)', border: '#0c4a6e', text: '#7dd3fc', glow: 'rgba(14, 165, 233, 0.2)', iconBg: 'rgba(14, 165, 233, 0.2)' };
            case 'genesis': return isLight 
                ? { bg: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)', border: '#a5b4fc', text: '#4338ca', glow: 'rgba(99, 102, 241, 0.25)', iconBg: 'rgba(255,255,255,0.8)' } 
                : { bg: 'linear-gradient(135deg, rgba(30, 27, 75, 0.7) 0%, rgba(10, 10, 40, 0.9) 100%)', border: '#312e81', text: '#a5b4fc', glow: 'rgba(99, 102, 241, 0.2)', iconBg: 'rgba(99, 102, 241, 0.2)' };
            default: return isLight 
                ? { bg: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)', border: '#d1d5db', text: '#374151', glow: 'rgba(107, 114, 128, 0.2)', iconBg: 'rgba(255,255,255,0.8)' } 
                : { bg: 'linear-gradient(135deg, rgba(31, 41, 55, 0.7) 0%, rgba(10, 10, 20, 0.9) 100%)', border: '#374151', text: '#e5e7eb', glow: 'rgba(107, 114, 128, 0.15)', iconBg: 'rgba(107, 114, 128, 0.2)' };
        }
    };
    
    const colors = getSystemColors();

    return (
        <main className="min-h-screen text-foreground selection:bg-purple-500/30 relative">
            <div className="fixed inset-0 bg-background -z-20" />
            
            {/* Dynamic Background Effects based on selected system */}
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden transition-all duration-700 ease-in-out">
                {/* Glowing Orbs */}
                <div
                    className="absolute -top-[400px] left-1/2 -translate-x-1/2 w-[1200px] h-[800px] animate-pulse transition-all duration-700"
                    style={{
                        background: `radial-gradient(ellipse at center, ${colors.glow.replace('0.25', '0.4').replace('0.2', '0.3')} 0%, ${colors.glow.replace('0.25', '0.15').replace('0.2', '0.1')} 30%, transparent 70%)`,
                        filter: 'blur(50px)',
                        animationDuration: '6s',
                    }}
                />
                <div
                    className="absolute top-[30%] -right-[300px] w-[800px] h-[800px] animate-pulse transition-all duration-700"
                    style={{
                        background: `radial-gradient(circle, ${colors.glow.replace('0.25', '0.2').replace('0.2', '0.25')} 0%, ${colors.glow.replace('0.25', '0.1').replace('0.2', '0.1')} 50%, transparent 70%)`,
                        filter: 'blur(80px)',
                        animationDuration: '8s',
                        animationDelay: '2s'
                    }}
                />
                
                {/* Retrowave Perspective Grid Lines */}
                <div className="absolute inset-0 perspective-[1000px] flex items-end justify-center overflow-hidden opacity-40 mix-blend-screen transition-opacity duration-1000">
                    <div 
                        className="w-[200%] h-[100vh] origin-bottom transition-all duration-1000 ease-in-out"
                        style={{
                            backgroundSize: '80px 80px',
                            backgroundImage: `
                                linear-gradient(to right, ${colors.glow.replace('0.2', '0.4')} 1px, transparent 1px),
                                linear-gradient(to bottom, ${colors.glow.replace('0.2', '0.4')} 1px, transparent 1px)
                            `,
                            transform: 'rotateX(75deg) translateY(20%)',
                            maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 80%)',
                            WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 80%)'
                        }}
                    />
                </div>
            </div>

            <Header />

            <div className="container mx-auto px-4 lg:px-8 py-4 sm:py-8 pt-8">
                {/* Simple Header */}
                <div className="mb-6 lg:mb-8 space-y-2">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl sm:text-4xl font-black font-mono-tech uppercase tracking-wider mb-1 sm:mb-2">
                            {t('systems.title') || 'Các Hệ Máy Game'}
                        </h1>
                        <div className="flex items-center gap-2 bg-secondary/50 rounded-lg px-3 py-1.5 shrink-0">
                            <span className="text-xl font-bold font-mono-tech text-primary">
                                {filteredGames.length}
                            </span>
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden sm:inline-block">
                                Games
                            </span>
                        </div>
                    </div>
                    <p className="text-muted-foreground max-w-2xl text-sm sm:text-base">
                        {t('systems.subtitle') || 'Lựa chọn và chơi các tựa game theo tuổi thơ của bạn'}
                    </p>
                </div>
                {/* System Filter (The main focus here) */}
                <div className="mb-8">
                    <SystemFilter />
                </div>

                {/* Optional Category and Advanced Filters */}
                <div className="mb-6 flex flex-col gap-4">
                    <CategoryFilter />
                    <FilterToolbar />
                </div>

                {/* Game Grid */}
                <GameGrid />
            </div>
        </main>
    );
}

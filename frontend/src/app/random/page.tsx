'use client';

import { useLanguage } from '@/components/providers/LanguageProvider';
import { usePerformance } from '@/components/providers/PerformanceProvider';
import { Shuffle, Play, RotateCcw, Sparkles, Dices, History, Gamepad2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Header } from '@/components/layout/Header';
import { Game } from '@/types';
import Image from 'next/image';
import { imageService } from '@/services/imageService';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRandomPlay } from '@/features/games/hooks/useRandomPlay';

export default function RandomPlayPage() {
    const { t } = useLanguage();
    const { isLowPerformanceMode } = usePerformance();
    const {
        allGames, selectedGame, isSpinning, history, showResult,
        spinRandomGame, handlePlayGame, selectFromHistory,
    } = useRandomPlay();

    return (
        <main className="min-h-screen text-foreground relative selection:bg-primary/30">
            <div className="fixed inset-0 bg-background -z-20" />
            <Header />

            {!isLowPerformanceMode && (
                <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                    <div className="absolute -top-[400px] left-1/2 -translate-x-1/2 w-[1200px] h-[800px] animate-pulse"
                        style={{ background: 'radial-gradient(ellipse at center, rgba(0, 212, 255, 0.25) 0%, rgba(0, 212, 255, 0.1) 30%, transparent 70%)', filter: 'blur(40px)', animationDuration: '4s' }} />
                    <div className="absolute top-[20%] -left-[200px] w-[500px] h-[500px] animate-float"
                        style={{ background: 'radial-gradient(circle, rgba(255, 0, 255, 0.15) 0%, transparent 60%)', filter: 'blur(60px)' }} />
                    <div className="absolute top-[40%] -right-[300px] w-[700px] h-[700px] animate-pulse"
                        style={{ background: 'radial-gradient(circle, rgba(0, 245, 212, 0.18) 0%, rgba(0, 212, 255, 0.08) 40%, transparent 70%)', filter: 'blur(80px)', animationDuration: '5s', animationDelay: '1s' }} />
                    <div className="absolute inset-0"
                        style={{ backgroundSize: '60px 60px', backgroundImage: 'linear-gradient(to right, rgba(0, 212, 255, 0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 212, 255, 0.06) 1px, transparent 1px)' }} />
                </div>
            )}

            <div className="container mx-auto px-4 lg:px-8 py-12">
                <div className="flex flex-col items-center mb-12 text-center">
                    <div className={cn("p-4 rounded-full mb-4 ring-1 bg-gradient-to-br from-primary/20 to-accent/20 ring-primary/30", !isLowPerformanceMode && "animate-pulse")}>
                        <Dices className="w-12 h-12 text-primary" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black font-tech uppercase bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary animate-gradient mb-4">
                        {t('random.title') || 'RANDOM PLAY'}
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl">
                        {t('random.subtitle') || 'Không biết chơi gì? Để số phận quyết định! Bấm nút để chọn ngẫu nhiên một game.'}
                    </p>
                </div>

                <div className="max-w-4xl mx-auto">
                    <div className="bg-card/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl mb-8">
                        <div className="relative flex flex-col items-center">
                            <div className={cn(
                                "relative w-64 h-80 rounded-2xl overflow-hidden border-2 mb-8 transition-all duration-300",
                                isSpinning ? "border-primary shadow-lg shadow-primary/50 animate-pulse"
                                    : showResult ? "border-primary/50 shadow-xl shadow-primary/30" : "border-white/10"
                            )}>
                                {selectedGame ? (
                                    <>
                                        <GameImage game={selectedGame} isSpinning={isSpinning} />
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4">
                                            <h3 className={cn("font-bold text-white text-lg truncate transition-all", isSpinning && "blur-sm")}>{selectedGame.name}</h3>
                                            <p className="text-white/70 text-sm">{selectedGame.category || 'NES Game'}</p>
                                        </div>
                                        {isSpinning && (
                                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                                <Shuffle className="w-12 h-12 text-primary animate-spin" />
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-secondary to-muted flex flex-col items-center justify-center">
                                        <Gamepad2 className="w-16 h-16 text-muted-foreground/30 mb-4" />
                                        <p className="text-muted-foreground text-sm text-center px-4">{t('random.clickToStart') || 'Bấm nút để bắt đầu'}</p>
                                    </div>
                                )}
                            </div>

                            {showResult && selectedGame && (
                                <div className="flex items-center gap-2 mb-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <Sparkles className="w-5 h-5 text-yellow-400" />
                                    <span className="text-lg font-bold bg-gradient-magic bg-clip-text text-transparent">{t('random.yourGame') || 'Game dành cho bạn!'}</span>
                                    <Sparkles className="w-5 h-5 text-yellow-400" />
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <button onClick={spinRandomGame} disabled={isSpinning || allGames.length === 0}
                                    className={cn("group relative px-10 py-4 rounded-2xl font-bold text-lg uppercase tracking-wider transition-all duration-300 bg-gradient-to-r from-primary to-accent text-white hover:shadow-2xl hover:shadow-primary/40 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed", isSpinning && "animate-pulse")}>
                                    <span className="flex items-center gap-3">
                                        {isSpinning ? <><Shuffle className="w-6 h-6 animate-spin" />{t('random.spinning') || 'Đang quay...'}</>
                                            : <><Dices className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />{t('random.spin') || 'QUAY NGẪU NHIÊN'}</>}
                                    </span>
                                </button>

                                {showResult && selectedGame && (
                                    <button onClick={handlePlayGame}
                                        className={cn("px-8 py-4 rounded-2xl font-bold text-lg uppercase tracking-wider transition-all duration-300 bg-white/10 border border-white/20 text-foreground hover:bg-primary/20 hover:border-primary/50 hover:scale-105 active:scale-95 animate-in fade-in slide-in-from-left-4")}>
                                        <span className="flex items-center gap-3"><Play className="w-5 h-5 fill-current" />{t('random.playNow') || 'CHƠI NGAY'}</span>
                                    </button>
                                )}
                            </div>

                            <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2"><Gamepad2 className="w-4 h-4" /><span>{allGames.length} games</span></div>
                                <div className="w-1 h-1 rounded-full bg-white/20" />
                                <div className="flex items-center gap-2"><RotateCcw className="w-4 h-4" /><span>{history.length} {t('random.played') || 'đã quay'}</span></div>
                            </div>
                        </div>
                    </div>

                    {history.length > 0 && (
                        <div className="bg-card/30 backdrop-blur border border-white/5 rounded-3xl p-6">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <History className="w-5 h-5 text-primary" />
                                {t('random.recentSpins') || 'Đã quay gần đây'}
                            </h3>
                            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                                {history.map((game, index) => (
                                    <HistoryItem key={`${game.id}-${index}`} game={game} onClick={() => selectFromHistory(game)} />
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mt-8 text-center">
                        <p className="text-muted-foreground text-sm">
                            💡 {t('random.tip') || 'Mẹo: Bạn cũng có thể truy cập'}{' '}
                            <Link href="/library" className="text-primary hover:underline">{t('nav.library') || 'Thư viện game'}</Link>
                            {' '}{t('random.tipEnd') || 'để tìm kiếm game theo tên hoặc danh mục.'}
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}

function GameImage({ game, isSpinning }: { game: Game; isSpinning: boolean }) {
    const [imageUrl, setImageUrl] = useState(game.image || game.thumbnail || '/placeholder.png');
    const [fallbackUrls] = useState(() => imageService.generateFallbackUrls(game.name, game.image));
    const [currentFallbackIndex, setCurrentFallbackIndex] = useState(0);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        setImageUrl(game.image || game.thumbnail || '/placeholder.png');
        setCurrentFallbackIndex(0);
        setHasError(false);
    }, [game]);

    const handleImageError = () => {
        if (hasError) return;
        const nextUrl = imageService.getNextFallbackUrl(fallbackUrls, currentFallbackIndex);
        if (nextUrl) { setImageUrl(nextUrl); setCurrentFallbackIndex(prev => prev + 1); }
        else setHasError(true);
    };

    if (hasError) {
        return (
            <div className="w-full h-full bg-gradient-to-br from-secondary to-muted flex items-center justify-center">
                <div className="text-center"><div className="text-5xl mb-2 opacity-40">🎮</div><p className="text-xs text-muted-foreground px-4 line-clamp-2">{game.name}</p></div>
            </div>
        );
    }

    return <Image src={imageUrl} alt={game.name} fill className={cn("object-cover transition-all duration-300", isSpinning && "scale-110 blur-sm")} onError={handleImageError} sizes="256px" />;
}

function HistoryItem({ game, onClick }: { game: Game; onClick: () => void }) {
    const [imageUrl] = useState(game.image || game.thumbnail || '/placeholder.png');
    const [hasError, setHasError] = useState(false);

    return (
        <button onClick={onClick} className="flex-shrink-0 w-24 group cursor-pointer">
            <div className="relative w-24 h-32 rounded-xl overflow-hidden border border-white/10 group-hover:border-primary/50 transition-all">
                {!hasError ? (
                    <Image src={imageUrl} alt={game.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" onError={() => setHasError(true)} sizes="96px" />
                ) : (
                    <div className="w-full h-full bg-secondary flex items-center justify-center"><Gamepad2 className="w-6 h-6 text-muted-foreground/50" /></div>
                )}
            </div>
            <p className="mt-2 text-xs text-muted-foreground truncate group-hover:text-foreground transition-colors">{game.name}</p>
        </button>
    );
}

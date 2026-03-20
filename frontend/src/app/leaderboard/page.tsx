'use client';

import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { usePerformance } from '@/components/providers/PerformanceProvider';
import { Game } from '@/types/game';
import { Trophy } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { useLeaderboard } from '@/features/leaderboard/hooks/useLeaderboard';
import { LeaderboardList } from '@/components/game/LeaderboardList';

export default function LeaderboardPage() {
    const router = useRouter();
    const { t } = useLanguage();
    const { isLowPerformanceMode } = usePerformance();
    const { topGames, isLoading } = useLeaderboard();

    const handleGameClick = (game: Game) => {
        router.push(`/games/${game.id}/play`);
    };

    return (
        <main className="min-h-screen text-foreground relative selection:bg-primary/30">
            {/* Base background color */}
            <div className="fixed inset-0 bg-background -z-20" />

            <Header />

            {/* Background Effects - NEXUS Style */}
            {!isLowPerformanceMode && (
                <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                    <div
                        className="absolute -top-[400px] left-1/2 -translate-x-1/2 w-[1200px] h-[800px] animate-pulse"
                        style={{
                            background: 'radial-gradient(ellipse at center, rgba(0, 212, 255, 0.25) 0%, rgba(0, 212, 255, 0.1) 30%, transparent 70%)',
                            filter: 'blur(40px)',
                            animationDuration: '4s',
                        }}
                    />
                    <div
                        className="absolute top-[20%] -left-[200px] w-[500px] h-[500px] animate-float"
                        style={{
                            background: 'radial-gradient(circle, rgba(0, 245, 212, 0.15) 0%, transparent 60%)',
                            filter: 'blur(60px)',
                        }}
                    />
                    <div
                        className="absolute top-[40%] -right-[300px] w-[700px] h-[700px] animate-pulse"
                        style={{
                            background: 'radial-gradient(circle, rgba(255, 0, 255, 0.18) 0%, rgba(139, 92, 246, 0.08) 40%, transparent 70%)',
                            filter: 'blur(80px)',
                            animationDuration: '5s',
                            animationDelay: '1s',
                        }}
                    />
                    <div
                        className="absolute -bottom-[200px] left-1/3 w-[800px] h-[400px] animate-pulse"
                        style={{
                            background: 'radial-gradient(ellipse at center, rgba(0, 212, 255, 0.12) 0%, transparent 60%)',
                            filter: 'blur(100px)',
                            animationDuration: '6s',
                        }}
                    />
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundSize: '60px 60px',
                            backgroundImage: `
              linear-gradient(to right, rgba(0, 212, 255, 0.06) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0, 212, 255, 0.06) 1px, transparent 1px)
            `,
                        }}
                    />
                    <div
                        className="absolute inset-0"
                        style={{
                            background: 'radial-gradient(ellipse at center, transparent 0%, rgba(5, 10, 20, 0.4) 100%)',
                        }}
                    />
                </div>
            )}

            <div className="container mx-auto px-4 lg:px-8 py-12">
                <div className="flex flex-col items-center mb-12 text-center">
                    <div className="p-4 rounded-full bg-primary/10 mb-4 ring-1 ring-primary/20">
                        <Trophy className="w-12 h-12 text-primary" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black font-tech uppercase bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary animate-gradient mb-4">
                        {t('leaderboard.title') || 'Leaderboard'}
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl">
                        {t('leaderboard.subtitle') || 'Top rated games by our community. Play, rate, and help your favorites climb the ranks!'}
                    </p>
                </div>

                <LeaderboardList
                    games={topGames}
                    isLoading={isLoading}
                    onGameClick={handleGameClick}
                />
            </div>
        </main>
    );
}

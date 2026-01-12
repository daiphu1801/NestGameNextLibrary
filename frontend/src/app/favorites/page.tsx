'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/features/games/store/gameStore';
import { userService } from '@/services/userService';
import { Header } from '@/components/layout/Header';
import { GameModal } from '@/components/game/GameModal';
import { FavoriteGameCard } from '@/components/game/FavoriteGameCard';
import { Game } from '@/types';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { usePerformance } from '@/components/providers/PerformanceProvider';
import { useAuth } from '@/components/providers/AuthProvider';
import { ArrowLeft, Heart, Trash2, LogIn } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function FavoritesPage() {
    const { t } = useLanguage();
    const { user, openLoginModal } = useAuth();
    const { isLowPerformanceMode } = usePerformance();
    const [favoriteGames, setFavoriteGames] = useState<Game[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedGame, setSelectedGame] = useState<Game | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const loadFavorites = async () => {
            if (!user) {
                setFavoriteGames([]);
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            try {
                const favs = await userService.getFavorites();
                setFavoriteGames(favs);
            } catch (error) {
                console.error('Failed to load favorites:', error);
                setFavoriteGames([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadFavorites();

        const handleStorageUpdate = () => {
            loadFavorites();
        };
        window.addEventListener('favorites-updated', handleStorageUpdate);
        return () => window.removeEventListener('favorites-updated', handleStorageUpdate);

    }, [user]);

    const handleGameClick = (game: Game) => {
        setSelectedGame(game);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setTimeout(() => setSelectedGame(null), 300);
    };

    const handleRemoveFavorite = (gameId: string | number) => {
        setFavoriteGames(prev => prev.filter(g => g.id !== gameId));
    };

    const handleClearAll = async () => {
        if (!confirm('Bạn có chắc muốn xóa tất cả game yêu thích?')) return;

        for (const game of favoriteGames) {
            try {
                await userService.removeFavorite(game.id);
            } catch (e) {
                console.error('Failed to remove', e);
            }
        }
        setFavoriteGames([]);
        window.dispatchEvent(new Event('favorites-updated'));
    };

    return (
        <main className="min-h-screen text-foreground selection:bg-primary/30 relative">
            {/* Base background */}
            <div className="fixed inset-0 bg-background -z-20" />

            {/* Background Effects */}
            {!isLowPerformanceMode && (
                <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                    <div
                        className="absolute -top-[400px] left-1/2 -translate-x-1/2 w-[1200px] h-[800px] animate-pulse"
                        style={{
                            background: 'radial-gradient(ellipse at center, rgba(255, 100, 50, 0.1) 0%, rgba(255, 0, 100, 0.05) 30%, transparent 70%)',
                            filter: 'blur(60px)',
                        }}
                    />
                </div>
            )}

            <Header />

            <div className="container mx-auto px-4 lg:px-8 py-12">
                {/* Back Link */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium">{t('nav.home') || 'Back to Home'}</span>
                </Link>

                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "p-4 rounded-2xl shadow-lg",
                            "bg-gradient-to-br from-rose-500 to-pink-600 shadow-rose-500/20"
                        )}>
                            <Heart className="w-8 h-8 text-white fill-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-black font-mono-tech uppercase tracking-tight flex items-center gap-3">
                                {t('nav.favorites') || 'My Favorites'}
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                {user ? (t('user.favoritesDesc') || 'Your collection of loved games') : 'Đăng nhập để xem danh sách yêu thích'}
                            </p>
                        </div>
                    </div>

                    {/* Stats & Actions */}
                    {user && (
                        <div className="flex items-center gap-3">
                            <div className="px-4 py-2 rounded-xl bg-card border border-white/10">
                                <span className="text-rose-400 font-bold text-xl">{favoriteGames.length}</span>
                                <span className="text-muted-foreground ml-2 text-sm">{t('pagination.games') || 'games'}</span>
                            </div>

                            {favoriteGames.length > 0 && (
                                <button
                                    onClick={handleClearAll}
                                    className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all flex items-center gap-2 text-sm font-medium"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Xóa tất cả
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Content */}
                {!user ? (
                    /* Guest - Login Required */
                    <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl bg-white/5">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-rose-500/20 to-pink-500/20 flex items-center justify-center">
                            <LogIn className="w-10 h-10 text-rose-400" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Đăng nhập để sử dụng</h3>
                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                            Tính năng yêu thích chỉ dành cho người dùng đã đăng nhập. Đăng nhập để lưu và quản lý danh sách game yêu thích của bạn!
                        </p>
                        <button
                            onClick={openLoginModal}
                            className="px-8 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold hover:brightness-110 transition-all flex items-center gap-2 mx-auto"
                        >
                            <LogIn className="w-5 h-5" />
                            Đăng nhập ngay
                        </button>
                    </div>
                ) : isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
                    </div>
                ) : favoriteGames.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                        {favoriteGames.map((game) => (
                            <FavoriteGameCard
                                key={game.id}
                                game={game}
                                onClick={() => handleGameClick(game)}
                                onRemove={handleRemoveFavorite}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl bg-white/5">
                        <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <h3 className="text-xl font-bold mb-2">{t('favorites.empty') || 'Chưa có game yêu thích'}</h3>
                        <p className="text-muted-foreground mb-6">{t('favorites.emptyDesc') || 'Nhấn vào biểu tượng ❤️ trên game để thêm vào đây!'}</p>
                        <Link href="/">
                            <button className="px-6 py-2 rounded-full bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity">
                                {t('header.play') || 'Khám phá game'}
                            </button>
                        </Link>
                    </div>
                )}

            </div>

            {/* Game Modal */}
            {selectedGame && (
                <GameModal
                    game={selectedGame}
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                />
            )}
        </main>
    );
}

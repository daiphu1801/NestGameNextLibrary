'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Game } from '@/types';
import { gameService } from '@/services/gameService';
import { Loader2, Gamepad2, AlertCircle, ChevronRight, Crown, Trophy } from 'lucide-react';

export default function GameOfTheMonthBanner() {
    const [game, setGame] = useState<Game | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchGame = async () => {
            try {
                const gotm = await gameService.getGameOfTheMonth();
                setGame(gotm || null);
            } catch (error) {
                console.error('Lỗi khi tải Game Of The Month:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchGame();
    }, []);

    if (isLoading) {
        return (
            <div className="w-full h-[300px] rounded-3xl overflow-hidden relative bg-[#0F172A] flex items-center justify-center border border-white/5 shadow-2xl">
                <div className="flex flex-col items-center gap-4 text-white/50">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    <p className="text-sm font-medium animate-pulse">Đang nạp dữ liệu siêu phẩm...</p>
                </div>
            </div>
        );
    }

    if (!game) return null;

    return (
        <section className="w-full relative group">
            {/* Background Effects */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-purple-600/30 rounded-[2.5rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>
            
            <div className="relative w-full overflow-hidden rounded-[2rem] border border-white/10 bg-[#0F172A] shadow-2xl">
                {/* Hero Background with Overlay */}
                <div className="absolute inset-0 z-0">
                    <img
                        src={game.imageSnap || game.imageUrl || "/placeholder.jpg"}
                        alt=""
                        className="w-full h-full object-cover scale-105 blur-sm opacity-40 group-hover:scale-100 group-hover:blur-none transition-all duration-1000"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A] via-[#0F172A]/80 to-transparent z-10"></div>
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#0F172A] to-transparent z-10"></div>
                </div>

                {/* Content Container */}
                <div className="relative z-20 px-8 py-10 md:px-12 md:py-16 flex flex-col md:flex-row gap-10 items-center">
                    
                    {/* Game Card Visual */}
                    <div className="relative flex-shrink-0">
                        <div className="absolute -inset-4 bg-primary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative w-48 h-64 md:w-56 md:h-72 rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl rotate-2 group-hover:rotate-0 transition-transform duration-500">
                            <img
                                src={game.imageUrl || game.image || "/placeholder.jpg"}
                                alt={game.name}
                                className="w-full h-full object-cover"
                            />
                            {/* Floating Stats */}
                            <div className="absolute top-2 right-2 px-2 py-1 bg-black/80 backdrop-blur-md rounded-lg border border-white/10">
                                <span className="text-[10px] font-black text-amber-500">★ {game.rating?.toFixed(1)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Game Info */}
                    <div className="flex-1 text-center md:text-left space-y-6">
                        <div className="space-y-3">
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30 text-[10px] font-black uppercase tracking-widest animate-pulse">
                                    <Crown className="w-3 h-3" />
                                    Game của tháng
                                </span>
                                <span className="px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/30 text-[10px] font-black uppercase tracking-widest">
                                    {game.system}
                                </span>
                                {game.year && (
                                    <span className="px-3 py-1 rounded-full bg-white/5 text-white/60 border border-white/10 text-[10px] font-bold">
                                        {game.year}
                                    </span>
                                )}
                            </div>
                            
                            <h2 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tighter uppercase italic group-hover:translate-x-1 transition-transform">
                                {game.name}
                            </h2>
                            
                            <p className="text-white/60 text-sm md:text-lg max-w-2xl font-medium leading-relaxed line-clamp-2 md:line-clamp-3 italic">
                                &ldquo;{game.description || `Trải nghiệm ngay siêu phẩm ${game.name} trên trình giả lập của chúng tôi.`}&rdquo;
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
                            <Link
                                href={`/game-of-the-month`}
                                className="group/btn relative px-8 py-3.5 bg-primary hover:bg-primary/90 text-white font-black rounded-xl overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/25 flex items-center gap-2"
                            >
                                <span className="relative z-10 flex items-center gap-2 uppercase tracking-wider text-sm">
                                    <Gamepad2 className="w-5 h-5" />
                                    Bắt đầu chơi ngay
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></div>
                            </Link>

                            <Link
                                href="/game-of-the-month"
                                className="px-8 py-3.5 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl border border-white/10 transition-all flex items-center gap-2"
                            >
                                <span className="uppercase tracking-wider text-sm">Chi tiết</span>
                                <ChevronRight className="w-4 h-4 text-white/40 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Bottom Status Bar */}
                <div className="relative z-20 px-8 py-3 bg-black/40 backdrop-blur-sm border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-white/40">
                            <Trophy className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold uppercase">Game tiêu điểm - {game.gameOfMonthPeriod}</span>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-1.5 text-emerald-500">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest">Sẵn sàng tải về</span>
                    </div>
                </div>
            </div>
        </section>
    );
}

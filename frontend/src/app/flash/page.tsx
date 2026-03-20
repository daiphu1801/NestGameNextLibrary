'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { GameGrid } from '@/components/game/GameGrid';
import { useGameStore } from '@/features/games/store/gameStore';
import { gameService } from '@/services/gameService';
import { validateEnv } from '@/config/env';
import { Zap, Flame, MonitorPlay } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';

export default function FlashPortalPage() {
  const { allGames, isLoading: isGamesLoading, setGames } = useGameStore();
  const { t } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    validateEnv();
    const loadGames = async () => {
      const games = await gameService.loadGames();
      setGames(games);
    };
    loadGames();
  }, [setGames]);

  // Handle local state for Flash games
  const filteredGames = useMemo(() => allGames.filter(g => g.system === 'flash'), [allGames]);
  const [page, setPage] = useState(1);
  const gamesPerPage = 25;
  
  const totalPages = Math.ceil(filteredGames.length / gamesPerPage);
  const paginatedGames = useMemo(() => {
    const start = (page - 1) * gamesPerPage;
    return filteredGames.slice(start, start + gamesPerPage);
  }, [filteredGames, page, gamesPerPage]);

  const isLoading = isGamesLoading && allGames.length === 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F0A0A]">
        <div className="text-center space-y-6 relative">
          <div className="absolute inset-0 bg-orange-500/30 blur-3xl rounded-full" />
          <div className="w-16 h-16 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto relative z-10" />
          <p className="text-base font-medium text-orange-400 animate-pulse relative z-10 font-tech uppercase tracking-wider">
            Loading Flash Gateway...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0F0F23] text-slate-200 selection:bg-orange-500/30 relative overflow-hidden">
      {/* Intense Amber/Orange Aurora Background (Enterprise Gateway style) */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[#0F0A0A]" />
        
        {/* Animated Glows */}
        <div 
          className="absolute -top-[20%] left-[10%] w-[60%] h-[60%] rounded-full mix-blend-screen opacity-40 animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(234, 88, 12, 0.4) 0%, rgba(225, 29, 72, 0.1) 40%, transparent 70%)',
            filter: 'blur(60px)',
            animationDuration: '4s'
          }}
        />
        <div 
          className="absolute top-[40%] right-[-10%] w-[50%] h-[70%] rounded-full mix-blend-screen opacity-30 animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(245, 158, 11, 0.3) 0%, rgba(234, 88, 12, 0.1) 50%, transparent 70%)',
            filter: 'blur(80px)',
            animationDuration: '6s'
          }}
        />

        {/* Tech Grid Overlay */}
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(234, 88, 12, 0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(234, 88, 12, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)'
          }}
        />
      </div>

      <Header />

      <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-12 relative z-10">
        
        {/* Flash Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden mb-12 border border-orange-500/20 bg-black/40 backdrop-blur-md shadow-2xl shadow-orange-900/20">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 to-rose-600/20" />
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500" />
          
          <div className="relative p-8 lg:p-12 flex flex-col items-center justify-center text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-600 mb-6 shadow-lg shadow-orange-500/40 transform -rotate-6">
              <Zap className="w-10 h-10 text-white fill-white animate-pulse" />
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-black text-white tracking-tight mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                FLASH
              </span> CLASSICS GATEWAY
            </h1>
            
            <p className="text-lg text-orange-200/80 max-w-2xl mx-auto mb-8 leading-relaxed">
              Trở về tuổi thơ với hàng ngàn tựa game Flash huyền thoại (Y8, 24h, GameVui). 
              Tất cả đều được hồi sinh hoàn hảo ngay trên trình duyệt nhờ công nghệ <strong>WebAssembly Ruffle</strong>, không cần cài đặt bất kỳ Plugin nào!
            </p>

            <div className="flex items-center justify-center gap-6 text-sm font-tech font-bold uppercase tracking-wider text-orange-400">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4" /> Nostalgic Hits
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-orange-500/50" />
              <div className="flex items-center gap-2">
                <MonitorPlay className="w-4 h-4" /> Instant Play
              </div>
            </div>
          </div>
        </div>

        {/* Flash Games Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-3 text-white">
              <div className="w-1 h-6 rounded-full bg-gradient-to-b from-orange-500 to-rose-500" />
              Tất cả Game Flash
            </h2>
            <div className="px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 font-tech text-sm font-bold">
              {filteredGames.length} MỤC
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-black/40 border border-white/5 backdrop-blur-sm">
            {paginatedGames.length > 0 ? (
              <GameGrid 
                games={paginatedGames}
                totalGames={filteredGames.length}
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            ) : (
              <div className="text-center py-20">
                <Zap className="w-16 h-16 text-orange-500/20 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Chưa có game Flash nào</h3>
                <p className="text-slate-400">Hãy đăng nhập Admin và tải lên các file .swf nhé!</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}

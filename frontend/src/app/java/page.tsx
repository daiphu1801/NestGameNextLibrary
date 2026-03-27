'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { GameGrid } from '@/components/game/GameGrid';
import { useGameStore } from '@/features/games/store/gameStore';
import { gameService } from '@/services/gameService';
import { validateEnv } from '@/config/env';
import { Smartphone, Sparkles, Wifi } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { motion } from 'framer-motion';

export default function JavaPortalPage() {
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

  // Filter only J2ME games
  const filteredGames = useMemo(() => allGames.filter(g => g.system === 'j2me'), [allGames]);
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
      <div className="min-h-screen flex items-center justify-center bg-[#060F0D]">
        <div className="text-center space-y-6 relative">
          <div className="absolute inset-0 bg-teal-500/30 blur-3xl rounded-full" />
          <div className="w-16 h-16 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin mx-auto relative z-10" />
          <p className="text-base font-medium text-teal-400 animate-pulse relative z-10 font-tech uppercase tracking-wider">
            Loading Java Gateway...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#060F0D] text-slate-200 selection:bg-teal-500/30 relative overflow-hidden">
      {/* Teal/Green Nokia Aurora Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[#060F0D]" />
        
        {/* Animated Glows */}
        <div 
          className="absolute -top-[20%] left-[10%] w-[60%] h-[60%] rounded-full mix-blend-screen opacity-40 animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(20, 184, 166, 0.4) 0%, rgba(16, 185, 129, 0.1) 40%, transparent 70%)',
            filter: 'blur(60px)',
            animationDuration: '4s'
          }}
        />
        <div 
          className="absolute top-[40%] right-[-10%] w-[50%] h-[70%] rounded-full mix-blend-screen opacity-30 animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(52, 211, 153, 0.3) 0%, rgba(20, 184, 166, 0.1) 50%, transparent 70%)',
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
              linear-gradient(to right, rgba(20, 184, 166, 0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(20, 184, 166, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)'
          }}
        />
      </div>

      <Header />

      <div className="container mx-auto px-2 sm:px-4 lg:px-8 pt-6 sm:pt-8 pb-24 lg:py-12 relative z-10">
        
        {/* Java Hero Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative rounded-2xl sm:rounded-3xl overflow-hidden mb-8 sm:mb-12 border border-teal-500/20 bg-black/40 backdrop-blur-md shadow-2xl shadow-teal-900/20"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-teal-600/20 to-emerald-600/20" />
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 via-emerald-500 to-green-500" />
          
          <div className="relative p-8 lg:p-12 flex flex-col items-center justify-center text-center">
            
            {/* 3D Floating Phone Icon */}
            <div className="mb-8" style={{ perspective: "1000px" }}>
              <motion.div 
                animate={{ 
                  y: [0, -15, 0],
                  rotateZ: [-5, 5, -5],
                  rotateY: [-20, 20, -20],
                  rotateX: [10, -10, 10]
                }}
                transition={{ 
                  duration: 5, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-2xl shadow-teal-500/60 border border-teal-400/40 relative transform-style-3d cursor-pointer group"
              >
                <div className="absolute inset-0 rounded-3xl bg-white/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Smartphone className="w-12 h-12 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
              </motion.div>
            </div>
            
            <motion.h1 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
              className="text-4xl lg:text-6xl font-black text-white tracking-tight mb-4"
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">
                JAVA
              </span> MOBILE GATEWAY
            </motion.h1>
            
            <p className="text-lg text-teal-200/80 max-w-2xl mx-auto mb-8 leading-relaxed">
              {t('javaPortal.subtitle')}
            </p>

            <div className="flex items-center justify-center gap-6 text-sm font-tech font-bold uppercase tracking-wider text-teal-400">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> {t('javaPortal.tag1')}
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-teal-500/50" />
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4" /> {t('javaPortal.tag2')}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Java Games Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-3 text-white">
              <div className="w-1 h-6 rounded-full bg-gradient-to-b from-teal-500 to-emerald-500" />
              {t('javaPortal.allGames')}
            </h2>
            <div className="px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 font-tech text-sm font-bold">
              {filteredGames.length} {t('javaPortal.items')}
            </div>
          </div>

          <div className="p-3 sm:p-6 rounded-2xl bg-black/40 border border-white/5 backdrop-blur-sm">
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
                <Smartphone className="w-16 h-16 text-teal-500/20 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">{t('javaPortal.empty')}</h3>
                <p className="text-slate-400">{t('javaPortal.emptyDesc')}</p>
              </div>
            )}
          </div>
        </motion.div>

      </div>
    </main>
  );
}

'use client';

import { useEffect } from 'react';
import { useGameStore } from '@/features/games/store/gameStore';
import { gameService } from '@/services/gameService';
import { Header } from '@/components/layout/Header';
import { CategoryFilter } from '@/components/search/CategoryFilter';
import { GameGrid } from '@/components/game/GameGrid';
import { FeaturedGames } from '@/components/game/FeaturedGames';
import { GameModal } from '@/components/game/GameModal';
import { validateEnv } from '@/config/env';
import { Sparkles, Zap, Save, ArrowRight, Play, Gamepad2, Users, Trophy } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useState } from 'react';
import { Game } from '@/types';

export default function HomePage() {
  const { setGames, isLoading, filteredGames, allGames } = useGameStore();
  const { t } = useLanguage();
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleGameClick = (game: Game) => {
    setSelectedGame(game);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedGame(null), 300);
  };

  useEffect(() => {
    validateEnv();
    const loadGames = async () => {
      const games = await gameService.loadGames();
      setGames(games);
    };
    loadGames();
  }, [setGames]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-6 relative">
          <div className="absolute inset-0 bg-primary/30 blur-3xl rounded-full" />
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto relative z-10" />
          <p className="text-base font-medium text-muted-foreground animate-pulse relative z-10 font-mono-tech uppercase tracking-wider">
            {t('game.loading')}...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen text-foreground selection:bg-primary/30 relative">
      {/* Base background color - sits behind everything */}
      <div className="fixed inset-0 bg-background -z-20" />

      <Header />

      {/* Background Effects - NEXUS Style */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        {/* Main animated cyan glow orb */}
        <div
          className="absolute -top-[400px] left-1/2 -translate-x-1/2 w-[1200px] h-[800px] animate-pulse"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(0, 212, 255, 0.25) 0%, rgba(0, 212, 255, 0.1) 30%, transparent 70%)',
            filter: 'blur(40px)',
            animationDuration: '4s',
          }}
        />

        {/* Secondary cyan blob - floating */}
        <div
          className="absolute top-[20%] -left-[200px] w-[500px] h-[500px] animate-float"
          style={{
            background: 'radial-gradient(circle, rgba(0, 245, 212, 0.15) 0%, transparent 60%)',
            filter: 'blur(60px)',
          }}
        />

        {/* Magenta/Purple glow orb - right side */}
        <div
          className="absolute top-[40%] -right-[300px] w-[700px] h-[700px] animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(255, 0, 255, 0.18) 0%, rgba(139, 92, 246, 0.08) 40%, transparent 70%)',
            filter: 'blur(80px)',
            animationDuration: '5s',
            animationDelay: '1s',
          }}
        />

        {/* Bottom glow for depth */}
        <div
          className="absolute -bottom-[200px] left-1/3 w-[800px] h-[400px] animate-pulse"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(0, 212, 255, 0.12) 0%, transparent 60%)',
            filter: 'blur(100px)',
            animationDuration: '6s',
          }}
        />

        {/* Grid pattern overlay - more visible */}
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

        {/* Vignette effect for focus */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 0%, rgba(5, 10, 20, 0.4) 100%)',
          }}
        />
      </div>

      <div className="container mx-auto px-4 lg:px-8">
        {/* Hero Section - Two Column Layout */}
        <section className="relative py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Column - Hero Content */}
            <div className="space-y-8">
              {/* Live Badge */}
              <div className="badge-live">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                <span>{t('welcome.badge').replace('{count}', '1700')}</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-none">
                <span className="text-foreground block">{t('welcome.titlePart1') || 'PLAY YOUR'}</span>
                <span className="text-gradient-cyan block italic">{t('welcome.titlePart2') || 'CLASSICS'}</span>
              </h1>

              {/* Description */}
              <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
                {t('welcome.description')}
              </p>

              {/* CTA Buttons */}
              <div className="flex items-center gap-4 flex-wrap">
                <a href="#library" className="btn-primary inline-flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  {t('welcome.startPlaying') || 'Launch App'}
                </a>
                <button className="btn-outline inline-flex items-center gap-2">
                  {t('welcome.browseLibrary') || 'Read Docs'}
                </button>
              </div>

              {/* Stats Cards */}
              <div className="flex items-center gap-4 flex-wrap pt-4">
                <div className="stats-card">
                  <div className="stats-value">{filteredGames.length}+</div>
                  <div className="stats-label">{t('stats.games') || 'Games'}</div>
                </div>
                <div className="stats-card">
                  <div className="stats-value">50K</div>
                  <div className="stats-label">{t('stats.users') || 'Users'}</div>
                </div>
                <div className="stats-card">
                  <div className="stats-value">100%</div>
                  <div className="stats-label">{t('stats.free') || 'Free'}</div>
                </div>
              </div>
            </div>

            {/* Right Column - Feature Card */}
            <div className="glass-card-strong rounded-2xl p-6 lg:p-8 space-y-6">
              <div className="flex items-center gap-2 text-sm font-mono-tech uppercase tracking-widest">
                <Gamepad2 className="w-4 h-4 text-primary" />
                <span className="text-foreground">Game</span>
                <span className="text-muted-foreground">Features</span>
              </div>

              {/* Feature List */}
              <div className="space-y-4">
                <FeatureItem
                  icon={Sparkles}
                  title={t('welcome.free') || 'Free to Play'}
                  description={t('features.freeDesc') || 'No payment required, play instantly'}
                />
                <FeatureItem
                  icon={Zap}
                  title={t('welcome.noInstall') || 'Instant Load'}
                  description={t('features.instantDesc') || 'No downloads, runs in your browser'}
                />
                <FeatureItem
                  icon={Save}
                  title={t('welcome.saveState') || 'Cloud Saves'}
                  description={t('features.saveDesc') || 'Save your progress and continue anytime'}
                />
              </div>

              {/* CTA in Card */}
              <button className="w-full btn-gradient py-4 mt-4">
                {t('header.play') || 'Start Playing Now'}
              </button>
            </div>
          </div>
        </section>

        {/* Featured Hot Games Section */}
        <FeaturedGames games={allGames} onGameClick={handleGameClick} />

        {/* Game Library Section */}
        <section id="library" className="pb-20 space-y-8">
          {/* Section Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h2 className="text-2xl font-bold font-mono-tech uppercase tracking-wider">
              {t('game.library') || 'Game Library'}
            </h2>
            <span className="text-primary font-mono-tech">{filteredGames.length} {t('header.games') || 'GAMES'}</span>
          </div>

          {/* Category Filter */}
          <CategoryFilter />

          {/* Game Grid */}
          <GameGrid />
        </section>
      </div>

      {/* Game Modal for Featured Games */}
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

function FeatureItem({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-xl bg-secondary/50 border border-border/50 hover:border-primary/30 transition-colors">
      <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
      </div>
    </div>
  );
}

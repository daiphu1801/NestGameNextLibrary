'use client';

import { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Gamepad2, Zap, Sparkles, Star } from 'lucide-react';
import Image from 'next/image';
import { Game } from '@/types';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { cn } from '@/lib/utils';

// ================================================================
// RIGHT PANEL — Hot Games
// ================================================================

interface HotGamesPanelProps {
  hotGames: Game[];
  onGameClick?: (gameId: number) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function HotGamesPanel({
  hotGames = [],
  onGameClick,
  isCollapsed = false,
  onToggleCollapse,
}: HotGamesPanelProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'hot' | 'new' | 'top'>('hot');
  const [games, setGames] = useState<Game[]>(hotGames);
  const [isLoading, setIsLoading] = useState(false);

  // Update internal state when prop changes (initial load)
  useEffect(() => {
    if (activeTab === 'hot' && hotGames.length > 0) {
      setGames(hotGames);
    }
  }, [hotGames, activeTab]);

  // Fetch games on tab change
  useEffect(() => {
    const fetchGames = async () => {
      if (activeTab === 'hot') {
        // If we have hotGames prop, use it, otherwise fetch
        if (hotGames.length > 0) {
          setGames(hotGames);
          return;
        }
      }

      setIsLoading(true);
      try {
        const data = await import('@/services/gameService').then(m => m.gameService.getTopGames(activeTab, 10));
        setGames(data);
      } catch (error) {
        console.error('Failed to fetch games:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGames();
  }, [activeTab, hotGames]);

  const tabs = [
    { id: 'hot', icon: Zap, label: t('play.hotGames'), color: 'text-rose-400', activeColor: 'bg-rose-500', gradient: 'from-rose-500 to-orange-500' },
    { id: 'new', icon: Sparkles, label: t('play.newGames'), color: 'text-amber-300', activeColor: 'bg-amber-500', gradient: 'from-amber-400 to-yellow-500' },
    { id: 'top', icon: Star, label: t('play.topGames'), color: 'text-yellow-400', activeColor: 'bg-yellow-500', gradient: 'from-yellow-400 to-orange-500' },
  ] as const;

  return (
    <div
      className={cn(
        "relative h-full bg-gradient-to-b from-[#12122a] to-[#0d0d1f] transition-all duration-300 flex flex-col",
        "border-l border-white/[0.06]",
        isCollapsed ? "w-10" : "w-[260px] min-w-[220px]",
      )}
    >
      {/* Collapse Toggle */}
      {onToggleCollapse && (
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-6 h-12 bg-[#1a1a35] hover:bg-rose-500/20 border border-white/[0.08] rounded-l-lg items-center justify-center text-slate-400 hover:text-rose-300 transition-all"
          title={isCollapsed ? 'Expand' : 'Collapse'}
        >
          {isCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      )}

      {isCollapsed ? (
        <div className="flex-1 flex flex-col items-center gap-4 py-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as any); onToggleCollapse?.(); }}
              className={cn(
                "w-7 h-7 rounded-lg flex items-center justify-center transition-all",
                activeTab === tab.id
                  ? "bg-white/[0.1] text-white shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                  : "text-slate-500 hover:text-white hover:bg-white/[0.05]"
              )}
              title={tab.label}
            >
              <tab.icon className={cn("w-3.5 h-3.5", activeTab === tab.id ? tab.color : "")} />
            </button>
          ))}
        </div>
      ) : (
        <>
          {/* Header Tabs */}
          <div className="grid grid-cols-3 border-b border-white/[0.06]">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-1.5 py-3 hover:bg-white/[0.02] transition-colors",
                  activeTab === tab.id ? "text-white" : "text-slate-500 hover:text-slate-300"
                )}
              >
                <tab.icon className={cn(
                  "w-4 h-4 transition-all duration-300",
                  activeTab === tab.id ? `${tab.color} scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]` : ""
                )} />
                <span className="text-[9px] font-bold uppercase tracking-wider">{tab.label}</span>

                {/* Active Indicator */}
                {activeTab === tab.id && (
                  <div className={cn(
                    "absolute bottom-0 left-0 right-0 h-[2px] rounded-full mx-3",
                    `bg-gradient-to-r ${tab.gradient}`
                  )} />
                )}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-40 gap-2">
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span className="text-[10px] text-slate-500 animate-pulse">Loading...</span>
              </div>
            ) : (
              <HotGamesListCompact
                games={games}
                onGameClick={onGameClick}
                showRank={activeTab === 'hot'}
                badgeType={activeTab}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ============================================
// Game Thumbnail with Fallback
// ============================================
export function GameThumbnail({ game }: { game: Game }) {
  const [error, setError] = useState(false);

  // If no image or error occurred, show fallback icon
  if (error || (!game.image && !game.thumbnail)) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-white/[0.03]">
        <Gamepad2 className="w-5 h-5 text-slate-600/50" />
      </div>
    );
  }

  return (
    <Image
      src={game.image || game.thumbnail || '/placeholder.png'}
      alt={game.name}
      fill
      className="object-cover group-hover:scale-110 transition-transform duration-300"
      onError={() => setError(true)}
    />
  );
}

// ============================================
// Hot Games — Compact rows
// ============================================
export function HotGamesListCompact({
  games,
  onGameClick,
  showRank = true,
  badgeType = 'hot'
}: {
  games: Game[];
  onGameClick?: (id: number) => void;
  showRank?: boolean;
  badgeType?: 'hot' | 'new' | 'top';
}) {
  const { t } = useLanguage();

  if (games.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-12">
        <div className="w-10 h-10 rounded-full bg-white/[0.03] flex items-center justify-center mb-3">
          <Gamepad2 className="w-5 h-5 text-slate-600" />
        </div>
        <p className="text-[10px] text-slate-500">{t('play.noHotGames')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {games.map((game, index) => (
        <button
          key={game.id}
          onClick={() => onGameClick?.(Number(game.id))}
          className="w-full group flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.04] transition-all active:scale-[0.98]"
        >
          {/* Rank number */}
          {showRank && (
            <div className="w-4 text-center shrink-0">
              <span className={cn(
                "text-[10px] font-black",
                index === 0 ? "text-yellow-400" : index === 1 ? "text-slate-300" : index === 2 ? "text-amber-600" : "text-slate-600"
              )}>
                {index + 1}
              </span>
            </div>
          )}

          {/* Thumbnail */}
          <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-white/[0.06] shadow-sm bg-[#1a1a2e]">
            <GameThumbnail game={game} />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 text-left">
            <h4 className="text-[11px] font-semibold text-slate-200 truncate group-hover:text-white transition-colors">
              {game.name}
            </h4>

            {/* Metadata Badge */}
            <div className="flex items-center gap-2 mt-0.5">
              {badgeType === 'top' && game.rating && (
                <div className="flex items-center gap-1">
                  <Star className="w-2.5 h-2.5 text-yellow-400 fill-current" />
                  <span className="text-[10px] font-bold text-yellow-500">{game.rating.toFixed(1)}</span>
                </div>
              )}

              {badgeType === 'hot' && (
                <div className="flex items-center gap-1">
                  <Zap className="w-2.5 h-2.5 text-rose-400 fill-rose-400/20" />
                  <span className="text-[10px] font-medium text-slate-400">
                    {game.playCount ? (game.playCount > 1000 ? `${(game.playCount / 1000).toFixed(1)}k` : game.playCount) : 0}
                  </span>
                </div>
              )}

              {badgeType === 'new' && (
                <div className="flex items-center gap-1">
                  <span className="text-[9px] px-1 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                    NEW
                  </span>
                  {game.year && <span className="text-[10px] text-slate-500">{game.year}</span>}
                </div>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

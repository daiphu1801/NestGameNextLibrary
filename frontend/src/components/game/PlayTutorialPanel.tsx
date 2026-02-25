'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  ChevronRight, ChevronLeft, Gamepad2,
  Zap, Star, Keyboard, Save, Sparkles, TrendingUp, Clock
} from 'lucide-react';
import { Game } from '@/types';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { cn } from '@/lib/utils';

// ================================================================
// LEFT PANEL — Controls Guide
// ================================================================

interface ControlsPanelProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function ControlsPanel({
  isCollapsed = false,
  onToggleCollapse,
}: ControlsPanelProps) {
  const { t } = useLanguage();

  return (
    <div
      className={cn(
        "relative h-full bg-gradient-to-b from-[#12122a] to-[#0d0d1f] transition-all duration-300 flex flex-col",
        "border-r border-white/[0.06]",
        isCollapsed ? "w-10" : "w-[260px] min-w-[220px]",
      )}
    >
      {/* Collapse Toggle */}
      {onToggleCollapse && (
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-12 bg-[#1a1a35] hover:bg-purple-500/20 border border-white/[0.08] rounded-r-lg items-center justify-center text-slate-400 hover:text-purple-300 transition-all"
          title={isCollapsed ? t('play.expandTutorial') : t('play.collapseTutorial')}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      )}

      {isCollapsed ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 py-8">
          <button
            onClick={onToggleCollapse}
            className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-purple-500/15 flex items-center justify-center text-slate-400 hover:text-purple-300 transition-all"
            title={t('docs.controls.title')}
          >
            <Keyboard className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="px-3 py-2.5 border-b border-white/[0.06] shrink-0">
            <div className="flex items-center gap-2">
              <Keyboard className="w-3.5 h-3.5 text-purple-400" />
              <h3 className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">
                {t('docs.controls.title')}
              </h3>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
            <ControlsGuideCompact />
          </div>
        </>
      )}
    </div>
  );
}

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

// ================================================================
// LEGACY EXPORT — for mobile drawer compatibility
// ================================================================
interface PlayTutorialPanelProps {
  hotGames?: Game[];
  onGameClick?: (gameId: number) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  trialTimeLeft?: number | null;
  isGuest?: boolean;
}

export function PlayTutorialPanel({
  hotGames = [],
  onGameClick,
}: PlayTutorialPanelProps) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col w-full">
      {/* Controls Section */}
      <div className="border-b border-white/[0.06]">
        <div className="px-3 py-2.5">
          <div className="flex items-center gap-2">
            <Keyboard className="w-3.5 h-3.5 text-purple-400" />
            <h3 className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">
              {t('docs.controls.title')}
            </h3>
          </div>
        </div>
        <div className="p-3">
          <ControlsGuideCompact />
        </div>
      </div>

      {/* Hot Games Section */}
      <div>
        <div className="px-3 py-2.5">
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-rose-400" />
            <h3 className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">
              {t('play.hotGames')}
            </h3>
          </div>
        </div>
        <div className="p-2">
          <HotGamesListCompact games={hotGames} onGameClick={onGameClick} />
        </div>
      </div>
    </div>
  );
}

// ============================================
// Controls Guide — Clean grid for P1, P2, Common
// ============================================
function ControlsGuideCompact() {
  const { t } = useLanguage();

  return (
    <div className="space-y-3">
      {/* Player 1 */}
      <PlayerControlsCard
        label={t('docs.controls.player1')}
        tag="P1"
        tagColor="cyan"
        movement={['W', 'A', 'S', 'D']}
        actions={[
          { key: 'J', label: 'A' },
          { key: 'K', label: 'B' },
        ]}
        movementLabel={t('docs.controls.movement')}
        actionsLabel={t('docs.controls.actions')}
        movementDataTutorial="movement"
        actionsDataTutorial="actions"
      />

      {/* Player 2 */}
      <PlayerControlsCard
        label={t('docs.controls.player2')}
        tag="P2"
        tagColor="pink"
        movement={['↑', '←', '↓', '→']}
        actions={[
          { key: '1', label: 'A' },
          { key: '2', label: 'B' },
        ]}
        movementLabel={t('docs.controls.movement')}
        actionsLabel={t('docs.controls.actions')}
      />

      {/* Common Controls */}
      <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-2.5">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 rounded-md bg-emerald-500/10 flex items-center justify-center">
            <Save className="w-2.5 h-2.5 text-emerald-400" />
          </div>
          <span className="text-[10px] font-bold text-emerald-400">{t('docs.controls.common')}</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5" data-tutorial="startselect">
          <KeyRow keyName="Enter" label={t('docs.controls.start')} color="emerald" />
          <KeyRow keyName="Shift" label={t('docs.controls.select')} color="emerald" />
          <KeyRow keyName="F5" label={t('saveState.quickSave')} color="emerald" />
          <KeyRow keyName="F8" label={t('saveState.quickLoad')} color="emerald" />
        </div>
      </div>
    </div>
  );
}

// Reusable player controls card
function PlayerControlsCard({
  label,
  tag,
  tagColor,
  movement,
  actions,
  movementLabel,
  actionsLabel,
  movementDataTutorial,
  actionsDataTutorial,
}: {
  label: string;
  tag: string;
  tagColor: 'cyan' | 'pink';
  movement: string[];
  actions: { key: string; label: string }[];
  movementLabel?: string;
  actionsLabel?: string;
  movementDataTutorial?: string;
  actionsDataTutorial?: string;
}) {
  const colors = {
    cyan: {
      bg: 'bg-cyan-500/[0.06]',
      border: 'border-cyan-500/[0.12]',
      tag: 'bg-cyan-500/15 text-cyan-400',
      label: 'text-cyan-400',
      kbd: 'bg-cyan-500/10 border-cyan-500/25 text-cyan-300',
    },
    pink: {
      bg: 'bg-pink-500/[0.06]',
      border: 'border-pink-500/[0.12]',
      tag: 'bg-pink-500/15 text-pink-400',
      label: 'text-pink-400',
      kbd: 'bg-pink-500/10 border-pink-500/25 text-pink-300',
    },
  };

  const c = colors[tagColor];

  return (
    <div className={cn('rounded-xl border p-2.5', c.bg, c.border)}>
      <div className="flex items-center gap-2 mb-2">
        <div className={cn('w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-black', c.tag)}>
          {tag}
        </div>
        <span className={cn('text-[10px] font-bold', c.label)}>{label}</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* Movement */}
        <div {...(movementDataTutorial ? { 'data-tutorial': movementDataTutorial } : {})}>
          <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-1">{movementLabel || 'Movement'}:</div>
          <div className="flex flex-wrap gap-0.5">
            {movement.map((key) => (
              <kbd
                key={key}
                className={cn(
                  'inline-flex items-center justify-center min-w-[20px] h-5 px-1 rounded border text-[10px] font-mono font-semibold',
                  c.kbd
                )}
              >
                {key}
              </kbd>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div {...(actionsDataTutorial ? { 'data-tutorial': actionsDataTutorial } : {})}>
          <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-1">{actionsLabel || 'Actions'}:</div>
          <div className="space-y-0.5">
            {actions.map((a) => (
              <div key={a.key} className="flex items-center gap-1 text-[10px] text-slate-300">
                <kbd className={cn(
                  'inline-flex items-center justify-center min-w-[20px] h-5 px-1 rounded border font-mono font-semibold',
                  c.kbd
                )}>
                  {a.key}
                </kbd>
                <span className="text-slate-400">{a.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Single key-label row
function KeyRow({ keyName, label, color }: { keyName: string; label: string; color: string }) {
  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300',
  };

  return (
    <div className="flex items-center gap-1.5 text-[10px]">
      <kbd className={cn(
        'inline-flex items-center justify-center min-w-[20px] h-4 px-1 rounded border font-mono font-semibold text-[9px]',
        colorMap[color] || 'bg-white/5 border-white/10 text-white'
      )}>
        {keyName}
      </kbd>
      <span className="text-slate-400 truncate">{label}</span>
    </div>
  );
}

// ============================================
// Game Thumbnail with Fallback
// ============================================
function GameThumbnail({ game }: { game: Game }) {
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
function HotGamesListCompact({
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

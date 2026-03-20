'use client';

import { Game } from '@/types';
import {
  ArrowLeft, Save, FolderOpen, Maximize2, Minimize2, Heart, Gamepad2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlayHeaderProps {
  game: Game | null;
  isFavorite: boolean;
  isFullscreen: boolean;
  isLoading: boolean;
  error: string | null;
  showControls: boolean;
  isMobile: boolean;
  user: any;
  t: (key: string, ...args: any[]) => string;
  onBack: () => void;
  onFavoriteToggle: () => void;
  onToggleFullscreen: () => void;
  onOpenSave: () => void;
  onOpenLoad: () => void;
}

export function PlayHeader({
  game, isFavorite, isFullscreen, isLoading, error,
  showControls, isMobile, user, t,
  onBack, onFavoriteToggle, onToggleFullscreen, onOpenSave, onOpenLoad
}: PlayHeaderProps) {
  return (
    <header
      className={cn(
        "relative z-50 backdrop-blur-xl bg-[#0a0a1a]/90 border-b border-white/[0.06] transition-transform duration-300",
        !showControls && !isFullscreen && "-translate-y-full",
        isMobile && "hidden"
      )}
    >
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex items-center justify-between gap-4">
          {/* Left - Back */}
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium hidden sm:inline">{t('common.back')}</span>
          </button>

          {/* Center - Title */}
          <div className="flex-1 flex items-center justify-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500/20 to-violet-500/20 flex items-center justify-center flex-shrink-0 border border-purple-500/10">
              <Gamepad2 className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <h1 className="text-sm font-bold text-white truncate">{game?.name}</h1>
          </div>

          {/* Right - Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={onFavoriteToggle}
              className={cn(
                "p-2 rounded-lg transition-all border",
                isFavorite
                  ? "bg-rose-500/15 text-rose-400 border-rose-500/30 hover:bg-rose-500/25"
                  : "bg-white/[0.03] text-slate-400 border-white/[0.06] hover:bg-white/[0.06] hover:text-white"
              )}
            >
              <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
            </button>

            <div className="flex items-center gap-2" data-tutorial="saveload">
              {game?.system !== 'flash' && user && !isLoading && !error ? (
                <>
                  <button
                    onClick={onOpenSave}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors text-emerald-400 border border-emerald-500/15"
                    title={t('saveState.save')}
                  >
                    <Save className="w-4 h-4" />
                    <span className="text-xs font-medium hidden sm:inline">{t('saveState.save')}</span>
                  </button>
                  <button
                    onClick={onOpenLoad}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 transition-colors text-blue-400 border border-blue-500/15"
                    title={t('saveState.load')}
                  >
                    <FolderOpen className="w-4 h-4" />
                    <span className="text-xs font-medium hidden sm:inline">{t('saveState.load')}</span>
                  </button>
                </>
              ) : null}
            </div>

            <div className="flex items-center gap-2" data-tutorial="tips">
              <button
                onClick={onToggleFullscreen}
                className="p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] transition-colors text-slate-400 hover:text-white border border-white/[0.06]"
                title={t('modal.fullscreen')}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

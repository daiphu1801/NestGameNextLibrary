'use client';

import { Keyboard, Zap } from 'lucide-react';
import { Game } from '@/types';
import { useLanguage } from '@/components/providers/LanguageProvider';

// Import from our newly extracted files
import { ControlsPanel, ControlsGuideCompact } from './tutorial/ControlsPanel';
import { HotGamesPanel, HotGamesListCompact } from './tutorial/HotGamesPanel';

// ================================================================
// LEGACY EXPORT — for mobile drawer compatibility
// ================================================================

interface PlayTutorialPanelProps {
  system?: string;
  isZapper?: boolean;
  hotGames?: Game[];
  onGameClick?: (gameId: number) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  trialTimeLeft?: number | null;
  isGuest?: boolean;
}

export function PlayTutorialPanel({
  system = 'nes',
  isZapper = false,
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
          <ControlsGuideCompact system={system} isZapper={isZapper} />
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

// Re-export so existing usages in page.tsx don't break
export { ControlsPanel } from './tutorial/ControlsPanel';
export { HotGamesPanel } from './tutorial/HotGamesPanel';

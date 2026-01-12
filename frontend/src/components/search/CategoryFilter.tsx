'use client';

import { GAME_CATEGORIES, CATEGORY_ORDER } from '@/config/categories';
import { useGameStore } from '@/features/games/store/gameStore';
import { gameService } from '@/services/gameService';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';
import { type LucideIcon } from 'lucide-react';
import { useRef } from 'react';

import { useLanguage } from '@/components/providers/LanguageProvider';

export function CategoryFilter() {
  const { t } = useLanguage();
  const {
    allGames,
    currentCategory,
    searchQuery,
    setCategory,
    setFilteredGames
  } = useGameStore();

  const handleCategoryClick = (categoryKey: string) => {
    setCategory(categoryKey as any);

    let filtered = gameService.filterByCategory(allGames, categoryKey as any);
    filtered = gameService.searchGames(filtered, searchQuery);

    setFilteredGames(filtered);
  };

  return (
    <div className="w-full relative group">
      {/* Decorative gradient fade on sides */}
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none md:hidden" />
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none md:hidden" />

      <div className="w-full">
        <div className="flex flex-wrap gap-3 justify-center">
          {CATEGORY_ORDER.map((categoryKey) => {
            const category = GAME_CATEGORIES[categoryKey];
            const isActive = currentCategory === categoryKey;

            // Get the icon component dynamically
            const IconComponent = (LucideIcons as any)[category.icon] as LucideIcon;

            return (
              <button
                key={categoryKey}
                onClick={() => handleCategoryClick(categoryKey)}
                className={cn(
                  'relative flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-300',
                  'border font-medium text-sm',
                  isActive
                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/25 scale-105'
                    : 'bg-card/50 hover:bg-card border-white/5 text-muted-foreground hover:text-foreground hover:border-white/10 hover:shadow-lg'
                )}
              >
                {/* Active glow background */}
                {isActive && (
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-accent opacity-100 -z-10" />
                )}

                {IconComponent && (
                  <IconComponent className={cn(
                    "h-4 w-4 transition-transform duration-300",
                    isActive ? "scale-110" : "group-hover:scale-110"
                  )} />
                )}
                <span className="whitespace-nowrap z-10">
                  {t(`categories.${categoryKey}`)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

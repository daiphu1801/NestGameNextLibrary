'use client';

import { GAME_CATEGORIES, CATEGORY_ORDER } from '@/config/categories';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';
import { type LucideIcon } from 'lucide-react';
import { useRef } from 'react';

import { useLanguage } from '@/components/providers/LanguageProvider';

interface CategoryFilterProps {
  currentCategory: string;
  onChange: (category: any) => void;
}

export function CategoryFilter({ currentCategory, onChange }: CategoryFilterProps) {
  const { t } = useLanguage();

  return (
    <div className="w-full relative">
      {/* Mobile: horizontal scroll | Desktop: wrap */}
      <div className="w-full overflow-x-auto sm:overflow-x-visible scrollbar-hide">
        <div className="flex sm:flex-wrap gap-2 sm:gap-3 sm:justify-center pb-2 sm:pb-0">
          {CATEGORY_ORDER.map((categoryKey) => {
            const category = GAME_CATEGORIES[categoryKey];
            const isActive = currentCategory === categoryKey;

            // Get the icon component dynamically
            const IconComponent = (LucideIcons as any)[category.icon] as LucideIcon;

            return (
              <button
                key={categoryKey}
                onClick={() => onChange(categoryKey)}
                className={cn(
                  'relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full transition-all duration-300',
                  'border font-medium text-xs sm:text-sm',
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

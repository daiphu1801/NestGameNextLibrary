'use client';

import { Globe } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { cn } from '@/lib/utils';

export type RegionKey = 'all' | 'usa' | 'japan' | 'europe' | 'asia' | 'world';

interface RegionFilterProps {
    value: RegionKey;
    onChange: (value: RegionKey) => void;
}

const REGIONS: { key: RegionKey; emoji: string; labelKey: string; pattern: string }[] = [
    { key: 'all', emoji: '🌍', labelKey: 'region.all', pattern: '' },
    { key: 'usa', emoji: '🇺🇸', labelKey: 'region.usa', pattern: 'USA' },
    { key: 'japan', emoji: '🇯🇵', labelKey: 'region.japan', pattern: 'Japan' },
    { key: 'europe', emoji: '🇪🇺', labelKey: 'region.europe', pattern: 'Europe' },
    { key: 'asia', emoji: '🌏', labelKey: 'region.asia', pattern: 'Asia' },
];

export function RegionFilter({ value, onChange }: RegionFilterProps) {
    const { t } = useLanguage();

    return (
        <div className="flex items-center gap-2 flex-wrap">
            {/* Label */}
            <div className="flex items-center gap-1.5 text-muted-foreground text-sm font-medium">
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline">{t('filter.region')}:</span>
            </div>

            {/* Region Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
                {REGIONS.map((region) => {
                    const isActive = value === region.key;

                    return (
                        <button
                            key={region.key}
                            onClick={() => onChange(region.key)}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "bg-primary text-white shadow-lg shadow-primary/25"
                                    : "bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary border border-transparent hover:border-white/10"
                            )}
                        >
                            <span className="text-base">{region.emoji}</span>
                            <span className="hidden sm:inline">{t(region.labelKey)}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

// Export regions for use in gameService
export const REGION_PATTERNS: Record<RegionKey, string[]> = {
    all: [],
    usa: ['USA', '🇺🇸'],
    japan: ['Japan', '🇯🇵'],
    europe: ['Europe', '🇪🇺'],
    asia: ['Asia', '🌏'],
    world: [],
};

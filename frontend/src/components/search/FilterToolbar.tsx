'use client';

import { SortFilter } from './SortFilter';
import { RegionFilter, RegionKey } from './RegionFilter';
import { SortOption } from '@/types';

interface FilterToolbarProps {
    currentSort: SortOption;
    currentRegion: string;
    onSortChange: (sort: SortOption) => void;
    onRegionChange: (region: RegionKey) => void;
}

export function FilterToolbar({ currentSort, currentRegion, onSortChange, onRegionChange }: FilterToolbarProps) {

    return (
        <div className="flex flex-wrap items-center justify-between gap-4 py-4 px-2 rounded-xl bg-secondary/20 border border-white/5">
            {/* Sort Filter */}
            <SortFilter value={currentSort} onChange={onSortChange} />

            {/* Region Filter */}
            <RegionFilter value={currentRegion as RegionKey} onChange={onRegionChange} />
        </div>
    );
}

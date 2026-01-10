'use client';

import { ChevronDown, ArrowUpAZ, ArrowDownAZ, Star, Calendar, Flame } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { SortOption } from '@/types';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { cn } from '@/lib/utils';

interface SortFilterProps {
    value: SortOption;
    onChange: (value: SortOption) => void;
}

const SORT_OPTIONS: { value: SortOption; labelKey: string; icon: React.ElementType }[] = [
    { value: 'name-asc', labelKey: 'sort.nameAZ', icon: ArrowUpAZ },
    { value: 'name-desc', labelKey: 'sort.nameZA', icon: ArrowDownAZ },
    { value: 'rating-desc', labelKey: 'sort.rating', icon: Star },
    { value: 'year-desc', labelKey: 'sort.newest', icon: Calendar },
    { value: 'year-asc', labelKey: 'sort.oldest', icon: Calendar },
];

export function SortFilter({ value, onChange }: SortFilterProps) {
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const currentOption = SORT_OPTIONS.find(opt => opt.value === value) || SORT_OPTIONS[0];
    const CurrentIcon = currentOption.icon;

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Dropdown Trigger */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300",
                    "bg-secondary/50 border border-white/10 hover:border-primary/30",
                    "text-sm font-medium",
                    isOpen && "border-primary/50 bg-primary/10"
                )}
            >
                <CurrentIcon className="w-4 h-4 text-primary" />
                <span className="text-foreground">{t(currentOption.labelKey)}</span>
                <ChevronDown className={cn(
                    "w-4 h-4 text-muted-foreground transition-transform duration-200",
                    isOpen && "rotate-180"
                )} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 py-2 z-50 rounded-xl bg-card/95 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {SORT_OPTIONS.map((option) => {
                        const Icon = option.icon;
                        const isActive = value === option.value;

                        return (
                            <button
                                key={option.value}
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                                )}
                            >
                                <Icon className={cn("w-4 h-4", isActive && "text-primary")} />
                                <span>{t(option.labelKey)}</span>
                                {isActive && (
                                    <span className="ml-auto w-2 h-2 rounded-full bg-primary" />
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

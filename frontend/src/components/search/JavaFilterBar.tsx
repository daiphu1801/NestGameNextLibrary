'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/components/providers/LanguageProvider';
import {
  ArrowUpAZ, ArrowDownAZ, Star, Calendar,
  ChevronDown, RotateCcw, Tags
} from 'lucide-react';
import { SortOption } from '@/types';

// ─── Publisher groups built from actual game.json data ────────────
// These are search keywords that match game names in the DB.
// When selected, the keyword is passed as the `search` API param.
const J2ME_PUBLISHERS = [
  { id: '',              label: 'Tất cả',       emoji: '📱' },
  { id: 'gameloft',      label: 'Gameloft',     emoji: '🎮',
    keywords: ['Real Football','Modern Combat','N O V A','Asphalt','Miami Nights','New York Nights',
      'Gangstar','Diamond Rush','Bubble Bash','Brain Challenge','Block Breaker','Wonder Zoo',
      'Total Conquest','Rise Of Lost','Megacity Empire','Mega Tower','Little Big City',
      'Ice Age','Lets Go','Lets G O','Oregon Trail','Pop Superstar','Paris Hilton',
      'Platinum','World At Arms','Midnight','Rayman','Castle Of Magic','Naval Battle',
      'Monsters University','My Life In New York','Pocket Chef','Predators','Soul Of Darkness',
      'Star Invasion','Tower Bloxx','Petzeon','Night At The Museum','Sherlock Holmes'] },
  { id: 'ea',            label: 'EA Mobile',    emoji: '⚽',
    keywords: ['Tetris','The Sims','Need For Speed','FIFA','N B A','Pub Mania',
      'Plants vs Zombies','Zumas Revenge','Bejeweled'] },
  { id: 'sega',          label: 'SEGA',         emoji: '🦔',
    keywords: ['Sonic'] },
  { id: 'marvel',        label: 'Marvel / DC',  emoji: '🕷️',
    keywords: ['Spider Man','Avengers','Transformers'] },
  { id: 'capcom',        label: 'Capcom',       emoji: '🐉',
    keywords: ['Street Fighter','Puzzle Fighter','Mega Man'] },
  { id: 'viet',          label: 'Game Việt',    emoji: '🇻🇳',
    keywords: ['Ninja School','Bầu Cua','Cờ Tướng','Cờ Cá Ngựa','Sơn Tinh','Sân Anh',
      'Quận','Loạn 12','Đua Ngựa','Đua Thú','Cầu Vàng','Chọn Vợ','Cưa Bom',
      'Kiến Càng','Kua Gái','Mê Cung','Mùa Hè','Ai Là Triệu','Ao Cá',
      'BOOM','Cuộc Chiến','Đẹp Từng','Hợp Tác','Thành Phố Thú','Ăn Trái',
      'Bắn Vịt','Bảo Vệ','Bóng Chuyền','Boom Hero','Câu Cá','Công Lý',
      'Đại Dương','Dòng Máu','Đường Đua','Giải Cứu','Giao Thức',
      'Hiệp Sĩ','Hoàng Tử','Hứng Trứng','Khám Phá','Khỉ Ăn',
      'Mai An Tiêm','Mèo Trèo','Metal Soldier','Nhiệm Vụ','Pac Man',
      'Phượng Hoàng','Song Hành','Tàu Thoát','Tay Lái','Thỏ Con',
      'Training Army','Vịt Con','Vua Cầu','Vương Quốc','Vườn Táo',
      'X Force','Xạ Thủ','Yêu','Ăn Rồng','Đánh Đầu','Ba Chân',
      'Bạch Đằng','Bí Ẩn','Bomk','Cá Lớn','Chó Mèo','H 1 N 1',
      'Leo Cột','Lì Xì','Lựa Trái','MU vs','Panda Vượt','Smart Boy',
      'Vượt Thiên','Zombie Football','Đẹp Từng'] },
  { id: 'classic',       label: 'Board / Puzzle', emoji: '🧩',
    keywords: ['Tetris','U N O','Mahjong','Sudoku','Puzzle','Texas Holdem','Word'] },
  { id: 'racing',        label: 'Racing',       emoji: '🏎️',
    keywords: ['Asphalt','Need For Speed','Rival Wheels','Rollercoaster','Rayman Kart',
      'Turtle Dash'] },
  { id: 'action',        label: 'Action / FPS', emoji: '🔫',
    keywords: ['Modern Combat','N O V A','Zombie','Time Crisis','Air Strike',
      'Ninja Prophecy','Panzer','Wild West','Vampire','Sniper'] },
];

// ─── Sort Options ──────────────────────────────────────────────────
const SORT_OPTIONS: { value: SortOption; labelKey: string; icon: React.ElementType }[] = [
  { value: 'name-asc',    labelKey: 'sort.nameAZ', icon: ArrowUpAZ },
  { value: 'name-desc',   labelKey: 'sort.nameZA', icon: ArrowDownAZ },
  { value: 'rating-desc', labelKey: 'sort.rating', icon: Star },
  { value: 'year-desc',   labelKey: 'sort.newest', icon: Calendar },
  { value: 'year-asc',    labelKey: 'sort.oldest', icon: Calendar },
];

// ─── Props ─────────────────────────────────────────────────────────
interface JavaFilterBarProps {
  publisher: string;
  sort: SortOption;
  onPublisherChange: (publisher: string) => void;
  onSortChange: (sort: SortOption) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
}

export function JavaFilterBar({
  publisher, sort,
  onPublisherChange, onSortChange, onReset,
  hasActiveFilters,
}: JavaFilterBarProps) {
  const { t } = useLanguage();
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setIsSortOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentSort = SORT_OPTIONS.find(o => o.value === sort) || SORT_OPTIONS[0];
  const CurrentSortIcon = currentSort.icon;

  return (
    <div className="space-y-3">
      {/* ── Row 1: Publisher / Provider tags ─────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-2 ml-1">
          <Tags className="w-3.5 h-3.5 text-teal-400/70" />
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {t('javaFilter.publisher')}
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-teal-500/20 to-transparent" />
        </div>
        <div className="w-full overflow-x-auto scrollbar-hide">
          <div className="flex gap-1.5 sm:gap-2 sm:flex-wrap p-1.5 pb-2">
            {J2ME_PUBLISHERS.map(({ id, label, emoji }) => {
              const isActive = publisher === id;
              return (
                <button
                  key={id}
                  onClick={() => onPublisherChange(id)}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg transition-all duration-300',
                    'border font-medium text-[11px] sm:text-xs whitespace-nowrap',
                    isActive
                      ? 'relative z-10 bg-gradient-to-r from-teal-500/25 to-emerald-500/25 text-teal-300 border-teal-500/40 shadow-lg shadow-teal-500/10 scale-105'
                      : 'bg-white/[0.03] text-muted-foreground border-white/5 hover:bg-teal-500/10 hover:text-teal-400 hover:border-teal-500/20'
                  )}
                >
                  <span>{emoji}</span>
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Row 2: Sort + Reset ──────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 py-2.5 px-3 rounded-xl bg-teal-500/5 border border-teal-500/10">
        {/* Sort Dropdown */}
        <div className="relative" ref={sortRef}>
          <button
            onClick={() => setIsSortOpen(!isSortOpen)}
            className={cn(
              'flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl transition-all duration-300',
              'bg-white/5 border text-sm font-medium',
              isSortOpen
                ? 'border-teal-500/50 bg-teal-500/10 text-teal-300'
                : 'border-white/10 hover:border-teal-500/30 text-foreground'
            )}
          >
            <CurrentSortIcon className="w-4 h-4 text-teal-400" />
            <span className="hidden sm:inline">{t(currentSort.labelKey)}</span>
            <ChevronDown className={cn(
              'w-4 h-4 text-muted-foreground transition-transform duration-200',
              isSortOpen && 'rotate-180'
            )} />
          </button>

          {isSortOpen && (
            <div className="absolute top-full left-0 mt-2 w-48 py-2 z-50 rounded-xl bg-card/95 backdrop-blur-xl border border-teal-500/20 shadow-2xl shadow-black/50 animate-in fade-in slide-in-from-top-2 duration-200">
              {SORT_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isActive = sort === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => { onSortChange(option.value); setIsSortOpen(false); }}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                      isActive
                        ? 'bg-teal-500/10 text-teal-400'
                        : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                    )}
                  >
                    <Icon className={cn('w-4 h-4', isActive && 'text-teal-400')} />
                    <span>{t(option.labelKey)}</span>
                    {isActive && <span className="ml-auto w-2 h-2 rounded-full bg-teal-400" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Reset Button */}
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-teal-500/10 hover:border-teal-500/20 transition-all text-sm font-medium text-muted-foreground hover:text-teal-400"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('search.reset') || 'Reset'}</span>
          </button>
        )}
      </div>
    </div>
  );
}

// Export publisher data for use in the page
export { J2ME_PUBLISHERS };

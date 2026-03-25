'use client';

import { useGameStore } from '@/features/games/store/gameStore';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { cn } from '@/lib/utils';
import { Gamepad2, MonitorPlay, Smartphone, LayoutGrid } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

type SystemOption = {
  id: string;
  nameKey: string;
  icon: React.ReactNode;
  bgDesc: string;
  activeColor: string;
  activeBorder: string;
  lightActiveColor: string;
  lightActiveBorder: string;
  shadow: string;
  subtitle: string;
  disabled?: boolean;
  comingSoon?: boolean;
  demo?: boolean;
  complete?: boolean;
};

const SYSTEMS: SystemOption[] = [
  { 
    id: 'all', nameKey: 'system.all', icon: <LayoutGrid className="w-10 h-10 md:w-14 md:h-14 mb-2 opacity-80" />, 
    subtitle: 'All Systems',
    bgDesc: 'from-gray-600/20 to-gray-900/60',
    activeColor: 'bg-gray-500/20 text-gray-200', activeBorder: 'border-gray-400/50',
    lightActiveColor: 'bg-gray-200 text-gray-800', lightActiveBorder: 'border-gray-400',
    shadow: 'shadow-[0_0_30px_rgba(107,114,128,0.3)]'
  },
  { 
    id: 'nes', nameKey: 'system.nes', icon: <Gamepad2 className="w-10 h-10 md:w-14 md:h-14 mb-2 opacity-80" />, 
    subtitle: '8-bit Classic',
    bgDesc: 'from-red-600/20 to-red-950/60',
    activeColor: 'bg-red-500/20 text-red-400', activeBorder: 'border-red-500/50',
    lightActiveColor: 'bg-red-100 text-red-700', lightActiveBorder: 'border-red-400',
    shadow: 'shadow-[0_0_30px_rgba(239,68,68,0.4)]'
  },
  { 
    id: 'snes', nameKey: 'system.snes', icon: <Gamepad2 className="w-10 h-10 md:w-14 md:h-14 mb-2 opacity-80" />, 
    subtitle: '16-bit Era',
    bgDesc: 'from-purple-600/20 to-purple-950/60',
    activeColor: 'bg-purple-500/20 text-purple-300', activeBorder: 'border-purple-500/50',
    lightActiveColor: 'bg-purple-100 text-purple-700', lightActiveBorder: 'border-purple-400',
    shadow: 'shadow-[0_0_30px_rgba(168,85,247,0.4)]',
    complete: true
  },
  { 
    id: 'gba', nameKey: 'system.gba', icon: <Smartphone className="w-10 h-10 md:w-14 md:h-14 mb-2 opacity-50" />, 
    subtitle: 'Advance Handheld',
    bgDesc: 'from-blue-600/20 to-blue-950/60',
    activeColor: 'bg-blue-500/20 text-blue-300', activeBorder: 'border-blue-500/50',
    lightActiveColor: 'bg-blue-100 text-blue-700', lightActiveBorder: 'border-blue-400',
    shadow: 'shadow-[0_0_30px_rgba(59,130,246,0.4)]',
    demo: true
  },
  { 
    id: 'gb', nameKey: 'system.gb', icon: <Smartphone className="w-10 h-10 md:w-14 md:h-14 mb-2 opacity-50" />, 
    subtitle: 'Classic Handheld',
    bgDesc: 'from-zinc-600/20 to-zinc-950/60',
    activeColor: 'bg-zinc-500/20 text-zinc-300', activeBorder: 'border-zinc-500/50',
    lightActiveColor: 'bg-zinc-100 text-zinc-700', lightActiveBorder: 'border-zinc-400',
    shadow: 'shadow-[0_0_30px_rgba(161,161,170,0.4)]',
    demo: true
  },
  { 
    id: 'gbc', nameKey: 'system.gbc', icon: <Smartphone className="w-10 h-10 md:w-14 md:h-14 mb-2 opacity-50" />, 
    subtitle: 'Color Handheld',
    bgDesc: 'from-pink-600/20 to-pink-950/60',
    activeColor: 'bg-pink-500/20 text-pink-300', activeBorder: 'border-pink-500/50',
    lightActiveColor: 'bg-pink-100 text-pink-700', lightActiveBorder: 'border-pink-400',
    shadow: 'shadow-[0_0_30px_rgba(236,72,153,0.4)]',
    disabled: true, comingSoon: true
  },
  { 
    id: 'genesis', nameKey: 'system.genesis', icon: <MonitorPlay className="w-10 h-10 md:w-14 md:h-14 mb-2 opacity-50" />, 
    subtitle: 'Blast Processing',
    bgDesc: 'from-indigo-600/20 to-indigo-950/60',
    activeColor: 'bg-indigo-500/20 text-indigo-300', activeBorder: 'border-indigo-500/50',
    lightActiveColor: 'bg-indigo-100 text-indigo-700', lightActiveBorder: 'border-indigo-400',
    shadow: 'shadow-[0_0_30px_rgba(99,102,241,0.4)]',
    disabled: true, comingSoon: true
  },
  { 
    id: 'arcade', nameKey: 'system.arcade', icon: <LayoutGrid className="w-10 h-10 md:w-14 md:h-14 mb-2 opacity-50" />, 
    subtitle: 'Coin-Op',
    bgDesc: 'from-orange-600/20 to-orange-950/60',
    activeColor: 'bg-orange-500/20 text-orange-300', activeBorder: 'border-orange-500/50',
    lightActiveColor: 'bg-orange-100 text-orange-700', lightActiveBorder: 'border-orange-400',
    shadow: 'shadow-[0_0_30px_rgba(249,115,22,0.4)]',
    disabled: true, comingSoon: true
  },
  { 
    id: 'neogeo', nameKey: 'system.neogeo', icon: <Gamepad2 className="w-10 h-10 md:w-14 md:h-14 mb-2 opacity-50" />, 
    subtitle: 'The 100 Mega Shock',
    bgDesc: 'from-yellow-600/20 to-yellow-950/60',
    activeColor: 'bg-yellow-500/20 text-yellow-300', activeBorder: 'border-yellow-500/50',
    lightActiveColor: 'bg-yellow-100 text-yellow-700', lightActiveBorder: 'border-yellow-400',
    shadow: 'shadow-[0_0_30px_rgba(234,179,8,0.4)]',
    disabled: true, comingSoon: true
  },
];

export function SystemFilter() {
  const { currentSystem, setSystem, allGames, setGames } = useGameStore();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  const isLight = mounted && theme === 'light';

  const handleSystemClick = (systemId: string) => {
    if (systemId === currentSystem) return;
    setSystem(systemId);
    // Trigger filter update
    setGames(allGames);
  };

  return (
    <div className="flex flex-col gap-3 w-full relative">
      <div className="flex items-center justify-between ml-1">
        <h3 className={cn(
          "text-xs md:text-sm font-bold uppercase tracking-widest opacity-70 flex items-center gap-2"
        )}>
          <LayoutGrid className="w-3.5 h-3.5" />
          {t('system.title') || 'Select Console'}
        </h3>
        
        {/* Decorative line */}
        <div className="h-px flex-1 ml-4 bg-gradient-to-r from-white/20 to-transparent" />
      </div>
      
      {/* Grid Container */}
      <div className="relative group/grid w-full">
        {/* Connecting background line - only for desktop single row */}
        <div className="absolute top-[45%] left-0 right-0 h-0.5 bg-white/5 -translate-y-1/2 hidden lg:block" />

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:flex lg:flex-wrap lg:justify-center gap-2 md:gap-3 lg:gap-4 relative z-10 w-full px-1">
          {SYSTEMS.map((system) => {
            const isActive = currentSystem === system.id;
            
            return (
              <button
                key={system.id}
                onClick={() => !system.disabled && handleSystemClick(system.id)}
                disabled={system.disabled}
                className={cn(
                  "group relative flex flex-col justify-center items-center p-2 md:p-3 lg:p-4 rounded-xl transition-all duration-500 border overflow-hidden min-w-0 lg:min-w-[120px] aspect-square lg:aspect-auto",
                  system.disabled ? "cursor-not-allowed opacity-60 grayscale hover:grayscale-0" : "",
                  // Active State (Dark)
                  isActive && !isLight && `${system.activeColor} ${system.activeBorder} ${system.shadow} scale-105 -translate-y-1 z-20`,
                  // Active State (Light)
                  isActive && isLight && `${system.lightActiveColor} ${system.lightActiveBorder} ${system.shadow} scale-105 -translate-y-1 z-20`,
                  
                  // Inactive State
                  !isActive && !isLight && `bg-[#0a0a0a] border-white/10 hover:border-white/20 hover:bg-white/5 text-gray-500 hover:text-gray-300`,
                  !isActive && isLight && `bg-gray-50 border-gray-200 hover:border-gray-300 shadow-sm text-gray-500 hover:text-gray-800`,
                )}
              >
                {/* Active Indicator Dot */}
                {isActive && (
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-b-full bg-current opacity-50" />
                )}

                {/* Glassmorphism Background layer for Dark mode active state */}
                {isActive && !isLight && (
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-40 z-0",
                    system.bgDesc
                  )} />
                )}
                
                {/* Inner content */}
                <div className="relative z-10 flex flex-col items-center w-full">
                  <div className={cn(
                    "transition-transform duration-500",
                    isActive ? "scale-105 drop-shadow-md pb-0.5" : "group-hover:scale-110 opacity-70 group-hover:opacity-100 pb-1",
                    "[&>svg]:w-5 [&>svg]:h-5 md:[&>svg]:w-7 md:[&>svg]:h-7" 
                  )}>
                    {system.icon}
                  </div>
                  
                  <span className={cn(
                    "font-bold text-[9px] md:text-xs lg:text-sm tracking-widest uppercase transition-colors truncate w-full text-center px-1",
                    isActive ? "text-current" : ""
                  )}>
                    {t(system.nameKey, undefined, system.id === 'all' ? 'Tất cả' : system.id.toUpperCase())}
                  </span>
                  
                  {/* Subtitle - only show when active to save space */}
                  <span className={cn(
                    "text-[7px] md:text-[8px] font-medium tracking-tight mt-0.5 opacity-60 uppercase overflow-hidden transition-all duration-300 truncate w-full text-center px-1 hidden lg:block",
                    isActive ? "max-h-4 opacity-80" : "max-h-0 opacity-0"
                  )}>
                    {system.subtitle}
                  </span>
                </div>
                
                {/* Neon border glow effect on hover if inactive */}
                {!isActive && !isLight && !system.disabled && (
                  <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ boxShadow: `inset 0 0 15px rgba(255,255,255,0.03)` }} />
                )}

                {/* Badges - positioned more compactly for grid */}
                <div className="absolute top-1 right-1 z-20">
                  {system.comingSoon && (
                    <span className="bg-primary/90 text-primary-foreground text-[6px] md:text-[8px] font-black uppercase px-1 py-0.5 rounded shadow whitespace-nowrap border border-primary/20 block rotate-3">
                      {t('system.comingSoon')}
                    </span>
                  )}
                  {system.demo && (
                    <span className="bg-gradient-to-r from-amber-500 to-yellow-500 text-black text-[6px] md:text-[8px] font-black uppercase px-1 py-0.5 rounded shadow whitespace-nowrap border border-amber-400/50 block animate-pulse rotate-3">
                      {t('system.demo')}
                    </span>
                  )}
                  {system.complete && (
                    <span className="bg-gradient-to-r from-emerald-500 to-green-500 text-white text-[6px] md:text-[8px] font-black uppercase px-1 py-0.5 rounded shadow whitespace-nowrap border border-emerald-400/50 block rotate-3">
                      {t('system.complete')}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

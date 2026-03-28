'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Home, Gamepad2, Crown, Sparkles, ChevronDown, Dices, BookOpen, Zap, Smartphone, Joystick } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { cn } from '@/lib/utils';
import { WelcomePopup } from './WelcomePopup';

function NavLink({ href, children, active }: { href: string; children: React.ReactNode; active?: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all duration-300 whitespace-nowrap",
        active
          ? "text-primary bg-primary/10"
          : "text-muted-foreground hover:text-foreground hover:bg-white/5"
      )}
    >
      {children}
    </Link>
  );
}

interface NavigationProps {
  pathname: string;
  showWelcomePopup: boolean;
  dismissWelcome: () => void;
}

export function Navigation({ pathname, showWelcomePopup, dismissWelcome }: NavigationProps) {
  const { t } = useLanguage();
  const [isExploreOpen, setIsExploreOpen] = useState(false);

  return (
    <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
      <NavLink href="/" active={pathname === '/'}>
        <span className="flex items-center gap-1.5">
          <Home className="w-3 h-3" />
          {t('nav.home') || 'Trang chủ'}
        </span>
      </NavLink>
      <NavLink href="/library" active={pathname === '/library'}>
        <span className="flex items-center gap-1.5">
          <Gamepad2 className="w-3 h-3" />
          {t('nav.library') || 'Thư viện'}
        </span>
      </NavLink>

      <NavLink href="/featured" active={pathname === '/featured'}>
        <span className="flex items-center gap-1.5 text-amber-500 font-bold">
          <Crown className="w-3 h-3" />
          {t('nav.featured', undefined, 'Nổi Bật') || 'Nổi bật'}
        </span>
      </NavLink>

      <div
        className="relative"
        onMouseEnter={() => setIsExploreOpen(true)}
        onMouseLeave={() => setIsExploreOpen(false)}
      >
        <button
          className={cn(
            "px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all duration-300 whitespace-nowrap flex items-center gap-1",
            (pathname === '/random' || pathname === '/must-play' || pathname === '/systems' || pathname === '/game-of-the-month' || pathname === '/java')
              ? "text-primary bg-primary/10"
              : "text-muted-foreground hover:text-foreground hover:bg-white/5"
          )}
        >
          <Sparkles className="w-3 h-3 text-primary" />
          {t('nav.explore') || 'Khám phá'}
          <ChevronDown className={cn(
            "w-3 h-3 transition-transform duration-200",
            isExploreOpen && "rotate-180"
          )} />
        </button>

        {/* Dropdown Menu */}
        {isExploreOpen && (
          <div className="absolute top-full left-0 pt-1 w-48 z-[200]">
            <div className="bg-secondary/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl shadow-primary/10 animate-in fade-in slide-in-from-top-2 duration-200 overflow-clip">
              <Link
                href="/random"
                className={cn(
                  "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all hover:bg-primary/10",
                  pathname === '/random' ? "text-primary bg-primary/5" : "text-foreground"
                )}
              >
                <Dices className="w-4 h-4" />
                <span>{t('nav.random') || 'Ngẫu nhiên'}</span>
              </Link>
              <div className="h-px bg-white/5" />
              <Link
                href="/must-play"
                className={cn(
                  "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all hover:bg-primary/10",
                  pathname === '/must-play' ? "text-primary bg-primary/5" : "text-foreground"
                )}
              >
                <Joystick className="w-4 h-4 text-cyan-400" />
                <span>{t('nav.must-play') || 'Must Play'}</span>
              </Link>
              <div className="h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
              <Link
                href="/systems"
                className={cn(
                  "relative flex items-center gap-3 px-4 py-3.5 text-sm font-bold transition-all group/systems overflow-hidden",
                  "bg-gradient-to-r from-purple-500/10 via-fuchsia-500/10 to-cyan-500/10",
                  "hover:from-purple-500/20 hover:via-fuchsia-500/20 hover:to-cyan-500/20",
                  "hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]",
                  pathname === '/systems' ? "text-purple-400" : ""
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-white/10 to-cyan-500/0 -translate-x-full group-hover/systems:animate-[shimmer_1.5s_infinite]" />
                <Gamepad2 className="w-4 h-4 text-purple-400 group-hover/systems:animate-bounce relative z-10" />
                <span className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-cyan-400 bg-clip-text relative z-10 group-hover/systems:scale-[1.02] transition-transform" style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {t('nav.systems') || 'Hệ máy'}
                </span>
                <span className="ml-auto px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white leading-none relative z-10 shadow-[0_0_10px_rgba(168,85,247,0.5)]">New</span>
              </Link>
              <div className="h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
              <Link
                href="/game-of-the-month"
                className={cn(
                  "flex items-center gap-3 px-4 py-3.5 text-sm font-bold transition-all hover:bg-amber-500/10 text-amber-500",
                  pathname === '/game-of-the-month' ? "bg-amber-500/10" : ""
                )}
              >
                <Crown className="w-4 h-4 text-amber-500" />
                <span>Game Của Tháng</span>
                <span className="ml-auto px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-500 text-white leading-none shadow-[0_0_10px_rgba(245,158,11,0.5)]">Hot</span>
              </Link>
              <div className="h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />
              <Link
                href="/flash"
                className="flex items-center gap-3 px-4 py-3.5 text-sm font-bold transition-all hover:bg-orange-500/10 text-orange-500"
              >
                <Zap className="w-4 h-4 text-orange-500" />
                <span>Flash Classics</span>
                <span className="ml-auto px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-orange-500 text-white leading-none shadow-[0_0_10px_rgba(249,115,22,0.5)]">New</span>
              </Link>
              <div className="h-px bg-gradient-to-r from-transparent via-teal-500/30 to-transparent" />
              <Link
                href="/java"
                className="flex items-center gap-3 px-4 py-3.5 text-sm font-bold transition-all hover:bg-teal-500/10 text-teal-500"
              >
                <Smartphone className="w-4 h-4 text-teal-500" />
                <span>Java Mobile</span>
                <span className="ml-auto px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-teal-500 text-white leading-none shadow-[0_0_10px_rgba(20,184,166,0.5)]">New</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="relative">
        <Link
          href="/docs"
          className={cn(
            "px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all duration-300 whitespace-nowrap inline-flex",
            pathname === '/docs'
              ? "bg-primary/10"
              : "hover:bg-white/5"
          )}
        >
          <span className="flex items-center gap-1.5">
            <BookOpen className="w-3 h-3 text-primary" />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text font-black" style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {t('nav.docs') || 'Tài liệu'}
            </span>
          </span>
        </Link>
        <WelcomePopup show={showWelcomePopup} onDismiss={dismissWelcome} />
      </div>
    </nav>
  );
}

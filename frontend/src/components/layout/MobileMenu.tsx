'use client';

import Link from 'next/link';
import { Home, Gamepad2, Crown, Sparkles, Dices, BookOpen, Zap, Smartphone, Joystick } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { cn } from '@/lib/utils';
import React from 'react';

export function MobileNavLink({
  href,
  children,
  icon,
  active,
  onClick
}: {
  href: string;
  children: React.ReactNode;
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 px-4 py-4 rounded-xl text-lg font-bold transition-all",
        active
          ? "text-primary bg-primary/10"
          : "text-foreground hover:bg-white/5"
      )}
    >
      <span className={active ? "text-primary" : "text-muted-foreground"}>{icon}</span>
      {children}
    </Link>
  );
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  pathname: string;
  showDisclaimer: boolean;
}

export function MobileMenu({ isOpen, onClose, pathname, showDisclaimer }: MobileMenuProps) {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="lg:hidden fixed inset-0 z-40 bg-background/95 backdrop-blur-xl animate-in fade-in duration-200">
      <div
        className="container mx-auto px-4 pb-8 overflow-y-auto h-full"
        style={{ paddingTop: showDisclaimer ? '148px' : '104px' }}
      >
        <nav className="flex flex-col gap-2">
          <MobileNavLink
            href="/"
            icon={<Home className="w-5 h-5" />}
            active={pathname === '/'}
            onClick={onClose}
          >
            {t('nav.home') || 'Trang chủ'}
          </MobileNavLink>
          <MobileNavLink
            href="/library"
            icon={<Gamepad2 className="w-5 h-5" />}
            active={pathname === '/library'}
            onClick={onClose}
          >
            {t('nav.library') || 'Thư viện'}
          </MobileNavLink>

          <MobileNavLink
            href="/featured"
            icon={<Crown className="w-5 h-5 text-amber-500" />}
            active={pathname === '/featured'}
            onClick={onClose}
          >
            {t('nav.featured', undefined, 'Nổi Bật') || 'Nổi bật'}
          </MobileNavLink>

          {/* Explore Section */}
          <div className="my-2">
            <div className="flex items-center gap-2 px-4 py-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('nav.explore') || 'Khám phá'}</span>
            </div>
            <div className="ml-4 flex flex-col gap-1">
              <MobileNavLink
                href="/random"
                icon={<Dices className="w-4 h-4" />}
                active={pathname === '/random'}
                onClick={onClose}
              >
                {t('nav.random') || 'Ngẫu nhiên'}
              </MobileNavLink>
              <MobileNavLink
                href="/must-play"
                icon={<Joystick className="w-4 h-4 text-cyan-400" />}
                active={pathname === '/must-play'}
                onClick={onClose}
              >
                {t('nav.must-play') || 'Must Play'}
              </MobileNavLink>
              <MobileNavLink
                href="/systems"
                icon={<Gamepad2 className="w-4 h-4 text-purple-500" />}
                active={pathname === '/systems'}
                onClick={onClose}
              >
                {t('nav.systems') || 'Hệ máy'}
              </MobileNavLink>
              <MobileNavLink
                href="/game-of-the-month"
                icon={<Crown className="w-4 h-4 text-amber-500" />}
                active={pathname === '/game-of-the-month'}
                onClick={onClose}
              >
                Game Của Tháng
              </MobileNavLink>
              <MobileNavLink
                href="/flash"
                icon={<Zap className="w-4 h-4 text-orange-500" />}
                active={pathname === '/flash'}
                onClick={onClose}
              >
                <span className="text-orange-500">Flash Classics</span>
              </MobileNavLink>
              <MobileNavLink
                href="/java"
                icon={<Smartphone className="w-4 h-4 text-cyan-500" />}
                active={pathname === '/java'}
                onClick={onClose}
              >
                <span className="text-cyan-500">Java Classics</span>
              </MobileNavLink>
            </div>
          </div>

          <MobileNavLink
            href="/docs"
            icon={<BookOpen className="w-5 h-5" />}
            active={pathname === '/docs'}
            onClick={onClose}
          >
            {t('nav.docs') || 'Tài liệu'}
          </MobileNavLink>
        </nav>

        {/* Mobile CTA */}
        <div className="mt-8">
          <Link
            href="/library"
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-bold text-lg shadow-lg shadow-primary/30"
          >
            <Zap className="w-5 h-5" />
            {t('header.play') || 'Chơi ngay'}
          </Link>
        </div>
      </div>
    </div>
  );
}

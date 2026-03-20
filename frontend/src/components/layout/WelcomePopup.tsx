'use client';

import Link from 'next/link';
import { Sparkles, BookOpen, X } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';

interface WelcomePopupProps {
  show: boolean;
  onDismiss: () => void;
}

export function WelcomePopup({ show, onDismiss }: WelcomePopupProps) {
  const { t } = useLanguage();

  if (!show) return null;

  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-card rotate-45 border-l border-t border-primary/30" />
      <div className="relative bg-card/95 backdrop-blur-xl border border-primary/30 rounded-xl shadow-lg shadow-primary/10 px-4 py-3 w-[220px]">
        <button
          onClick={onDismiss}
          className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <X className="w-3 h-3" />
        </button>
        <div className="flex items-center gap-2 mb-1.5">
          <Sparkles className="w-3.5 h-3.5 text-primary flex-shrink-0" />
          <span className="text-xs font-bold text-foreground">{t('header.welcomeTooltip.title')}</span>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          {t('header.welcomeTooltip.content')}
        </p>
        <Link
          href="/docs"
          onClick={onDismiss}
          className="mt-2 flex items-center justify-center gap-1.5 w-full px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-[11px] font-bold transition-all"
        >
          <BookOpen className="w-3 h-3" />
          {t('header.welcomeTooltip.action')}
        </Link>
      </div>
    </div>
  );
}

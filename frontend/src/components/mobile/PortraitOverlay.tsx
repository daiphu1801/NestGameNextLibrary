'use client';

import { RotateCw } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';

/**
 * Fullscreen overlay shown in portrait orientation on touch devices.
 * CSS class `portrait-overlay` controls visibility via @media query.
 */
export function PortraitOverlay() {
  const { t } = useLanguage();

  return (
    <div className="portrait-overlay fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex-col items-center justify-center gap-6 text-center px-8">
      {/* Animated rotate icon */}
      <div className="relative w-20 h-20 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-purple-500/20 animate-ping" />
        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 border border-purple-500/30 flex items-center justify-center">
          <RotateCw className="w-8 h-8 text-purple-400 animate-spin" style={{ animationDuration: '3s' }} />
        </div>
      </div>

      <div className="space-y-2 max-w-[280px]">
        <h3 className="text-lg font-bold text-white">
          {t('mobile.rotateTitle') || 'Xoay ngang để chơi'}
        </h3>
        <p className="text-sm text-white/60 leading-relaxed">
          {t('mobile.rotateDesc') || 'Xoay điện thoại sang ngang để có trải nghiệm chơi game tốt nhất'}
        </p>
      </div>

      {/* Phone rotation visual hint */}
      <div className="mt-4 relative w-16 h-24 border-2 border-white/30 rounded-xl flex items-center justify-center animate-[tilt_2s_ease-in-out_infinite]">
        <div className="w-8 h-1 bg-white/30 rounded-full" />
      </div>
    </div>
  );
}

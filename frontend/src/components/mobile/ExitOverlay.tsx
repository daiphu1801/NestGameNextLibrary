'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, Save, FolderOpen } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';

interface ExitOverlayProps {
  onExit: () => void;
  onSave?: () => void;
  onLoad?: () => void;
  gameName?: string;
  autoHideDelay?: number;
}

export function ExitOverlay({ onExit, onSave, onLoad, gameName, autoHideDelay = 3000 }: ExitOverlayProps) {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const show = useCallback(() => {
    setVisible(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(false), autoHideDelay);
  }, [autoHideDelay]);

  const handleTap = useCallback((e: TouchEvent) => {
    const x = e.changedTouches[0]?.clientX;
    const y = e.changedTouches[0]?.clientY;
    const w = window.innerWidth;
    const h = window.innerHeight;

    // Wider tap zone in landscape: center 50% width, top 50% height
    // Avoids joystick (left 25%) and buttons (right 25%) zones
    if (x > w * 0.25 && x < w * 0.75 && y > h * 0.05 && y < h * 0.5) {
      show();
    }
  }, [show]);

  useEffect(() => {
    document.addEventListener('touchstart', handleTap, { passive: true });
    return () => {
      document.removeEventListener('touchstart', handleTap);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [handleTap]);

  if (!visible) return null;

  return (
    <div
      className="absolute z-50 animate-in fade-in slide-in-from-top-2 duration-200"
      style={{
        top: 'max(8px, env(safe-area-inset-top, 0px))',
        left: '50%',
        transform: 'translateX(-50%)',
      }}
    >
      <div className="flex items-center gap-2 px-2 py-1.5 rounded-2xl bg-black/70 backdrop-blur-xl border border-white/10 shadow-2xl">
        {/* Exit button */}
        <button
          onClick={onExit}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 text-white text-xs font-medium active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {t('common.back') || 'Quay lại'}
        </button>

        {/* Game name */}
        {gameName && (
          <span className="text-white/50 text-[10px] font-medium truncate max-w-[120px] hidden landscape:inline">
            {gameName}
          </span>
        )}

        {/* Save button */}
        {onSave && (
          <button
            onClick={onSave}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/60 text-emerald-100 text-xs font-medium active:scale-95 transition-transform"
          >
            <Save className="w-3.5 h-3.5" />
            {t('saveState.save') || 'Lưu'}
          </button>
        )}

        {/* Load button */}
        {onLoad && (
          <button
            onClick={onLoad}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/60 text-blue-100 text-xs font-medium active:scale-95 transition-transform"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            {t('saveState.load') || 'Tải'}
          </button>
        )}
      </div>
    </div>
  );
}

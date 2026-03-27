'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, Save, FolderOpen, Menu, X } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';

interface ExitOverlayProps {
  onExit: () => void;
  onSave?: () => void;
  onLoad?: () => void;
  gameName?: string;
  autoHideDelay?: number;
  isFlash?: boolean;
  isJ2me?: boolean;
}

export function ExitOverlay({ onExit, onSave, onLoad, gameName, autoHideDelay = 3000, isFlash, isJ2me }: ExitOverlayProps) {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const show = useCallback(() => {
    setVisible(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(false), autoHideDelay);
  }, [autoHideDelay]);

  const handleTap = useCallback((e: TouchEvent) => {
    if (isFlash || isJ2me) return; // Do not use tap-to-show zone for iframe games

    const x = e.changedTouches[0]?.clientX;
    const y = e.changedTouches[0]?.clientY;
    const w = window.innerWidth;
    const h = window.innerHeight;

    // Wider tap zone in landscape: center 50% width, top 50% height
    // Avoids joystick (left 25%) and buttons (right 25%) zones
    if (x > w * 0.25 && x < w * 0.75 && y > h * 0.05 && y < h * 0.5) {
      show();
    }
  }, [show, isFlash]);

  useEffect(() => {
    if (isFlash || isJ2me) return;
    document.addEventListener('touchstart', handleTap, { passive: true });
    return () => {
      document.removeEventListener('touchstart', handleTap);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [handleTap, isFlash, isJ2me]);

  // Iframe Game Mode (Flash or J2ME): Floating menu in top-left since iframe swallows touches
  if (isFlash || isJ2me) {
    return (
      <div
        className="absolute z-50 pointer-events-auto flex flex-col items-start gap-2"
        style={{
          top: 'max(16px, env(safe-area-inset-top, 16px))',
          left: 'max(16px, env(safe-area-inset-left, 16px))',
        }}
      >
        <button
          onClick={() => setVisible(!visible)}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white/80 hover:bg-black/70 hover:text-white active:scale-95 transition-all shadow-xl"
          aria-label="Menu"
        >
          {visible ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {visible && (
          <div className="flex flex-col gap-2 animate-in slide-in-from-top-2 fade-in duration-200">
            <button
              onClick={onExit}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-black/70 backdrop-blur-xl border border-white/10 text-white text-sm font-medium active:scale-95 transition-transform shadow-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('common.back') || 'Quay lại'}
            </button>
            {onSave && (
              <button
                onClick={() => { setVisible(false); onSave(); }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600/80 backdrop-blur-xl border border-emerald-500/30 text-emerald-50 text-sm font-medium active:scale-95 transition-transform shadow-lg shadow-emerald-900/20"
              >
                <Save className="w-4 h-4" />
                {t('saveState.save') || 'Lưu'}
              </button>
            )}
            {onLoad && (
              <button
                onClick={() => { setVisible(false); onLoad(); }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600/80 backdrop-blur-xl border border-blue-500/30 text-blue-50 text-sm font-medium active:scale-95 transition-transform shadow-lg shadow-blue-900/20"
              >
                <FolderOpen className="w-4 h-4" />
                {t('saveState.load') || 'Tải'}
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // Retro Game Mode: Popup menu in center
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

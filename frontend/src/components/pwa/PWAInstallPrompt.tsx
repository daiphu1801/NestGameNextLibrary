'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Share2, PlusSquare, Download, MoreVertical } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { cn } from '@/lib/utils';

const DISMISSED_KEY = 'nestgame_pwa_prompt_v1';
const SHOW_DELAY_MS = 5000;

type Platform = 'ios' | 'ios-chrome' | 'android' | null;

function detectPlatform(): Platform {
  if (typeof window === 'undefined') return null;
  const ua = navigator.userAgent;

  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as any).standalone === true;
  if (isStandalone) return null;

  if (!window.matchMedia('(pointer: coarse)').matches) return null;

  const isIOS = /iPhone|iPad|iPod/.test(ua);
  if (isIOS) {
    const isChrome = /CriOS/.test(ua);
    return isChrome ? 'ios-chrome' : 'ios';
  }

  if (/Android/.test(ua)) return 'android';
  return null;
}

function StepRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08]">
      {children}
    </div>
  );
}

function Step({ num, icon, label }: { num: string; icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-white/60 text-xs">
      <span>{num}</span>
      {icon}
      <span className="font-medium text-white/80">{label}</span>
    </div>
  );
}

export function PWAInstallPrompt() {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);
  const [platform, setPlatform] = useState<Platform>(null);
  const [isExiting, setIsExiting] = useState(false);
  const [hasNativePrompt, setHasNativePrompt] = useState(false);
  const deferredPromptRef = useRef<any>(null);

  useEffect(() => {
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      deferredPromptRef.current = e;
      setHasNativePrompt(true);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall);
  }, []);

  useEffect(() => {
    if (localStorage.getItem(DISMISSED_KEY)) return;
    const p = detectPlatform();
    if (!p) return;

    const timer = setTimeout(() => {
      setPlatform(p);
      setVisible(true);
    }, SHOW_DELAY_MS);

    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setIsExiting(true);
    localStorage.setItem(DISMISSED_KEY, '1');
    setTimeout(() => setVisible(false), 320);
  };

  const handleAndroidInstall = async () => {
    if (deferredPromptRef.current) {
      deferredPromptRef.current.prompt();
      const { outcome } = await deferredPromptRef.current.userChoice;
      if (outcome === 'accepted') localStorage.setItem(DISMISSED_KEY, '1');
    }
    dismiss();
  };

  if (!visible) return null;

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 px-3 pointer-events-none',
        'transition-transform duration-300 ease-out',
        isExiting ? 'translate-y-full' : 'translate-y-0'
      )}
      style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))' }}
    >
      <div
        className="pointer-events-auto mx-auto max-w-sm rounded-2xl overflow-hidden
          border border-white/10 shadow-2xl shadow-black/50"
        style={{
          background: 'rgba(10, 15, 28, 0.92)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}
      >
        <div className="h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-11 h-11 rounded-xl overflow-hidden border border-white/10 shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icons/icon-192.png" alt="NestGame" className="w-full h-full object-cover" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm leading-tight">
                {t('pwa.title')}
              </p>
              <p className="text-white/50 text-xs mt-0.5 leading-snug">
                {t('pwa.desc')}
              </p>
            </div>

            <button
              onClick={dismiss}
              className="flex-shrink-0 p-1 -m-1 rounded-lg text-white/30 hover:text-white/70
                transition-colors touch-manipulation"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3">
            {/* iOS Safari */}
            {platform === 'ios' && (
              <StepRow>
                <Step num="1." icon={<Share2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />} label={t('pwa.iosStep1')} />
                <span className="text-white/20 text-xs">›</span>
                <Step num="2." icon={<PlusSquare className="w-3.5 h-3.5 text-primary flex-shrink-0" />} label={t('pwa.iosStep2')} />
              </StepRow>
            )}

            {/* iOS Chrome */}
            {platform === 'ios-chrome' && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <span className="text-amber-400 text-sm">🧭</span>
                <p className="text-amber-300/90 text-xs leading-snug">{t('pwa.iosChromeHint')}</p>
              </div>
            )}

            {/* Android — native install if Chrome supports it, else manual steps */}
            {platform === 'android' && (
              hasNativePrompt ? (
                <button
                  onClick={handleAndroidInstall}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
                    bg-primary/15 border border-primary/25 text-primary
                    hover:bg-primary/20 active:scale-[0.98] transition-all touch-manipulation"
                >
                  <Download className="w-4 h-4" />
                  <span className="text-sm font-semibold">{t('pwa.androidInstall')}</span>
                </button>
              ) : (
                <StepRow>
                  <Step num="1." icon={<MoreVertical className="w-3.5 h-3.5 text-primary flex-shrink-0" />} label={t('pwa.androidStep1')} />
                  <span className="text-white/20 text-xs">›</span>
                  <Step num="2." icon={<PlusSquare className="w-3.5 h-3.5 text-primary flex-shrink-0" />} label={t('pwa.androidStep2')} />
                </StepRow>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2, Smartphone, Maximize, Minimize } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';

interface J2mePlayerProps {
  gameUrl?: string;
}

/**
 * J2ME Player – renders the J2ME-For-Web emulator inside an iframe.
 * Similar pattern to FlashPlayer.tsx (Ruffle), but for Java MIDlet (.jar) files.
 *
 * The emulator is expected to be self-hosted and accept a `midlet` query param.
 * Example: https://your-j2me-host.com/?midlet=https://cdn.example.com/game.jar
 */
export function J2mePlayer({ gameUrl }: J2mePlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { t } = useLanguage();

  // Build the emulator URL with the midlet param
  // IMPORTANT: Always use the local Next.js rewrite proxy to avoid COEP (Cross-Origin-Embedder-Policy) blocks.
  // The proxy is defined in next.config.js and forwards /j2me-emulator/* → R2.
  const J2ME_EMULATOR_HOST = '/j2me-emulator';

  const emulatorUrl = gameUrl
    ? `${J2ME_EMULATOR_HOST}/index.html?midlet=${encodeURIComponent(gameUrl)}`
    : null;

  // Focus the iframe when loaded so keyboard events go to the emulator
  const handleIframeLoad = useCallback(() => {
    setIsLoaded(true);
    setTimeout(() => {
      iframeRef.current?.focus();
    }, 300);
  }, []);

  const handleIframeError = useCallback(() => {
    setError(t('javaPortal.playerError'));
  }, [t]);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  }, []);

  // Listen for fullscreen change
  useEffect(() => {
    const handleChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleChange);
    return () => document.removeEventListener('fullscreenchange', handleChange);
  }, []);

  // Focus lock & scroll prevent
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const preventedKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '];
      if (preventedKeys.includes(e.key) && containerRef.current?.contains(document.activeElement)) {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-[#0a0a0a] flex flex-col items-center justify-center relative sm:rounded-xl sm:border border-white/5 overflow-hidden shadow-2xl group"
      tabIndex={0}
      onClick={() => iframeRef.current?.focus()}
    >
      {/* The iframe that hosts the J2ME emulator */}
      {emulatorUrl && (
        <iframe
          ref={iframeRef}
          src={emulatorUrl}
          className="absolute inset-0 w-full h-full z-10 border-0"
          allow="autoplay; gamepad; cross-origin-isolated"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          title="J2ME Game Emulator"
        />
      )}

      {/* Fullscreen toggle button */}
      {isLoaded && (
        <button
          onClick={toggleFullscreen}
          className="absolute top-3 right-3 z-20 p-2 rounded-lg bg-black/50 text-white/70 hover:text-white hover:bg-black/80 backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 cursor-pointer border border-white/10"
          title={isFullscreen ? t('javaPortal.exitFullscreen') : t('modal.fullscreen')}
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>
      )}

      {/* Loading / Error overlay */}
      {(!isLoaded || error || !emulatorUrl) && (
        <>
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                'linear-gradient(rgba(20, 184, 166, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(20, 184, 166, 0.4) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent z-0" />

          <div className="relative z-10 flex flex-col items-center gap-6 p-8 text-center max-w-md animate-in slide-in-from-bottom-4 fade-in duration-700 pointer-events-none">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-teal-400 to-emerald-600 p-[3px] shadow-[0_0_40px_rgba(20,184,166,0.3)]">
              <div className="w-full h-full bg-[#1C1F26] rounded-[21px] flex items-center justify-center">
                {error || !emulatorUrl ? (
                  <Smartphone className="w-10 h-10 text-red-500" />
                ) : (
                  <Loader2 className="w-10 h-10 text-teal-500 animate-spin" />
                )}
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-300 mb-3 tracking-tight">
                {error || !emulatorUrl ? t('javaPortal.playerErrorTitle') : 'JAVA PLAYER'}
              </h2>
              <p className="text-[#A5B4CB] text-sm leading-relaxed mb-8">
                {error ||
                  (!emulatorUrl
                    ? t('javaPortal.playerNoUrl')
                    : t('javaPortal.playerLoading'))}
              </p>
            </div>
          </div>
        </>
      )}

      {/* Watermark */}
      <div className="absolute bottom-6 font-black text-white/5 tracking-[0.3em] text-4xl select-none pointer-events-none z-0">
        J2ME EMULATOR
      </div>
    </div>
  );
}

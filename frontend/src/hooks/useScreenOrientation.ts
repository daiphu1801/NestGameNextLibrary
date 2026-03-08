'use client';

import { useState, useCallback, useEffect } from 'react';

interface UseScreenOrientationReturn {
  lockLandscape: () => Promise<void>;
  unlock: () => Promise<void>;
  isLandscape: boolean;
  isLocked: boolean;
  isIOS: boolean;
}

export function useScreenOrientation(): UseScreenOrientationReturn {
  const [isLandscape, setIsLandscape] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(ios);

    const updateOrientation = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };

    updateOrientation();
    window.addEventListener('resize', updateOrientation);
    return () => window.removeEventListener('resize', updateOrientation);
  }, []);

  const lockLandscape = useCallback(async () => {
    try {
      // Request fullscreen first (required for orientation lock on most browsers)
      const docEl = document.documentElement;
      if (docEl.requestFullscreen) {
        await docEl.requestFullscreen();
      }

      // Lock orientation (not supported on iOS Safari)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const orientation = screen.orientation as any;
      if (orientation?.lock) {
        await orientation.lock('landscape');
        setIsLocked(true);
      }
    } catch (err) {
      // Orientation lock may fail on some browsers; that's OK
      console.warn('[Orientation] Lock failed:', err);
    }
  }, []);

  const unlock = useCallback(async () => {
    try {
      if (screen.orientation?.unlock) {
        screen.orientation.unlock();
      }
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
      setIsLocked(false);
    } catch (err) {
      console.warn('[Orientation] Unlock failed:', err);
    }
  }, []);

  return { lockLandscape, unlock, isLandscape, isLocked, isIOS };
}

'use client';

import { useState, useEffect } from 'react';

/**
 * Detects mobile/touch devices using `(pointer: coarse)` media query.
 * Uses mounted guard to avoid Next.js hydration mismatch (server always returns false).
 * Uses shorter screen side to stay stable across portrait/landscape rotation.
 */
export function useMobileDetection(): boolean {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const checkMobile = () => {
      // pointer: coarse = touch-primary device (phone, tablet)
      // pointer: fine   = mouse-primary device (desktop, laptop with trackpad)
      const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;

      // Use shorter side so landscape rotation doesn't flip detection
      // Phone short side = portrait width (320-430px), always < 768
      // Tablet short side = portrait width (768-1024px)
      const shortSide = Math.min(window.innerWidth, window.innerHeight);
      const isPhoneSize = shortSide <= 600;

      setIsMobile(isCoarsePointer && isPhoneSize);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Before mount, return false to match server-rendered HTML (no hydration mismatch)
  if (!mounted) return false;

  return isMobile;
}

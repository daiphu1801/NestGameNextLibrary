'use client';

import { useCallback } from 'react';

export function useHapticFeedback() {
  const vibrate = useCallback((pattern: number | number[] = 10) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }, []);

  return { vibrate };
}

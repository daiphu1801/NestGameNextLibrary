'use client';

import { useState, useEffect } from 'react';

export type ControlType = 'joystick' | 'dpad';

const STORAGE_KEY = 'nestgame_mobile_control_type';

export function useMobileControlSetting(): [ControlType, (t: ControlType) => void] {
  const [type, setType] = useState<ControlType>('joystick');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ControlType | null;
    if (stored === 'dpad' || stored === 'joystick') setType(stored);
  }, []);

  const set = (t: ControlType) => {
    setType(t);
    try { localStorage.setItem(STORAGE_KEY, t); } catch { /* ignore */ }
  };

  return [type, set];
}

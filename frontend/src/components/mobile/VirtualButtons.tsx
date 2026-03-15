'use client';

import { useRef, useCallback, useState, useEffect } from 'react';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { cn } from '@/lib/utils';

type ButtonName = 'a' | 'b' | 'x' | 'y' | 'l' | 'r' | 'start' | 'select';

interface VirtualButtonsProps {
  system?: string;
  onButtonDown: (button: ButtonName) => void;
  onButtonUp: (button: ButtonName) => void;
}

// Glass-style color accents
const GLASS_ACCENTS: Record<string, {
  idle: string;
  active: string;
  text: string;
  textActive: string;
  glow: string;
}> = {
  a: {
    idle: 'border-red-400/20',
    active: 'border-red-400/60',
    text: 'text-red-300/70',
    textActive: 'text-red-200',
    glow: '0 0 20px 6px rgba(248,113,113,0.35), inset 0 0 12px rgba(248,113,113,0.15)',
  },
  b: {
    idle: 'border-amber-400/20',
    active: 'border-amber-400/60',
    text: 'text-amber-300/70',
    textActive: 'text-amber-200',
    glow: '0 0 20px 6px rgba(251,191,36,0.35), inset 0 0 12px rgba(251,191,36,0.15)',
  },
  x: {
    idle: 'border-blue-400/20',
    active: 'border-blue-400/60',
    text: 'text-blue-300/70',
    textActive: 'text-blue-200',
    glow: '0 0 20px 6px rgba(96,165,250,0.35), inset 0 0 12px rgba(96,165,250,0.15)',
  },
  y: {
    idle: 'border-green-400/20',
    active: 'border-green-400/60',
    text: 'text-green-300/70',
    textActive: 'text-green-200',
    glow: '0 0 20px 6px rgba(74,222,128,0.35), inset 0 0 12px rgba(74,222,128,0.15)',
  },
  l: {
    idle: 'border-purple-400/20',
    active: 'border-purple-400/60',
    text: 'text-purple-300/70',
    textActive: 'text-purple-200',
    glow: '0 0 20px 6px rgba(168,85,247,0.35), inset 0 0 12px rgba(168,85,247,0.15)',
  },
  r: {
    idle: 'border-fuchsia-400/20',
    active: 'border-fuchsia-400/60',
    text: 'text-fuchsia-300/70',
    textActive: 'text-fuchsia-200',
    glow: '0 0 20px 6px rgba(232,121,249,0.35), inset 0 0 12px rgba(232,121,249,0.15)',
  },
};

const DEFAULT_ACCENT = GLASS_ACCENTS.a;

export function VirtualButtons({ system, onButtonDown, onButtonUp }: VirtualButtonsProps) {
  const { vibrate } = useHapticFeedback();
  const activeButtonsRef = useRef<Set<string>>(new Set());
  const [pressed, setPressed] = useState<Record<string, boolean>>({});
  const [rippleKey, setRippleKey] = useState<Record<string, number>>({});

  const isSixButton = system === 'snes' || system === 'gba' || system === 'genesis' || system === 'arcade';

  // Release all held buttons on orientation change or visibility change
  useEffect(() => {
    const releaseAll = () => {
      activeButtonsRef.current.forEach(btn => onButtonUp(btn as ButtonName));
      activeButtonsRef.current.clear();
      setPressed({});
    };
    window.addEventListener('orientationchange', releaseAll);
    const onVisibility = () => { if (document.hidden) releaseAll(); };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('orientationchange', releaseAll);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [onButtonUp]);

  const handleTouchStart = useCallback((button: ButtonName) => (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!activeButtonsRef.current.has(button)) {
      activeButtonsRef.current.add(button);
      vibrate(15);
      setPressed(p => ({ ...p, [button]: true }));
      setRippleKey(r => ({ ...r, [button]: Date.now() }));
      onButtonDown(button);
    }
  }, [onButtonDown, vibrate]);

  const handleTouchEnd = useCallback((button: ButtonName) => (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    activeButtonsRef.current.delete(button);
    setPressed(p => ({ ...p, [button]: false }));
    onButtonUp(button);
  }, [onButtonUp]);

  // Render a single glass button
  const renderButton = (name: ButtonName, label?: string) => {
    const isPressed = pressed[name];
    const rKey = rippleKey[name];
    const accent = GLASS_ACCENTS[name] || DEFAULT_ACCENT;
    const btnSize = isSixButton ? 'w-[56px] h-[56px]' : 'w-[62px] h-[62px]';

    return (
      <div key={name} className="relative">
        {/* Ripple */}
        {rKey && (
          <span
            key={rKey}
            className={cn(
              "absolute inset-[-8px] rounded-full border-2 pointer-events-none animate-[ripple_400ms_ease-out_forwards]",
              accent.active.replace('/60', '/40'),
            )}
          />
        )}

        {/* Glow ring */}
        <div
          className={cn(
            'absolute inset-[-3px] rounded-full pointer-events-none transition-all duration-150',
            isPressed ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
          )}
          style={{ boxShadow: accent.glow }}
        />

        {/* Glass button */}
        <button
          onTouchStart={handleTouchStart(name)}
          onTouchEnd={handleTouchEnd(name)}
          onTouchCancel={handleTouchEnd(name)}
          className={cn(
            btnSize, 'rounded-full flex items-center justify-center',
            'border-2 transition-all duration-100 touch-none overflow-hidden relative',
            'backdrop-blur-md',
            isPressed
              ? cn('bg-white/25 scale-90', accent.active)
              : cn('bg-white/[0.08]', accent.idle),
            !isPressed && 'shadow-[0_0_0_2px_rgba(255,255,255,0.06)]',
          )}
        >
          {/* Inner glass highlight */}
          <div className="absolute top-1 left-2 w-5 h-2 rounded-full bg-white/20 blur-[3px] pointer-events-none" />

          {/* Pressed flash */}
          {isPressed && (
            <span className="absolute inset-0 rounded-full bg-white/20 pointer-events-none" />
          )}

          {/* Label */}
          <span className={cn(
            'font-black text-lg uppercase select-none pointer-events-none z-10 transition-colors duration-75',
            'drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]',
            isPressed ? accent.textActive : accent.text,
          )}>
            {label || name}
          </span>
        </button>
      </div>
    );
  };

  // ── 6-button layout: 2 rows × 3 columns (fighting game style) ──
  // Top row:    Y   X   L   (Punch: Light → Medium → Heavy)
  // Bottom row: B   A   R   (Kick:  Light → Medium → Heavy)
  if (isSixButton) {
    return (
      <div className="touch-none select-none flex flex-col items-end gap-2">
        {/* Top row — "Punch" */}
        <div className="flex items-center gap-2">
          {renderButton('y')}
          {renderButton('x')}
          {renderButton('l')}
        </div>
        {/* Bottom row — "Kick" */}
        <div className="flex items-center gap-2">
          {renderButton('b')}
          {renderButton('a')}
          {renderButton('r')}
        </div>
      </div>
    );
  }

  // ── 2-button layout (NES) — diagonal ──
  return (
    <div className="relative touch-none select-none" style={{ width: 150, height: 100 }}>
      <div className="absolute left-0 bottom-0">
        {renderButton('b')}
      </div>
      <div className="absolute right-0 top-0">
        {renderButton('a')}
      </div>
    </div>
  );
}

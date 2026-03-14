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

const getActionButtons = (system?: string) => {
  const isFourButton = system === 'snes' || system === 'gba';
  
  if (isFourButton) {
    return [
      { name: 'l' as const, posClass: 'left-[-15px] top-[15px] -rotate-12 scale-[0.85]' },
      { name: 'r' as const, posClass: 'right-[15px] top-[-15px] rotate-12 scale-[0.85]' },
      { name: 'y' as const, posClass: 'left-0 top-[65px]' },
      { name: 'x' as const, posClass: 'left-[53px] top-[12px]' },
      { name: 'b' as const, posClass: 'left-[53px] bottom-[-12px]' },
      { name: 'a' as const, posClass: 'right-0 top-[65px]' },
    ];
  }
  
  return [
    { name: 'b' as const, posClass: 'left-[15px] bottom-0' },
    { name: 'a' as const, posClass: 'right-[15px] top-[20px]' },
  ];
};

export function VirtualButtons({ system, onButtonDown, onButtonUp }: VirtualButtonsProps) {
  const { vibrate } = useHapticFeedback();
  const activeButtonsRef = useRef<Set<string>>(new Set());
  const [pressed, setPressed] = useState<Record<string, boolean>>({});
  const [rippleKey, setRippleKey] = useState<Record<string, number>>({});
  
  const actionButtons = getActionButtons(system);
  const containerStyle = system === 'snes' || system === 'gba' 
    ? { width: 175, height: 175 } 
    : { width: 150, height: 100 };

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

  const isFourButton = system === 'snes' || system === 'gba';

  // SNES-style per-button colors
  const getButtonColors = (name: string) => {
    if (!isFourButton) {
      return {
        normal: 'bg-gradient-to-br from-red-500/90 to-red-700/90 border-red-400/50 shadow-lg shadow-red-900/30',
        pressed: 'bg-gradient-to-br from-red-400 to-red-600 border-red-300/90 scale-90 shadow-[inset_0_2px_8px_rgba(0,0,0,0.4)]',
        glow: '0 0 18px 6px rgba(239,68,68,0.45)',
        ripple: 'border-red-400/60',
      };
    }
    switch (name) {
      case 'l':
      case 'r': return {
        normal: 'bg-gradient-to-br from-slate-400/90 to-slate-600/90 border-slate-300/50 shadow-lg shadow-slate-900/30',
        pressed: 'bg-gradient-to-br from-slate-300 to-slate-500 border-slate-200/90 scale-90 shadow-[inset_0_2px_8px_rgba(0,0,0,0.4)]',
        glow: '0 0 18px 6px rgba(148,163,184,0.45)',
        ripple: 'border-slate-300/60',
      };
      case 'a': return {
        normal: 'bg-gradient-to-br from-red-500/90 to-red-700/90 border-red-400/50 shadow-lg shadow-red-900/30',
        pressed: 'bg-gradient-to-br from-red-400 to-red-600 border-red-300/90 scale-90 shadow-[inset_0_2px_8px_rgba(0,0,0,0.4)]',
        glow: '0 0 18px 6px rgba(239,68,68,0.45)',
        ripple: 'border-red-400/60',
      };
      case 'b': return {
        normal: 'bg-gradient-to-br from-yellow-500/90 to-amber-700/90 border-yellow-400/50 shadow-lg shadow-yellow-900/30',
        pressed: 'bg-gradient-to-br from-yellow-400 to-amber-600 border-yellow-300/90 scale-90 shadow-[inset_0_2px_8px_rgba(0,0,0,0.4)]',
        glow: '0 0 18px 6px rgba(245,158,11,0.45)',
        ripple: 'border-yellow-400/60',
      };
      case 'x': return {
        normal: 'bg-gradient-to-br from-blue-500/90 to-blue-700/90 border-blue-400/50 shadow-lg shadow-blue-900/30',
        pressed: 'bg-gradient-to-br from-blue-400 to-blue-600 border-blue-300/90 scale-90 shadow-[inset_0_2px_8px_rgba(0,0,0,0.4)]',
        glow: '0 0 18px 6px rgba(59,130,246,0.45)',
        ripple: 'border-blue-400/60',
      };
      case 'y': return {
        normal: 'bg-gradient-to-br from-green-500/90 to-green-700/90 border-green-400/50 shadow-lg shadow-green-900/30',
        pressed: 'bg-gradient-to-br from-green-400 to-green-600 border-green-300/90 scale-90 shadow-[inset_0_2px_8px_rgba(0,0,0,0.4)]',
        glow: '0 0 18px 6px rgba(34,197,94,0.45)',
        ripple: 'border-green-400/60',
      };
      default: return {
        normal: 'bg-gradient-to-br from-red-500/90 to-red-700/90 border-red-400/50 shadow-lg shadow-red-900/30',
        pressed: 'bg-gradient-to-br from-red-400 to-red-600 border-red-300/90 scale-90 shadow-[inset_0_2px_8px_rgba(0,0,0,0.4)]',
        glow: '0 0 18px 6px rgba(239,68,68,0.45)',
        ripple: 'border-red-400/60',
      };
    }
  };

  return (
    <div className="relative touch-none select-none">
      <div className="relative" style={containerStyle}>
        {actionButtons.map(({ name, posClass }) => {
          const isPressed = pressed[name];
          const key = rippleKey[name];
          const colors = getButtonColors(name);
          // Determine if it's a bumper (L/R) button to stretch it horizontally
          const isBumper = name === 'l' || name === 'r';
          return (
            <div key={name} className={cn('absolute', posClass)}>
              {key && (
                <span
                  key={key}
                  className={cn(
                    "absolute inset-[-6px] border-2 pointer-events-none animate-[ripple_350ms_ease-out_forwards]",
                    isBumper ? "rounded-2xl" : "rounded-full",
                    colors.ripple
                  )}
                />
              )}
              <div
                className={cn(
                  'absolute inset-[-4px] rounded-full pointer-events-none transition-opacity duration-100',
                  isPressed ? 'opacity-100' : 'opacity-0'
                )}
                style={{ boxShadow: colors.glow }}
              />
              <button
                onTouchStart={handleTouchStart(name)}
                onTouchEnd={handleTouchEnd(name)}
                onTouchCancel={handleTouchEnd(name)}
                className={cn(
                  'flex items-center justify-center font-black select-none pointer-events-none drop-shadow-md z-10 uppercase',
                  'border-2 transition-all duration-75 touch-none overflow-hidden relative',
                  isBumper ? 'w-[75px] h-[45px] rounded-2xl text-lg' : 'w-[65px] h-[65px] rounded-full text-xl',
                  isPressed ? colors.pressed : colors.normal
                )}
              >
                <div className={cn(
                  "absolute top-1.5 left-2.5 h-2 rounded-full bg-white/30 blur-[2px] pointer-events-none",
                  isBumper ? "w-6" : "w-3.5"
                )} />
                {isPressed && (
                  <span className={cn(
                    "absolute inset-0 bg-white/15 pointer-events-none",
                    isBumper ? "rounded-2xl" : "rounded-full"
                  )} />
                )}
                <span className="text-white relative z-10">{name}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

'use client';

import { useRef, useCallback, useState, useEffect } from 'react';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { cn } from '@/lib/utils';

type ButtonName = 'a' | 'b' | 'start' | 'select';

interface VirtualButtonsProps {
  onButtonDown: (button: ButtonName) => void;
  onButtonUp: (button: ButtonName) => void;
}

export function VirtualButtons({ onButtonDown, onButtonUp }: VirtualButtonsProps) {
  const { vibrate } = useHapticFeedback();
  const activeButtonsRef = useRef<Set<string>>(new Set());
  const [pressed, setPressed] = useState<Record<string, boolean>>({});
  const [rippleKey, setRippleKey] = useState<Record<string, number>>({});

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

  const ActionButton = ({
    name,
    posClass,
  }: {
    name: 'a' | 'b';
    posClass: string;
  }) => {
    const isPressed = pressed[name];
    const key = rippleKey[name];

    return (
      <div className={cn('absolute', posClass)}>
        {key && (
          <span
            key={key}
            className="absolute inset-[-6px] rounded-full border-2 border-red-400/60
              pointer-events-none animate-[ripple_350ms_ease-out_forwards]"
          />
        )}

        <div
          className={cn(
            'absolute inset-[-4px] rounded-full pointer-events-none transition-opacity duration-100',
            isPressed ? 'opacity-100' : 'opacity-0'
          )}
          style={{ boxShadow: '0 0 18px 6px rgba(239,68,68,0.45)' }}
        />

        <button
          onTouchStart={handleTouchStart(name)}
          onTouchEnd={handleTouchEnd(name)}
          onTouchCancel={handleTouchEnd(name)}
          className={cn(
            'w-[60px] h-[60px] rounded-full flex items-center justify-center',
            'border-2 transition-all duration-75 touch-none overflow-hidden relative',
            isPressed
              ? 'bg-gradient-to-br from-red-400 to-red-600 border-red-300/90 scale-90 shadow-[inset_0_2px_8px_rgba(0,0,0,0.4)]'
              : 'bg-gradient-to-br from-red-500/90 to-red-700/90 border-red-400/50 shadow-lg shadow-red-900/30'
          )}
        >
          <div className="absolute top-1.5 left-2.5 w-3.5 h-2 rounded-full bg-white/30 blur-[2px] pointer-events-none" />
          {isPressed && (
            <span className="absolute inset-0 rounded-full bg-white/15 pointer-events-none" />
          )}
          <span className="text-white font-black text-xl select-none pointer-events-none drop-shadow-md z-10 uppercase">
            {name}
          </span>
        </button>
      </div>
    );
  };

  return (
    <div className="relative touch-none select-none">
      <div className="relative" style={{ width: 130, height: 90 }}>
        <ActionButton name="b" posClass="left-0 bottom-0" />
        <ActionButton name="a" posClass="right-0 top-0" />
      </div>
    </div>
  );
}

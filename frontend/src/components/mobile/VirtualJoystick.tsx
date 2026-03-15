'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { cn } from '@/lib/utils';

interface VirtualJoystickProps {
  onDirectionChange: (directions: {
    up: boolean; down: boolean; left: boolean; right: boolean;
  }) => void;
  size?: number;
}

export function VirtualJoystick({ onDirectionChange, size = 120 }: VirtualJoystickProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastDirectionsRef = useRef({ up: false, down: false, left: false, right: false });
  const { vibrate } = useHapticFeedback();

  const [isActive, setIsActive] = useState(false);
  const [dirs, setDirs] = useState({ up: false, down: false, left: false, right: false });

  const angleToDirections = useCallback((angle: number, distance: number) => {
    if (distance < 0.4) {
      return { up: false, down: false, left: false, right: false };
    }

    const d = { up: false, down: false, left: false, right: false };
    if (angle >= 22.5 && angle < 157.5) d.up = true;
    if (angle >= 202.5 && angle < 337.5) d.down = true;
    if (angle >= 112.5 && angle < 247.5) d.left = true;
    if (angle < 67.5 || angle >= 292.5) d.right = true;
    return d;
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    let nipple: any;
    let destroyed = false;

    const initNipple = async () => {
      const nipplejs = (await import('nipplejs')).default;
      if (destroyed || !containerRef.current) return;

      nipple = nipplejs.create({
        zone: containerRef.current!,
        mode: 'static',
        position: { left: '50%', top: '50%' },
        color: 'rgba(255,255,255,0.18)',
        size,
        restOpacity: 0.65,
        fadeTime: 100,
      });

      nipple.on('start', () => setIsActive(true));

      nipple.on('move', (_evt: any, data: any) => {
        if (data?.angle?.degree == null || data?.distance == null) return;

        const normalizedDistance = data.distance / (size / 2);
        const newDirs = angleToDirections(data.angle.degree, normalizedDistance);
        const last = lastDirectionsRef.current;
        const changed = newDirs.up !== last.up || newDirs.down !== last.down
          || newDirs.left !== last.left || newDirs.right !== last.right;

        if (changed) {
          vibrate(8);
          lastDirectionsRef.current = { ...newDirs };
          setDirs({ ...newDirs });
          onDirectionChange(newDirs);
        }
      });

      nipple.on('end', () => {
        const release = { up: false, down: false, left: false, right: false };
        lastDirectionsRef.current = release;
        setDirs(release);
        setIsActive(false);
        onDirectionChange(release);
      });
    };

    initNipple();
    return () => {
      destroyed = true;
      if (nipple) nipple.destroy();
    };
  }, [size, angleToDirections, onDirectionChange, vibrate]);

  const arrowSize = Math.round(size * 0.18);

  return (
    <div
      className="relative touch-none select-none"
      style={{ width: size, height: size }}
    >
      {/* Outer glow ring — pulses when active */}
      <div
        className={cn(
          "absolute inset-0 rounded-full pointer-events-none transition-all duration-150",
          isActive
            ? "shadow-[0_0_0_3px_rgba(168,85,247,0.6),0_0_24px_rgba(168,85,247,0.35)] scale-105"
            : "shadow-[0_0_0_2px_rgba(255,255,255,0.08)]"
        )}
        style={{ borderRadius: '50%' }}
      />

      {/* Direction arrows — light up on active direction */}
      {/* UP */}
      <div className={cn(
        "absolute left-1/2 -translate-x-1/2 top-0 flex items-center justify-center pointer-events-none transition-all duration-75",
        dirs.up ? "opacity-100 scale-110" : "opacity-20"
      )} style={{ width: arrowSize, height: arrowSize }}>
        <svg viewBox="0 0 24 24" fill="currentColor"
          className={cn("w-full h-full drop-shadow-lg", dirs.up ? "text-purple-400" : "text-white/50")}>
          <path d="M12 4l8 10H4z" />
        </svg>
      </div>
      {/* DOWN */}
      <div className={cn(
        "absolute left-1/2 -translate-x-1/2 bottom-0 flex items-center justify-center pointer-events-none transition-all duration-75",
        dirs.down ? "opacity-100 scale-110" : "opacity-20"
      )} style={{ width: arrowSize, height: arrowSize }}>
        <svg viewBox="0 0 24 24" fill="currentColor"
          className={cn("w-full h-full drop-shadow-lg", dirs.down ? "text-purple-400" : "text-white/50")}>
          <path d="M12 20l-8-10h16z" />
        </svg>
      </div>
      {/* LEFT */}
      <div className={cn(
        "absolute top-1/2 -translate-y-1/2 left-0 flex items-center justify-center pointer-events-none transition-all duration-75",
        dirs.left ? "opacity-100 scale-110" : "opacity-20"
      )} style={{ width: arrowSize, height: arrowSize }}>
        <svg viewBox="0 0 24 24" fill="currentColor"
          className={cn("w-full h-full drop-shadow-lg", dirs.left ? "text-purple-400" : "text-white/50")}>
          <path d="M4 12l10-8v16z" />
        </svg>
      </div>
      {/* RIGHT */}
      <div className={cn(
        "absolute top-1/2 -translate-y-1/2 right-0 flex items-center justify-center pointer-events-none transition-all duration-75",
        dirs.right ? "opacity-100 scale-110" : "opacity-20"
      )} style={{ width: arrowSize, height: arrowSize }}>
        <svg viewBox="0 0 24 24" fill="currentColor"
          className={cn("w-full h-full drop-shadow-lg", dirs.right ? "text-purple-400" : "text-white/50")}>
          <path d="M20 12L10 4v16z" />
        </svg>
      </div>

      {/* nipplejs zone */}
      <div ref={containerRef} className="absolute inset-0 touch-none" />
    </div>
  );
}

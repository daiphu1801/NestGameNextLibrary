'use client';

import { useRef, useCallback, useState, useEffect } from 'react';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { cn } from '@/lib/utils';

type Dirs = { up: boolean; down: boolean; left: boolean; right: boolean };

interface DPadProps {
  onDirectionChange: (dirs: Dirs) => void;
  size?: number;
}

export function DPad({ onDirectionChange, size = 120 }: DPadProps) {
  const { vibrate } = useHapticFeedback();
  const containerRef = useRef<HTMLDivElement>(null);
  const activeTouchesRef = useRef<Map<number, Dirs>>(new Map());
  const lastDirsRef = useRef<Dirs>({ up: false, down: false, left: false, right: false });
  const [dirs, setDirs] = useState<Dirs>({ up: false, down: false, left: false, right: false });

  // Release all on orientation change
  useEffect(() => {
    const releaseAll = () => {
      activeTouchesRef.current.clear();
      const release = { up: false, down: false, left: false, right: false };
      lastDirsRef.current = release;
      setDirs(release);
      onDirectionChange(release);
    };
    window.addEventListener('orientationchange', releaseAll);
    const onVisibility = () => { if (document.hidden) releaseAll(); };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('orientationchange', releaseAll);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [onDirectionChange]);

  const getDirectionsFromPoint = useCallback((clientX: number, clientY: number, rect: DOMRect): Dirs => {
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = clientX - cx;
    const dy = clientY - cy;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    const deadzone = size * 0.12;

    if (absX < deadzone && absY < deadzone) {
      return { up: false, down: false, left: false, right: false };
    }
    if (absX >= absY) {
      return { up: false, down: false, left: dx < 0, right: dx > 0 };
    } else {
      return { up: dy < 0, down: dy > 0, left: false, right: false };
    }
  }, [size]);

  const mergeAndFire = useCallback(() => {
    const merged: Dirs = { up: false, down: false, left: false, right: false };
    activeTouchesRef.current.forEach(d => {
      if (d.up) merged.up = true;
      if (d.down) merged.down = true;
      if (d.left) merged.left = true;
      if (d.right) merged.right = true;
    });
    const last = lastDirsRef.current;
    if (merged.up !== last.up || merged.down !== last.down
      || merged.left !== last.left || merged.right !== last.right) {
      const isAny = merged.up || merged.down || merged.left || merged.right;
      const wasAny = last.up || last.down || last.left || last.right;
      if (isAny && !wasAny) vibrate(8);
      lastDirsRef.current = { ...merged };
      setDirs({ ...merged });
      onDirectionChange(merged);
    }
  }, [onDirectionChange, vibrate]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      activeTouchesRef.current.set(t.identifier, getDirectionsFromPoint(t.clientX, t.clientY, rect));
    }
    mergeAndFire();
  }, [getDirectionsFromPoint, mergeAndFire]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      activeTouchesRef.current.set(t.identifier, getDirectionsFromPoint(t.clientX, t.clientY, rect));
    }
    mergeAndFire();
  }, [getDirectionsFromPoint, mergeAndFire]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      activeTouchesRef.current.delete(e.changedTouches[i].identifier);
    }
    mergeAndFire();
  }, [mergeAndFire]);

  const a = size / 3;  // arm size (each segment = 1/3 of total)
  const r = 5;         // border-radius of arm tips

  const armBase = "absolute border transition-colors duration-75";
  const armActive = "bg-white/30 border-white/50 shadow-[0_0_10px_rgba(168,85,247,0.5)]";
  const armIdle = "bg-white/[0.07] border-white/[0.15]";

  return (
    <div
      ref={containerRef}
      className="relative touch-none select-none"
      style={{ width: size, height: size }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {/* Top arm */}
      <div
        className={cn(armBase, dirs.up ? armActive : armIdle)}
        style={{ left: a, top: 0, width: a, height: a, borderRadius: `${r}px ${r}px 0 0` }}
      />
      {/* Bottom arm */}
      <div
        className={cn(armBase, dirs.down ? armActive : armIdle)}
        style={{ left: a, top: a * 2, width: a, height: a, borderRadius: `0 0 ${r}px ${r}px` }}
      />
      {/* Left arm */}
      <div
        className={cn(armBase, dirs.left ? armActive : armIdle)}
        style={{ left: 0, top: a, width: a, height: a, borderRadius: `${r}px 0 0 ${r}px` }}
      />
      {/* Right arm */}
      <div
        className={cn(armBase, dirs.right ? armActive : armIdle)}
        style={{ left: a * 2, top: a, width: a, height: a, borderRadius: `0 ${r}px ${r}px 0` }}
      />
      {/* Center */}
      <div
        className="absolute bg-white/[0.07] border border-white/[0.15]"
        style={{ left: a, top: a, width: a, height: a }}
      />

      {/* Arrow icons — centered in each arm */}
      {/* UP */}
      <svg className={cn("absolute pointer-events-none transition-colors duration-75", dirs.up ? "text-purple-300" : "text-white/40")}
        style={{ left: a + a / 2 - 8, top: a / 2 - 8, width: 16, height: 16 }}
        viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 4l8 10H4z" />
      </svg>
      {/* DOWN */}
      <svg className={cn("absolute pointer-events-none transition-colors duration-75", dirs.down ? "text-purple-300" : "text-white/40")}
        style={{ left: a + a / 2 - 8, top: a * 2 + a / 2 - 8, width: 16, height: 16 }}
        viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 20l-8-10h16z" />
      </svg>
      {/* LEFT */}
      <svg className={cn("absolute pointer-events-none transition-colors duration-75", dirs.left ? "text-purple-300" : "text-white/40")}
        style={{ left: a / 2 - 8, top: a + a / 2 - 8, width: 16, height: 16 }}
        viewBox="0 0 24 24" fill="currentColor">
        <path d="M4 12l10-8v16z" />
      </svg>
      {/* RIGHT */}
      <svg className={cn("absolute pointer-events-none transition-colors duration-75", dirs.right ? "text-purple-300" : "text-white/40")}
        style={{ left: a * 2 + a / 2 - 8, top: a + a / 2 - 8, width: 16, height: 16 }}
        viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 12L10 4v16z" />
      </svg>
    </div>
  );
}

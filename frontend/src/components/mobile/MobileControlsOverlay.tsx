'use client';

import { useCallback, useRef, useState } from 'react';
import { VirtualJoystick } from './VirtualJoystick';
import { DPad } from './DPad';
import { VirtualButtons } from './VirtualButtons';
import { emulatorService, NESButton } from '@/services/emulatorService';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { useMobileControlSetting } from '@/hooks/useMobileControlSetting';
import { useCombo } from '@/hooks/useCombo';
import { COMBO_SLOT_LABELS } from '@/data/comboPresets';
import { cn } from '@/lib/utils';

interface MobileControlsOverlayProps {
  enabled: boolean;
  system?: string;
}

export function MobileControlsOverlay({ enabled, system }: MobileControlsOverlayProps) {
  const activeDirsRef = useRef({ up: false, down: false, left: false, right: false });
  const { vibrate } = useHapticFeedback();
  const [pressed, setPressed] = useState<Record<string, boolean>>({});
  const [controlType, setControlType] = useMobileControlSetting();
  const { combos, execute, isExecuting } = useCombo('p1');
  const isAdvancedSystem = system === 'snes' || system === 'gba';

  const handleDirectionChange = useCallback((directions: {
    up: boolean; down: boolean; left: boolean; right: boolean;
  }) => {
    if (!enabled) return;
    const prev = activeDirsRef.current;
    (['up', 'down', 'left', 'right'] as const).forEach((dir) => {
      if (prev[dir] && !directions[dir]) emulatorService.pressButtonUp(dir);
      if (!prev[dir] && directions[dir]) emulatorService.pressButtonDown(dir);
    });
    activeDirsRef.current = { ...directions };
  }, [enabled]);

  const handleButtonDown = useCallback((button: 'a' | 'b' | 'x' | 'y' | 'l' | 'r' | 'start' | 'select') => {
    if (!enabled) return;
    vibrate(15);
    emulatorService.pressButtonDown(button as NESButton);
  }, [enabled, vibrate]);

  const handleButtonUp = useCallback((button: 'a' | 'b' | 'x' | 'y' | 'l' | 'r' | 'start' | 'select') => {
    if (!enabled) return;
    emulatorService.pressButtonUp(button as NESButton);
  }, [enabled]);

  const handleSystemDown = useCallback((btn: 'select' | 'start') => (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPressed(p => ({ ...p, [btn]: true }));
    handleButtonDown(btn);
  }, [handleButtonDown]);

  const handleSystemUp = useCallback((btn: 'select' | 'start') => (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPressed(p => ({ ...p, [btn]: false }));
    handleButtonUp(btn);
  }, [handleButtonUp]);

  const handleToggleControl = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    vibrate(12);
    setControlType(controlType === 'joystick' ? 'dpad' : 'joystick');
  }, [controlType, setControlType, vibrate]);

  if (!enabled) return null;

  return (
    <div className="mobile-only absolute inset-0 z-30 pointer-events-none touch-none select-none">
      {/* D-pad / Joystick — Bottom Left with safe-area */}
      <div
        className="absolute pointer-events-auto"
        style={{
          bottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
          left: 'calc(16px + env(safe-area-inset-left, 0px))',
        }}
      >
        {controlType === 'dpad'
          ? <DPad onDirectionChange={handleDirectionChange} size={150} />
          : <VirtualJoystick onDirectionChange={handleDirectionChange} size={150} />
        }
      </div>

      {/* A/B/X/Y Buttons — Bottom Right with safe-area */}
      <div
        className="absolute pointer-events-auto"
        style={{
          bottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
          right: 'calc(16px + env(safe-area-inset-right, 0px))',
        }}
      >
        <VirtualButtons system={system} onButtonDown={handleButtonDown as any} onButtonUp={handleButtonUp as any} />
      </div>

      {/* Combo Buttons — Left side, above D-pad (SNES/GBA only) */}
      {isAdvancedSystem && (
        <div
          className="absolute pointer-events-auto grid grid-cols-2 gap-1"
          style={{
            bottom: 'calc(185px + env(safe-area-inset-bottom, 0px))',
            left: 'calc(12px + env(safe-area-inset-left, 0px))',
          }}
        >
          {combos.map((combo, i) => {
            if (!combo) return null;
            const isActive = pressed[`combo_${i}`];
            return (
              <button
                key={combo.id}
                onTouchStart={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (isExecuting) return;
                  vibrate(20);
                  setPressed(p => ({ ...p, [`combo_${i}`]: true }));
                  execute(i).finally(() => setPressed(p => ({ ...p, [`combo_${i}`]: false })));
                }}
                onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onTouchCancel={(e) => { e.preventDefault(); e.stopPropagation(); }}
                disabled={isExecuting}
                className={cn(
                  'flex items-center gap-1 px-2 py-1 rounded-full border transition-all duration-75 touch-none',
                  'text-[9px] font-bold uppercase tracking-wider select-none min-w-[56px]',
                  isActive
                    ? 'bg-gradient-to-r from-purple-500/80 to-fuchsia-500/80 border-purple-300/60 scale-95 shadow-[0_0_14px_rgba(168,85,247,0.5)]'
                    : 'bg-gradient-to-r from-purple-500/30 to-fuchsia-500/20 border-purple-400/20 backdrop-blur-sm',
                  isExecuting && !isActive && 'opacity-50'
                )}
              >
                <span className="text-[10px]">{combo.icon}</span>
                <span className="text-white/80">{COMBO_SLOT_LABELS[i]}</span>
              </button>
            );
          })}
        </div>
      )}




      {/* Control type toggle + Select/Start — Bottom Center */}
      <div
        className="absolute left-1/2 -translate-x-1/2 pointer-events-auto flex flex-col items-center gap-2"
        style={{ bottom: 'calc(10px + env(safe-area-inset-bottom, 0px))' }}
      >
        {/* Joystick / D-pad toggle pill */}
        <button
          onTouchStart={handleToggleControl}
          onTouchEnd={e => { e.preventDefault(); e.stopPropagation(); }}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full border touch-none
            bg-black/30 border-white/10 active:scale-95 transition-transform"
        >
          {controlType === 'joystick' ? (
            <>
              {/* Joystick icon */}
              <svg viewBox="0 0 24 24" className="w-3 h-3 text-purple-300" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <circle cx="12" cy="12" r="9" strokeDasharray="3 2" />
                <line x1="12" y1="3" x2="12" y2="7" />
                <line x1="12" y1="17" x2="12" y2="21" />
                <line x1="3" y1="12" x2="7" y2="12" />
                <line x1="17" y1="12" x2="21" y2="12" />
              </svg>
              <span className="text-white/50 text-[9px] uppercase tracking-widest">Joy</span>
            </>
          ) : (
            <>
              {/* D-pad icon (plus shape) */}
              <svg viewBox="0 0 24 24" className="w-3 h-3 text-purple-300" fill="currentColor">
                <path d="M9 3h6v5H9zM9 16h6v5H9zM3 9h5v6H3zM16 9h5v6h-5z" />
              </svg>
              <span className="text-white/50 text-[9px] uppercase tracking-widest">D-Pad</span>
            </>
          )}
        </button>

        {/* Select / Start */}
        <div className="flex items-center gap-5">
          {(['select', 'start'] as const).map((btn) => (
            <button
              key={btn}
              onTouchStart={handleSystemDown(btn)}
              onTouchEnd={handleSystemUp(btn)}
              onTouchCancel={handleSystemUp(btn)}
              className={cn(
                "relative overflow-hidden px-5 py-2 rounded-full border transition-all duration-75 touch-none",
                pressed[btn]
                  ? "bg-white/20 border-white/40 shadow-[0_0_12px_rgba(255,255,255,0.2)] scale-95"
                  : "bg-white/[0.08] border-white/[0.15]"
              )}
            >
              <span className="text-white/70 text-[10px] font-bold uppercase tracking-widest select-none pointer-events-none">
                {btn}
              </span>
              {pressed[btn] && (
                <span className="absolute inset-0 rounded-full bg-white/20 animate-ping pointer-events-none" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

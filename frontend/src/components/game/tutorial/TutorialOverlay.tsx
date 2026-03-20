'use client';

import { Rect } from './types';

interface TutorialOverlayProps {
  targetRect: Rect | null;
  onSkip: () => void;
}

export function TutorialOverlay({ targetRect, onSkip }: TutorialOverlayProps) {
  return (
    <div className="absolute inset-0 z-40 pointer-events-auto" onClick={onSkip}>
      {/* Dark overlay with spotlight cutout via CSS clip-path */}
      <div
        className="absolute inset-0 bg-black/70 transition-all duration-300"
        style={
          targetRect
            ? {
                clipPath: `polygon(
                  0% 0%, 100% 0%, 100% 100%, 0% 100%,
                  0% ${targetRect.top - 6}px,
                  ${targetRect.left - 6}px ${targetRect.top - 6}px,
                  ${targetRect.left - 6}px ${targetRect.top + targetRect.height + 6}px,
                  ${targetRect.left + targetRect.width + 6}px ${targetRect.top + targetRect.height + 6}px,
                  ${targetRect.left + targetRect.width + 6}px ${targetRect.top - 6}px,
                  0% ${targetRect.top - 6}px
                )`,
              }
            : {}
        }
      />

      {/* Spotlight border glow around target */}
      {targetRect && (
        <div
          className={`absolute rounded-lg border-2 border-white/40 shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all duration-300 pointer-events-none`}
          style={{
            top: targetRect.top - 6,
            left: targetRect.left - 6,
            width: targetRect.width + 12,
            height: targetRect.height + 12,
          }}
        />
      )}
    </div>
  );
}

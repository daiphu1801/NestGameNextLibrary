'use client';

import React from 'react';
import { ArrowRight, ChevronRight, X } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { TutorialStepType } from './types';

interface TutorialStepsProps {
  step: TutorialStepType;
  currentStep: number;
  totalSteps: number;
  tooltipStyle: React.CSSProperties;
  arrowStyle: React.CSSProperties;
  arrowDirection: 'left' | 'right' | 'top' | 'bottom';
  isAnimating: boolean;
  onSkip: () => void;
  onNext: () => void;
  tooltipRef: React.RefObject<HTMLDivElement | null>;
  allStepsCount: number;
}

export function TutorialSteps({
  step,
  currentStep,
  totalSteps,
  tooltipStyle,
  arrowStyle,
  arrowDirection,
  isAnimating,
  onSkip,
  onNext,
  tooltipRef,
  allStepsCount
}: TutorialStepsProps) {
  const { t } = useLanguage();

  return (
    <div
      ref={tooltipRef}
      className={`absolute z-50 pointer-events-auto transition-all duration-200 ${isAnimating ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}
      style={tooltipStyle}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="relative bg-[#1a1a2e] border border-white/15 rounded-xl shadow-2xl overflow-hidden">
        {/* Top gradient accent */}
        <div className={`h-1 bg-gradient-to-r ${step.gradient}`} />

        {/* Arrow */}
        <div
            className="w-3 h-3 bg-[#1a1a2e] border-white/15 absolute"
            style={{
                ...arrowStyle,
                borderTop: arrowDirection === 'top' || arrowDirection === 'left' ? '1px solid rgba(255,255,255,0.15)' : 'none',
                borderLeft: arrowDirection === 'left' || arrowDirection === 'bottom' ? '1px solid rgba(255,255,255,0.15)' : 'none',
                borderRight: arrowDirection === 'right' || arrowDirection === 'top' ? '1px solid rgba(255,255,255,0.15)' : 'none',
                borderBottom: arrowDirection === 'bottom' || arrowDirection === 'right' ? '1px solid rgba(255,255,255,0.15)' : 'none',
            }}
        />

        {/* Content */}
        <div className="px-5 py-4">
            {/* Step counter */}
            <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    {t('tutorial.stepOf', { current: currentStep + 1, total: totalSteps }) ||
                        `Step ${currentStep + 1} / ${totalSteps}`}
                </span>
                <button
                    onClick={onSkip}
                    className="p-1 rounded-full hover:bg-white/10 text-muted-foreground hover:text-white transition-all"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Title */}
            <h4 className="text-base font-bold text-white mb-1.5">
                {t(step.titleKey) || step.titleKey}
            </h4>

            {/* Description */}
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                {t(step.descKey) || step.descKey}
            </p>

            {/* Footer: dots + buttons */}
            <div className="flex items-center justify-between">
                {/* Progress dots */}
                <div className="flex gap-1">
                    {Array.from({ length: allStepsCount }).map((_, i) => (
                        <div
                            key={i}
                            className={`h-1.5 rounded-full transition-all duration-300 ${i === currentStep
                                ? `w-5 bg-gradient-to-r ${step.gradient}`
                                : i < currentStep
                                    ? 'w-1.5 bg-white/40'
                                    : 'w-1.5 bg-white/15'
                                }`}
                        />
                    ))}
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-1.5">
                    <button
                        onClick={onSkip}
                        className="px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-white hover:bg-white/5 transition-all"
                    >
                        {t('tutorial.skip') || 'Skip'}
                    </button>
                    <button
                        onClick={onNext}
                        className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r ${step.gradient} text-white text-xs font-bold hover:brightness-110 transition-all active:scale-95`}
                    >
                        {currentStep < totalSteps - 1 ? (
                            <>
                                {t('tutorial.next') || 'Next'}
                                <ChevronRight className="w-3.5 h-3.5" />
                            </>
                        ) : (
                            <>
                                {t('tutorial.start') || "Let's Play!"}
                                <ArrowRight className="w-3.5 h-3.5" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

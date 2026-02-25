'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowRight, ChevronRight, X } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';

interface GameTutorialProps {
    isOpen: boolean;
    onClose: () => void;
    modalRef: React.RefObject<HTMLDivElement | null>;
}

const TUTORIAL_STORAGE_KEY = 'nestgame_tutorial_seen';

interface TutorialStep {
    targetSelector: string;
    titleKey: string;
    descKey: string;
    position: 'right' | 'left' | 'bottom' | 'top' | 'bottom-right';
    gradient: string;
}

const STEPS: TutorialStep[] = [
    {
        targetSelector: '[data-tutorial="movement"]',
        titleKey: 'tutorial.step1.title',
        descKey: 'tutorial.step1.desc',
        position: 'right',
        gradient: 'from-cyan-500 to-blue-500',
    },
    {
        targetSelector: '[data-tutorial="actions"]',
        titleKey: 'tutorial.step2.title',
        descKey: 'tutorial.step2.desc',
        position: 'right',
        gradient: 'from-pink-500 to-purple-500',
    },
    {
        targetSelector: '[data-tutorial="startselect"]',
        titleKey: 'tutorial.step3.title',
        descKey: 'tutorial.step3.desc',
        position: 'right',
        gradient: 'from-green-500 to-emerald-500',
    },
    {
        targetSelector: '[data-tutorial="saveload"]',
        titleKey: 'tutorial.step4.title',
        descKey: 'tutorial.step4.desc',
        position: 'bottom-right',
        gradient: 'from-emerald-500 to-teal-500',
    },
    {
        targetSelector: '[data-tutorial="tips"]',
        titleKey: 'tutorial.step5.title',
        descKey: 'tutorial.step5.desc',
        position: 'bottom-right',
        gradient: 'from-amber-500 to-orange-500',
    },
];

interface Rect {
    top: number;
    left: number;
    width: number;
    height: number;
}

export function GameTutorial({ isOpen, onClose, modalRef }: GameTutorialProps) {
    const { t } = useLanguage();
    const [currentStep, setCurrentStep] = useState(0);
    const [targetRect, setTargetRect] = useState<Rect | null>(null);
    const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
    const [arrowStyle, setArrowStyle] = useState<React.CSSProperties>({});
    const [arrowDirection, setArrowDirection] = useState<'left' | 'right' | 'top' | 'bottom'>('left');
    const [isAnimating, setIsAnimating] = useState(false);
    const tooltipRef = useRef<HTMLDivElement>(null);

    const totalSteps = STEPS.length;
    const step = STEPS[currentStep];

    // Calculate target position relative to modal
    const updatePosition = useCallback(() => {
        if (!modalRef.current || !step) return;

        const modal = modalRef.current;
        const target = modal.querySelector(step.targetSelector);
        if (!target) {
            // If target not found (e.g., save buttons hidden), skip step
            setTargetRect(null);
            return;
        }

        const modalRect = modal.getBoundingClientRect();
        const elRect = target.getBoundingClientRect();

        const rect: Rect = {
            top: elRect.top - modalRect.top,
            left: elRect.left - modalRect.left,
            width: elRect.width,
            height: elRect.height,
        };

        setTargetRect(rect);
    }, [modalRef, step]);

    // Position tooltip relative to target
    useEffect(() => {
        if (!targetRect || !step) return;

        const padding = 12;
        const tooltipWidth = 300;

        let style: React.CSSProperties = {};
        let aStyle: React.CSSProperties = {};
        let aDir: 'left' | 'right' | 'top' | 'bottom' = 'left';

        switch (step.position) {
            case 'right':
                style = {
                    top: targetRect.top + targetRect.height / 2,
                    left: targetRect.left + targetRect.width + padding,
                    transform: 'translateY(-50%)',
                    maxWidth: tooltipWidth,
                };
                aStyle = {
                    position: 'absolute',
                    top: '50%',
                    left: -6,
                    transform: 'translateY(-50%) rotate(45deg)',
                };
                aDir = 'left';
                break;
            case 'left':
                style = {
                    top: targetRect.top + targetRect.height / 2,
                    right: `calc(100% - ${targetRect.left}px + ${padding}px)`,
                    transform: 'translateY(-50%)',
                    maxWidth: tooltipWidth,
                };
                aStyle = {
                    position: 'absolute',
                    top: '50%',
                    right: -6,
                    transform: 'translateY(-50%) rotate(45deg)',
                };
                aDir = 'right';
                break;
            case 'bottom':
                style = {
                    top: targetRect.top + targetRect.height + padding,
                    left: targetRect.left + targetRect.width / 2,
                    transform: 'translateX(-50%)',
                    maxWidth: tooltipWidth,
                };
                aStyle = {
                    position: 'absolute',
                    top: -6,
                    left: '50%',
                    transform: 'translateX(-50%) rotate(45deg)',
                };
                aDir = 'top';
                break;
            case 'bottom-right':
                style = {
                    top: targetRect.top + targetRect.height + padding,
                    right: `calc(100% - ${targetRect.left + targetRect.width}px)`, // Align right edge with target right edge
                    transform: 'none',
                    maxWidth: tooltipWidth,
                };
                aStyle = {
                    position: 'absolute',
                    top: -6,
                    right: targetRect.width / 2 - 6,
                    transform: 'rotate(45deg)',
                };
                aDir = 'top';
                break;
            case 'top':
                style = {
                    bottom: `calc(100% - ${targetRect.top}px + ${padding}px)`,
                    left: targetRect.left + targetRect.width / 2,
                    transform: 'translateX(-50%)',
                    maxWidth: tooltipWidth,
                };
                aStyle = {
                    position: 'absolute',
                    bottom: -6,
                    left: '50%',
                    transform: 'translateX(-50%) rotate(45deg)',
                };
                aDir = 'bottom';
                break;
        }

        setTooltipStyle(style);
        setArrowStyle(aStyle);
        setArrowDirection(aDir);
    }, [targetRect, step]);

    // Update position on mount and resize
    useEffect(() => {
        if (!isOpen) return;

        updatePosition();
        const interval = setInterval(updatePosition, 300);
        window.addEventListener('resize', updatePosition);

        return () => {
            clearInterval(interval);
            window.removeEventListener('resize', updatePosition);
        };
    }, [isOpen, updatePosition]);

    const handleNext = useCallback(() => {
        if (isAnimating) return;

        if (currentStep < totalSteps - 1) {
            setIsAnimating(true);
            setTimeout(() => {
                setCurrentStep((prev) => {
                    let next = prev + 1;
                    // Skip steps whose target is not found
                    while (next < totalSteps) {
                        const nextStep = STEPS[next];
                        const target = modalRef.current?.querySelector(nextStep.targetSelector);
                        if (target) break;
                        next++;
                    }
                    return next >= totalSteps ? prev : next;
                });
                setIsAnimating(false);
            }, 150);
        } else {
            handleComplete();
        }
    }, [currentStep, totalSteps, isAnimating, modalRef]);

    const handleComplete = useCallback(() => {
        localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
        onClose();
    }, [onClose]);

    const handleSkip = useCallback(() => {
        localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
        onClose();
    }, [onClose]);

    // Keyboard support
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                handleNext();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                handleSkip();
            }
        };

        window.addEventListener('keydown', handleKeyDown, true);
        return () => window.removeEventListener('keydown', handleKeyDown, true);
    }, [isOpen, handleNext, handleSkip]);

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay that dims the whole modal */}
            <div className="absolute inset-0 z-40 pointer-events-auto" onClick={handleSkip}>
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

            {/* Tooltip */}
            <div
                ref={tooltipRef}
                className={`absolute z-50 pointer-events-auto transition-all duration-200 ${isAnimating ? 'opacity-0 scale-90' : 'opacity-100 scale-100'
                    }`}
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
                                onClick={handleSkip}
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
                                {STEPS.map((_, i) => (
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
                                    onClick={handleSkip}
                                    className="px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-white hover:bg-white/5 transition-all"
                                >
                                    {t('tutorial.skip') || 'Skip'}
                                </button>
                                <button
                                    onClick={handleNext}
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
        </>
    );
}

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { Rect, TutorialStepType } from './tutorial/types';
import { TutorialOverlay } from './tutorial/TutorialOverlay';
import { TutorialSteps } from './tutorial/TutorialSteps';

interface GameTutorialProps {
    isOpen: boolean;
    onClose: () => void;
    modalRef: React.RefObject<HTMLDivElement | null>;
}

const TUTORIAL_STORAGE_KEY = 'nestgame_tutorial_seen';

const STEPS: TutorialStepType[] = [
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
                    right: `calc(100% - ${targetRect.left + targetRect.width}px)`,
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
            <TutorialOverlay 
                targetRect={targetRect} 
                onSkip={handleSkip} 
            />

            <TutorialSteps
                step={step}
                currentStep={currentStep}
                totalSteps={totalSteps}
                tooltipStyle={tooltipStyle}
                arrowStyle={arrowStyle}
                arrowDirection={arrowDirection}
                isAnimating={isAnimating}
                onSkip={handleSkip}
                onNext={handleNext}
                tooltipRef={tooltipRef}
                allStepsCount={totalSteps}
            />
        </>
    );
}

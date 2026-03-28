'use client';

import React, { useState, useEffect } from 'react';
import { DottedSurface } from '@/components/ui/dotted-surface';
import { cn } from '@/lib/utils';

export function WelcomeScreen() {
  const [isVisible, setIsVisible] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [typedText, setTypedText] = useState('');
  
  const fullText = "CHÀO MỪNG ĐẾN VỚI HỆ THỐNG WEBSITE NESTGAME";

  useEffect(() => {
    // Check session storage
    if (typeof window !== 'undefined') {
      const hasSeenWelcome = sessionStorage.getItem('nestgame_welcome_seen');
      if (!hasSeenWelcome) {
        setIsVisible(true);
        // Disable scrolling when full screen welcome is active
        document.body.style.overflow = 'hidden';
      }
    }
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setTypedText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
      }
    }, 60); // Speed of typing

    return () => clearInterval(typingInterval);
  }, [isVisible]);

  const handleEnter = () => {
    if (isFadingOut) return;
    setIsFadingOut(true);
    sessionStorage.setItem('nestgame_welcome_seen', 'true');
    
    // Allow animation to finish before removing from DOM
    setTimeout(() => {
      setIsVisible(false);
      document.body.style.overflow = '';
    }, 800); // match duration of fade out animation
  };

  if (!isVisible) return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-background cursor-pointer transition-opacity duration-700 ease-in-out",
        isFadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
      )}
      onClick={handleEnter}
    >
      {/* Background 3D Effect */}
      <DottedSurface className="absolute inset-0 top-0 left-0 w-full h-full opacity-70" />

      {/* Content Overlay */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-5xl">
        {/* Typewriter Text */}
        <h1 className="text-2xl md:text-5xl lg:text-7xl font-tech font-bold uppercase tracking-widest text-white leading-tight mb-16 h-24 md:h-40 flex items-center justify-center">
          <span>{typedText}<span className="animate-pulse opacity-50 font-mono ml-1 text-white">_</span></span>
        </h1>
        
        {/* Click to Enter Prompt */}
        <div 
          className={cn(
            "flex flex-col items-center gap-4 transition-all duration-1000",
            typedText.length === fullText.length ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          <div className="text-sm md:text-base uppercase tracking-[0.3em] font-tech text-white font-bold flex items-center gap-3 bg-background/50 backdrop-blur-sm py-3 px-8 border-2 border-primary/40 shadow-[0_0_15px_rgba(var(--primary),0.3)] hover:bg-primary/10 hover:border-primary transition-all duration-300">
            [ NHẤN BẤT KỲ ĐÂU ĐỂ BẮT ĐẦU ]
          </div>
          <div className="w-10 h-10 border-2 border-primary/30 flex items-center justify-center animate-bounce mt-4 rounded-sm">
            <div className="w-2 h-2 bg-primary rounded-sm shadow-[0_0_10px_rgba(var(--primary),1)]" />
          </div>
        </div>
      </div>
    </div>
  );
}
